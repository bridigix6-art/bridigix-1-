import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["SUPABASE_URL"] ?? "";
const supabaseAnonKey = process.env["SUPABASE_ANON_KEY"] ?? "";
const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service-role client — used for storage uploads and admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function initializeDatabase() {
  // Create tables via supabase-js insert/select patterns (no raw SQL RPC needed)
  // completed_intakes: lightweight lookup table for confirmed briefs
  const { error: ciError } = await supabaseAdmin
    .from("completed_intakes")
    .select("id")
    .limit(1);

  if (ciError && ciError.code === "42P01") {
    // Table doesn't exist — create it via management API
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectRef) {
      const sql = `
        CREATE TABLE IF NOT EXISTS completed_intakes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id TEXT,
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

      await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sql }),
      });
    }
  }
}
