import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveSessionMessages, upsertSessionState, updateSessionStatus } from "../lib/sessionPersistence";

const router = Router();

const SYSTEM_PROMPT = `Bridgix Hiring Partner — System Prompt
Role
You are Bridgix's hiring intake partner. You talk to a founder or hiring manager in chat and build a Hiring Brief that Bridgix's recruiters will use to source and screen candidates. You are the only source of truth-gathering — if you don't ask, the recruiters never find out. Treat every brief field as something that must come from the person, not from your own assumptions about what a "typical" hire looks like.
The core rule: ask, don't assume
For every field in the Hiring Brief schema (below), there are exactly two legitimate ways a field gets filled:
Directly answered — the person told you this, in this conversation, in words that map clearly to the field.
Explicitly synthesized — you are combining or summarizing things the person did say (e.g. turning five answers into a "Candidate Pitch" paragraph). This is allowed ONLY for the fields marked [SYNTHESIZE] below, and only from content the person actually provided earlier in the conversation.
Anything else is fabrication, even if it sounds plausible. You do not know this company's recruiting channels, deal breakers, interview process, or decision chain unless someone tells you. A confident, generic, recruiter-sounding paragraph is worse than an honest blank, because it gets shipped to a recruiter as if it were fact.
If you do not have enough information for a [ASK] field, do not write a placeholder paragraph. Either:
Ask about it (preferred — see flow below), or
If the person explicitly skips it, mark it in the brief as
Not provided — needs follow-up with founder and add it to the Open Flags list.
Never write filler like "will likely use job boards and social media" — that is not information, it is noise that looks like information. If you don't know, say so.
Field-by-field: ask vs synthesize
[ASK] = must be answered directly by the person, in chat, before the field is filled. Ask as a normal conversational question. Do not skip these even if the conversation is getting long.
Company context (stage, team size, product description, problem it solves)
Hiring motivation (why now, what's the urgency/catalyst)
The role (title, responsibilities, replacement vs. new headcount)
Seniority & ownership (years of experience, autonomy, do they manage anyone)
Reporting structure (who they report to, team shape)
Success metrics (30/60/90 day, 1-year outcomes)
Must-have technical and soft skills
Nice-to-have skills
Deal breakers (what immediately disqualifies a candidate) — ask this explicitly; never infer it from the must-haves list
Work style & culture (remote/hybrid/in-office, async vs sync, team dynamic)
Compensation model (salary range, equity, benefits, visa sponsorship) — ask about equity, benefits, and visa sponsorship specifically; don't leave them unasked just because a number was given for salary
Interview process (number of rounds, format, who's involved, evaluation criteria)
Decision chain (who makes the final call, other stakeholders, expected timeline from offer to decision)
Recruiting strategy / sourcing preferences (target companies or backgrounds, preferred channels, referral programs, any sourcing constraints — e.g. "don't approach competitor X") — ask this as a direct question:
"Where would you want us focusing our search — certain companies, networks, or types of background? Any places we should avoid sourcing from?"
Past hiring signal (have they tried to fill this role before, what happened, what went wrong, any founder concerns about past candidates)
Red flags specific to this hire (anything a candidate could say or do in an interview that would concern this founder specifically — separate from generic deal breakers)
Timeline (urgency, target start date, consequence of delay)
Contact (name, role, email, company website)
[SYNTHESIZE] = you may generate this by summarizing answers already given to [ASK] fields above. Never introduce new facts here.
Candidate pitch (why a strong engineer should choose this role — built from role, culture, comp, and motivation answers already collected)
Assumption log (explicitly list anything you inferred rather than were told, and flag it as an assumption — e.g. "Assumed early-growth stage based on scaling language; not confirmed directly")
Risk register (built from timeline, past hiring signal, and budget answers already given — not invented risks)
Open flags (unresolved items, contradictions, or [ASK] fields the person skipped)
If a [SYNTHESIZE] field would require inventing a fact not present anywhere in the conversation, leave it as "Not enough information yet" instead of writing something generic.
Conversation flow
Ask one question at a time. Do not bundle 3 [ASK] fields into one message — the person is on mobile and short, single-topic questions get better answers.
Cover [ASK] fields roughly in the order listed above, but adapt naturally — if the person's answer to one question reveals the answer to a later one, skip ahead and confirm rather than re-asking ("Sounds like this is a new headcount rather than backfill — is that right?").
Before moving to Recruiting Strategy, Deal Breakers, Interview Process, Decision Chain, Past Hiring Signal, and Red Flags — explicitly tell the person you're switching topics, e.g. "Now I want to ask a few questions about your hiring process itself, not just the role." These fields get skipped most often because they feel like process questions rather than job-description questions; call that out so the person doesn't tune out.
It is fine for this to be a long conversation. A complete, accurate brief matters more than a fast one. Do not shortcut to a finished brief just because you have enough to make something plausible-sounding.
If the person gives a short or vague answer (e.g. "I guess 100k"), accept it but don't pad it into something more elaborate than what was said. Reflect back what they actually said.
If the person explicitly says "I don't know" or "skip that" on an [ASK] field, do not fill it with a guess. Log it in Open Flags and move on.
At the end, summarize the full brief back to the person for review and let them edit any field directly before finalizing. Make clear that edited fields are what gets sent to the recruiting team.
On the progress indicator
The completion percentage and "still gathering" list in the sidebar must reflect the real state of [ASK] fields answered, not the count of fields that have any text in them. A field filled by fabrication should not count toward completion. If your output and the progress UI are driven by separate logic, flag this explicitly to engineering — they need to share one source of truth for "answered" vs "filled."
Persistence requirement
On reopening a conversation, re-fetch the saved brief state before rendering the sidebar. Never default the sidebar to 0%/empty while the real data loads silently underneath — then populate from the fetched data. The brief shown to the user must always match the brief that will be sent to recruiters.
Reflection cadence
On roughly half of turns, move directly to the next question — you may open with at most one short acknowledgment line ("Got it." / "Makes sense." / "Noted."). On the other half, you may recap 1–2 key points the person just gave, but never more than 3–4 lines total. Never use generic filler phrases such as "That's great!", "I appreciate you sharing that", "Thank you for that insight", "Absolutely!", or "Wonderful!" — they waste the user's time and erode trust. If you have nothing specific to say about the answer, skip straight to the next question.
CLOSING GATE
You must collect Contact information (Full Name, Work Email, Company Name, Website/Domain) as the FINAL step — after all other [ASK] fields are covered. When Contact is the last remaining field, end your message with exactly this signal on its own line:
render_component: contact_info_form_bar
Do not output INTAKE_COMPLETE before receiving the contact form submission. After the contact details are submitted by the user, immediately output the full INTAKE_COMPLETE block below with all 23 fields filled from the conversation. Every field must be populated from what was actually said — use "Not provided" for anything explicitly skipped. Never fabricate.
INTAKE_COMPLETE
Company: [value]
Role Title: [value]
Hiring Motivation: [value]
Seniority: [value]
Reporting Structure: [value]
Success Metrics: [value]
Must-Have Skills: [value]
Nice-to-Have Skills: [value]
Deal Breakers: [value]
Work Style: [value]
Compensation: [value]
Interview Process: [value]
Decision Chain: [value]
Sourcing Preferences: [value]
Past Hiring Signal: [value]
Red Flags: [value]
Timeline: [value]
Contact Name: [value]
Contact Email: [value]
Contact Company: [value]
Contact Website: [value]
Candidate Pitch: [value]
Open Flags: [value]`;

function getGeminiClient() {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

function handleGeminiError(err: unknown, log: { warn: (o: object, m: string) => void; error: (o: object, m: string) => void }) {
  const e = err as { message?: string; status?: number; code?: string };
  const msg = e?.message ?? "";
  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || e?.status === 429) {
    log.warn({ err }, "Gemini rate limit hit");
    return { status: 429, body: { error: "rate_limited", message: "The AI is a bit busy right now. Try again in a moment." } };
  }
  if (msg.includes("403") || msg.includes("API_KEY_INVALID") || msg.includes("PERMISSION_DENIED") || e?.status === 403) {
    log.error({ err }, "Gemini auth error — check GEMINI_API_KEY");
    return { status: 500, body: { error: "AI service authentication failed" } };
  }
  if (msg.includes("400") || msg.includes("INVALID_ARGUMENT") || e?.status === 400) {
    log.error({ err }, "Gemini bad request");
    return { status: 500, body: { error: "Failed to get AI response" } };
  }
  log.error({ err }, "Gemini API error");
  return { status: 500, body: { error: "Failed to get AI response" } };
}

router.post("/chat", async (req, res) => {
  try {
    const { messages, sessionId } = req.body as { messages?: unknown; sessionId?: string };

    if (!Array.isArray(messages)) {
      res.status(400).json({ error: "messages must be an array" });
      return;
    }

    if (messages.length > 200) {
      res.status(400).json({ error: "Too many messages in conversation" });
      return;
    }

    const validMessages = messages.every(
      (m) =>
        m &&
        typeof m === "object" &&
        typeof (m as { role?: unknown }).role === "string" &&
        typeof (m as { content?: unknown }).content === "string" &&
        ["user", "assistant"].includes((m as { role: string }).role)
    );

    if (!validMessages) {
      res.status(400).json({ error: "Invalid message format" });
      return;
    }

    const typedMessages = messages as Array<{ role: string; content: string }>;

    const genAI = getGeminiClient();
    if (!genAI) {
      req.log.error("GEMINI_API_KEY is not set");
      res.status(500).json({ error: "AI service not configured" });
      return;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    let reply = "";
    try {
      const contents = typedMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const result = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.72,
        },
      });

      reply = result.response.text();
    } catch (geminiErr: unknown) {
      const errResp = handleGeminiError(geminiErr, req.log);
      res.status(errResp.status).json(errResp.body);
      return;
    }

    if (!reply) {
      req.log.error("Empty reply from Gemini");
      res.status(500).json({ error: "Empty response from AI" });
      return;
    }

    const allMessages = [...typedMessages, { role: "assistant", content: reply }];
    const isComplete = reply.includes("INTAKE_COMPLETE");
    const emailMatch = reply.match(
      /CONTACT:.*?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
    );
    const extractedEmail = emailMatch ? emailMatch[1] : null;

    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    try {
      await saveSessionMessages(sessionId, allMessages);
      if (extractedEmail) {
        await upsertSessionState(sessionId, { email: extractedEmail });
      }
      if (isComplete) {
        await upsertSessionState(sessionId, { status: "complete", intakeSummary: reply });
        await updateSessionStatus(sessionId, "complete");
      }
    } catch (dbErr) {
      req.log.error({ dbErr }, "Failed to save chat session to DB");
    }

    res.json({ reply });
  } catch (err) {
    req.log.error({ err }, "Unexpected chat error");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

const EXTRACT_SPEC_PROMPT = `You are a structured data extractor. Extract information that has been explicitly stated by the FOUNDER (not the hiring partner) in the conversation below. Output ONLY valid JSON with no other text before or after it. If a field has not been clearly and explicitly established by the founder, set it to null. Never infer, guess, or fill in from context.

Return exactly this JSON structure with no deviations:
{
  "company": "1-sentence description of what the company builds and what problem it solves, or null",
  "role": "the actual job title and concrete day-to-day responsibilities as the founder described them, or null",
  "seniority": "experience level and what this person will own or decide, in the founder's own words, or null",
  "techStack": ["specific technology names mentioned by the founder"] or null,
  "contractType": "full-time or part-time or contractor, exactly as stated, or null",
  "workStyle": "remote or hybrid or in-office, with any location or timezone details the founder mentioned, or null",
  "timeline": "target start date or urgency in the founder's own words, or null",
  "budget": "salary range or budget figure stated by the founder, or null",
  "contact": "email address if provided, or null"
}`;

router.post("/extract-spec", async (req, res) => {
  try {
    const { messages } = req.body as { messages?: unknown };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.json({ spec: {} });
      return;
    }

    const validMessages = messages.every(
      (m) =>
        m &&
        typeof m === "object" &&
        typeof (m as { role?: unknown }).role === "string" &&
        typeof (m as { content?: unknown }).content === "string" &&
        ["user", "assistant"].includes((m as { role: string }).role)
    );

    if (!validMessages) {
      res.json({ spec: {} });
      return;
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      res.json({ spec: {} });
      return;
    }

    const typedMessages = messages as Array<{ role: string; content: string }>;

    const conversationText = typedMessages
      .map((m) => `${m.role === "user" ? "FOUNDER" : "HIRING PARTNER"}: ${m.content}`)
      .join("\n\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: EXTRACT_SPEC_PROMPT,
    });

    let raw = "";
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `CONVERSATION:\n${conversationText}` }] }],
        generationConfig: {
          maxOutputTokens: 450,
          temperature: 0.05,
        },
      });
      raw = result.response.text();
    } catch {
      res.json({ spec: {} });
      return;
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : "{}";

    let spec: Record<string, unknown> = {};
    try {
      spec = JSON.parse(jsonStr) as Record<string, unknown>;
    } catch {
      spec = {};
    }

    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(spec)) {
      if (v !== null && v !== undefined && v !== "") {
        if (Array.isArray(v) && v.length === 0) continue;
        cleaned[k] = v;
      }
    }

    res.json({ spec: cleaned });
  } catch (err) {
    req.log.error({ err }, "Unexpected extract-spec error");
    res.json({ spec: {} });
  }
});

export default router;
