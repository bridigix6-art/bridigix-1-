---
name: Bridgix chat architecture
description: Chat modal flow, DB persistence patterns, INTAKE_COMPLETE parsing, hiring brief review screen.
---

## Session flow (sessionPhase state)
"init" → "continue_banner" (if localStorage has draft) or "chat"
"chat" → "review" (when INTAKE_COMPLETE detected, after 2.2s delay)
"review" → back to "chat" + complete=true (when founder confirms brief)

## DB persistence — avoiding duplicate rows
- Frontend generates `sessionId = crypto.randomUUID()` once per modal open
- Sent with every `/api/chat` and `/api/save-chat` request
- chat.ts: select by session_id → update if found, insert if not (never insert-on-every-message)
- save-chat: select by email first, then session_id fallback → update or insert

**Why:** Old code inserted a new row on every single chat message, making chat_conversations unreadable.

## INTAKE_COMPLETE format (from SYSTEM_PROMPT)
AI outputs this block and nothing else when intake is done:
```
INTAKE_COMPLETE
COMPANY CONTEXT: ...
ROLE: ...
SENIORITY & OWNERSHIP: ...
PAST HIRING SIGNAL: ...
WORK STYLE & CULTURE: ...
REQUIREMENTS: ...
TIMELINE: ...
BUDGET: ...
CONTACT: ...
NOTABLE QUOTES OR CONTEXT: ...
OPEN QUESTIONS OR FLAGS: ...
```
parseIntakeComplete() uses regex to extract each field between successive labels.

## Hiring brief table
hiring_briefs table may not exist (only anon key, can't CREATE TABLE). The save-hiring-brief endpoint:
1. Updates chat_conversations.intake_summary with JSON of the brief
2. Tries to insert into hiring_briefs — logs warning if it fails (graceful)
SQL to create it:
```sql
CREATE TABLE hiring_briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT, session_id TEXT, status TEXT DEFAULT 'draft',
  company_context TEXT, role TEXT, seniority_ownership TEXT,
  past_hiring_signal TEXT, work_style_culture TEXT, requirements TEXT,
  timeline TEXT, budget TEXT, contact TEXT, notable_quotes TEXT,
  open_flags TEXT, raw_intake TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), confirmed_at TIMESTAMPTZ
);
```

## load-chat behavior
Returns `{ found: boolean, messages, intakeSummary }`.
Only returns rows where status = 'complete'. Frontend checks `data.found && data.messages.length > 0`.

## Bubble colors
- User bubble: rgba(52,211,153,0.14) bg with rgba(52,211,153,0.22) border — light mint green
- AI bubble: rgba(26,122,74,0.12) bg with rgba(26,122,74,0.18) border — darker forest green
- Both use #0A0A0A text

## Microphone fix
- No useCallback for handleMicClick — regular function
- Uses isListeningRef (ref) instead of state to check current listening state, so function reference stays stable
- recognition.start() called synchronously at end of click handler with no async gap before it
