import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Ensure completed_intakes table exists on startup using the shared db pool
async function ensureCompletedIntakesTable() {
  try {
    await pool.query(`
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
    `);
    // Notify PostgREST to reload its schema cache so the new table is visible
    await pool.query(`NOTIFY pgrst, 'reload schema'`);
    logger.info("completed_intakes table ready");
  } catch (err) {
    logger.warn({ err }, "Could not ensure completed_intakes table (may already exist or no access)");
  }
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  ensureCompletedIntakesTable().catch(() => {});
});
