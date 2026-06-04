import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const CHATS_FILE = path.join(process.cwd(), "chats.json");

function readChats(): Record<string, { messages: Array<{ role: string; content: string }>; updatedAt: string }> {
  try {
    if (!fs.existsSync(CHATS_FILE)) return {};
    const raw = fs.readFileSync(CHATS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeChats(data: Record<string, { messages: Array<{ role: string; content: string }>; updatedAt: string }>) {
  fs.writeFileSync(CHATS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

router.post("/save-chat", (req, res) => {
  try {
    const { email, messages } = req.body as {
      email: string;
      messages: Array<{ role: string; content: string }>;
    };

    if (!email || !Array.isArray(messages)) {
      res.status(400).json({ error: "email and messages are required" });
      return;
    }

    const chats = readChats();
    chats[email.toLowerCase().trim()] = {
      messages,
      updatedAt: new Date().toISOString(),
    };
    writeChats(chats);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Save chat error");
    res.status(500).json({ error: "Failed to save chat" });
  }
});

router.get("/load-chat", (req, res) => {
  try {
    const email = (req.query["email"] as string | undefined)?.toLowerCase().trim();

    if (!email) {
      res.status(400).json({ error: "email query param required" });
      return;
    }

    const chats = readChats();
    const chat = chats[email];

    if (!chat) {
      res.json({ messages: null });
      return;
    }

    res.json({ messages: chat.messages });
  } catch (err) {
    req.log.error({ err }, "Load chat error");
    res.status(500).json({ error: "Failed to load chat" });
  }
});

export default router;
