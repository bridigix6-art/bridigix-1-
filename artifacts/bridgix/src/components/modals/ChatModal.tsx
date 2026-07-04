import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HiringBrief {
  companyContext?: string;
  hiringMotivation?: string;
  role?: string;
  seniorityOwnership?: string;
  reportingStructure?: string;
  successMetrics?: string;
  mustHaves?: string;
  niceToHaves?: string;
  dealBreakers?: string;
  technicalRequirements?: string;
  workStyleCulture?: string;
  compensationModel?: string;
  interviewProcess?: string;
  decisionChain?: string;
  candidatePitch?: string;
  recruitingStrategy?: string;
  riskRegister?: string;
  assumptionLog?: string;
  pastHiringSignal?: string;
  timeline?: string;
  budget?: string;
  contact?: string;
  openFlags?: string;
  rawIntake?: string;
}

interface CandidateSpec {
  [key: string]: string | string[];
}

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const COOKIE_KEY = "bridigix_tz";
const STORAGE_SESSION_ID_KEY = "bridigix_session_id";

const ACCENT = "#1A7A4A";
const BG = "#FAFAF8";
const DARK = "#0A0A0A";
const USER_BUBBLE_BG = "rgba(52,211,153,0.14)";
const USER_BUBBLE_BORDER = "rgba(52,211,153,0.22)";
const AI_BUBBLE_BG = "rgba(26,122,74,0.12)";
const AI_BUBBLE_BORDER = "rgba(26,122,74,0.18)";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY?.trim();
const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

// ─── ENHANCED SYSTEM PROMPT ───────────────────────────────────────────────────
// Explicitly instructs model on exact format, all fields, and INTAKE_COMPLETE marker
const CHAT_SYSTEM_PROMPT = `You are Bridigix's hiring intake partner. Guide a founder through a structured hiring intake conversation to build a complete hiring brief.

**CONVERSATION RULES:**
1. Ask ONE question at a time, focused and conversational.
2. Listen to the founder's answers and reflect back understanding.
3. Build rapport — this is a conversation, not an interrogation.
4. Keep responses brief (2-3 sentences) for mobile chat readability.

**FIELDS YOU MUST COLLECT (in approximate order, but adapt to conversation flow):**
1. COMPANY CONTEXT — company name, stage, industry, what problem they solve
2. HIRING MOTIVATION — why are they hiring now? growth, replacement, new team?
3. ROLE — job title, what the person will do day-to-day
4. SENIORITY & OWNERSHIP — IC vs. management, budget ownership, decision-making authority
5. REPORTING STRUCTURE — who do they report to? team size they'll manage?
6. SUCCESS METRICS — how will we know if this hire is a win after 6 months?
7. CANDIDATE PROFILE — MUST-HAVES — skills, experience, mindset that's non-negotiable
8. CANDIDATE PROFILE — NICE-TO-HAVES — bonus skills or background
9. DEAL BREAKERS — what absolutely disqualifies someone?
10. TECHNICAL REQUIREMENTS — specific languages, frameworks, tools required?
11. WORK STYLE & CULTURE — remote/office? communication style? pace?
12. COMPENSATION MODEL — salary range, equity, benefits, flexibility?
13. INTERVIEW PROCESS — how many rounds? who interviews? timeline?
14. DECISION CHAIN — who decides? how long until offer?
15. CANDIDATE PITCH — what's compelling about this role and company?
16. RECRUITING STRATEGY — where to source? internal referrals? headhunter?
17. RISK REGISTER — what could go wrong? key hiring risks?
18. ASSUMPTION LOG — what are you assuming that might not be true?
19. PAST HIRING SIGNAL — tell me about your last great hire. what made them great?
20. TIMELINE — when do you need someone? hard deadline?
21. BUDGET — total comp budget, flexibility?
22. CONTACT — name, email, title, company website for the hiring contact
23. OPEN QUESTIONS OR FLAGS — anything else we should know?

**AFTER COLLECTING ALL 23 FIELDS:**
When you have gathered substantive information on all 23 fields above (even if brief), output the hiring brief in this EXACT format. Use these EXACT labels followed by a colon, one field per line:

INTAKE_COMPLETE

COMPANY CONTEXT: [content]
HIRING MOTIVATION: [content]
ROLE: [content]
SENIORITY & OWNERSHIP: [content]
REPORTING STRUCTURE: [content]
SUCCESS METRICS: [content]
CANDIDATE PROFILE — MUST-HAVES: [content]
CANDIDATE PROFILE — NICE-TO-HAVES: [content]
DEAL BREAKERS: [content]
TECHNICAL REQUIREMENTS: [content]
WORK STYLE & CULTURE: [content]
COMPENSATION MODEL: [content]
INTERVIEW PROCESS: [content]
DECISION CHAIN: [content]
CANDIDATE PITCH: [content]
RECRUITING STRATEGY: [content]
RISK REGISTER: [content]
ASSUMPTION LOG: [content]
PAST HIRING SIGNAL: [content]
TIMELINE: [content]
BUDGET: [content]
CONTACT: [content]
OPEN QUESTIONS OR FLAGS: [content]

**CRITICAL RULES:**
- Do NOT invent information. If they haven't answered a question, make a note like "Not yet discussed" or ask the question.
- Do NOT output INTAKE_COMPLETE until you have asked about ALL 23 FIELDS and received substantive responses (even if some are brief).
- Use the exact field labels and colon format shown above — this is essential for parsing.
- Be conversational and warm — don't sound robotic.`;

// ─── Cookie / timezone utils ──────────────────────────────────────────────────

function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^|;)\\s*" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getOrSetTimezone(): string {
  const stored = getCookieValue(COOKIE_KEY);
  if (stored) return stored;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  setCookie(COOKIE_KEY, tz);
  return tz;
}

function getTimeGreeting(): string {
  const tz = getOrSetTimezone();
  const now = new Date();
  const localTimeStr = now.toLocaleTimeString("en-US", { timeZone: tz, hour12: false, hour: "2-digit" });
  const hour = parseInt(localTimeStr, 10);
  if (hour >= 5 && hour < 12) {
    const opts = ["Good morning!", "Morning!", "Morning, mate!"];
    return opts[Math.floor(Math.random() * opts.length)];
  } else if (hour >= 12 && hour < 17) {
    const opts = ["Good afternoon!", "Afternoon!", "Afternoon, boss!", "Afternoon, friend!"];
    return opts[Math.floor(Math.random() * opts.length)];
  } else {
    const opts = ["Good evening!", "Evening!", "Evening, friend!", "Evening, mate!"];
    return opts[Math.floor(Math.random() * opts.length)];
  }
}

// ─── Hiring brief parsing ─────────────────────────────────────────────────────

function parseIntakeComplete(text: string): HiringBrief {
  const FIELDS = [
    "COMPANY CONTEXT",
    "HIRING MOTIVATION",
    "ROLE",
    "SENIORITY & OWNERSHIP",
    "REPORTING STRUCTURE",
    "SUCCESS METRICS",
    "CANDIDATE PROFILE — MUST-HAVES",
    "CANDIDATE PROFILE — NICE-TO-HAVES",
    "DEAL BREAKERS",
    "TECHNICAL REQUIREMENTS",
    "WORK STYLE & CULTURE",
    "COMPENSATION MODEL",
    "INTERVIEW PROCESS",
    "DECISION CHAIN",
    "CANDIDATE PITCH",
    "RECRUITING STRATEGY",
    "RISK REGISTER",
    "ASSUMPTION LOG",
    "PAST HIRING SIGNAL",
    "TIMELINE",
    "BUDGET",
    "CONTACT",
    "OPEN QUESTIONS OR FLAGS",
  ];

  const extractField = (label: string, nextLabel?: string): string => {
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = nextLabel
      ? new RegExp(`${esc(label)}:\\s*([\\s\\S]*?)(?=${esc(nextLabel)}:)`, "i")
      : new RegExp(`${esc(label)}:\\s*([\\s\\S]*)`, "i");
    const match = text.match(pattern);
    return match ? match[1].replace(/^INTAKE_COMPLETE\s*/i, "").trim() : "";
  };

  return {
    companyContext:       extractField(FIELDS[0],  FIELDS[1]),
    hiringMotivation:    extractField(FIELDS[1],  FIELDS[2]),
    role:                extractField(FIELDS[2],  FIELDS[3]),
    seniorityOwnership:  extractField(FIELDS[3],  FIELDS[4]),
    reportingStructure:  extractField(FIELDS[4],  FIELDS[5]),
    successMetrics:      extractField(FIELDS[5],  FIELDS[6]),
    mustHaves:           extractField(FIELDS[6],  FIELDS[7]),
    niceToHaves:         extractField(FIELDS[7],  FIELDS[8]),
    dealBreakers:        extractField(FIELDS[8],  FIELDS[9]),
    technicalRequirements: extractField(FIELDS[9], FIELDS[10]),
    workStyleCulture:    extractField(FIELDS[10], FIELDS[11]),
    compensationModel:   extractField(FIELDS[11], FIELDS[12]),
    interviewProcess:    extractField(FIELDS[12], FIELDS[13]),
    decisionChain:       extractField(FIELDS[13], FIELDS[14]),
    candidatePitch:      extractField(FIELDS[14], FIELDS[15]),
    recruitingStrategy:  extractField(FIELDS[15], FIELDS[16]),
    riskRegister:        extractField(FIELDS[16], FIELDS[17]),
    assumptionLog:       extractField(FIELDS[17], FIELDS[18]),
    pastHiringSignal:    extractField(FIELDS[18], FIELDS[19]),
    timeline:            extractField(FIELDS[19], FIELDS[20]),
    budget:              extractField(FIELDS[20], FIELDS[21]),
    contact:             extractField(FIELDS[21], FIELDS[22]),
    openFlags:           extractField(FIELDS[22]),
    rawIntake: text,
  };
}

// ─── FIXED: fetchLiveSpec now calls OpenRouter directly ──────────────────────

async function fetchLiveSpec(messages: Message[]): Promise<CandidateSpec> {
  try {
    if (!OPENROUTER_API_KEY) {
      return {};
    }

    const res = await fetch(OPENROUTER_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://bridigix.ai",
        "X-Title": "Bridigix Intake",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-next-80b-a3b-instruct:free",
        messages: [
          {
            role: "system",
            content: `Extract hiring brief fields from the conversation so far. Return ONLY valid JSON (no markdown, no extra text) with keys like companyContext, role, mustHaves, timeline, etc. Example: {"companyContext": "...", "role": "..."}.`,
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 1000,
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      return {};
    }

    const payload = await res.json().catch(() => ({}));
    const reply: string = (payload as { choices?: Array<{ message?: { content?: string | null } }> }).choices?.[0]?.message?.content ?? "";

    if (!reply) return {};

    // Parse JSON response
    try {
      const parsed = JSON.parse(reply) as CandidateSpec;
      return parsed;
    } catch {
      // If not valid JSON, return empty
      return {};
    }
  } catch {
    return {};
  }
}

// ─── PDF Generation Function ──────────────────────────────────────────────────

async function generatePDFFromBrief(brief: HiringBrief): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    let yPosition = 15;
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const lineHeight = 7;

    // Helper function to add field with word wrap
    const addField = (label: string, value: string | undefined) => {
      if (!value) return;
      const labelLines = doc.splitTextToSize(`${label}:`, 170);
      const valueLines = doc.splitTextToSize(value, 170);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(labelLines, margin, yPosition);
      yPosition += labelLines.length * lineHeight + 2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(valueLines, margin, yPosition);
      yPosition += valueLines.length * lineHeight + 6;

      // Page break check
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Hiring Brief", margin, yPosition);
    yPosition += 12;

    // Add all fields
    addField("Company Context", brief.companyContext);
    addField("Hiring Motivation", brief.hiringMotivation);
    addField("Role", brief.role);
    addField("Seniority & Ownership", brief.seniorityOwnership);
    addField("Reporting Structure", brief.reportingStructure);
    addField("Success Metrics", brief.successMetrics);
    addField("Candidate Profile — Must-Haves", brief.mustHaves);
    addField("Candidate Profile — Nice-to-Haves", brief.niceToHaves);
    addField("Deal Breakers", brief.dealBreakers);
    addField("Technical Requirements", brief.technicalRequirements);
    addField("Work Style & Culture", brief.workStyleCulture);
    addField("Compensation Model", brief.compensationModel);
    addField("Interview Process", brief.interviewProcess);
    addField("Decision Chain", brief.decisionChain);
    addField("Candidate Pitch", brief.candidatePitch);
    addField("Recruiting Strategy", brief.recruitingStrategy);
    addField("Risk Register", brief.riskRegister);
    addField("Assumption Log", brief.assumptionLog);
    addField("Past Hiring Signal", brief.pastHiringSignal);
    addField("Timeline", brief.timeline);
    addField("Budget", brief.budget);
    addField("Contact", brief.contact);
    addField("Open Questions or Flags", brief.openFlags);

    // Download
    doc.save("hiring-brief.pdf");
  } catch (err) {
    console.error("PDF generation failed:", err);
  }
}

// ─── Sidebar field builder ───────────────────────────────────────────────────

interface SidebarField {
  label: string;
  value: string | string[];
}

function buildSidebarFields(brief: HiringBrief | null, spec: CandidateSpec): SidebarField[] {
  if (brief) {
    return [
      { label: "Company", value: brief.companyContext || "" },
      { label: "Role", value: brief.role || "" },
      { label: "Seniority", value: brief.seniorityOwnership || "" },
      { label: "Must-Haves", value: brief.mustHaves || "" },
      { label: "Nice-to-Haves", value: brief.niceToHaves || "" },
      { label: "Tech Requirements", value: brief.technicalRequirements || "" },
      { label: "Work Style", value: brief.workStyleCulture || "" },
      { label: "Compensation", value: brief.compensationModel || "" },
      { label: "Timeline", value: brief.timeline || "" },
      { label: "Contact", value: brief.contact || "" },
    ];
  }

  return [
    { label: "Company", value: (spec.companyContext as string) || "" },
    { label: "Role", value: (spec.role as string) || "" },
    { label: "Seniority", value: (spec.seniorityOwnership as string) || "" },
    { label: "Must-Haves", value: (spec.mustHaves as string | string[]) || "" },
    { label: "Tech Stack", value: (spec.techStack as string | string[]) || "" },
    { label: "Timeline", value: (spec.timeline as string) || "" },
    { label: "Compensation", value: (spec.compensationModel as string) || "" },
    { label: "Work Style", value: (spec.workStyleCulture as string) || "" },
    { label: "Contact", value: (spec.contact as string) || "" },
  ];
}

// ─── Sidebar Component (Desktop) ──────────────────────────────────────────────

function HiringBriefSidebar({ spec, hiringBrief, visible }: { spec: CandidateSpec; hiringBrief: HiringBrief | null; visible: boolean }) {
  const fields = buildSidebarFields(hiringBrief, spec);
  const filled = fields.filter(f => f.value && (Array.isArray(f.value) ? f.value.length > 0 : String(f.value).trim().length > 0));
  const total = hiringBrief ? filled.length : 9;
  const progress = hiringBrief ? 100 : Math.round((filled.length / total) * 100);
  const isComplete = hiringBrief !== null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.25 }}
          className="hidden lg:flex flex-col w-72 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hiring Brief
              </span>
              {isComplete ? (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                  Complete
                </span>
              ) : (
                <span className="text-xs font-medium text-green-600">{progress}%</span>
              )}
            </div>
            <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-green-600 to-green-400"
              />
            </div>
          </div>

          {/* Fields */}
          <div className="p-5 space-y-4">
            {filled.length === 0 && (
              <p className="text-xs text-gray-400 leading-relaxed mt-1">
                Fields will populate as you chat. Start by describing your company.
              </p>
            )}

            {filled.map((field, i) => {
              const value = field.value;
              const displayValue = Array.isArray(value) ? value.join(", ") : String(value).slice(0, 60) + (String(value).length > 60 ? "..." : "");
              return (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {i > 0 && <div className="h-px bg-gray-100 my-3" />}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">{field.label}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{displayValue}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Message Bubbles ──────────────────────────────────────────────────────────

function AiBubble({ content }: { content: string }) {
  return (
    <div
      style={{
        alignSelf: "flex-start",
        maxWidth: "85%",
        padding: "12px 16px",
        borderRadius: 12,
        backgroundColor: AI_BUBBLE_BG,
        border: `1px solid ${AI_BUBBLE_BORDER}`,
        color: DARK,
        fontSize: 14,
        lineHeight: 1.5,
        wordWrap: "break-word",
      }}
    >
      {content}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div
      style={{
        alignSelf: "flex-end",
        maxWidth: "85%",
        padding: "12px 16px",
        borderRadius: 12,
        backgroundColor: USER_BUBBLE_BG,
        border: `1px solid ${USER_BUBBLE_BORDER}`,
        color: DARK,
        fontSize: 14,
        lineHeight: 1.5,
        wordWrap: "break-word",
      }}
    >
      {content}
    </div>
  );
}

// ─── Review Panel ─────────────────────────────────────────────────────────────

const BRIEF_REVIEW_FIELDS: { key: keyof HiringBrief; label: string; hint: string }[] = [
  { key: "companyContext", label: "Company Context", hint: "Company name, stage, what you do" },
  { key: "hiringMotivation", label: "Hiring Motivation", hint: "Why are you hiring now?" },
  { key: "role", label: "Role", hint: "Job title and responsibilities" },
  { key: "seniorityOwnership", label: "Seniority & Ownership", hint: "IC vs. management" },
  { key: "reportingStructure", label: "Reporting Structure", hint: "Who do they report to?" },
  { key: "successMetrics", label: "Success Metrics", hint: "6-month success indicators" },
  { key: "mustHaves", label: "Must-Haves", hint: "Non-negotiable skills" },
  { key: "niceToHaves", label: "Nice-to-Haves", hint: "Bonus experience" },
  { key: "dealBreakers", label: "Deal Breakers", hint: "Disqualifying factors" },
  { key: "technicalRequirements", label: "Technical Requirements", hint: "Languages, frameworks, tools" },
  { key: "workStyleCulture", label: "Work Style & Culture", hint: "Remote? Pace? Communication?" },
  { key: "compensationModel", label: "Compensation", hint: "Salary, equity, benefits" },
  { key: "interviewProcess", label: "Interview Process", hint: "Rounds, who, timeline" },
  { key: "decisionChain", label: "Decision Chain", hint: "Who decides? Timeline?" },
  { key: "candidatePitch", label: "Candidate Pitch", hint: "Why candidates want this role" },
  { key: "recruitingStrategy", label: "Recruiting Strategy", hint: "Where to source" },
  { key: "riskRegister", label: "Risk Register", hint: "Hiring risks" },
  { key: "assumptionLog", label: "Assumption Log", hint: "Untested assumptions" },
  { key: "pastHiringSignal", label: "Past Hiring Signal", hint: "Your last great hire" },
  { key: "timeline", label: "Timeline", hint: "When do you need someone?" },
  { key: "budget", label: "Budget", hint: "Total compensation budget" },
  { key: "contact", label: "Contact", hint: "Name, email, title, company, website" },
  { key: "openFlags", label: "Open Questions", hint: "Anything else?" },
];

function HiringBriefReview({ brief, onConfirm, isSaving }: { brief: HiringBrief; onConfirm: (edited: HiringBrief) => void; isSaving: boolean }) {
  const [edited, setEdited] = useState(brief);

  const handleFieldChange = (key: keyof HiringBrief, value: string) => {
    setEdited(prev => ({ ...prev, [key]: value }));
  };

  const handleDownloadPDF = async () => {
    await generatePDFFromBrief(edited);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Review Your Hiring Brief</h2>
        <p className="text-sm text-gray-600">Edit any field, then submit to the recruiting team.</p>
      </div>

      {/* Fields */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {BRIEF_REVIEW_FIELDS.map((field) => {
          const value = edited[field.key] || "";
          return (
            <div key={field.key} className="border border-gray-200 rounded-lg p-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
              <textarea
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.hint}
                className="w-full p-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
              />
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={handleDownloadPDF}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition disabled:opacity-50"
        >
          📥 Download PDF
        </button>
        <button
          onClick={() => onConfirm(edited)}
          disabled={isSaving}
          className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {isSaving ? "Sending..." : "✓ Confirm & Send"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main ChatModal Component ───────────────────────────────────────────────────

export function ChatModal({ open, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [latestAiIndex, setLatestAiIndex] = useState(-1);
  const [sessionPhase, setSessionPhase] = useState<"init" | "chat" | "review">("init");
  const [detectedEmail, setDetectedEmail] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [hiringBrief, setHiringBrief] = useState<HiringBrief | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [liveSpec, setLiveSpec] = useState<CandidateSpec>({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [sessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_SESSION_ID_KEY);
      if (stored) return stored;
    }
    return crypto.randomUUID();
  });

  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const isListeningRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const spec = liveSpec;

  // ─── Microphone handler ──────────────────────────────────────────────────────

  function handleMicClick() {
    type SpeechRecognitionInstance = {
      continuous: boolean; interimResults: boolean; lang: string;
      onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      start: () => void; stop: () => void;
    };
    const win = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance };
    const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!Ctor) {
      alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (isListeningRef.current) {
      recognitionRef.current?.stop();
      isListeningRef.current = false;
      setIsListening(false);
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results as ArrayLike<{ 0: { transcript: string } }>)
        .map(r => r[0].transcript).join("");
      setInput(transcript);
    };
    recognition.onend = () => { isListeningRef.current = false; setIsListening(false); };
    recognition.onerror = () => { isListeningRef.current = false; setIsListening(false); };
    recognitionRef.current = recognition;
    isListeningRef.current = true;
    setIsListening(true);
    recognition.start();
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  // ─── Modal lifecycle ──────────────────────────────────────────────────

  useEffect(() => {
    if (!open) {
      setSessionPhase("init");
      setMessages([]);
      setComplete(false);
      setLatestAiIndex(-1);
      setDetectedEmail(null);
      setInput("");
      setHiringBrief(null);
      setReviewSaving(false);
      setShowSidebar(true);
      setLiveSpec({});
      return;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_SESSION_ID_KEY);
      if (!stored || stored !== sessionId) {
        localStorage.setItem(STORAGE_SESSION_ID_KEY, sessionId);
      }
    }

    setSessionPhase("chat");
    setMessages([{ role: "assistant", content: getTimeGreeting() + " Let's build your hiring brief together. Tell me about the role you're looking to fill." }]);
    setLatestAiIndex(0);
  }, [open, sessionId]);

  // ─── Main sendMessage function ───────────────────────────────────────────────

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading || complete || sessionPhase === "review") return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "56px";

    try {
      if (!OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key is not configured.");
      }

      const res = await fetch(OPENROUTER_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://bridigix.ai",
          "X-Title": "Bridigix Intake",
        },
        body: JSON.stringify({
          model: "qwen/qwen3-next-80b-a3b-instruct:free",
          messages: [
            { role: "system", content: CHAT_SYSTEM_PROMPT },
            ...newMessages.map((message) => ({ role: message.role, content: message.content })),
          ],
          max_tokens: 2000,
          temperature: 0.72,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMessage = (payload as { error?: { message?: string } }).error?.message || "The AI service is temporarily unavailable.";
        throw new Error(errorMessage ? `HTTP ${res.status}: ${errorMessage}` : `HTTP ${res.status}`);
      }

      const reply: string = (payload as { choices?: Array<{ message?: { content?: string | null } }> }).choices?.[0]?.message?.content ?? "";

      // Extract email if present
      const emailMatch = reply.match(EMAIL_REGEX);
      if (emailMatch && !detectedEmail) {
        setDetectedEmail(emailMatch[0]);
      }

      // Fetch live spec on each response (if not INTAKE_COMPLETE)
      if (reply && !reply.includes("INTAKE_COMPLETE")) {
        const fullConv = [...newMessages, { role: "assistant" as const, content: reply }];
        fetchLiveSpec(fullConv).then(extracted => {
          if (Object.keys(extracted).length > 0) {
            setLiveSpec(extracted);
          }
        }).catch(() => {});
      }

      if (reply.includes("INTAKE_COMPLETE")) {
        // Parse the complete brief
        const brief = parseIntakeComplete(reply);
        setHiringBrief(brief);
        
        // Add final message and transition to review phase
        const finalMsg = "Perfect — I've got everything I need. Review the brief and make any edits before submitting to the team.";
        setMessages(prev => [...prev, { role: "assistant" as const, content: finalMsg }]);
        setLatestAiIndex(newMessages.length);
        setComplete(true);
        
        // Delay transition to allow user to see the message
        setTimeout(() => {
          setSessionPhase("review");
        }, 2200);
      } else {
        // Regular AI response
        setMessages(prev => [...prev, { role: "assistant" as const, content: reply }]);
        setLatestAiIndex(newMessages.length);
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "An unexpected error occurred.";
      setMessages(prev => [...prev, { role: "assistant" as const, content: `Error: ${errorText}` }]);
      setLatestAiIndex(newMessages.length);
    } finally {
      setLoading(false);
    }
  }, [messages, input, loading, complete, sessionPhase, detectedEmail]);

  // ─── Handle brief confirmation ───────────────────────────────────────────────

  async function handleBriefConfirm(edited: HiringBrief) {
    setReviewSaving(true);
    try {
      // TODO: Save to Supabase if needed
      setHiringBrief(edited);
    } catch { /* non-fatal */ }
    setReviewSaving(false);
    setComplete(true);
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:w-full sm:max-w-5xl bg-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Hiring Intake</h2>
                <p className="text-xs text-gray-500 mt-1">Build your hiring brief</p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 text-gray-600 hover:bg-gray-100 rounded flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Chat Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {sessionPhase === "review" && hiringBrief ? (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <HiringBriefReview
                      brief={hiringBrief}
                      onConfirm={handleBriefConfirm}
                      isSaving={reviewSaving}
                    />
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                      {messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-center text-sm text-gray-600">Loading...</p>
                        </div>
                      ) : (
                        messages.map((msg, i) => (
                          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "assistant" && <AiBubble content={msg.content} />}
                            {msg.role === "user" && <UserBubble content={msg.content} />}
                          </div>
                        ))
                      )}
                      {loading && (
                        <div className="flex gap-3">
                          <div className="flex gap-1 items-center px-4 py-2 rounded-lg" style={{ backgroundColor: AI_BUBBLE_BG }}>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
                      <div className="flex gap-2 sm:gap-3">
                        <div className="flex-1 relative">
                          <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                              setInput(e.target.value);
                              if (textareaRef.current) {
                                textareaRef.current.style.height = "auto";
                                textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                            placeholder="Share your thoughts..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            style={{ minHeight: "56px", maxHeight: "120px" }}
                          />
                          <button
                            onClick={handleMicClick}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded transition ${isListening ? "bg-red-100 text-red-600" : "text-gray-400 hover:text-gray-600"}`}
                          >
                            🎤
                          </button>
                        </div>
                        <button
                          onClick={() => sendMessage()}
                          disabled={!input.trim() || loading}
                          className="px-3 sm:px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex-shrink-0"
                        >
                          ➤
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <HiringBriefSidebar spec={spec} hiringBrief={hiringBrief} visible={showSidebar} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
