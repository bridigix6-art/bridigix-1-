import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["SUPABASE_URL"] ?? "";
const supabaseKey = process.env["SUPABASE_ANON_KEY"] ?? "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function initializeDatabase() {
  const sql = `
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT,
      messages JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS join_applications (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT,
      email TEXT,
      form_data JSONB,
      ip_address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS visitor_sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      ip_address TEXT,
      timezone TEXT,
      country TEXT,
      city TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const { error } = await supabase.rpc("exec_sql", { query: sql });
  if (error) {
    console.error("DB init error (tables may already exist):", error.message);
  }
}
