import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@assets/Screenshot_2026-06-04-07-57-10-533_com.canva.editor-edit_17805_1780625194177.jpg";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message { role: "user" | "assistant"; content: string; }
interface ChatModalProps { open: boolean; onClose: () => void; }

interface HiringBrief {
  companyContext: string;
  hiringMotivation: string;
  role: string;
  seniorityOwnership: string;
  reportingStructure: string;
  successMetrics: string;
  mustHaves: string;
  niceToHaves: string;
  dealBreakers: string;
  technicalRequirements: string;
  workStyleCulture: string;
  compensationModel: string;
  interviewProcess: string;
  decisionChain: string;
  candidatePitch: string;
  recruitingStrategy: string;
  riskRegister: string;
  assumptionLog: string;
  pastHiringSignal: string;
  timeline: string;
  budget: string;
  contact: string;
  openFlags: string;
  rawIntake?: string;
}

interface CandidateSpec {
  company?: string;
  role?: string;
  seniority?: string;
  techStack?: string[];
  contractType?: string;
  workStyle?: string;
  timeline?: string;
  budget?: string;
  contact?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FIRST_MESSAGE_VARIANTS = [
  "Tell me a bit about what you're building — what does your company do?",
  "Let's start from the top — what are you building, and what problem does it solve?",
  "Before we get into the role, give me a sense of the company — what are you working on?",
  "Start me off with the basics — what does your company do and who is it built for?",
  "What's the product, and what stage are you at? Give me the short version first.",
  "Tell me about the company — what are you building and what problem are you solving?",
  "What does your company do? Walk me through what you're building.",
];

function pickFirstMessage(): string {
  return FIRST_MESSAGE_VARIANTS[Math.floor(Math.random() * FIRST_MESSAGE_VARIANTS.length)];
}

const LS_KEY = "bridigix_chat";
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const COOKIE_KEY = "bridigix_tz";

const ACCENT = "#1A7A4A";
const BG = "#FAFAF8";
const DARK = "#0A0A0A";
// Section 3 — bubble colors: user = light mint, AI = darker forest green
const USER_BUBBLE_BG = "rgba(52,211,153,0.14)";
const USER_BUBBLE_BORDER = "rgba(52,211,153,0.22)";
const AI_BUBBLE_BG = "rgba(26,122,74,0.12)";
const AI_BUBBLE_BORDER = "rgba(26,122,74,0.18)";

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

// ─── Incremental spec extraction (during conversation) ───────────────────────

async function fetchLiveSpec(messages: Message[]): Promise<CandidateSpec> {
  try {
    const res = await fetch("/api/extract-spec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) return {};
    const data = await res.json() as { spec?: CandidateSpec };
    return data.spec ?? {};
  } catch {
    return {};
  }
}

// ─── Interactive type detection ──────────────────────────────────────────────

type InteractiveType = "slider" | "tags" | "choice" | null;

function detectInteractiveType(message: string): InteractiveType {
  const lower = message.toLowerCase();
  if (
    (lower.includes("structured") && (lower.includes("adaptive") || lower.includes("flexible") || lower.includes("chaotic"))) ||
    (lower.includes("work style") || lower.includes("working style"))
  ) return "slider";
  if (lower.includes("tech stack") || lower.includes("technology stack") || (lower.includes("stack") && (lower.includes("using") || lower.includes("built"))) || (lower.includes("language") && lower.includes("framework"))) return "tags";
  if ((lower.includes("contractor") || lower.includes("contract")) && (lower.includes("full-time") || lower.includes("full time") || lower.includes("permanent"))) return "choice";
  if (lower.includes("engagement type") || (lower.includes("bring") && (lower.includes("contractor") || lower.includes("full-time")))) return "choice";
  return null;
}

function stripContactFormSignal(text: string): string {
  return text.replace(/render_component:\s*contact_info_form_bar\s*/gi, "").trim();
}

const TECH_TAGS = ["JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "Swift", "Kotlin", "React", "Next.js", "Vue", "Angular", "Node.js", "Express", "PostgreSQL", "MongoDB", "Redis", "MySQL", "AWS", "GCP", "Azure", "Docker", "Kubernetes"];
const CONTRACT_OPTIONS = ["Full-time / Permanent", "Contract / Short-term", "Part-time", "Freelance", "Not sure yet"];

// ─── Interactive UI components ───────────────────────────────────────────────

function SliderInput({ onConfirm }: { onConfirm: (value: string) => void }) {
  const [val, setVal] = useState(50);
  const labels = ["Fully Structured", "Mostly Structured", "Balanced", "Mostly Adaptive", "Highly Adaptive"];
  const labelIndex = Math.round((val / 100) * (labels.length - 1));
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: `rgba(26,122,74,0.06)`, border: `1px solid rgba(26,122,74,0.14)`, borderRadius: 18, padding: "20px 22px", maxWidth: 420, fontFamily: "Inter, sans-serif" }}>
      <p style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 16 }}>Drag to describe your team's working style</p>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9B9B9B", marginBottom: 8 }}>
        <span>Structured</span><span>Highly Adaptive</span>
      </div>
      <input type="range" min={0} max={100} value={val} onChange={e => setVal(Number(e.target.value))}
        style={{ width: "100%", accentColor: ACCENT, cursor: "pointer", marginBottom: 12 }} />
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ display: "inline-block", background: ACCENT, color: "white", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 500 }}>{labels[labelIndex]}</span>
      </div>
      <button onClick={() => onConfirm(`Work style: ${labels[labelIndex]}`)}
        style={{ width: "100%", background: DARK, color: "white", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
        Confirm
      </button>
    </motion.div>
  );
}

function TagsInput({ onConfirm }: { onConfirm: (value: string) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const toggle = (tag: string) => setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  const addCustom = () => { const t = custom.trim(); if (t && !selected.includes(t)) setSelected(prev => [...prev, t]); setCustom(""); };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "rgba(26,122,74,0.06)", border: "1px solid rgba(26,122,74,0.14)", borderRadius: 18, padding: "20px 22px", maxWidth: 480, fontFamily: "Inter, sans-serif" }}>
      <p style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 14 }}>Select all that apply, or type your own</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {TECH_TAGS.map(tag => {
          const active = selected.includes(tag);
          return (
            <button key={tag} onClick={() => toggle(tag)}
              style={{ border: `1px solid ${active ? ACCENT : "#E0E0DE"}`, borderRadius: 20, padding: "6px 14px", fontSize: 13, background: active ? ACCENT : "white", color: active ? "white" : DARK, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.15s", fontWeight: active ? 500 : 400 }}>
              {tag}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder="Add custom (e.g. Elixir, Svelte...)"
          style={{ flex: 1, border: "1px solid #E0E0DE", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", background: "white" }} />
        <button onClick={addCustom} style={{ background: "rgba(26,122,74,0.1)", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: ACCENT, cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>Add</button>
      </div>
      {selected.length > 0 && (
        <div style={{ marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {selected.map(t => (
            <span key={t} style={{ background: "rgba(26,122,74,0.1)", color: ACCENT, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500, fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              {t}
              <button onClick={() => setSelected(prev => prev.filter(x => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", color: ACCENT, fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
      )}
      <button disabled={selected.length === 0} onClick={() => onConfirm(`Tech stack: ${selected.join(", ")}`)}
        style={{ width: "100%", background: selected.length > 0 ? DARK : "#E4E4E2", color: selected.length > 0 ? "white" : "#B0B0B0", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 500, cursor: selected.length > 0 ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif" }}>
        Confirm selection{selected.length > 0 ? ` (${selected.length})` : ""}
      </button>
    </motion.div>
  );
}

function ChoiceInput({ onConfirm }: { onConfirm: (value: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "rgba(26,122,74,0.06)", border: "1px solid rgba(26,122,74,0.14)", borderRadius: 18, padding: "20px 22px", maxWidth: 400, fontFamily: "Inter, sans-serif" }}>
      <p style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 14 }}>Select the engagement type</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {CONTRACT_OPTIONS.map(opt => {
          const active = selected === opt;
          return (
            <button key={opt} onClick={() => setSelected(opt)}
              style={{ border: `1.5px solid ${active ? ACCENT : "#E0E0DE"}`, borderRadius: 10, padding: "11px 16px", fontSize: 14, background: active ? "rgba(26,122,74,0.08)" : "white", color: active ? ACCENT : DARK, cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left", transition: "all 0.15s", fontWeight: active ? 500 : 400, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${active ? ACCENT : "#C0C0C0"}`, background: active ? ACCENT : "white", flexShrink: 0, transition: "all 0.15s" }} />
              {opt}
            </button>
          );
        })}
      </div>
      <button disabled={!selected} onClick={() => selected && onConfirm(`Contract type: ${selected}`)}
        style={{ width: "100%", background: selected ? DARK : "#E4E4E2", color: selected ? "white" : "#B0B0B0", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 500, cursor: selected ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif" }}>
        Confirm
      </button>
    </motion.div>
  );
}

// ─── Contact info form bar ────────────────────────────────────────────────────

function ContactFormBar({ onConfirm }: { onConfirm: (value: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSubmit = () => {
    const e: { name?: string; email?: string } = {};
    if (!name.trim()) e.name = "Required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Valid email required";
    if (Object.keys(e).length) { setErrors(e); return; }
    const parts = [`Name: ${name.trim()}`, `Email: ${email.trim()}`];
    if (website.trim()) parts.push(`Company website: ${website.trim()}`);
    onConfirm(parts.join(", "));
  };

  const fieldStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    border: `1px solid ${hasError ? "#E05050" : "#E0E0DE"}`,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 14,
    fontFamily: "Inter, sans-serif",
    outline: "none",
    background: "white",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(26,122,74,0.05)",
        border: "1px solid rgba(26,122,74,0.16)",
        borderRadius: 18,
        padding: "22px 24px",
        maxWidth: 480,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 18, fontWeight: 500 }}>
        Fill in your details to complete the intake
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#4A4A4A", display: "block", marginBottom: 5 }}>
            Full Name <span style={{ color: ACCENT }}>*</span>
          </label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="Jane Smith"
            style={fieldStyle(!!errors.name)}
            onFocus={e => { e.target.style.borderColor = ACCENT; }}
            onBlur={e => { e.target.style.borderColor = errors.name ? "#E05050" : "#E0E0DE"; }}
          />
          {errors.name && <span style={{ fontSize: 11, color: "#E05050", marginTop: 3, display: "block" }}>{errors.name}</span>}
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#4A4A4A", display: "block", marginBottom: 5 }}>
            Work Email <span style={{ color: ACCENT }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="jane@company.com"
            style={fieldStyle(!!errors.email)}
            onFocus={e => { e.target.style.borderColor = ACCENT; }}
            onBlur={e => { e.target.style.borderColor = errors.email ? "#E05050" : "#E0E0DE"; }}
          />
          {errors.email && <span style={{ fontSize: 11, color: "#E05050", marginTop: 3, display: "block" }}>{errors.email}</span>}
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#4A4A4A", display: "block", marginBottom: 5 }}>
            Company Website <span style={{ color: "#B0B0B0", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            value={website}
            onChange={e => setWebsite(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="company.com"
            style={fieldStyle()}
            onFocus={e => { e.target.style.borderColor = ACCENT; }}
            onBlur={e => { e.target.style.borderColor = "#E0E0DE"; }}
          />
        </div>
      </div>
      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          marginTop: 18,
          background: DARK,
          color: "white",
          border: "none",
          borderRadius: 10,
          padding: "12px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          transition: "background 0.2s",
          letterSpacing: "-0.01em",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = ACCENT; }}
        onMouseLeave={e => { e.currentTarget.style.background = DARK; }}
      >
        Submit details →
      </button>
    </motion.div>
  );
}

// ─── Section 1: Hiring Brief Sidebar (redesigned, no emojis) ─────────────────

interface BriefField { label: string; value: string | string[] | undefined; }

function buildSidebarFields(brief: HiringBrief | null, spec: CandidateSpec): BriefField[] {
  if (brief) {
    return [
      { label: "Company Context",       value: brief.companyContext },
      { label: "Hiring Motivation",     value: brief.hiringMotivation },
      { label: "The Role",              value: brief.role },
      { label: "Seniority & Ownership", value: brief.seniorityOwnership },
      { label: "Reporting Structure",   value: brief.reportingStructure },
      { label: "Success Metrics",       value: brief.successMetrics },
      { label: "Must-Haves",            value: brief.mustHaves },
      { label: "Nice-to-Haves",         value: brief.niceToHaves },
      { label: "Deal Breakers",         value: brief.dealBreakers },
      { label: "Technical Requirements", value: brief.technicalRequirements },
      { label: "Work Style & Culture",  value: brief.workStyleCulture },
      { label: "Compensation",          value: brief.compensationModel },
      { label: "Interview Process",     value: brief.interviewProcess },
      { label: "Decision Chain",        value: brief.decisionChain },
      { label: "Candidate Pitch",       value: brief.candidatePitch },
      { label: "Risk Register",         value: brief.riskRegister },
      { label: "Assumption Log",        value: brief.assumptionLog },
      { label: "Past Hiring Signal",    value: brief.pastHiringSignal },
      { label: "Timeline",              value: brief.timeline },
      { label: "Budget",                value: brief.budget },
      { label: "Contact",               value: brief.contact },
      { label: "Open Flags",            value: brief.openFlags },
    ].filter(f => f.value && String(f.value).trim().length > 0);
  }
  return [
    { label: "Company", value: spec.company },
    { label: "Role", value: spec.role },
    { label: "Seniority", value: spec.seniority },
    { label: "Tech Stack", value: spec.techStack },
    { label: "Engagement", value: spec.contractType },
    { label: "Work Style", value: spec.workStyle },
    { label: "Timeline", value: spec.timeline },
    { label: "Budget", value: spec.budget },
    { label: "Contact", value: spec.contact },
  ];
}

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
          style={{
            width: 290,
            flexShrink: 0,
            borderLeft: "1px solid rgba(0,0,0,0.07)",
            background: "#FFFFFF",
            overflowY: "auto",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #F0F0EE" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.10em" }}>
                Hiring Brief
              </span>
              {isComplete ? (
                <span style={{ fontSize: 10, fontWeight: 500, color: ACCENT, background: "rgba(26,122,74,0.08)", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(26,122,74,0.15)" }}>
                  Complete
                </span>
              ) : (
                <span style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>{progress}%</span>
              )}
            </div>
            <div style={{ height: 2, background: "#F0F0EE", borderRadius: 1 }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                style={{ height: "100%", background: `linear-gradient(90deg, ${ACCENT}, #34D399)`, borderRadius: 1 }}
              />
            </div>
          </div>

          {/* Fields */}
          <div style={{ padding: "16px 20px 24px" }}>
            {filled.length === 0 && (
              <p style={{ fontSize: 12, color: "#C0C0C0", lineHeight: 1.7, marginTop: 4 }}>
                Fields will populate as you chat. Start by describing your company.
              </p>
            )}

            {filled.map((field, i) => {
              const value = field.value;
              return (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {i > 0 && <div style={{ height: 1, background: "#F4F4F2", margin: "14px 0" }} />}
                  <div style={{ marginBottom: 0 }}>
                    <p style={{ fontSize: 9, color: "#ABABAB", textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 600, marginBottom: 5 }}>
                      {field.label}
                    </p>
                    {Array.isArray(value) ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(value as string[]).map(tag => (
                          <span key={tag} style={{
                            background: "rgba(26,122,74,0.07)",
                            color: ACCENT,
                            borderRadius: 20,
                            padding: "3px 10px",
                            fontSize: 11,
                            fontWeight: 500,
                            border: "1px solid rgba(26,122,74,0.12)",
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: "#1A1A1A", lineHeight: 1.65, fontWeight: 400, margin: 0 }}>
                        {String(value)}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {!isComplete && filled.length > 0 && filled.length < 9 && (
              <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #F0F0EE" }}>
                <p style={{ fontSize: 9, color: "#D0D0D0", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>
                  Still gathering
                </p>
                {buildSidebarFields(null, spec)
                  .filter(f => !f.value || (Array.isArray(f.value) ? f.value.length === 0 : !f.value.trim()))
                  .map(field => (
                    <div key={field.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, opacity: 0.4 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#D0D0D0", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#B0B0B0" }}>{field.label}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Chat components ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: AI_BUBBLE_BG, border: `1px solid ${AI_BUBBLE_BORDER}` }}>
        <img src={logoImage} alt="Bridgix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div className="flex items-center gap-1.5" style={{ background: AI_BUBBLE_BG, border: `1px solid ${AI_BUBBLE_BORDER}`, borderRadius: "6px 18px 18px 18px", padding: "14px 20px" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, opacity: 0.5, animation: "bounce-dot 1.2s ease infinite", animationDelay: `${i * 0.22}s` }} />
        ))}
      </div>
    </div>
  );
}

function useTypewriter(text: string, speed = 14, active = true) {
  const [displayed, setDisplayed] = useState(active ? "" : text);
  useEffect(() => {
    if (!active) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return displayed;
}

// Section 3: AI bubble — darker forest green
function AIBubble({ content, isLatest }: { content: string; isLatest: boolean }) {
  const text = useTypewriter(content, 14, isLatest);
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 overflow-hidden"
        style={{ background: AI_BUBBLE_BG, border: `1px solid ${AI_BUBBLE_BORDER}` }}>
        <img src={logoImage} alt="Bridgix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div style={{ background: AI_BUBBLE_BG, border: `1px solid ${AI_BUBBLE_BORDER}`, borderRadius: "6px 18px 18px 18px", padding: "14px 20px", fontSize: 17, color: DARK, lineHeight: 1.65, fontFamily: "Inter, sans-serif", fontWeight: 500, maxWidth: "78%" }}>
        {isLatest ? text : content}
      </div>
    </div>
  );
}

// Section 3: User bubble — light mint green
function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex items-end justify-end gap-3">
      <div style={{ background: USER_BUBBLE_BG, border: `1px solid ${USER_BUBBLE_BORDER}`, borderRadius: "18px 6px 18px 18px", padding: "14px 20px", fontSize: 17, color: DARK, lineHeight: 1.65, fontFamily: "Inter, sans-serif", fontWeight: 500, maxWidth: "72%" }}>
        {content}
      </div>
    </div>
  );
}

// ─── Doc 2: Editable Hiring Brief Review screen ───────────────────────────────

const BRIEF_REVIEW_FIELDS: { key: keyof HiringBrief; label: string; hint: string }[] = [
  { key: "companyContext",       label: "Company Context",          hint: "Stage, team size, product description, the problem it solves" },
  { key: "hiringMotivation",     label: "Hiring Motivation",        hint: "Why this role exists right now — the business urgency or catalyst" },
  { key: "role",                 label: "The Role",                 hint: "Title, responsibilities, new or replacement, week one and month one" },
  { key: "seniorityOwnership",   label: "Seniority & Ownership",    hint: "Experience required, what they own, autonomy, whether they manage anyone" },
  { key: "reportingStructure",   label: "Reporting Structure",      hint: "Who they report to, team size and shape, management expectations" },
  { key: "successMetrics",       label: "Success Metrics",          hint: "30-day, 60-day, 90-day, and 1-year outcomes for this hire" },
  { key: "mustHaves",            label: "Must-Haves",               hint: "Non-negotiable technical and human requirements" },
  { key: "niceToHaves",          label: "Nice-to-Haves",            hint: "Desired but non-blocking attributes" },
  { key: "dealBreakers",         label: "Deal Breakers",            hint: "What would immediately disqualify a candidate" },
  { key: "technicalRequirements", label: "Technical Requirements",  hint: "Must-have tech skills, nice-to-have tech skills, stack specifics" },
  { key: "workStyleCulture",     label: "Work Style & Culture",     hint: "Remote/hybrid/in-office, timezone, async vs sync, team dynamic" },
  { key: "compensationModel",    label: "Compensation Model",       hint: "Salary range, equity, benefits, visa sponsorship" },
  { key: "interviewProcess",     label: "Interview Process",        hint: "Rounds, who conducts each stage, evaluation criteria, decision maker" },
  { key: "decisionChain",        label: "Decision Chain",           hint: "Who makes the final call, other stakeholders, timeline from offer to decision" },
  { key: "candidatePitch",       label: "Candidate Pitch",          hint: "Why a strong engineer should choose this role over competing options" },
  { key: "recruitingStrategy",   label: "Recruiting Strategy",      hint: "Target profile, sourcing channels, referral opportunities, constraints" },
  { key: "riskRegister",         label: "Risk Register",            hint: "Known risks: budget mismatch, timeline pressure, unclear scope" },
  { key: "assumptionLog",        label: "Assumption Log",           hint: "What was inferred vs explicitly stated, with recruiting implications" },
  { key: "pastHiringSignal",     label: "Past Hiring Signal",       hint: "Prior experience with this hire, what went wrong, founder concerns" },
  { key: "timeline",             label: "Timeline",                 hint: "Urgency level, target start date, consequence of delay" },
  { key: "budget",               label: "Budget",                   hint: "Salary range, equity, any mismatch flag with seniority" },
  { key: "contact",              label: "Contact",                  hint: "Name, role, email, company website" },
  { key: "openFlags",            label: "Open Flags",               hint: "Unresolved items, contradictions, risks before sourcing begins" },
];

function HiringBriefReview({
  brief,
  onConfirm,
  saving,
}: {
  brief: HiringBrief;
  onConfirm: (edited: HiringBrief) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState<HiringBrief>({ ...brief });
  const [downloading, setDownloading] = useState(false);

  const update = (key: keyof HiringBrief, value: string) => {
    setEditing(prev => ({ ...prev, [key]: value }));
  };

  const downloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: editing }),
      });
      if (!res.ok) {
        const err = await res.json() as { message?: string };
        alert(err.message ?? "Could not generate PDF. Check that all required fields are filled.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hiring-brief.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "0 24px 80px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ paddingTop: 40, paddingBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(26,122,74,0.10)", border: "1px solid rgba(26,122,74,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" stroke={ACCENT} strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 2 }}>Review &amp; Confirm</p>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: DARK, letterSpacing: "-0.03em", lineHeight: 1 }}>Your Hiring Brief</h2>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.65, maxWidth: 560, fontWeight: 300 }}>
          Check everything looks right. Edit any field directly before sending to the team — your edits are what gets saved.
        </p>
        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(26,122,74,0.3), rgba(52,211,153,0.2), transparent)", marginTop: 24 }} />
      </div>

      {/* Editable fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {BRIEF_REVIEW_FIELDS.map((field, i) => {
          const value = editing[field.key] as string;
          if (!value && field.key === "openFlags") return null;
          return (
            <div key={field.key}>
              {i > 0 && <div style={{ height: 1, background: "#F0F0EE" }} />}
              <div style={{ padding: "20px 0" }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.10em", display: "block", marginBottom: 2 }}>
                    {field.label}
                  </label>
                  <p style={{ fontSize: 11, color: "#C0C0C0", margin: 0 }}>{field.hint}</p>
                </div>
                <textarea
                  value={value}
                  onChange={e => update(field.key, e.target.value)}
                  rows={value && value.length > 120 ? 4 : 2}
                  placeholder={`Edit ${field.label.toLowerCase()}...`}
                  style={{
                    width: "100%",
                    border: "1px solid #E8E8E8",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 14,
                    color: DARK,
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.6,
                    resize: "vertical",
                    outline: "none",
                    background: "#FAFAF8",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm + Download buttons */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #F0F0EE" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => onConfirm(editing)}
            disabled={saving}
            style={{
              background: saving ? "#9B9B9B" : `linear-gradient(135deg, ${ACCENT}, #2A9D5C)`,
              color: "white", border: "none", borderRadius: 12,
              padding: "14px 32px", fontSize: 15, fontWeight: 600,
              cursor: saving ? "wait" : "pointer", fontFamily: "Inter, sans-serif",
              boxShadow: saving ? "none" : "0 4px 20px rgba(26,122,74,0.30)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.boxShadow = "0 6px 28px rgba(26,122,74,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = saving ? "none" : "0 4px 20px rgba(26,122,74,0.30)"; e.currentTarget.style.transform = "none"; }}
          >
            {saving ? "Sending..." : "Looks good, send to the team →"}
          </button>
          <button
            onClick={downloadPdf}
            disabled={downloading}
            style={{
              background: "white", color: DARK, border: `1.5px solid #E8E8E8`,
              borderRadius: 12, padding: "14px 24px", fontSize: 14, fontWeight: 500,
              cursor: downloading ? "wait" : "pointer", fontFamily: "Inter, sans-serif",
              display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8E8E8"; e.currentTarget.style.color = DARK; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#B0B0B0", marginTop: 10 }}>
          Profiles in your inbox within 5-7 days.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Completion panel ─────────────────────────────────────────────────────────

function CompletionPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center px-8 py-12"
      style={{ background: "linear-gradient(135deg, rgba(26,122,74,0.04) 0%, transparent 100%)", borderRadius: 20, border: "1px solid rgba(26,122,74,0.10)" }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(26,122,74,0.10)", border: "1px solid rgba(26,122,74,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 20, color: DARK, marginBottom: 8 }}>
        We're on it.
      </p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#6B6B6B", lineHeight: 1.65, maxWidth: 320 }}>
        Your brief is confirmed. Expect a handpicked shortlist in your inbox within 5-7 days.
      </p>
      <motion.div
        style={{ width: "100%", maxWidth: 280, height: 3, background: `linear-gradient(90deg, ${ACCENT}, #34D399)`, borderRadius: 2, marginTop: 24 }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
      />
    </motion.div>
  );
}

// ─── Recovery bar (load completed intake by email) ────────────────────────────

function RecoveryBar({ onLoad, hidden }: { onLoad: (msgs: Message[]) => void; hidden: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "not_found" | "error" | "already_complete">("idle");

  if (hidden) return null;

  const handleLoad = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setState("loading");
    try {
      const res = await fetch(`/api/load-chat?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json() as { found?: boolean; messages?: Message[]; intakeSummary?: string };
      if (data.found && data.messages && data.messages.length > 0) {
        if (data.intakeSummary) {
          // Conversation is already complete — do not load as resumable
          setState("already_complete");
          return;
        }
        onLoad(data.messages);
        setState("idle");
      } else {
        setState("not_found");
        setTimeout(() => setState("idle"), 3000);
      }
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  };

  return (
    <div style={{ background: "#F7F7F5", border: "1px solid #F0F0EE", padding: "12px 16px", marginBottom: 8, borderRadius: 12, fontFamily: "Inter, sans-serif" }}>
      {state === "already_complete" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, color: DARK, fontWeight: 500, margin: 0 }}>Intake already completed</p>
            <p style={{ fontSize: 12, color: "#6B6B6B", margin: "2px 0 0" }}>This intake is done — the Bridgix team already has your brief. <button onClick={() => setState("idle")} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 0, fontFamily: "Inter, sans-serif" }}>Search again</button></p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 flex-wrap">
          <span style={{ fontSize: 13, color: "#6B6B6B", fontWeight: 400, whiteSpace: "nowrap" }}>
            Resume a previous intake?
          </span>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); if (state !== "idle") setState("idle"); }}
            placeholder="your@email.com"
            style={{ border: `1px solid ${state === "not_found" ? "#ef4444" : "#E8E8E8"}`, borderRadius: 6, padding: "5px 11px", fontSize: 12, fontFamily: "Inter, sans-serif", width: 200, outline: "none", background: "white" }}
            onKeyDown={e => { if (e.key === "Enter") handleLoad(); }}
          />
          <button
            onClick={handleLoad}
            disabled={state === "loading"}
            style={{ background: DARK, color: "#FFFFFF", borderRadius: 6, padding: "5px 14px", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 500, cursor: "pointer", border: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = ACCENT; }}
            onMouseLeave={e => { e.currentTarget.style.background = DARK; }}
          >
            {state === "loading" ? "Looking..." : "Load"}
          </button>
          {state === "not_found" && <span style={{ fontSize: 11, color: "#ef4444" }}>No in-progress intake found for that email.</span>}
          {state === "error" && <span style={{ fontSize: 11, color: "#ef4444" }}>Error loading. Try again.</span>}
        </div>
      )}
    </div>
  );
}

// ─── Main ChatModal ───────────────────────────────────────────────────────────

export function ChatModal({ open, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestAiIndex, setLatestAiIndex] = useState(-1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [detectedEmail, setDetectedEmail] = useState<string | null>(null);
  const [sessionPhase, setSessionPhase] = useState<"init" | "continue_banner" | "chat" | "review">("init");
  const [savedMessages, setSavedMessages] = useState<Message[] | null>(null);
  const [recoveryBarHidden, setRecoveryBarHidden] = useState(false);
  const [greeting] = useState(() => getTimeGreeting());
  const [isListening, setIsListening] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [interactiveUsed, setInteractiveUsed] = useState<Set<number>>(new Set());
  const [contactFormIndex, setContactFormIndex] = useState<number | null>(null);
  const [hiringBrief, setHiringBrief] = useState<HiringBrief | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [liveSpec, setLiveSpec] = useState<CandidateSpec>({});
  // Session ID — stable per modal session, prevents duplicate DB rows
  const [sessionId] = useState(() => crypto.randomUUID());

  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const isListeningRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const spec = liveSpec;

  // Section 5: microphone — no useCallback, synchronous recognition.start()
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
    recognition.start(); // called synchronously inside click handler — no async gap
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  // On modal open/close
  useEffect(() => {
    if (!open) {
      setSessionPhase("init");
      setMessages([]);
      setComplete(false);
      setLatestAiIndex(-1);
      setDetectedEmail(null);
      setRecoveryBarHidden(false);
      setSavedMessages(null);
      setInput("");
      setInteractiveUsed(new Set());
      setContactFormIndex(null);
      setHiringBrief(null);
      setReviewSaving(false);
      setShowSidebar(true);
      setLiveSpec({});
      return;
    }
    // Track visitor session on modal open
    const tz = getOrSetTimezone();
    fetch("/api/track-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: tz }),
    }).catch(() => {});

    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed: Message[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setSavedMessages(parsed);
          setSessionPhase("continue_banner");
          return;
        }
      }
    } catch { /* ignore */ }
    startFresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Persist to localStorage
  useEffect(() => {
    if (messages.length > 0 && sessionPhase === "chat") {
      try { localStorage.setItem(LS_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
    }
  }, [messages, sessionPhase]);

  // Detect email in conversation
  useEffect(() => {
    if (messages.length === 0) return;
    const allText = messages.map(m => m.content).join(" ");
    const match = allText.match(EMAIL_REGEX);
    if (match && !detectedEmail) setDetectedEmail(match[0]);
  }, [messages, detectedEmail]);

  // Save to DB via save-chat when email detected
  useEffect(() => {
    if (!detectedEmail || messages.length === 0) return;
    fetch("/api/save-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: detectedEmail, messages, sessionId }),
    }).catch(() => {});
  }, [messages, detectedEmail, sessionId]);

  function startFresh() {
    setMessages([]);
    setComplete(false);
    setLatestAiIndex(-1);
    setDetectedEmail(null);
    setRecoveryBarHidden(false);
    setInteractiveUsed(new Set());
    setContactFormIndex(null);
    setHiringBrief(null);
    setLiveSpec({});
    setSessionPhase("chat");
    setTimeout(() => {
      setMessages([{ role: "assistant", content: pickFirstMessage() }]);
      setLatestAiIndex(0);
    }, 400);
  }

  function continueSession() {
    if (!savedMessages) return;
    setMessages(savedMessages);
    setLatestAiIndex(-1);
    setSessionPhase("chat");
    setSavedMessages(null);
  }

  function handleEmailLoad(msgs: Message[]) {
    setMessages(msgs);
    setLatestAiIndex(-1);
    setSessionPhase("chat");
  }

  // Handle founder confirming the edited brief
  async function handleBriefConfirm(edited: HiringBrief) {
    setReviewSaving(true);
    try {
      await fetch("/api/save-hiring-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: detectedEmail,
          sessionId,
          brief: edited,
          status: "confirmed",
        }),
      });
    } catch { /* non-fatal */ }
    setHiringBrief(edited);
    setReviewSaving(false);
    setComplete(true);
    setSessionPhase("chat");
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  }

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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          sessionId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          const errMsg = (errData as { message?: string }).message || "The AI is a bit busy right now. Try again in a moment.";
          setMessages(prev => { const u = [...prev, { role: "assistant" as const, content: errMsg }]; setLatestAiIndex(u.length - 1); return u; });
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply: string = data.reply ?? "";

      // Fire-and-forget: extract structured spec from the updated conversation
      if (reply && !reply.includes("INTAKE_COMPLETE")) {
        const fullConv = [...newMessages, { role: "assistant" as const, content: reply }];
        fetchLiveSpec(fullConv).then(extracted => {
          if (Object.keys(extracted).length > 0) setLiveSpec(extracted);
        }).catch(() => {});
      }

      if (reply.includes("INTAKE_COMPLETE")) {
        // Add final AI message to the conversation
        const finalAIMsg = "Perfect — I've got everything I need. Before I send this to the team, take a moment to review the brief. Edit anything that doesn't look right.";
        setMessages(prev => { const u = [...prev, { role: "assistant" as const, content: finalAIMsg }]; setLatestAiIndex(u.length - 1); return u; });

        // Parse the brief and transition to review screen
        const parsed = parseIntakeComplete(reply);
        setTimeout(() => {
          setHiringBrief(parsed);
          setSessionPhase("review");
        }, 2200);
      } else if (reply.includes("render_component: contact_info_form_bar")) {
        // Clean signal from displayed text, store cleaned version in messages
        const cleanedReply = stripContactFormSignal(reply);
        setMessages(prev => {
          const u = [...prev, { role: "assistant" as const, content: cleanedReply }];
          setLatestAiIndex(u.length - 1);
          setContactFormIndex(u.length - 1);
          return u;
        });
      } else {
        setMessages(prev => { const u = [...prev, { role: "assistant" as const, content: reply }]; setLatestAiIndex(u.length - 1); return u; });
      }
    } catch {
      setMessages(prev => { const u = [...prev, { role: "assistant" as const, content: "Something went wrong. Try again in a moment." }]; setLatestAiIndex(u.length - 1); return u; });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, complete, sessionPhase, sessionId]);

  const handleInteractiveConfirm = useCallback((messageIndex: number, value: string) => {
    setInteractiveUsed(prev => new Set([...prev, messageIndex]));
    sendMessage(value);
  }, [sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "56px";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  };

  const showNoConversation = sessionPhase === "chat" && messages.length === 0;
  const showRecovery = sessionPhase === "chat" && !recoveryBarHidden;
  const hasSidebarContent = Object.values(spec).some(v => v && (Array.isArray(v) ? v.length > 0 : true)) || hiringBrief !== null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2000] flex flex-col"
          style={{ background: BG }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Top accent bar */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #1A7A4A, #34D399, #6EE7B7)", flexShrink: 0 }} />

          {/* Header */}
          <div className="flex-shrink-0" style={{ background: "rgba(250,250,248,0.97)", borderBottom: "1px solid rgba(0,0,0,0.07)", backdropFilter: "blur(12px)" }}>
            <div className="max-w-none mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: AI_BUBBLE_BG, border: `1px solid ${AI_BUBBLE_BORDER}` }}>
                  <img src={logoImage} alt="Bridgix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div>
                  <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 15, color: DARK }}>
                    Bridgix hiring partner
                  </span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6B6B6B", marginLeft: 8 }}>
                    {loading ? "Thinking..." : sessionPhase === "review" ? "Review your brief" : "Online"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Sidebar toggle */}
                <button
                  onClick={() => setShowSidebar(s => !s)}
                  title={showSidebar ? "Hide brief" : "Show hiring brief"}
                  style={{
                    background: showSidebar ? "rgba(26,122,74,0.1)" : "#F0F0EE",
                    border: showSidebar ? "1px solid rgba(26,122,74,0.2)" : "none",
                    borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: showSidebar ? ACCENT : "#6B6B6B", transition: "all 0.15s", position: "relative",
                  }}
                >
                  <svg width="15" height="13" viewBox="0 0 18 14" fill="none">
                    <rect x="0" y="0" width="7" height="14" rx="2" fill="currentColor" opacity="0.4"/>
                    <rect x="9" y="0" width="9" height="3" rx="1.5" fill="currentColor"/>
                    <rect x="9" y="5.5" width="7" height="3" rx="1.5" fill="currentColor"/>
                    <rect x="9" y="11" width="5" height="3" rx="1.5" fill="currentColor"/>
                  </svg>
                  {hasSidebarContent && !showSidebar && (
                    <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
                  )}
                </button>
                <button
                  onClick={onClose}
                  style={{ background: "#F0F0EE", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6B6B", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#E0E0DE"; e.currentTarget.style.color = DARK; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#F0F0EE"; e.currentTarget.style.color = "#6B6B6B"; }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Continue / Start Fresh Banner */}
          <AnimatePresence>
            {sessionPhase === "continue_banner" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
                style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.07)", flexShrink: 0 }}
              >
                <div className="max-w-[780px] mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 15, color: DARK, marginBottom: 2 }}>You have an unfinished conversation</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6B6B6B" }}>Pick up where you left off, or start fresh?</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={continueSession}
                      style={{ background: DARK, color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontFamily: "Inter, sans-serif", fontWeight: 500, cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = ACCENT; }}
                      onMouseLeave={e => { e.currentTarget.style.background = DARK; }}>
                      Continue
                    </button>
                    <button onClick={startFresh}
                      style={{ background: "transparent", color: "#6B6B6B", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontFamily: "Inter, sans-serif", cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.25)"; e.currentTarget.style.color = DARK; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; e.currentTarget.style.color = "#6B6B6B"; }}>
                      Start fresh
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main body: chat/review + sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* Content area */}
            <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: "smooth" }}>

              {/* Review screen (Doc 2) — shown when sessionPhase === "review" */}
              {sessionPhase === "review" && hiringBrief && (
                <HiringBriefReview
                  brief={hiringBrief}
                  onConfirm={handleBriefConfirm}
                  saving={reviewSaving}
                />
              )}

              {/* Chat area — shown when sessionPhase === "chat" */}
              {sessionPhase !== "review" && (
                <div className="max-w-[780px] mx-auto px-6 py-8 flex flex-col h-full">

                  {showNoConversation && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "clamp(32px, 5vw, 52px)", color: DARK, letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.1 }}
                      >
                        {greeting}
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                        style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "#6B6B6B", fontWeight: 300, maxWidth: 360, lineHeight: 1.6 }}
                      >
                        Tell us about your role and we'll find you the right engineer.
                      </motion.p>
                    </div>
                  )}

                  {showRecovery && sessionPhase === "chat" && messages.length > 0 && (
                    <RecoveryBar onLoad={handleEmailLoad} hidden={recoveryBarHidden} />
                  )}

                  {sessionPhase === "chat" && messages.length > 0 && messages.length <= 2 && (
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                      style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "clamp(28px, 4vw, 42px)", color: DARK, letterSpacing: "-0.03em", marginBottom: 32, lineHeight: 1.15, textAlign: "center" }}
                    >
                      {greeting}
                    </motion.h1>
                  )}

                  <div className="flex flex-col gap-5">
                    {messages.map((msg, i) => {
                      if (msg.role === "assistant") {
                        const interactiveType = detectInteractiveType(msg.content);
                        const isLastMsg = i === messages.length - 1;
                        const shouldShowInteractive = interactiveType && isLastMsg && !interactiveUsed.has(i) && !loading && !complete;
                        const shouldShowContactForm = i === contactFormIndex && !interactiveUsed.has(i) && !loading && !complete;
                        return (
                          <div key={i}>
                            <AIBubble content={msg.content} isLatest={i === latestAiIndex} />
                            {shouldShowContactForm && (
                              <div style={{ marginTop: 12, marginLeft: 44 }}>
                                <ContactFormBar onConfirm={(val) => handleInteractiveConfirm(i, val)} />
                              </div>
                            )}
                            {shouldShowInteractive && !shouldShowContactForm && (
                              <div style={{ marginTop: 12, marginLeft: 44 }}>
                                {interactiveType === "slider" && <SliderInput onConfirm={(val) => handleInteractiveConfirm(i, val)} />}
                                {interactiveType === "tags" && <TagsInput onConfirm={(val) => handleInteractiveConfirm(i, val)} />}
                                {interactiveType === "choice" && <ChoiceInput onConfirm={(val) => handleInteractiveConfirm(i, val)} />}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return <UserBubble key={i} content={msg.content} />;
                    })}
                    {loading && <TypingDots />}
                    {complete && <CompletionPanel />}
                  </div>
                  <div ref={messagesEndRef} style={{ height: 24 }} />
                </div>
              )}
            </div>

            {/* Sidebar — hidden on mobile, toggled by button */}
            <div className="hidden lg:flex">
              <HiringBriefSidebar spec={spec} hiringBrief={hiringBrief} visible={showSidebar} />
            </div>
          </div>

          {/* Input bar — hidden during review or when complete */}
          {sessionPhase === "chat" && !complete && (
            <div className="flex-shrink-0" style={{ background: "rgba(250,250,248,0.97)", borderTop: "1px solid rgba(0,0,0,0.07)", backdropFilter: "blur(12px)" }}>
              <div className="max-w-[780px] mx-auto px-6 py-4">
                <div className="flex items-end gap-3">
                  {/* Section 4: larger font size */}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply..."
                    rows={1}
                    style={{
                      flex: 1, border: "1.5px solid #E4E4E2", borderRadius: 14, padding: "16px 20px",
                      fontFamily: "Inter, sans-serif", fontSize: 17, color: DARK,
                      resize: "none", minHeight: 56, maxHeight: 150, overflowY: "auto",
                      outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", lineHeight: 1.55,
                      background: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                    onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                    onBlur={e => { e.target.style.borderColor = "#E4E4E2"; e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
                  />
                  {/* Section 5: microphone — direct handler, no useCallback */}
                  <button
                    onClick={handleMicClick}
                    type="button"
                    title={isListening ? "Stop listening" : "Voice input"}
                    style={{
                      width: 56, height: 56, borderRadius: 14, border: "none", flexShrink: 0,
                      background: isListening ? "linear-gradient(135deg, #E05050, #FF7070)" : AI_BUBBLE_BG,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" stroke={isListening ? "white" : ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" stroke={isListening ? "white" : ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {/* Send button */}
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    style={{
                      width: 56, height: 56, borderRadius: 14, border: "none", flexShrink: 0,
                      background: !input.trim() || loading ? "#E4E4E2" : `linear-gradient(135deg, ${ACCENT}, #2A9D5C)`,
                      cursor: !input.trim() || loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: input.trim() && !loading ? "0 4px 14px rgba(26,122,74,0.3)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke={!input.trim() || loading ? "#B0B0B0" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#B0B0B0", marginTop: 8, textAlign: "center" }}>
                  Bridgix hiring partner · Responses within seconds
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
