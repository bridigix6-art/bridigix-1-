This fixes eight specific, confirmed bugs found through real testing. Work through each section in order and actually verify each fix in the live preview before moving to the next, since several of these have been reported as fixed before and were not.

SECTION 1 — INTERACTIVE UI ELEMENTS DON'T DISAPPEAR AFTER BEING ANSWERED

The tag-selection box, slider, and multiple-choice UI elements that render inline in the chat are supposed to disappear once the user confirms their answer for that question. Right now they persist on screen and then reappear again on the next question, stacking up instead of being replaced. Find where these components are rendered conditionally in ChatModal.tsx and fix the state logic so that once a user confirms an answer through one of these elements, that specific element is removed from view immediately, and a new one only appears if the AI's next question specifically calls for a new interactive element. This should behave like a normal chat where old interactive prompts go away once answered, not accumulate.

SECTION 2 — AI IS STILL SKIPPING REQUIRED FIELDS, AND PAST EDITS HAVE BEEN CORRUPTING THE PROMPT INSTEAD OF FIXING IT

There is a known pattern causing this: previous edits to SYSTEM_PROMPT in chat.ts have been done by appending or partially replacing instructions rather than replacing the whole constant cleanly, which has left the prompt in a state with incomplete or contradictory instructions, some required fields present, others silently dropped during a partial edit. Do not repeat this pattern. Read the entire current SYSTEM_PROMPT constant first, in full, and identify exactly which required fields are currently present versus missing or contradicted.

Then write one single, complete, clean replacement for the entire SYSTEM_PROMPT constant, deleting the old one entirely rather than editing pieces of it. This replacement must include every one of the following as explicitly required fields the AI must collect before it is allowed to close the conversation: company context and what they build, the actual job title and day to day responsibilities, whether it's a new role or replacement, minimum years of experience required, reporting structure (who they report to), remote versus hybrid versus in-office, seniority and ownership level, must-have versus nice-to-have technical skills, must-have versus nice-to-have soft skills or culture fit, red flags or deal-breakers that would disqualify a candidate, engagement type and duration, start date or urgency, budget and any additional compensation, and full contact details (name, role at company, email, company website) collected last.

Be precise about scope: these should be the genuinely necessary fields a real detailed job posting would cover, not an exhaustive interrogation. Do not add speculative or low-value questions beyond this list. The goal is complete coverage of what's actually necessary, not maximum question count.

After writing the replacement, do a final pass reading it back top to bottom yourself to confirm there are no contradictions, no duplicated instructions, and no field mentioned as required in one place but missing from the actual required list, before applying it.

After applying this, run a full test conversation yourself and confirm the AI actually asks about daily responsibilities, experience minimum, reporting line, remote/hybrid/in-office, must-haves versus nice-to-haves for both technical and culture fit, and red flags, in addition to the fields already confirmed working, before it's allowed to close.

SECTION 3 — CONTACT INFO SHOULD BE A PROPER INPUT FORM, NOT PLAIN CHAT TEXT

When the AI reaches the final contact collection step (name, email, company website), instead of asking this as a plain text question expecting a typed sentence answer, render an inline form with separate labeled input fields for full name, email, and company website, styled consistently with the other interactive chat elements already built (the slider, tag picker, multiple choice buttons). The user fills in each field and taps a confirm button, and that structured data is what gets sent back into the conversation, rather than parsing a single freeform sentence for this information.

SECTION 4 — HIRING BRIEF SIDEBAR DISAPPEARS AFTER CLOSING AND REOPENING THE CHAT

If a user accidentally closes the chat modal mid-conversation and reopens it, the Hiring Brief sidebar no longer shows, even though the conversation and its data still exist. Find where the sidebar's visibility or data state is managed and fix it so that reopening an existing conversation correctly restores both the chat history and the populated Hiring Brief sidebar from whatever data has already been collected, rather than resetting to an empty or hidden state.

SECTION 5 — HIRING BRIEF CONTENT NEEDS TO BE QUALITATIVE AND DETAILED EVERYWHERE, NOT JUST IN THE REVIEW SCREEN

The editable review screen shown at the end of intake already displays detailed, well-written, qualitative summaries per field, for example a full sentence describing the role and seniority rather than a one-word fragment. Confirm this same level of detail and the same generation logic is used consistently in the live sidebar shown during the conversation as well, not just in the final review screen. If the live sidebar is using a different, shorter extraction method than the final review screen, unify them so both pull from the same detailed summarization logic.

SECTION 6 — "CONTINUE A PREVIOUS CHAT" INCORRECTLY TREATS COMPLETED CONVERSATIONS AS UNFINISHED, AND DOES NOT ACTUALLY WORK

A completed conversation is one where the AI has collected contact information (name, email, and so on) and reached INTAKE_COMPLETE. Right now, looking up a completed conversation by email still shows it as an unfinished, resumable chat, which is incorrect. Fix this by checking the conversation's actual status field, and if status is complete, do not offer to resume it as an in-progress chat. Instead, show a separate, clearly labeled option such as "Resume a completed intake? Enter your email" that, when used, shows the user their finished Hiring Brief in read-only form rather than continuing the conversation as if it were still in progress. Confirm this entire lookup flow actually works end to end, since it has been reported as broken before: enter an email tied to a real completed conversation and confirm the correct completed state is shown, not an empty result or an incorrectly resumable chat.

SECTION 7 — FONT SIZE THROUGHOUT THE CHAT IS TOO SMALL

Increase the font size and font weight of the text throughout the chat interface, including AI messages, user messages, and the input bar, to a clearly larger and slightly bolder size than what's currently rendered. It should be comfortably readable without zooming, similar in scale to a standard modern messaging app, not the current small, thin text.

SECTION 8 — REPLACE TABLE-BASED CONVERSATION STORAGE ENTIRELY WITH SCREENSHOTS AND PDF BRIEFS, FULLY AUTOMATED

This is a firm architectural change, not an addition: tables are not suitable for storing conversational data and the raw JSON table approach for reviewing conversations should be eliminated, not just supplemented. Implement this fully automatically, with no manual step required after a conversation completes.

When a conversation reaches INTAKE_COMPLETE, automatically and without any manual trigger: render the full conversation thread exactly as it appeared in the chat UI and capture it as an image file (a genuine rendered screenshot of the actual chat interface, not a plain text export), and separately generate a properly formatted PDF document of the finalized Hiring Brief using the detailed qualitative fields described in Section 5, not a raw data dump or table export.

Upload both files to Supabase Storage automatically as part of the same process that handles INTAKE_COMPLETE. Organize them by chat session, so each completed conversation has its own clearly identified screenshot file and PDF file grouped together, retrievable as a set.

Keep only a minimal lightweight reference row in the database for lookup purposes: conversation id, session id, email, a link to the screenshot file, a link to the PDF file, and a timestamp. This reference row is purely for locating the files, it must not contain the conversational content itself or a JSON dump of messages as the primary stored content going forward.

Update the admin panel so that opening a completed conversation shows the rendered chat screenshot directly and an embedded view or download link for the Hiring Brief PDF, replacing the current raw JSON table view entirely for completed conversations.

Test this yourself: complete a full real conversation, confirm a screenshot file and a PDF file are both automatically generated and stored in Supabase Storage with no manual step, and confirm the admin panel shows them correctly organized by session.

GENERAL REQUIREMENT
For every section above, test the fix yourself in the live running app exactly as a real user would. Several of these issues have been reported as already fixed in previous sessions and were found to still be broken on real testing, so do not report something as fixed unless you have personally verified it works through an actual end to end test, not just by reading the code and confirming it looks correct. At the end, give me a section by section summary confirming exactly what you tested and saw working, and clearly flag anything you were not able to fully verify.
