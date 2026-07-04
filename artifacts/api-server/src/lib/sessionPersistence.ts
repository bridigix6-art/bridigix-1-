import { pool } from "@workspace/db";

type SessionRow = {
  status?: string | null;
  export_count?: number | string | null;
};

type SessionStateRow = {
  state?: Record<string, unknown> | null;
};

type ChatMessageRow = {
  role?: string | null;
  content?: string | null;
};

export interface ChatMessagePayload {
  role: string;
  content: string;
}

export interface SessionStatePatch {
  email?: string | null;
  status?: string | null;
  intakeSummary?: string | null;
  brief?: Record<string, unknown> | null;
  completionPct?: number | null;
}

export interface LoadedSession {
  sessionId: string;
  status: string;
  exportCount: number;
  state: Record<string, unknown> | null;
  messages: Array<{ role: string; content: string }>; 
}

export async function ensureSession(sessionId: string): Promise<void> {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  await pool.query(
    `INSERT INTO sessions (id, status, updated_at)
     VALUES ($1, 'in_progress', NOW())
     ON CONFLICT (id) DO UPDATE SET updated_at = NOW()`,
    [sessionId],
  );
}

export async function saveSessionMessages(
  sessionId: string,
  messages: ChatMessagePayload[],
): Promise<void> {
  await ensureSession(sessionId);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM chat_messages WHERE session_id = $1`,
      [sessionId],
    );

    if (messages.length > 0) {
      const placeholders: string[] = [];
      const values: unknown[] = [sessionId];
      messages.forEach((message, index) => {
        const roleIndex = index * 2 + 2;
        const contentIndex = index * 2 + 3;
        placeholders.push(`($1, $${roleIndex}, $${contentIndex})`);
        values.push(message.role, message.content);
      });

      const insertSql = `INSERT INTO chat_messages (session_id, role, content) VALUES ${placeholders.join(", ")}`;
      await client.query(insertSql, values);
    }

    await client.query(
      `UPDATE sessions SET updated_at = NOW() WHERE id = $1`,
      [sessionId],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function upsertSessionState(
  sessionId: string,
  patch: SessionStatePatch,
): Promise<void> {
  await ensureSession(sessionId);

  const result = await pool.query(
    `SELECT state FROM session_state WHERE session_id = $1`,
    [sessionId],
  );

  const existingState = result.rows[0]?.state ?? {};
  const mergedState = { ...existingState, ...patch };

  await pool.query(
    `INSERT INTO session_state (session_id, state, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (session_id) DO UPDATE SET state = $2::jsonb, updated_at = NOW()`,
    [sessionId, JSON.stringify(mergedState)],
  );
}

export async function updateSessionStatus(
  sessionId: string,
  status: string,
): Promise<void> {
  await ensureSession(sessionId);
  await pool.query(
    `UPDATE sessions SET status = $2, updated_at = NOW() WHERE id = $1`,
    [sessionId, status],
  );
}

export async function loadSession(
  sessionId: string,
): Promise<LoadedSession | null> {
  const sessionResult = await pool.query<SessionRow>(
    `SELECT status, export_count FROM sessions WHERE id = $1`,
    [sessionId],
  );
  const sessionRow = sessionResult.rows[0];
  if (!sessionRow) {
    return null;
  }

  const stateResult = await pool.query(
    `SELECT state FROM session_state WHERE session_id = $1`,
    [sessionId],
  );

  const messagesResult = await pool.query(
    `SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY id ASC`,
    [sessionId],
  );

  return {
    sessionId,
    status: sessionRow.status ?? "in_progress",
    exportCount: Number(sessionRow.export_count ?? 0),
    state: stateResult.rows[0]?.state ?? null,
    messages: messagesResult.rows.map((row: { role: string; content: string }) => ({
      role: row.role,
      content: row.content,
    })),
  };
}

export async function loadCompletedSessionByEmail(
  email: string,
): Promise<{ sessionId: string; messages: Array<{ role: string; content: string }>; intakeSummary: string | null } | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const result = await pool.query(
    `SELECT s.id, ss.state
     FROM sessions s
     JOIN session_state ss ON ss.session_id = s.id
     WHERE LOWER(ss.state->>'email') = $1
       AND s.status = 'complete'
     ORDER BY ss.updated_at DESC
     LIMIT 1`,
    [normalizedEmail],
  );

  if (!result.rows[0]) {
    return null;
  }

  const sessionId = result.rows[0].id as string;
  const state = result.rows[0].state ?? {};
  const messagesResult = await pool.query(
    `SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY id ASC`,
    [sessionId],
  );

  return {
    sessionId,
    messages: messagesResult.rows.map((row: { role: string; content: string }) => ({
      role: row.role,
      content: row.content,
    })),
    intakeSummary: typeof state.intakeSummary === "string" ? state.intakeSummary : "complete",
  };
}

export async function insertSessionExport(
  sessionId: string,
  storagePath: string,
  fileSizeBytes: number,
): Promise<number> {
  await ensureSession(sessionId);

  const countResult = await pool.query(
    `SELECT export_count FROM sessions WHERE id = $1`,
    [sessionId],
  );
  const currentCount = Number(countResult.rows[0]?.export_count ?? 0);
  const version = currentCount + 1;

  await pool.query(
    `INSERT INTO session_exports (session_id, version, storage_path, file_size_bytes)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, version, storagePath, fileSizeBytes],
  );

  await pool.query(
    `UPDATE sessions SET export_count = $2, updated_at = NOW() WHERE id = $1`,
    [sessionId, version],
  );

  return version;
}
