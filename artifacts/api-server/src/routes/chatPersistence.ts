import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.post("/save-chat", async (req, res) => {
  try {
    const { email, messages } = req.body as {
      email: string;
      messages: Array<{ role: string; content: string }>;
    };

    if (!email || !Array.isArray(messages)) {
      res.status(400).json({ error: "email and messages are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.socket.remoteAddress
      || "";
    const userAgent = req.headers["user-agent"] ?? "";

    // Try to update an existing row first; if none exists, insert a new one
    const { data: existing } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    let error;
    if (existing) {
      const { error: updateErr } = await supabase
        .from("chat_conversations")
        .update({
          messages,
          ip_address: ipAddress,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        })
        .eq("email", normalizedEmail);
      error = updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from("chat_conversations")
        .insert({
          email: normalizedEmail,
          messages,
          ip_address: ipAddress,
          user_agent: userAgent,
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
    req.log.error({ err }, "Save chat error");
    res.status(500).json({ error: "Failed to save chat" });
  }
});

router.get("/load-chat", async (req, res) => {
  try {
    const email = (req.query["email"] as string | undefined)?.toLowerCase().trim();

    if (!email) {
      res.status(400).json({ error: "email query param required" });
      return;
    }

    const { data, error } = await supabase
      .from("chat_conversations")
      .select("messages")
      .eq("email", email)
      .single();

    if (error || !data) {
      res.json({ messages: null });
      return;
    }

    res.json({ messages: data.messages });
  } catch (err) {
    req.log.error({ err }, "Load chat error");
    res.status(500).json({ error: "Failed to load chat" });
  }
});

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
      || req.socket.remoteAddress
      || "";

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
    req.log.error({ err }, "Save application error");
    res.status(500).json({ error: "Failed to save application" });
  }
});

export default router;
