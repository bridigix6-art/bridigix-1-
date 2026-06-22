import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// ─── Save chat (keyed by email, select+update/insert) ─────────────────────────
router.post("/save-chat", async (req, res) => {
  try {
    const { email, messages, sessionId } = req.body as {
      email: string;
      messages: Array<{ role: string; content: string }>;
      sessionId?: string;
    };

    if (!email || !Array.isArray(messages)) {
      res.status(400).json({ error: "email and messages are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.socket.remoteAddress || "";
    const userAgent = req.headers["user-agent"] ?? "";

    // Try to find by email first, then session_id
    let existing = null;
    const { data: byEmail } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    existing = byEmail;

    if (!existing && sessionId) {
      const { data: bySession } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("session_id", sessionId)
        .maybeSingle();
      existing = bySession;
    }

    let error;
    if (existing) {
      const { error: updateErr } = await supabase
        .from("chat_conversations")
        .update({
          email: normalizedEmail,
          messages,
          ip_address: ipAddress,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      error = updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from("chat_conversations")
        .insert({
          email: normalizedEmail,
          session_id: sessionId ?? null,
          messages,
          ip_address: ipAddress,
          user_agent: userAgent,
          status: "in_progress",
          updated_at: new Date().toISOString(),
        });
      error = insertErr;
    }

    if (error) {
      req.log.error({ error }, "Supabase save-chat error");
      res.status(500).json({ error: "Failed to save chat" });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Unexpected save-chat error");
    res.status(500).json({ error: "Failed to save chat" });
  }
});

// ─── Load chat (only returns completed intakes by email) ──────────────────────
router.get("/load-chat", async (req, res) => {
  try {
    const { email } = req.query as { email?: string };
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const { data, error } = await supabase
      .from("chat_conversations")
      .select("messages, intake_summary, status")
      .eq("email", email.toLowerCase().trim())
      .eq("status", "complete")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      req.log.error({ error }, "Supabase load-chat error");
      res.status(500).json({ error: "Failed to load chat" });
      return;
    }

    // Only return if messages actually exist and intake is complete
    const messages = data?.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.json({ found: false });
      return;
    }

    res.json({ found: true, messages, intakeSummary: data?.intake_summary ?? null });
  } catch (err) {
    req.log.error({ err }, "Unexpected load-chat error");
    res.status(500).json({ error: "Failed to load chat" });
  }
});

// ─── Save hiring brief (structured, called after founder confirms review) ─────
router.post("/save-hiring-brief", async (req, res) => {
  try {
    const { email, sessionId, brief, status } = req.body as {
      email?: string;
      sessionId?: string;
      brief: {
        companyContext?: string;
        hiringMotivation?: string;
        role?: string;
        seniorityOwnership?: string;
        reportingStructure?: string;
        successMetrics?: string;
        mustHaves?: string;
        niceToHaves?: string;
        dealBreakers?: string;
        technicalRequirements?: string;
        workStyleCulture?: string;
        compensationModel?: string;
        interviewProcess?: string;
        decisionChain?: string;
        candidatePitch?: string;
        recruitingStrategy?: string;
        riskRegister?: string;
        assumptionLog?: string;
        pastHiringSignal?: string;
        timeline?: string;
        budget?: string;
        contact?: string;
        openFlags?: string;
        rawIntake?: string;
      };
      status?: string;
    };

    if (!brief) {
      res.status(400).json({ error: "brief is required" });
      return;
    }

    const briefStatus = status ?? "confirmed";

    // Persist confirmed brief as structured JSON in chat_conversations
    if (email || sessionId) {
      const query = supabase
        .from("chat_conversations")
        .update({
          intake_summary: JSON.stringify(brief),
          status: briefStatus,
          updated_at: new Date().toISOString(),
        });

      if (email) {
        await query.eq("email", email.toLowerCase().trim());
      } else if (sessionId) {
        await query.eq("session_id", sessionId);
      }
    }

    // Try to save to hiring_briefs table — serialize full 23-field brief as JSON
    const { error: briefError } = await supabase
      .from("hiring_briefs")
      .insert({
        email: email?.toLowerCase().trim() ?? null,
        session_id: sessionId ?? null,
        status: briefStatus,
        company_context: brief.companyContext ?? null,
        role: brief.role ?? null,
        seniority_ownership: brief.seniorityOwnership ?? null,
        past_hiring_signal: brief.pastHiringSignal ?? null,
        work_style_culture: brief.workStyleCulture ?? null,
        requirements: brief.mustHaves ?? null,
        open_flags: brief.openFlags ?? null,
        raw_intake: brief.rawIntake ?? null,
        confirmed_at: briefStatus === "confirmed" ? new Date().toISOString() : null,
      });

    if (briefError) {
      // hiring_briefs table may not exist yet — log but don't fail
      req.log.warn(
        { briefError: { code: briefError.code, message: briefError.message } },
        "Could not save to hiring_briefs table (table may not exist yet). Intake saved to chat_conversations."
      );
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Unexpected save-hiring-brief error");
    res.status(500).json({ error: "Failed to save hiring brief" });
  }
});

// ─── Track visitor session ───────────────────────────────────────────────────
router.post("/track-session", async (req, res) => {
  try {
    const { timezone } = req.body as { timezone?: string };

    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.socket.remoteAddress || "";
    const userAgent = req.headers["user-agent"] ?? "";

    const { error } = await supabase
      .from("visitor_sessions")
      .insert({
        ip_address: ipAddress,
        timezone: timezone ?? null,
        user_agent: userAgent,
      });

    if (error) {
      req.log.warn({ error }, "Failed to track visitor session");
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Unexpected track-session error");
    res.json({ ok: true }); // Never fail the client for analytics
  }
});

// ─── Save application ─────────────────────────────────────────────────────────
router.post("/save-application", async (req, res) => {
  try {
    const { name, email, formData } = req.body as {
      name: string;
      email: string;
      formData: Record<string, unknown>;
    };

    if (!name?.toString().trim() || !email?.toString().trim()) {
      res.status(400).json({ error: "name and email are required" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toString().trim())) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.socket.remoteAddress || "";

    const fd = (formData ?? {}) as Record<string, unknown>;

    const { error } = await supabase
      .from("join_applications")
      .insert({
        name: name.toString().trim(),
        email: email.toString().toLowerCase().trim(),
        location: fd["location"] ?? null,
        role: fd["role"] ?? null,
        other_role: fd["otherRole"] ?? null,
        experience: fd["experience"] ?? null,
        skills: Array.isArray(fd["skills"]) ? fd["skills"] : [],
        github: fd["github"] ?? null,
        linkedin: fd["linkedin"] ?? null,
        project: fd["project"] ?? null,
        environment: fd["environment"] ?? null,
        status: fd["status"] ?? null,
        availability: fd["availability"] ?? null,
        work_type: Array.isArray(fd["workType"]) ? fd["workType"] : [],
        salary: fd["salary"] ?? null,
        notes: fd["notes"] ?? null,
        ip_address: ipAddress,
      });

    if (error) {
      req.log.error({ error }, "Supabase save-application error");
      res.status(500).json({ error: "Failed to save application" });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Unexpected save-application error");
    res.status(500).json({ error: "Failed to save application" });
  }
});

// ─── Newsletter subscribe ─────────────────────────────────────────────────────
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body as { email: string };

    if (!email?.toString().trim()) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const normalizedEmail = email.toString().toLowerCase().trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.socket.remoteAddress || "";

    const { error } = await supabase
      .from("join_applications")
      .insert({
        name: "Newsletter Subscriber",
        email: normalizedEmail,
        status: "newsletter",
        notes: "newsletter_subscriber",
        ip_address: ipAddress,
        skills: [],
        work_type: [],
      });

    if (error) {
      req.log.error({ error }, "Supabase subscribe error");
      res.status(500).json({ error: "Failed to save subscription" });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Unexpected subscribe error");
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

export default router;
