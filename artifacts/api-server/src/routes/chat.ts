import { Router } from "express";
import { OpenRouter } from "@openrouter/sdk";
import { logger } from "../lib/logger";
import { saveSessionMessages, upsertSessionState, updateSessionStatus } from "../lib/sessionPersistence";
import { ensureRecruiterIntakeTable, supabaseAdmin } from "../lib/supabase";

const router = Router();

class OpenRouterApiError extends Error {
  status?: number;

  constructor(status: number | undefined, message: string) {
    super(message);
    this.name = "OpenRouterApiError";
    this.status = status;
  }
}

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const OPENROUTER_STREAM_PREFIX = "data:";

function getOpenRouterClient() {
  const apiKey = process.env["OPENROUTER_API_KEY"]?.trim();
  if (!apiKey) {
    throw new OpenRouterApiError(500, "OPENROUTER_API_KEY is not set");
  }

  return new OpenRouter({ apiKey });
}

async function callOpenRouter({
  model,
  systemPrompt,
  messages,
  maxOutputTokens,
  temperature,
}: {
  model: string;
  systemPrompt: string;
  messages: Array<{ role: string; content: string }>;
  maxOutputTokens: number;
  temperature: number;
}): Promise<string> {
  const client = getOpenRouterClient();

  const requestMessages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages
      .filter((m) => m.role === "assistant" || m.role === "user")
      .map((m): OpenRouterMessage => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
  ];

  try {
    const response = await client.chat.send({
      chatRequest: {
        model,
        messages: requestMessages,
        maxTokens: maxOutputTokens,
        temperature,
      },
      httpReferer: "https://bridigix.ai",
      appTitle: "Bridigix Intake",
    });

    if (response && typeof response === "object" && "body" in response) {
      const stream = response.body as ReadableStream<Uint8Array> | null | undefined;
      if (stream) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value);

          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const dataLine = part
              .split("\n")
              .map((line) => line.trim())
              .find((line) => line.startsWith(OPENROUTER_STREAM_PREFIX));

            if (!dataLine) continue;

            const payload = dataLine.slice(OPENROUTER_STREAM_PREFIX.length).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string | null } }>;
              };
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              if (typeof deltaContent === "string") {
                streamText += deltaContent;
              }
            } catch {
              // Ignore malformed streaming events and continue.
            }
          }
        }

        if (!streamText) {
          throw new OpenRouterApiError(502, "OpenRouter returned an empty response");
        }

        return streamText;
      }
    }

    const text =
      typeof response === "object" && response && "choices" in response && Array.isArray((response as { choices?: Array<{ message?: { content?: string | null } }> }).choices)
        ? (response as { choices?: Array<{ message?: { content?: string | null } }> }).choices
            ?.map((choice) => choice?.message?.content ?? "")
            .join("") ?? ""
        : "";

    if (!text) {
      throw new OpenRouterApiError(502, "OpenRouter returned an empty response");
    }

    return text;
  } catch (err) {
    if (err instanceof OpenRouterApiError) {
      throw err;
    }

    const status = typeof err === "object" && err && "statusCode" in err ? Number((err as { statusCode?: number }).statusCode) : undefined;
    const message = typeof err === "object" && err && "message" in err ? String((err as { message?: string }).message) : "OpenRouter request failed";
    const apiErr = new OpenRouterApiError(status, message);
    logger.error({ err: apiErr }, "OpenRouter request failed");
    throw apiErr;
  }
}

const SYSTEM_PROMPT = `You are the Bridgix Hiring Partner — a conversational AI that interviews startup founders to build a structured hiring brief. You are warm, sharp, and sound like a senior recruiter who is actually listening, not a form.

CONVERSATION STYLE — NON-NEGOTIABLE RULES
1. ONE QUESTION PER TURN. Never ask 2 or 3 questions stacked together. Never number your questions. If you have multiple things you still need, ask about the single most important one now and hold the rest for later turns.
2. ALWAYS REFLECT BEFORE YOU ASK. Every response has exactly two parts, in this order:
   a) A 1-2 sentence natural-language reflection that shows you understood what they just said.
   b) ONE follow-up question that flows naturally from what they just said.
   Never skip the reflection.
3. NEVER show a text question and an interactive widget in the same turn. If the next question is better suited to a widget, send ONLY the widget.
4. NEVER re-ask something the founder already told you, even indirectly.
5. TONE: conversational, confident, and a little enthusiastic about useful signals, but never sycophantic.

QUESTION SEQUENCE (default path)
1. Company & problem — what are they building, what problem it solves
2. Stage & team size — funding stage, current headcount, growth trajectory
3. The role itself — new headcount or replacement, title, one-line mandate
4. Seniority & autonomy — years of experience, IC vs management, ownership level
5. Tech stack & key responsibilities — concrete stack and the first 1-2 priorities this hire will own
6. Must-have vs nice-to-have skills — technical and soft skills, explicitly ask what would DISQUALIFY a candidate
7. Location & work style — remote/hybrid/onsite, timezone overlap, international eligibility
8. Compensation & benefits — salary range or equity, benefits, visa sponsorship stance
9. Sourcing strategy — target companies/backgrounds/networks, channels that have worked before
10. Interview process — stages, format, who's involved, expected timeline to decision
11. Decision-maker & onboarding timeline — who signs off, start-date expectations
12. Contact info — LAST step, always a structured form (name, email, company), never conversational

FIELD EXTRACTION
Every hiring brief field is tagged internally as either [ASK] or [SYNTHESIZE].
Fields: company, role, seniority, tech_stack, key_responsibilities, must_have_skills, nice_to_have_skills, disqualifiers, engagement_type, work_style, location, compensation, benefits, visa_sponsorship, sourcing_strategy, interview_process, decision_maker, timeline, contact.

After EVERY founder message, output an updated JSON patch of any fields you can now populate or update, in this exact shape:
{
  "brief_patch": {
    "field_name": "value",
    "...": "..."
  },
  "completion_pct": 0
}

Populate fields incrementally, turn by turn, as soon as you have enough signal — do NOT wait until the end. Use the same field names as above.

ENDING THE CONVERSATION
Once all fields are populated (or the founder indicates they're done / say "that's everything"), send a short closing message confirming the brief is ready for their review, and trigger the transition to the full hiring-brief review page. Do not paste the full brief as a text wall in chat.`

async function upsertRecruiterIntakeSessionState({
  sessionId,
  briefPatch,
  completionPct,
  email,
}: {
  sessionId: string;
  briefPatch: Record<string, unknown>;
  completionPct: number;
  email?: string | null;
}) {
  try {
    await ensureRecruiterIntakeTable();

    const payload = {
      session_id: sessionId,
      contact_email: email?.toLowerCase().trim() || null,
      brief_patch: briefPatch,
      completion_pct: completionPct,
      submission_payload: {
        sessionId,
        briefPatch,
        completionPct,
        updatedAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    };

    const { data: existingRow } = await supabaseAdmin
      .from("recruiter_intakes")
      .select("id")
      .eq("session_id", sessionId)
      .limit(1)
      .maybeSingle();

    if (existingRow?.id) {
      await supabaseAdmin.from("recruiter_intakes").update(payload).eq("id", existingRow.id);
      return;
    }

    await supabaseAdmin.from("recruiter_intakes").insert(payload);
  } catch (err) {
    logger.warn({ err, sessionId }, "Failed to upsert recruiter intake session state");
  }
}

function extractBriefPatchFromReply(reply: string): { briefPatch: Record<string, unknown>; completionPct: number } {
  const cleaned = reply.trim();
  if (!cleaned) {
    return { briefPatch: {}, completionPct: 0 };
  }

  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidateText = codeBlockMatch?.[1] ?? cleaned;

  const firstBrace = candidateText.indexOf("{");
  const lastBrace = candidateText.lastIndexOf("}");
  const jsonCandidate = firstBrace >= 0 && lastBrace > firstBrace ? candidateText.slice(firstBrace, lastBrace + 1) : candidateText;

  if (!jsonCandidate) {
    return { briefPatch: {}, completionPct: 0 };
  }

  try {
    const parsed = JSON.parse(jsonCandidate) as Record<string, unknown>;
    const rawPatch = parsed.brief_patch;
    const patchObject = rawPatch && typeof rawPatch === "object" && !Array.isArray(rawPatch)
      ? (rawPatch as Record<string, unknown>)
      : parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};

    const completionPct = typeof parsed.completion_pct === "number"
      ? Math.max(0, Math.min(100, Math.round(parsed.completion_pct)))
      : typeof parsed.completionPct === "number"
        ? Math.max(0, Math.min(100, Math.round(parsed.completionPct)))
        : 0;

    return { briefPatch: patchObject, completionPct };
  } catch {
    return { briefPatch: {}, completionPct: 0 };
  }
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

    let reply = "";
    try {
      reply = await callOpenRouter({
        model: "deepseek/deepseek-v4-flash",
        systemPrompt: SYSTEM_PROMPT,
        messages: typedMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        maxOutputTokens: 2000,
        temperature: 0.72,
      });
    } catch (openRouterErr: unknown) {
      const err = openRouterErr as { status?: number; message?: string };
      if (err?.status === 429) {
        req.log.warn({ openRouterErr }, "OpenRouter rate limit hit");
        res.status(429).json({
          error: "rate_limited",
          message: "The AI is a bit busy right now. Try again in a moment.",
        });
        return;
      }
      if (err?.status === 401) {
        req.log.error({ openRouterErr }, "OpenRouter auth error — check OPENROUTER_API_KEY");
        res.status(500).json({ error: "AI service authentication failed" });
        return;
      }
      req.log.error({ openRouterErr }, "OpenRouter API error");
      res.status(500).json({ error: "Failed to get AI response" });
      return;
    }

    if (!reply) {
      req.log.error("Empty reply from OpenRouter");
      res.status(500).json({ error: "Empty response from AI" });
      return;
    }

    const { briefPatch, completionPct } = extractBriefPatchFromReply(reply);
    const allMessages = [...typedMessages, { role: "assistant", content: reply }];
    const isComplete = reply.includes("INTAKE_COMPLETE") || completionPct >= 100;
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
      await upsertSessionState(sessionId, {
        brief: briefPatch,
        completionPct,
      });
      await upsertRecruiterIntakeSessionState({
        sessionId,
        briefPatch,
        completionPct,
        email: extractedEmail,
      });
      if (isComplete) {
        await upsertSessionState(sessionId, { status: "complete", intakeSummary: reply });
        await updateSessionStatus(sessionId, "complete");
      }
    } catch (dbErr) {
      req.log.error({ dbErr }, "Failed to save chat session to DB");
    }

    res.json({ reply, briefPatch, completionPct });
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

    const typedMessages = messages as Array<{ role: string; content: string }>;

    const conversationText = typedMessages
      .map((m) => `${m.role === "user" ? "FOUNDER" : "HIRING PARTNER"}: ${m.content}`)
      .join("\n\n");

    let raw = "";
    try {
      raw = await callOpenRouter({
        model: "deepseek/deepseek-v4-flash",
        systemPrompt: EXTRACT_SPEC_PROMPT,
        messages: [{ role: "user", content: `CONVERSATION:\n${conversationText}` }],
        maxOutputTokens: 450,
        temperature: 0.05,
      });
    } catch {
      res.json({ spec: {} });
      return;
    }

    raw = raw || "{}";

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
