import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["SUPABASE_URL"]?.trim() ?? "";
const supabaseAnonKey = process.env["SUPABASE_ANON_KEY"]?.trim() ?? "";
const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]?.trim() ?? supabaseAnonKey;

export const supabase = createClient(supabaseUrl || "https://example.supabase.co", supabaseAnonKey || "placeholder-anon-key");

// Service-role client — used for storage uploads and admin operations
export const supabaseAdmin = createClient(supabaseUrl || "https://example.supabase.co", supabaseServiceKey || "placeholder-service-role-key");

async function ensureTable(tableName: string, sql: string) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return;
  }

  const { error } = await supabaseAdmin.from(tableName).select("id").limit(1);

  if (error && error.code === "42P01") {
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (!projectRef) {
      return;
    }

    await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
  }
}

export async function ensureRecruiterIntakeTable() {
  await ensureTable(
    "recruiter_intakes",
    `
      CREATE TABLE IF NOT EXISTS recruiter_intakes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        contact_name TEXT,
        contact_email TEXT,
        company_name TEXT,
        company_website TEXT,
        job_title TEXT,
        employment_type TEXT,
        location_type TEXT,
        location_city TEXT,
        role_description TEXT,
        responsibilities TEXT,
        required_skills TEXT,
        nice_to_have_skills TEXT,
        experience TEXT,
        seniority TEXT,
        headcount TEXT,
        urgency TEXT,
        salary_min NUMERIC,
        salary_max NUMERIC,
        keep_salary_confidential BOOLEAN DEFAULT FALSE,
        interview_rounds TEXT,
        red_flags TEXT,
        culture TEXT,
        visa_sponsorship TEXT,
        referral_bonus TEXT,
        source TEXT DEFAULT 'bridgix_recruiter_form',
        submission_payload JSONB DEFAULT '{}'::JSONB,
        submitted_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS recruiter_intakes_contact_email_idx ON recruiter_intakes(contact_email);
      CREATE INDEX IF NOT EXISTS recruiter_intakes_company_name_idx ON recruiter_intakes(company_name);
      CREATE INDEX IF NOT EXISTS recruiter_intakes_submitted_at_idx ON recruiter_intakes(submitted_at DESC);
    `
  );
}

export async function initializeDatabase() {
  // Create tables via supabase-js insert/select patterns (no raw SQL RPC needed)
  // completed_intakes: lightweight lookup table for confirmed briefs
  await ensureTable(
    "completed_intakes",
    `
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
    `
  );
}
