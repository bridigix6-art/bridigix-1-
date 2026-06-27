import { Router } from "express";
import { supabase } from "../lib/supabase";
import {
  saveSessionMessages,
  upsertSessionState,
  loadCompletedSessionByEmail,
  loadSession,
  updateSessionStatus,
} from "../lib/sessionPersistence";

const router = Router();

// ─── Save chat to session-backed tables ───────────────────────────────────
router.post("/save-chat", async (req, res) => {
  try {
    const { email, messages, sessionId } = req.body as {
      email?: string;
      messages: Array<{ role: string; content: string }>;
      sessionId?: string;
    };

    if (!Array.isArray(messages) || !messages.every((m) => m && typeof m.role === "string" && typeof m.content === "string")) {
      res.status(400).json({ error: "messages must be an array of role/content objects" });
      return;
    }
    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    await saveSessionMessages(sessionId, messages);

    if (email) {
      await upsertSessionState(sessionId, { email: email.toLowerCase().trim() });
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Unexpected save-chat error");
    res.status(500).json({ error: "Failed to save chat" });
  }
});

// ─── Load session by sessionId (resumes in-progress sessions) ──────────────
router.get("/load-session", async (req, res) => {
  try {
    const { sessionId } = req.query as { sessionId?: string };
    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    const session = await loadSession(sessionId);
    if (!session || session.messages.length === 0) {
      res.json({ found: false });
      return;
    }

    res.json({
      found: true,
      messages: session.messages,
      status: session.status,
      state: session.state,
    });
  } catch (err) {
    req.log.error({ err }, "Unexpected load-session error");
    res.status(500).json({ error: "Failed to load session" });
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

    const session = await loadCompletedSessionByEmail(email);
    if (!session || session.messages.length === 0) {
      res.json({ found: false });
      return;
    }

    res.json({ found: true, messages: session.messages, intakeSummary: session.intakeSummary });
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

    // Persist confirmed brief into the new session state tables
    if (sessionId) {
      await upsertSessionState(sessionId, {
        email: email?.toLowerCase().trim() ?? null,
        status: briefStatus,
        intakeSummary: "complete",
      });
      if (briefStatus === "confirmed") {
        await updateSessionStatus(sessionId, "complete");
      }
    }

    // Persist confirmed brief as structured JSON in chat_conversations for legacy compatibility
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
