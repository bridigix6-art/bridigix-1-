import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@assets/Screenshot_2026-06-04-07-57-10-533_com.canva.editor-edit_17805_1780625194177.jpg";

interface Message { role: "user" | "assistant"; content: string; }
interface ChatModalProps { open: boolean; onClose: () => void; }

const FIRST_MESSAGE = "Tell me a bit about what you're building — what does your company do?";
const LS_KEY = "bridigix_chat";
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const COOKIE_KEY = "bridigix_tz";

const ACCENT = "#1A7A4A";
const BG = "#FAFAF8";
const DARK = "#0A0A0A";

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

// ─── Spec profile extraction ─────────────────────────────────────────────────

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

function extractSpec(messages: Message[]): CandidateSpec {
  const spec: CandidateSpec = {};
  const fullText = messages.map(m => m.content).join("\n");
  const userMessages = messages.filter(m => m.role === "user").map(m => m.content.toLowerCase());

  // Company: look for INTAKE_COMPLETE block first, else infer
  const companyMatch = fullText.match(/COMPANY CONTEXT:\s*([^\n]+)/);
  if (companyMatch) spec.company = companyMatch[1].trim();

  // Role
  const roleMatch = fullText.match(/ROLE:\s*([^\n]+)/);
  if (roleMatch) spec.role = roleMatch[1].trim();

  // Seniority
  const seniorityMatch = fullText.match(/SENIORITY[^:]*:\s*([^\n]+)/i);
  if (seniorityMatch) spec.seniority = seniorityMatch[1].trim();

  // Contract type
  const contractMatch = fullText.match(/CONTRACT[^:]*:\s*([^\n]+)/i);
  if (contractMatch) spec.contractType = contractMatch[1].trim();

  // Work style
  const workStyleMatch = fullText.match(/WORK STYLE[^:]*:\s*([^\n]+)/i);
  if (workStyleMatch) spec.workStyle = workStyleMatch[1].trim();

  // Timeline
  const timelineMatch = fullText.match(/TIMELINE:\s*([^\n]+)/);
  if (timelineMatch) spec.timeline = timelineMatch[1].trim();

  // Budget
  const budgetMatch = fullText.match(/BUDGET:\s*([^\n]+)/);
  if (budgetMatch) spec.budget = budgetMatch[1].trim();

  // Contact
  const contactMatch = fullText.match(/CONTACT:\s*([^\n]+)/);
  if (contactMatch) spec.contact = contactMatch[1].trim();

  // Incremental extraction from conversation when no INTAKE_COMPLETE yet
  if (!spec.company) {
    // Try to find company from early context
    for (const msg of messages.filter(m => m.role === "user").slice(0, 3)) {
      const c = msg.content;
      if (c.length > 15 && c.length < 300) {
        spec.company = c.length > 80 ? c.slice(0, 77) + "..." : c;
        break;
      }
    }
  }

  // Role inference from user messages
  if (!spec.role) {
    const roleKeywords = ["engineer", "developer", "designer", "manager", "lead", "cto", "backend", "frontend", "fullstack", "full stack", "ml ", "ai ", "devops", "mobile"];
    for (const msg of userMessages) {
      const found = roleKeywords.find(k => msg.includes(k));
      if (found) {
        const words = msg.split(/\s+/).slice(0, 10).join(" ");
        spec.role = words.length > 5 ? words : undefined;
        break;
      }
    }
  }

  // Seniority inference
  if (!spec.seniority) {
    const seniorityKws = ["junior", "mid", "senior", "staff", "lead", "principal"];
    for (const msg of userMessages) {
      const found = seniorityKws.find(k => msg.includes(k));
      if (found) { spec.seniority = found.charAt(0).toUpperCase() + found.slice(1); break; }
    }
  }

  // Tech stack from tagged response or user messages
  if (!spec.techStack) {
    const stackKws = ["react", "typescript", "javascript", "python", "go", "node", "next", "vue", "angular", "swift", "kotlin", "rust", "java", "postgres", "mongodb", "aws", "gcp", "azure", "docker", "kubernetes"];
    const found: string[] = [];
    for (const msg of userMessages) {
      for (const k of stackKws) {
        if (msg.includes(k) && !found.includes(k)) found.push(k.charAt(0).toUpperCase() + k.slice(1));
      }
    }
    if (found.length) spec.techStack = found.slice(0, 6);
  }

  // Contract type inference
  if (!spec.contractType) {
    const contractKws: [string, string][] = [["contractor", "Contractor"], ["contract", "Contractor"], ["freelance", "Freelance"], ["full-time", "Full-time"], ["full time", "Full-time"], ["part-time", "Part-time"], ["part time", "Part-time"]];
    for (const msg of userMessages) {
      const found = contractKws.find(([k]) => msg.includes(k));
      if (found) { spec.contractType = found[1]; break; }
    }
  }

  // Work style inference
  if (!spec.workStyle) {
    const wsKws: [string, string][] = [["async", "Async / Remote"], ["remote", "Remote"], ["structured", "Structured"], ["chaotic", "Fast-paced / Adaptive"], ["adaptive", "Adaptive"], ["fast", "Fast-paced"]];
    for (const msg of userMessages) {
      const found = wsKws.find(([k]) => msg.includes(k));
      if (found) { spec.workStyle = found[1]; break; }
    }
  }

  // Timeline inference
  if (!spec.timeline) {
    const tlKws = ["urgent", "asap", "immediately", "next month", "few weeks", "3 months", "6 months", "q1", "q2", "q3", "q4"];
    for (const msg of userMessages) {
      const found = tlKws.find(k => msg.includes(k));
      if (found) { spec.timeline = msg.slice(0, 60); break; }
    }
  }

  // Budget inference
  if (!spec.budget) {
    const budgetRe = /(\$[\d,]+k?|\£[\d,]+k?|[\d]+k\s*(usd|gbp|eur)?(\s*[-–]\s*[\d]+k)?|[\d]+,[\d]+)/i;
    for (const msg of userMessages) {
      const m = msg.match(budgetRe);
      if (m) { spec.budget = m[0]; break; }
    }
  }

  // Contact
  if (!spec.contact) {
    const emailMatch2 = fullText.match(EMAIL_REGEX);
    if (emailMatch2) spec.contact = emailMatch2[0];
  }

  return spec;
}

// ─── Interactive element detection ──────────────────────────────────────────

type InteractiveType = "slider" | "tags" | "choice" | null;

function detectInteractiveType(message: string): InteractiveType {
  const lower = message.toLowerCase();

  // Work style / structured vs adaptive
  if (
    (lower.includes("structured") && (lower.includes("adaptive") || lower.includes("flexible") || lower.includes("chaotic"))) ||
    (lower.includes("work style") || lower.includes("working style") || lower.includes("day to day") && lower.includes("team"))
  ) {
    return "slider";
  }

  // Tech stack
  if (
    lower.includes("tech stack") ||
    lower.includes("technology stack") ||
    (lower.includes("stack") && (lower.includes("using") || lower.includes("built") || lower.includes("current"))) ||
    (lower.includes("language") && lower.includes("framework"))
  ) {
    return "tags";
  }

  // Contract type
  if (
    (lower.includes("contractor") || lower.includes("contract")) &&
    (lower.includes("full-time") || lower.includes("full time") || lower.includes("permanent"))
  ) {
    return "choice";
  }
  if (
    lower.includes("engagement type") ||
    (lower.includes("bring") && (lower.includes("contractor") || lower.includes("full-time"))) ||
    (lower.includes("part-time") && lower.includes("full-time"))
  ) {
    return "choice";
  }

  return null;
}

const TECH_TAGS = [
  "JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "Swift", "Kotlin",
  "React", "Next.js", "Vue", "Angular", "Node.js", "Express",
  "PostgreSQL", "MongoDB", "Redis", "MySQL",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes",
];

const CONTRACT_OPTIONS = ["Full-time / Permanent", "Contract / Short-term", "Part-time", "Freelance", "Not sure yet"];

// ─── Interactive UI components ───────────────────────────────────────────────

function SliderInput({ onConfirm }: { onConfirm: (value: string) => void }) {
  const [val, setVal] = useState(50);
  const labels = ["Fully Structured", "Mostly Structured", "Balanced", "Mostly Adaptive", "Highly Adaptive"];
  const labelIndex = Math.round((val / 100) * (labels.length - 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: `rgba(26,122,74,0.06)`,
        border: `1px solid rgba(26,122,74,0.14)`,
        borderRadius: 18,
        padding: "20px 22px",
        maxWidth: 420,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 16, fontWeight: 400 }}>
        Drag to describe your team's working style
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9B9B9B", marginBottom: 8 }}>
        <span>Structured</span>
        <span>Highly Adaptive</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={val}
        onChange={e => setVal(Number(e.target.value))}
        style={{ width: "100%", accentColor: ACCENT, cursor: "pointer", marginBottom: 12 }}
      />
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{
          display: "inline-block",
          background: ACCENT,
          color: "white",
          borderRadius: 20,
          padding: "4px 14px",
          fontSize: 13,
          fontWeight: 500,
        }}>
          {labels[labelIndex]}
        </span>
      </div>
      <button
        onClick={() => onConfirm(`Work style: ${labels[labelIndex]}`)}
        style={{
          width: "100%",
          background: DARK,
          color: "white",
          border: "none",
          borderRadius: 10,
          padding: "11px",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Confirm
      </button>
    </motion.div>
  );
}

function TagsInput({ onConfirm }: { onConfirm: (value: string) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  const toggle = (tag: string) => {
    setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const addCustom = () => {
    const t = custom.trim();
    if (t && !selected.includes(t)) setSelected(prev => [...prev, t]);
    setCustom("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(26,122,74,0.06)",
        border: "1px solid rgba(26,122,74,0.14)",
        borderRadius: 18,
        padding: "20px 22px",
        maxWidth: 480,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 14, fontWeight: 400 }}>
        Select all that apply, or type your own
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {TECH_TAGS.map(tag => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              style={{
                border: `1px solid ${active ? ACCENT : "#E0E0DE"}`,
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 13,
                background: active ? ACCENT : "white",
                color: active ? "white" : "#0A0A0A",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.15s",
                fontWeight: active ? 500 : 400,
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder="Add custom (e.g. Elixir, Svelte...)"
          style={{
            flex: 1,
            border: "1px solid #E0E0DE",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            outline: "none",
            background: "white",
          }}
        />
        <button
          onClick={addCustom}
          style={{
            background: "rgba(26,122,74,0.1)",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            color: ACCENT,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
          }}
        >
          Add
        </button>
      </div>
      {selected.length > 0 && (
        <div style={{ marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {selected.map(t => (
            <span key={t} style={{
              background: "rgba(26,122,74,0.1)",
              color: ACCENT,
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              {t}
              <button
                onClick={() => setSelected(prev => prev.filter(x => x !== t))}
                style={{ background: "none", border: "none", cursor: "pointer", color: ACCENT, fontSize: 14, padding: 0, lineHeight: 1 }}
              >×</button>
            </span>
          ))}
        </div>
      )}
      <button
        disabled={selected.length === 0}
        onClick={() => onConfirm(`Tech stack: ${selected.join(", ")}`)}
        style={{
          width: "100%",
          background: selected.length > 0 ? DARK : "#E4E4E2",
          color: selected.length > 0 ? "white" : "#B0B0B0",
          border: "none",
          borderRadius: 10,
          padding: "11px",
          fontSize: 14,
          fontWeight: 500,
          cursor: selected.length > 0 ? "pointer" : "not-allowed",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Confirm selection{selected.length > 0 ? ` (${selected.length})` : ""}
      </button>
    </motion.div>
  );
}

function ChoiceInput({ onConfirm }: { onConfirm: (value: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(26,122,74,0.06)",
        border: "1px solid rgba(26,122,74,0.14)",
        borderRadius: 18,
        padding: "20px 22px",
        maxWidth: 400,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p style={{ fontSize: 13, color: "#6B6B6B", marginBottom: 14, fontWeight: 400 }}>
        Select the engagement type
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {CONTRACT_OPTIONS.map(opt => {
          const active = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              style={{
                border: `1.5px solid ${active ? ACCENT : "#E0E0DE"}`,
                borderRadius: 10,
                padding: "11px 16px",
                fontSize: 14,
                background: active ? "rgba(26,122,74,0.08)" : "white",
                color: active ? ACCENT : "#0A0A0A",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                textAlign: "left",
                transition: "all 0.15s",
                fontWeight: active ? 500 : 400,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: "50%",
                border: `2px solid ${active ? ACCENT : "#C0C0C0"}`,
                background: active ? ACCENT : "white",
                flexShrink: 0,
                transition: "all 0.15s",
              }} />
              {opt}
            </button>
          );
        })}
      </div>
      <button
        disabled={!selected}
        onClick={() => selected && onConfirm(`Contract type: ${selected}`)}
        style={{
          width: "100%",
          background: selected ? DARK : "#E4E4E2",
          color: selected ? "white" : "#B0B0B0",
          border: "none",
          borderRadius: 10,
          padding: "11px",
          fontSize: 14,
          fontWeight: 500,
          cursor: selected ? "pointer" : "not-allowed",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Confirm
      </button>
    </motion.div>
  );
}

// ─── Spec sidebar ────────────────────────────────────────────────────────────

const SPEC_FIELDS: { key: keyof CandidateSpec; label: string; icon: string }[] = [
  { key: "company", label: "Company", icon: "🏢" },
  { key: "role", label: "Role", icon: "💼" },
  { key: "seniority", label: "Seniority", icon: "📊" },
  { key: "techStack", label: "Tech Stack", icon: "🛠" },
  { key: "contractType", label: "Engagement", icon: "📋" },
  { key: "workStyle", label: "Work Style", icon: "🔄" },
  { key: "timeline", label: "Timeline", icon: "📅" },
  { key: "budget", label: "Budget", icon: "💰" },
  { key: "contact", label: "Contact", icon: "✉️" },
];

function SpecSidebar({ spec, visible }: { spec: CandidateSpec; visible: boolean }) {
  const filled = SPEC_FIELDS.filter(f => spec[f.key] && (Array.isArray(spec[f.key]) ? (spec[f.key] as string[]).length > 0 : true));
  const empty = SPEC_FIELDS.filter(f => !spec[f.key] || (Array.isArray(spec[f.key]) && (spec[f.key] as string[]).length === 0));
  const progress = Math.round((filled.length / SPEC_FIELDS.length) * 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.25 }}
          style={{
            width: 260,
            flexShrink: 0,
            borderLeft: "1px solid rgba(0,0,0,0.07)",
            background: "white",
            overflowY: "auto",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div style={{ padding: "20px 18px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#0A0A0A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Candidate Brief
              </span>
              <span style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>{progress}%</span>
            </div>
            <div style={{ height: 3, background: "#F0F0EE", borderRadius: 2, marginBottom: 16 }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: "100%", background: `linear-gradient(90deg, ${ACCENT}, #34D399)`, borderRadius: 2 }}
              />
            </div>

            {filled.length === 0 && (
              <p style={{ fontSize: 12, color: "#B0B0B0", lineHeight: 1.6 }}>
                Fields will populate as you chat.
              </p>
            )}

            {filled.map(field => {
              const value = spec[field.key];
              return (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: 14 }}
                >
                  <div style={{ fontSize: 11, color: "#9B9B9B", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
                    <span>{field.icon}</span>
                    <span style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>{field.label}</span>
                  </div>
                  {Array.isArray(value) ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {(value as string[]).map(tag => (
                        <span key={tag} style={{
                          background: "rgba(26,122,74,0.08)",
                          color: ACCENT,
                          borderRadius: 20,
                          padding: "2px 9px",
                          fontSize: 11,
                          fontWeight: 500,
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "#0A0A0A", lineHeight: 1.5, fontWeight: 400, margin: 0 }}>
                      {String(value).slice(0, 120)}{String(value).length > 120 ? "..." : ""}
                    </p>
                  )}
                </motion.div>
              );
            })}

            {empty.length > 0 && (
              <>
                {filled.length > 0 && <div style={{ height: 1, background: "#F0F0EE", margin: "12px 0" }} />}
                <p style={{ fontSize: 11, color: "#C0C0C0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
                  Not yet gathered
                </p>
                {empty.map(field => (
                  <div key={field.key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, opacity: 0.5 }}>
                    <span style={{ fontSize: 11 }}>{field.icon}</span>
                    <span style={{ fontSize: 12, color: "#9B9B9B" }}>{field.label}</span>
                    <div style={{ flex: 1, height: 1, background: "#E8E8E8", borderRadius: 1 }} />
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Core chat components ─────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: "rgba(26,122,74,0.08)", border: "1px solid rgba(26,122,74,0.12)" }}>
        <img src={logoImage} alt="Bridgix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div className="flex items-center gap-1.5" style={{ background: "rgba(26,122,74,0.07)", borderRadius: "6px 18px 18px 18px", padding: "14px 20px" }}>
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

function AIBubble({ content, isLatest }: { content: string; isLatest: boolean }) {
  const text = useTypewriter(content, 14, isLatest);
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 overflow-hidden" style={{ background: "rgba(26,122,74,0.08)", border: "1px solid rgba(26,122,74,0.12)" }}>
        <img src={logoImage} alt="Bridgix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div style={{ background: "rgba(26,122,74,0.07)", borderRadius: "6px 18px 18px 18px", padding: "14px 20px", fontSize: 16, color: DARK, lineHeight: 1.65, fontFamily: "Inter, sans-serif", fontWeight: 400, maxWidth: "78%" }}>
        {isLatest ? text : content}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex items-end justify-end gap-3">
      <div style={{ background: DARK, borderRadius: "18px 6px 18px 18px", padding: "14px 20px", fontSize: 16, color: "#FFFFFF", lineHeight: 1.65, fontFamily: "Inter, sans-serif", fontWeight: 400, maxWidth: "72%" }}>
        {content}
      </div>
    </div>
  );
}

function CompletionPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center px-8 py-12"
      style={{ background: "linear-gradient(135deg, rgba(26,122,74,0.04) 0%, transparent 100%)", borderRadius: 20, border: "1px solid rgba(26,122,74,0.10)" }}
    >
      <div style={{ marginBottom: 16 }}>
        <img src={logoImage} alt="Bridgix" style={{ width: 40, height: 40, objectFit: "contain" }} />
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 20, color: DARK, marginBottom: 8 }}>
        We're on it.
      </p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#6B6B6B", lineHeight: 1.65, maxWidth: 320 }}>
        Expect three matched profiles in your inbox within a week. We'll be in touch.
      </p>
      <motion.div
        style={{ width: "100%", maxWidth: 280, height: 3, background: "linear-gradient(90deg, #1A7A4A, #34D399)", borderRadius: 2, marginTop: 24 }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
      />
    </motion.div>
  );
}

function RecoveryBar({ onLoad, hidden }: { onLoad: (msgs: Message[]) => void; hidden: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "not_found" | "error">("idle");
  const [toast, setToast] = useState(false);

  if (hidden) return null;

  const handleLoad = async () => {
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch(`/api/load-chat?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (data.messages) {
        onLoad(data.messages);
        setToast(true);
        setTimeout(() => setToast(false), 2500);
      } else {
        setState("not_found");
        setTimeout(() => setState("idle"), 2200);
      }
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2200);
    }
  };

  return (
    <div style={{ background: "#F7F7F5", borderBottom: "1px solid #F0F0EE", padding: "10px 0", marginBottom: 8, borderRadius: 12 }}>
      <div className="flex items-center gap-2.5 flex-wrap">
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6B6B6B", fontWeight: 400, whiteSpace: "nowrap" }}>
          Continue a previous chat?
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
          {state === "loading" ? "Loading..." : "Load"}
        </button>
        {state === "not_found" && <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#ef4444" }}>No chat found.</span>}
      </div>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: ACCENT }}>Chat restored.</span>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main modal ──────────────────────────────────────────────────────────────

export function ChatModal({ open, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestAiIndex, setLatestAiIndex] = useState(-1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [detectedEmail, setDetectedEmail] = useState<string | null>(null);
  const [sessionPhase, setSessionPhase] = useState<"init" | "continue_banner" | "chat">("init");
  const [savedMessages, setSavedMessages] = useState<Message[] | null>(null);
  const [recoveryBarHidden, setRecoveryBarHidden] = useState(false);
  const [greeting] = useState(() => getTimeGreeting());
  const [isListening, setIsListening] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [interactiveUsed, setInteractiveUsed] = useState<Set<number>>(new Set());
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const spec = extractSpec(messages);

  const toggleListening = useCallback(() => {
    type SpeechRecognitionType = {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    type SpeechRecognitionCtor = new () => SpeechRecognitionType;

    const win = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!Ctor) {
      alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results as ArrayLike<{ 0: { transcript: string } }>)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

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
      return;
    }
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

  useEffect(() => {
    if (messages.length > 0 && sessionPhase === "chat") {
      try { localStorage.setItem(LS_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
    }
  }, [messages, sessionPhase]);

  useEffect(() => {
    if (messages.length === 0) return;
    const allText = messages.map(m => m.content).join(" ");
    const match = allText.match(EMAIL_REGEX);
    if (match && !detectedEmail) setDetectedEmail(match[0]);
  }, [messages, detectedEmail]);

  useEffect(() => {
    if (!detectedEmail || messages.length === 0) return;
    fetch("/api/save-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: detectedEmail, messages }),
    }).catch(() => {});
  }, [messages, detectedEmail]);

  function startFresh() {
    setMessages([]);
    setComplete(false);
    setLatestAiIndex(-1);
    setDetectedEmail(null);
    setRecoveryBarHidden(false);
    setInteractiveUsed(new Set());
    setSessionPhase("chat");
    setTimeout(() => {
      setMessages([{ role: "assistant", content: FIRST_MESSAGE }]);
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
    setRecoveryBarHidden(true);
  }

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading || complete) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "52px";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          const errMsg = (errData as { message?: string }).message || "The AI is a bit busy right now. Try again in a moment.";
          setMessages(prev => {
            const u = [...prev, { role: "assistant" as const, content: errMsg }];
            setLatestAiIndex(u.length - 1);
            return u;
          });
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply: string = data.reply ?? "";

      if (reply.includes("INTAKE_COMPLETE")) {
        const finalMsg = "Perfect. That's everything I need. I'm going into the network now — you'll have a handpicked shortlist in your inbox within a week. Keep an eye out.";
        setMessages(prev => {
          const u = [...prev, { role: "assistant" as const, content: finalMsg }];
          setLatestAiIndex(u.length - 1);
          return u;
        });
        setTimeout(() => {
          setComplete(true);
          try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
        }, 3000);
      } else {
        setMessages(prev => {
          const u = [...prev, { role: "assistant" as const, content: reply }];
          setLatestAiIndex(u.length - 1);
          return u;
        });
      }
    } catch {
      setMessages(prev => {
        const errMsg = "Something went wrong. Try again in a moment.";
        const u = [...prev, { role: "assistant" as const, content: errMsg }];
        setLatestAiIndex(u.length - 1);
        return u;
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, complete]);

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
    el.style.height = "52px";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const showNoConversation = sessionPhase === "chat" && messages.length === 0;
  const showRecovery = sessionPhase === "chat" && !recoveryBarHidden;
  const hasSidebarContent = Object.values(spec).some(v => v && (Array.isArray(v) ? v.length > 0 : true));

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
          <div style={{ height: 3, background: "linear-gradient(90deg, #1A7A4A, #34D399, #F5C518)", flexShrink: 0 }} />

          {/* Header */}
          <div className="flex-shrink-0" style={{ background: "rgba(250,250,248,0.97)", borderBottom: "1px solid rgba(0,0,0,0.07)", backdropFilter: "blur(12px)" }}>
            <div className="max-w-none mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: "rgba(26,122,74,0.08)", border: "1px solid rgba(26,122,74,0.12)" }}>
                  <img src={logoImage} alt="Bridgix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div>
                  <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 15, color: DARK }}>
                    Bridgix hiring partner
                  </span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6B6B6B", marginLeft: 8 }}>
                    {loading ? "Thinking..." : "Online"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Sidebar toggle */}
                <button
                  onClick={() => setShowSidebar(s => !s)}
                  title={showSidebar ? "Hide brief" : "Show candidate brief"}
                  style={{
                    background: showSidebar ? "rgba(26,122,74,0.1)" : "#F0F0EE",
                    border: showSidebar ? "1px solid rgba(26,122,74,0.2)" : "none",
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: showSidebar ? ACCENT : "#6B6B6B",
                    transition: "all 0.15s",
                    position: "relative",
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
                    <button
                      onClick={continueSession}
                      style={{ background: DARK, color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontFamily: "Inter, sans-serif", fontWeight: 500, cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = ACCENT; }}
                      onMouseLeave={e => { e.currentTarget.style.background = DARK; }}
                    >
                      Continue
                    </button>
                    <button
                      onClick={startFresh}
                      style={{ background: "transparent", color: "#6B6B6B", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontFamily: "Inter, sans-serif", fontWeight: 400, cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.25)"; e.currentTarget.style.color = DARK; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; e.currentTarget.style.color = "#6B6B6B"; }}
                    >
                      Start fresh
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main body: chat + sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
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
                      const isLastAI = i === messages.length - 1 || (i === messages.length - 2 && messages[messages.length - 1]?.role === "assistant");
                      const shouldShowInteractive = interactiveType && isLastAI && !interactiveUsed.has(i) && !loading && !complete;

                      return (
                        <div key={i}>
                          <AIBubble content={msg.content} isLatest={i === latestAiIndex} />
                          {shouldShowInteractive && (
                            <div style={{ marginTop: 12, marginLeft: 44 }}>
                              {interactiveType === "slider" && (
                                <SliderInput onConfirm={(val) => handleInteractiveConfirm(i, val)} />
                              )}
                              {interactiveType === "tags" && (
                                <TagsInput onConfirm={(val) => handleInteractiveConfirm(i, val)} />
                              )}
                              {interactiveType === "choice" && (
                                <ChoiceInput onConfirm={(val) => handleInteractiveConfirm(i, val)} />
                              )}
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
            </div>

            {/* Sidebar — hidden on mobile via CSS, toggled by button */}
            <div className="hidden lg:flex">
              <SpecSidebar spec={spec} visible={showSidebar} />
            </div>
          </div>

          {/* Input bar */}
          {sessionPhase === "chat" && !complete && (
            <div className="flex-shrink-0" style={{ background: "rgba(250,250,248,0.97)", borderTop: "1px solid rgba(0,0,0,0.07)", backdropFilter: "blur(12px)" }}>
              <div className="max-w-[780px] mx-auto px-6 py-4">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply..."
                    rows={1}
                    style={{
                      flex: 1, border: "1.5px solid #E4E4E2", borderRadius: 14, padding: "14px 18px",
                      fontFamily: "Inter, sans-serif", fontSize: 16, color: DARK,
                      resize: "none", minHeight: 52, maxHeight: 140, overflowY: "auto",
                      outline: "none", transition: "border-color 0.2s", lineHeight: 1.5,
                      background: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                    onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                    onBlur={e => { e.target.style.borderColor = "#E4E4E2"; e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
                  />
                  {/* Voice input button */}
                  <button
                    onClick={toggleListening}
                    type="button"
                    title={isListening ? "Stop listening" : "Voice input"}
                    style={{
                      width: 52, height: 52, borderRadius: 13, border: "none", flexShrink: 0,
                      background: isListening ? "linear-gradient(135deg, #E05050, #FF7070)" : "rgba(26,122,74,0.08)",
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
                      width: 52, height: 52, borderRadius: 13, border: "none", flexShrink: 0,
                      background: !input.trim() || loading ? "#E4E4E2" : "linear-gradient(135deg, #1A7A4A, #2A9D5C)",
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
