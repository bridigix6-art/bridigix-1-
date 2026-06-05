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

    const { error } = await supabase
      .from("chat_conversations")
      .upsert(
        {
          email: normalizedEmail,
          messages,
          ip_address: ipAddress,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

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

    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.socket.remoteAddress
      || "";

    const { error } = await supabase
      .from("join_applications")
      .insert({
        name,
        email: email.toLowerCase().trim(),
        form_data: formData,
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
