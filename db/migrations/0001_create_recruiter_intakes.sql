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
