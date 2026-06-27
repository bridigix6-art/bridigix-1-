---
name: Supabase schema reality
description: Actual column names in Supabase tables vs what the code assumed — critical for any future DB work.
---

## join_applications — actual columns
`id, session_id, name, email, location, role, other_role, experience, skills (array), github, linkedin, project, environment, status, availability, work_type (array), salary, notes, ip_address, created_at`

There is NO `form_data` JSONB column. The code must map fields individually.

**Why:** The table was created via Supabase UI with explicit columns, not via the initializeDatabase() DDL in supabase.ts (which tried to create a generic form_data column but the real table was made separately).

**How to apply:** When saving to join_applications, always map each field individually using snake_case column names (other_role not otherRole, work_type not workType).

## chat_conversations — actual columns
`id, session_id, email, messages (JSONB), intake_summary, status, ip_address, user_agent, created_at, updated_at`

There is NO unique constraint on `email`. Upsert with `onConflict: 'email'` throws error code 42P10.

**Why:** The table was created without a UNIQUE index on email.

**How to apply:** Use select-then-update/insert pattern (check if email exists, then update or insert). Never use .upsert() with onConflict: 'email' on this table.
