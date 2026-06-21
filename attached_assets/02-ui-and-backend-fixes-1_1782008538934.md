This covers everything except the AI's conversation logic, which has already been fixed separately. Work through each numbered section in order, test each one in the live preview before moving to the next, and don't touch the SYSTEM_PROMPT content in chat.ts, that part is already correct and shouldn't be modified by this pass.

SECTION 1 — REBUILD THE SIDEBAR INTO A REAL "HIRING BRIEF"

Rename every instance of "Candidate Brief" in the UI to "Hiring Brief."

Currently each field in the sidebar shows only a short, generic one-line fragment. Rebuild this so each field shows a properly summarized but genuinely detailed entry, written in full clauses, not a single extracted word or short phrase. For example, instead of showing "ROLE: it's an ai startup," it should show something like "Senior Backend Engineer to own API architecture and scale the recommendation service, replacing a previous contractor." Pull this from the AI's actual understanding as the conversation progresses, not a raw quote fragment from the user's last message.

Redesign the visual style of this sidebar to look premium and intentional, not like a generic colorful component library default. Remove any cheap-looking colorful icons or badges currently used per field. Use a clean, restrained design: consistent typography, a single accent color used sparingly, generous whitespace, and subtle dividers between sections rather than colorful icons next to every label. Match the existing design language already used elsewhere on the Bridgix site, the green and off-white palette and typography already in use on the landing page, rather than introducing a new visual style specific to this sidebar.

SECTION 2 — STORE THE HIRING BRIEF PROPERLY IN THE BACKEND

Right now the only thing saved to Supabase is the raw messages array and an intake_summary field containing an unformatted block of text. Add a new table, hiring_briefs, that stores the finalized brief in a clean, structured way, one row per completed intake, with each major field (company context, role, seniority, technical requirements, prior hiring history, engagement terms, budget, work style, contact info, notable quotes, open flags) as its own column rather than one giant text blob, so it can actually be read and filtered later without parsing JSON by eye. Link it to the corresponding chat_conversations row via the existing session linking pattern already used elsewhere in the schema. Update chat.ts so that once INTAKE_COMPLETE is generated, it parses that structured output and inserts a proper row into hiring_briefs, not just a text dump into intake_summary. Give me the exact CREATE TABLE SQL for this new table so I can run it in Supabase myself, the same way previous tables were set up.

SECTION 3 — FIX CHAT MESSAGE STYLING

In ChatModal.tsx, the user's message bubbles are currently solid black. Change them to a light green background with dark text, readable and soft, not harsh. The AI's message bubbles should be a darker green than the user's, with a slightly transparent or muted quality, clearly distinguishable from the user's lighter green at a glance. Keep both colors within the site's existing green palette rather than introducing a new color.

SECTION 4 — FIX THE INPUT BAR TEXT SIZE

The text input bar at the bottom of the chat is too small to read comfortably. Increase the font size of both the input text and the placeholder text to a clearly larger, more legible size, comparable to a standard comfortable chat input in a polished consumer chat app, not a cramped small input field. Adjust the input bar's height and padding as needed so the larger text doesn't look cramped inside it.

SECTION 5 — FIX THE MICROPHONE PERMISSION ERROR, FOR REAL THIS TIME

The microphone button still does not work; tapping it produces a browser error about not being able to ask for permission, even with no other apps or overlays running, and device causes have already been ruled out. Investigate the actual code cause. Specifically check whether SpeechRecognition.start() is being called fully synchronously inside the onClick handler with absolutely no async operation, state update, or delay before it, since any of those breaks the required direct user gesture and causes exactly this kind of permission failure. Also check whether a new SpeechRecognition instance is accidentally being created on every render instead of once, which can cause competing or conflicting permission requests. Fix the actual cause, then test it yourself in the live preview and confirm tapping the mic produces a normal browser permission prompt and actually transcribes real speech into the input field.

GENERAL REQUIREMENT FOR ALL SECTIONS
After completing each section, test it yourself in the live running app exactly as a real user would, not just by reading the code. At the end, give me a clear section by section summary of what you changed and confirm which ones you personally verified working, and clearly flag anything you were not able to fully verify rather than reporting everything as done.
