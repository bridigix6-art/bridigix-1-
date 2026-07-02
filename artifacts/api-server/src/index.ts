import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (!process.env["OPENROUTER_API_KEY"]?.trim()) {
  throw new Error("OPENROUTER_API_KEY must be set before starting the API server.");
}

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const host = process.env["HOST"] ?? "0.0.0.0";

async function ensureDatabaseReady() {
  await pool.query("SELECT 1");
  logger.info("database connection ready");
}

async function ensureSessionSchema() {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        status TEXT DEFAULT 'in_progress' NOT NULL,
        export_count INTEGER DEFAULT 0 NOT NULL
      );
      CREATE TABLE IF NOT EXISTS session_state (
        session_id TEXT PRIMARY KEY NOT NULL,
        state JSONB DEFAULT '{}'::JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE TABLE IF NOT EXISTS chat_messages (
        id BIGSERIAL PRIMARY KEY NOT NULL,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE TABLE IF NOT EXISTS session_exports (
        id BIGSERIAL PRIMARY KEY NOT NULL,
        session_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        storage_path TEXT NOT NULL,
        file_size_bytes INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        CONSTRAINT session_exports_session_id_version_unique UNIQUE (session_id, version)
      );
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
      CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
      CREATE INDEX IF NOT EXISTS session_exports_session_id_idx ON session_exports(session_id);
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
          ALTER TABLE session_state DROP CONSTRAINT IF EXISTS session_state_session_id_sessions_id_fk;
          ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_session_id_sessions_id_fk;
          ALTER TABLE session_exports DROP CONSTRAINT IF EXISTS session_exports_session_id_sessions_id_fk;
          ALTER TABLE sessions ALTER COLUMN id TYPE TEXT;
          ALTER TABLE session_state ALTER COLUMN session_id TYPE TEXT;
          ALTER TABLE chat_messages ALTER COLUMN session_id TYPE TEXT;
          ALTER TABLE session_exports ALTER COLUMN session_id TYPE TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'session_state_session_id_sessions_id_fk'
        ) THEN
          ALTER TABLE session_state
            ADD CONSTRAINT session_state_session_id_sessions_id_fk
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_session_id_sessions_id_fk'
        ) THEN
          ALTER TABLE chat_messages
            ADD CONSTRAINT chat_messages_session_id_sessions_id_fk
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'session_exports_session_id_sessions_id_fk'
        ) THEN
          ALTER TABLE session_exports
            ADD CONSTRAINT session_exports_session_id_sessions_id_fk
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);
    await pool.query(`NOTIFY pgrst, 'reload schema'`);
    logger.info("session schema ready");
  } catch (err) {
    logger.error({ err }, "Could not ensure session schema");
    throw err;
  }
}

async function startServer() {
  try {
    await ensureDatabaseReady();
    await ensureSessionSchema();
  } catch (err) {
    logger.error({ err }, "Database startup check failed");
    process.exit(1);
  }

  app.listen(port, host, (err) => {
    if (err) {
      logger.error({ err, host, port }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ host, port }, "Server listening");
  });
}

startServer().catch((err) => {
  logger.error({ err }, "Server startup failed");
  process.exit(1);
});
