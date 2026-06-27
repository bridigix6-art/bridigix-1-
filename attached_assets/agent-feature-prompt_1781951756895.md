I want to upgrade the AI intake chat (ChatModal.tsx and chat.ts) with three specific features. Please implement them carefully, one at a time, testing each one actually works in the live preview before moving to the next, rather than building all three at once and hoping nothing broke.

IMPORTANT CONTEXT FIRST:
- The chat currently works as a plain text conversation: the AI asks questions, the user types plain text answers, and the AI follows up.
- A voice input button using the Web Speech API already exists in ChatModal.tsx (a microphone icon that fills the text input with transcribed speech) — check whether it's already working correctly before assuming it needs to be built from scratch. If it exists but has bugs, fix it rather than duplicating it.
- Do not change the underlying system prompt, the conversation flow logic, or the Supabase saving logic unless a feature below specifically requires it.

FEATURE 1 — INTERACTIVE UI ELEMENTS INSTEAD OF PLAIN TEXT FOR SIMPLE ANSWERS

For specific, low-ambiguity questions the AI asks during intake, render an interactive UI element inline in the chat instead of expecting the user to type a full sentence. Specifically:

- When the AI asks about work style or how structured vs. adaptive the team/role is, render a slider control inline in the chat, labeled with "Structured" on one end and "Highly Adaptive" on the other. The user drags it to a position, then confirms, and that becomes their answer.
- When the AI asks about core tech stack, render a set of clickable tag buttons (e.g., JavaScript, TypeScript, Python, Go, React, Node.js, and a few other common ones) that the user can multi-select, plus a way to add a custom tag not in the list. Selected tags should be visually distinct from unselected ones.
- When the AI asks about contract type (full-time, part-time, contractor, etc.), render simple multiple-choice buttons instead of a text input, and let the user tap one to answer.

These interactive elements should appear as their own message bubble from the AI, replacing the plain text input for that specific turn only — once the user responds via the UI element, the conversation continues normally with plain text for all other questions. The user's selection should be sent to the backend in a clear, parseable format (for example, as a structured value alongside or instead of free text) so the AI can read it as a normal answer and continue the conversation naturally.

Use the existing design system already present on the site (the same fonts, colors, and rounded-corner style visible elsewhere in ChatModal.tsx) so these new elements look like they belong, not like a generic default component pasted in.

FEATURE 2 — LIVE "CANDIDATE SPEC PROFILE" SIDEBAR

Add a panel, visible alongside the chat (sidebar on larger screens, and gracefully collapsed or accessible via a toggle on smaller/mobile screens), that shows a live-updating summary of what's been gathered so far in the conversation. As the user answers each question, the relevant field in this panel should visually populate or update in near real time — for example, "Role" appears once they've described the role, "Tech Stack" appears once they've picked their stack tags, and so on.

This should pull from the same structured information the AI is already collecting per our existing intake flow (company context, role, seniority, past hiring signal, work style, requirements, timeline, budget, contact). It does not need to wait for the final INTAKE_COMPLETE summary — it should update incrementally, field by field, as each piece of information is confirmed during the conversation, giving the user visible proof that the AI is actually tracking what they say.

If a field hasn't been answered yet, show it in a clearly "not yet filled" state rather than blank or missing, so the user can see the full shape of what's being built even before it's complete.

FEATURE 3 — VOICE TO TEXT

Before building anything new for this, first check the existing microphone/speech-to-text implementation in ChatModal.tsx and confirm whether it currently works correctly end to end: tapping the mic button starts listening, speech gets transcribed into the input field in real time, and tapping again (or speech ending) stops it cleanly. Test this yourself in the live preview.

If it already works correctly, leave it as is and just confirm it still works after Features 1 and 2 are added, since the new interactive elements should not interfere with or break the existing voice input.

If it has bugs (wrong button position, doesn't actually transcribe, throws errors), fix the existing implementation rather than building a second, separate version.

FINAL STEPS — DO NOT SKIP:

After implementing all three features, actually test the full chat flow yourself in the live preview: trigger each interactive UI element (slider, tags, multiple choice), confirm the sidebar profile updates correctly as you answer, and confirm voice input still works. Then tell me clearly what you built, what (if anything) was already working before you touched it, and flag anything that didn't fully work as expected rather than reporting success if it doesn't actually work.
