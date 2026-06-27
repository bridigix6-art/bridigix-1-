import { Router, type Request, type Response, type NextFunction } from "express";
import { supabase, supabaseAdmin } from "../lib/supabase";
import { pool } from "@workspace/db";

const router = Router();

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "bridigix2025admin";

function checkAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["x-admin-password"];
  if (auth !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// ─── Completed intakes (primary — from new storage-based flow) ────────────────
router.get("/admin/completed-intakes", checkAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, session_id, email, screenshot_url, pdf_url, stage, confirmed_at, created_at
       FROM completed_intakes
       ORDER BY confirmed_at DESC`
    );
    res.json({ intakes: result.rows ?? [] });
  } catch (err: unknown) {
    const pgErr = err as { code?: string; message?: string };
    if (pgErr?.code === "42P01") {
      res.json({ intakes: [] });
      return;
    }
    req.log.error({ err }, "Admin completed-intakes error");
    res.status(500).json({ error: "Failed to fetch completed intakes" });
  }
});

// ─── Legacy conversations (kept for in-progress / historical records) ─────────
router.get("/admin/conversations", checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("id, email, ip_address, user_agent, created_at, updated_at, status")
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
    const [convResult, appResult, intakeResult] = await Promise.all([
      supabase.from("chat_conversations").select("id", { count: "exact", head: true }),
      supabase.from("join_applications").select("id", { count: "exact", head: true }),
      pool.query(`SELECT COUNT(*)::int AS count FROM completed_intakes`).catch(() => ({ rows: [{ count: 0 }] })),
    ]);

    res.json({
      totalConversations: convResult.count ?? 0,
      totalApplications: appResult.count ?? 0,
      completedIntakes: (intakeResult as { rows: Array<{ count: number }> }).rows[0]?.count ?? 0,
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
    const supabaseUrl = process.env["SUPABASE_URL"] ?? "";
    const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

    if (!projectRef || !serviceKey) {
      res.json({ ok: false, message: "Cannot run setup: missing service role key or project ref" });
      return;
    }

    const sql = `
      CREATE TABLE IF NOT EXISTS completed_intakes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id TEXT UNIQUE,
        email TEXT,
        screenshot_url TEXT,
        pdf_url TEXT,
        stage TEXT DEFAULT 'complete',
        confirmed_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS completed_intakes_email_idx ON completed_intakes(email);
      CREATE INDEX IF NOT EXISTS completed_intakes_session_idx ON completed_intakes(session_id);
    `;

    const result = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });

    const body = await result.json().catch(() => ({}));
    res.json({ ok: result.ok, status: result.status, body });
  } catch (err) {
    res.status(500).json({ error: "Setup failed" });
  }
});

export default router;
