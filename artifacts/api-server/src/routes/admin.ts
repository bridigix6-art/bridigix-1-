import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "bridigix2025admin";

function checkAuth(req: Parameters<Parameters<typeof Router.prototype.use>[0]>[0], res: Parameters<Parameters<typeof Router.prototype.use>[0]>[1], next: Parameters<Parameters<typeof Router.prototype.use>[0]>[2]) {
  const auth = req.headers["x-admin-password"];
  if (auth !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.get("/admin/conversations", checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ conversations: data ?? [] });
  } catch (err) {
    req.log.error({ err }, "Admin conversations error");
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.get("/admin/applications", checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("join_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ applications: data ?? [] });
  } catch (err) {
    req.log.error({ err }, "Admin applications error");
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.get("/admin/stats", checkAuth, async (req, res) => {
  try {
    const [convResult, appResult] = await Promise.all([
      supabase.from("chat_conversations").select("id", { count: "exact", head: true }),
      supabase.from("join_applications").select("id", { count: "exact", head: true }),
    ]);

    res.json({
      totalConversations: convResult.count ?? 0,
      totalApplications: appResult.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.post("/admin/verify", (req, res) => {
  const { password } = req.body as { password: string };
  if (password === ADMIN_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

router.post("/admin/setup-db", checkAuth, async (req, res) => {
  try {
    const queries = [
      `CREATE TABLE IF NOT EXISTS chat_conversations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE,
        messages JSONB,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS join_applications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT,
        email TEXT,
        form_data JSONB,
        ip_address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    ];

    for (const q of queries) {
      await supabase.rpc("exec_sql", { query: q }).catch(() => {});
    }

    res.json({ ok: true, message: "Database setup attempted. Please verify in Supabase dashboard." });
  } catch (err) {
    res.status(500).json({ error: "Setup failed" });
  }
});

export default router;
