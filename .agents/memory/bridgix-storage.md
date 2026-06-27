---
name: Bridgix Storage Architecture
description: Supabase Storage bucket, completed_intakes table, upload/record flow for screenshots and PDFs.
---

## Bucket
- Name: `conversation-records` (private, not public)
- Project ref: vtgbivniyrrmtyyczvjn
- Created via: `POST {SUPABASE_URL}/storage/v1/bucket` with SUPABASE_SERVICE_ROLE_KEY
- File layout: `{sessionId}/screenshot.png` and `{sessionId}/hiring-brief.pdf`
- Signed URLs: 10-year expiry (315360000s) generated via `supabaseAdmin.storage.createSignedUrl()`

## completed_intakes table
- Created on API startup via `pool.query(CREATE TABLE IF NOT EXISTS ...)` using @workspace/db pool
- Columns: id, session_id (UNIQUE), email, screenshot_url, pdf_url, stage, confirmed_at, created_at
- PostgREST schema reload triggered with `NOTIFY pgrst, 'reload schema'` after table creation
- NOT accessed via supabase-js (PostgREST cache lag) — use raw `pool.query()` in all routes

## API endpoints (in storage.ts)
- `POST /api/upload-artifact` — accepts `{ sessionId, type: "screenshot"|"pdf", dataUrl: "data:..." }`; returns `{ ok, path, url }`
- `POST /api/complete-intake` — accepts `{ sessionId, email, screenshotUrl, pdfUrl }`; upserts into completed_intakes via raw SQL

## API endpoint (in admin.ts)
- `GET /admin/completed-intakes` — returns all rows from completed_intakes via raw SQL (not supabase-js)
- `GET /admin/stats` — includes `completedIntakes` count from raw pool query

## Frontend flow (ChatModal.tsx)
1. At INTAKE_COMPLETE detection: `captureAndUploadScreenshot()` fires (600ms delay for DOM settle), uploads chat area div via html2canvas → `/api/upload-artifact type=screenshot`, result stored in `screenshotUrlRef.current`
2. At brief confirm (`handleBriefConfirm`): `generateAndUploadPdf(brief)` runs jsPDF, uploads → `/api/upload-artifact type=pdf`, then `POST /api/complete-intake` ties both URLs to sessionId
3. `POST /api/save-hiring-brief` still called for legacy load-chat recovery (chat_conversations.intake_summary)

## Supabase client setup (lib/supabase.ts)
- `supabase` = anon key client (for chat_conversations, join_applications)
- `supabaseAdmin` = service role client (for storage operations)
- Both exported from the same file

## Why raw SQL not supabase-js for completed_intakes
Supabase PostgREST caches the schema; newly created tables via raw pg don't appear immediately. Using `pool.query()` bypasses PostgREST entirely and works reliably.

## Admin panel
- New "Completed Briefs" tab is the primary tab (replaces old "Conversations" tab as primary)
- Shows screenshot inline (img tag) + PDF download link per CompletedIntakeCard
- "Setup DB" button triggers `/admin/setup-db` which creates the table if needed
