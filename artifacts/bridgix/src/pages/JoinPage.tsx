import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/sections/Navigation";
import { useLocation } from "wouter";
import bridgixLogo from "@assets/logo-original_1780481869651.jpg";

const ROLES = [
  "Select your primary role",
  "Full-Stack Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "AI / ML Engineer",
  "Mobile Engineer",
  "DevOps / Platform Engineer",
  "Cloud Engineer",
  "Data Engineer",
  "Engineering Lead / Manager",
  "Founding Engineer",
  "Security Engineer",
  "Blockchain / Web3 Engineer",
  "QA / Automation Engineer",
  "Embedded / Systems Engineer",
  "Other",
];

const EXPERIENCE = ["Select years", "1–2 years", "3–5 years", "6–9 years", "10+ years"];
const AVAILABILITY = ["Immediately", "Within 2 weeks", "Within a month", "1–3 months", "Not sure yet"];
const WORK_TYPES = ["Part-time", "Full-time", "Contract / Freelance"];
const ENVIRONMENTS = ["Early-stage startup", "Growth-stage startup", "Scale-up", "Remote-first", "Any"];
const STATUS_OPTIONS = ["Open to opportunities", "Actively looking", "Employed but open", "Not currently looking"];

const SKILLS_SUGGESTIONS = [
  // Languages
  "JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "Kotlin", "Swift",
  "C#", "C++", "PHP", "Ruby", "Scala", "Elixir", "Haskell", "Dart", "Zig", "Clojure",
  // Frontend
  "React", "Next.js", "Vue.js", "Angular", "Svelte", "SolidJS", "Astro",
  "Tailwind CSS", "CSS/SCSS", "HTML", "Three.js", "Framer Motion", "GSAP",
  "Redux", "Zustand", "Jotai", "React Query", "Vite", "Webpack", "Remix",
  // Backend
  "Node.js", "Express.js", "Fastify", "Hono", "NestJS",
  "Django", "FastAPI", "Flask", "SQLAlchemy",
  "Spring Boot", "Laravel", "Ruby on Rails",
  "Gin", "Echo", "Fiber", "Chi", "Actix", "Axum",
  "tRPC", "GraphQL", "REST APIs", "gRPC", "WebSockets",
  // Mobile
  "React Native", "Flutter", "SwiftUI", "Jetpack Compose", "Expo", "Capacitor",
  // AI / ML
  "TensorFlow", "PyTorch", "scikit-learn", "Keras", "XGBoost",
  "LangChain", "LlamaIndex", "OpenAI API", "Anthropic API",
  "Hugging Face", "RAG", "Fine-tuning", "Vector Databases",
  "Pandas", "NumPy", "Matplotlib", "Seaborn", "Spark",
  "OpenCV", "NLTK", "spaCy", "Stable Diffusion",
  // Cloud & Infrastructure
  "AWS", "GCP", "Google Cloud", "Azure", "Cloudflare",
  "Docker", "Kubernetes", "Helm", "Terraform", "Pulumi", "Ansible",
  "Linux", "Bash", "Shell Scripting", "Nginx", "Caddy",
  "Serverless", "Edge Computing", "CDN", "Load Balancing",
  // CI/CD & DevOps
  "GitHub Actions", "GitLab CI", "Jenkins", "CircleCI", "ArgoCD", "Tekton",
  // Observability
  "Prometheus", "Grafana", "Datadog", "Sentry", "OpenTelemetry", "Jaeger", "Loki",
  // Databases
  "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Elasticsearch",
  "DynamoDB", "Supabase", "Firebase", "Cassandra", "Neo4j",
  "ClickHouse", "CockroachDB", "PlanetScale", "Neon", "TimescaleDB",
  // Messaging & Streaming
  "Kafka", "RabbitMQ", "Celery", "SQS", "Pub/Sub", "NATS",
  // Architecture
  "Microservices", "System Design", "Event-Driven Architecture",
  "Domain-Driven Design", "Clean Architecture", "CQRS", "Event Sourcing",
  // Web3 / Blockchain
  "Solidity", "Ethereum", "Web3.js", "Ethers.js", "Hardhat", "Foundry", "Smart Contracts",
  // Testing & Quality
  "Testing / TDD", "Jest", "Vitest", "Cypress", "Playwright", "Pytest",
  // Soft skills
  "Technical Leadership", "Code Review", "Performance Optimization",
  "Security Engineering", "Architecture Review", "Mentoring",
];

function Field({ label, error, hint, optional, children }: {
  label: string; error?: string; hint?: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label className="text-[13px] font-medium text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</label>
        {optional && (
          <span className="text-[11px] text-[#9B9B9B]" style={{ fontFamily: "'Inter', sans-serif" }}>optional</span>
        )}
      </div>
      {children}
      {hint && <span className="text-[11px] text-[#9B9B9B]" style={{ fontFamily: "'Inter', sans-serif" }}>{hint}</span>}
      {error && <span className="text-[11px] text-[#E05050]" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</span>}
    </div>
  );
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  border: `1px solid ${hasError ? "#E05050" : "#E8E8E8"}`,
  borderRadius: 10,
  padding: "13px 16px",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  color: "#0A0A0A",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  background: "#FAFAF8",
  boxSizing: "border-box" as const,
});

function PillToggle({ options, value, onChange, multi = false }: {
  options: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
}) {
  const selected = multi ? (value as string[]) : [value as string];
  const toggle = (opt: string) => {
    if (multi) {
      const arr = value as string[];
      onChange(arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt]);
    } else {
      onChange(opt);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className="cursor-pointer transition-all duration-150"
            style={{
              border: `1px solid ${active ? "#1A7A4A" : "#E8E8E8"}`,
              borderRadius: 100,
              padding: "9px 18px",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              background: active ? "#1A7A4A" : "transparent",
              color: active ? "#FFFFFF" : "#0A0A0A",
              boxShadow: active ? "0 2px 10px rgba(26,122,74,0.20)" : "none",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SkillsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [inputVal, setInputVal] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = SKILLS_SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(inputVal.toLowerCase()) && !value.includes(s)
  ).slice(0, 10);

  const add = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputVal("");
    setShowSuggestions(false);
  };

  const remove = (skill: string) => onChange(value.filter(s => s !== skill));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2.5">
        {value.map(skill => (
          <span key={skill} className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full"
            style={{ background: "rgba(26,122,74,0.08)", color: "#1A7A4A", border: "1px solid rgba(26,122,74,0.18)", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            {skill}
            <button type="button" onClick={() => remove(skill)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#1A7A4A", lineHeight: 1, opacity: 0.7 }}>×</button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          value={inputVal}
          onChange={e => { setInputVal(e.target.value); setShowSuggestions(true); }}
          onKeyDown={e => { if (e.key === "Enter" && inputVal.trim()) { e.preventDefault(); add(inputVal); } if (e.key === "Escape") setShowSuggestions(false); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Type a skill and press Enter (e.g. React, Python, AWS...)"
          style={{ ...inputStyle(), marginBottom: 0 }}
        />
        <AnimatePresence>
          {showSuggestions && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-1 bg-white rounded-[12px] overflow-hidden z-10"
              style={{ border: "1px solid #E8E8E8", boxShadow: "0 8px 28px rgba(0,0,0,0.10)", maxHeight: 280, overflowY: "auto" }}
            >
              {filtered.map(s => (
                <button key={s} type="button" onMouseDown={() => add(s)}
                  className="w-full text-left px-4 py-2.5 text-[13px] cursor-pointer transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif", color: "#0A0A0A", background: "none", border: "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F4FBF7"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CustomSelect({ options, value, onChange, placeholder, error }: {
  options: string[]; value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const filtered = options.filter(o => o !== placeholder && o !== options[0]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left cursor-pointer transition-all duration-150"
        style={{
          ...inputStyle(error),
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: !value || value === options[0] ? "#9B9B9B" : "#0A0A0A",
          borderColor: open ? "#1A7A4A" : error ? "#E05050" : "#E8E8E8",
          boxShadow: open ? "0 0 0 3px rgba(26,122,74,0.08)" : "none",
        }}
      >
        <span>{!value || value === options[0] ? (placeholder ?? options[0]) : value}</span>
        <svg style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
          width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 bg-white rounded-[12px] overflow-hidden z-20"
            style={{ border: "1px solid #E8E8E8", boxShadow: "0 8px 28px rgba(0,0,0,0.12)", maxHeight: 240, overflowY: "auto" }}
          >
            {filtered.map(opt => (
              <button key={opt} type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-4 py-3 text-[13px] cursor-pointer transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: value === opt ? "#1A7A4A" : "#0A0A0A",
                  background: value === opt ? "rgba(26,122,74,0.05)" : "none",
                  border: "none",
                  fontWeight: value === opt ? 500 : 400,
                }}
                onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = "#F4FBF7"; }}
                onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = "none"; }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
    </div>
  );
}

export default function JoinPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "", email: "", location: "", role: ROLES[0], otherRole: "",
    experience: EXPERIENCE[0],
    skills: [] as string[],
    github: "", linkedin: "", project: "", environment: "",
    status: "", availability: AVAILABILITY[0],
    workType: [] as string[],
    salary: "", notes: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.role === ROLES[0]) e.role = "Please select your role";
    if (form.role === "Other" && !form.otherRole.trim()) e.otherRole = "Please describe your role";
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (form.skills.length === 0) e.skills = "Add at least one skill";
    return e;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!form.status) e.status = "Please select your current status";
    return e;
  };

  const handleNext = () => {
    const e = step === 1 ? validateStep1() : validateStep2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    const e = validateStep3();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepLabels = ["About You", "Your Work", "Availability"];

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
        <Navigation />
        <main className="pt-[100px] px-4 pb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
            style={{
              background: "linear-gradient(160deg, #0D1412 0%, #0A0F0D 100%)",
              minHeight: "calc(100dvh - 100px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "28px 28px 0 0",
              padding: "80px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #34D399, #1A7A4A, transparent)" }} />

            {/* Dot texture */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }} />

            {/* Glow */}
            <div className="absolute pointer-events-none" style={{
              top: "50%", left: "50%", transform: "translate(-50%, -60%)",
              width: 600, height: 600,
              background: "radial-gradient(circle, rgba(26,122,74,0.12) 0%, transparent 65%)",
              filter: "blur(80px)",
            }} />

            <div className="relative z-10 flex flex-col items-center text-center" style={{ maxWidth: 560 }}>
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15, type: "spring", stiffness: 200 }}
                style={{
                  width: 88, height: 88, borderRadius: 24,
                  background: "rgba(26,122,74,0.18)", border: "1px solid rgba(52,211,153,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 28, boxShadow: "0 8px 32px rgba(26,122,74,0.25)",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(32px, 5vw, 52px)",
                  color: "#FFFFFF",
                  letterSpacing: "-0.04em",
                  marginBottom: 16,
                  lineHeight: 1.08,
                }}
              >
                Application received.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.7,
                  fontWeight: 300,
                  marginBottom: 36,
                }}
              >
                We review every application personally. If you're a fit for our network, you'll hear from us within 48 hours. Keep an eye on your inbox.
              </motion.p>

              <motion.div
                style={{ width: "100%", height: 2, background: "linear-gradient(90deg, transparent, #34D399, #1A7A4A, transparent)", borderRadius: 2, marginBottom: 36 }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 items-center"
              >
                <button
                  onClick={() => navigate("/")}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.75)",
                    borderRadius: 12, padding: "12px 28px",
                    fontFamily: "Inter, sans-serif", fontSize: 14, cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                >
                  ← Back to Bridgix
                </button>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.30)" }}>
                  Questions?{" "}
                  <a href="mailto:hareem@bridgix.org" style={{ color: "#34D399", textDecoration: "underline", textUnderlineOffset: 2 }}>
                    hareem@bridgix.org
                  </a>
                </span>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <Navigation />

      <main className="pt-[110px] pb-[80px] px-4">
        <div className="max-w-[860px] mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-[36px] font-semibold text-[#0A0A0A] tracking-[-0.04em] mb-3 leading-[1.1]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Join the Bridgix Network
            </h1>
            <p className="text-[15px] text-[#6B6B6B] font-light leading-[1.65]" style={{ fontFamily: "'Inter', sans-serif" }}>
              We only work with the top 5%. Apply and we'll be in touch within 48 hours.
            </p>
          </motion.div>

          {/* Progress steps */}
          <div className="flex items-center mb-10 max-w-[480px] mx-auto">
            {stepLabels.map((label, i) => {
              const n = i + 1;
              const isActive = n === step;
              const isDone = n < step;
              return (
                <div key={label} className="flex-1 flex flex-col items-center">
                  <div className="flex items-center w-full">
                    {i > 0 && <div className="flex-1 h-px transition-all duration-500" style={{ background: isDone ? "#1A7A4A" : "#E8E8E8" }} />}
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                      background: isDone ? "#1A7A4A" : isActive ? "#0A0A0A" : "transparent",
                      border: isDone || isActive ? "none" : "1.5px solid #D0D0D0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.35s ease",
                      boxShadow: isActive ? "0 2px 12px rgba(0,0,0,0.15)" : isDone ? "0 2px 10px rgba(26,122,74,0.25)" : "none",
                    }}>
                      {isDone ? (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : (
                        <span style={{ fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 500, color: isActive ? "white" : "#B0B0B0" }}>{n}</span>
                      )}
                    </div>
                    {i < 2 && <div className="flex-1 h-px transition-all duration-500" style={{ background: isDone ? "#1A7A4A" : "#E8E8E8" }} />}
                  </div>
                  <span className="text-[11px] mt-1.5" style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isActive ? "#0A0A0A" : "#9B9B9B",
                    fontWeight: isActive ? 500 : 400,
                  }}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-[24px] p-8 md:p-12" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 18, color: "#0A0A0A", marginBottom: 28, letterSpacing: "-0.02em" }}>
                    About you
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Full Name" error={errors.name}>
                      <input value={form.name} onChange={set("name")} placeholder="Your full name" style={inputStyle(!!errors.name)}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = errors.name ? "#E05050" : "#E8E8E8"; e.target.style.boxShadow = "none"; }}/>
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <input type="email" value={form.email} onChange={set("email")} placeholder="your@email.com" style={inputStyle(!!errors.email)}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = errors.email ? "#E05050" : "#E8E8E8"; e.target.style.boxShadow = "none"; }}/>
                    </Field>
                    <Field label="Location" optional>
                      <input value={form.location} onChange={set("location")} placeholder="City, Country" style={inputStyle()}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}/>
                    </Field>
                    <Field label="Years of Experience">
                      <CustomSelect options={EXPERIENCE} value={form.experience} onChange={v => setForm(f => ({ ...f, experience: v }))} />
                    </Field>
                  </div>

                  <div className="mt-5">
                    <Field label="Primary Role" error={errors.role}>
                      <CustomSelect
                        options={ROLES}
                        value={form.role}
                        onChange={v => setForm(f => ({ ...f, role: v }))}
                        placeholder="Select your primary role"
                        error={!!errors.role}
                      />
                    </Field>
                  </div>

                  {form.role === "Other" && (
                    <div className="mt-5">
                      <Field label="Describe your role" error={errors.otherRole}>
                        <input value={form.otherRole} onChange={set("otherRole")} placeholder="e.g. Security Engineer, Data Scientist..." style={inputStyle(!!errors.otherRole)}
                          onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                          onBlur={e => { e.target.style.borderColor = errors.otherRole ? "#E05050" : "#E8E8E8"; e.target.style.boxShadow = "none"; }}/>
                      </Field>
                    </div>
                  )}

                  <div className="mt-8">
                    <button type="button" onClick={handleNext}
                      className="w-full cursor-pointer transition-all duration-200"
                      style={{
                        background: "#0A0A0A", color: "#FFFFFF", borderRadius: 14,
                        padding: "15px", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 15, border: "none",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1A7A4A"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,122,74,0.30)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#0A0A0A"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.12)"; }}
                    >Continue →</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
                  <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 18, color: "#0A0A0A", marginBottom: 4, letterSpacing: "-0.02em" }}>
                    Your work
                  </h2>
                  <Field label="Core Skills" error={errors.skills} hint="Type to search from hundreds of skills or press Enter to add custom ones">
                    <SkillsInput value={form.skills} onChange={v => setForm(f => ({ ...f, skills: v }))} />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="GitHub or Portfolio" optional>
                      <input value={form.github} onChange={set("github")} placeholder="github.com/yourhandle" style={inputStyle()}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}/>
                    </Field>
                    <Field label="LinkedIn" optional>
                      <input value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/yourprofile" style={inputStyle()}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}/>
                    </Field>
                  </div>
                  <Field label="Tell us about your best project" optional>
                    <textarea value={form.project} onChange={set("project")}
                      placeholder="What did you build, what was your role, and what impact did it have?"
                      rows={5} style={{ ...inputStyle(), resize: "none", minHeight: 130 }}
                      onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}/>
                  </Field>
                  <Field label="What kind of environment do you thrive in?">
                    <PillToggle options={ENVIRONMENTS} value={form.environment} onChange={v => setForm(f => ({ ...f, environment: v as string }))} />
                  </Field>
                  <div className="flex items-center justify-between mt-2">
                    <button type="button" onClick={() => { setErrors({}); setStep(1); }}
                      style={{ background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 14, color: "#6B6B6B", cursor: "pointer" }}>
                      ← Back
                    </button>
                    <button type="button" onClick={handleNext}
                      className="cursor-pointer transition-all duration-200"
                      style={{ background: "#0A0A0A", color: "#FFFFFF", borderRadius: 14, padding: "13px 32px", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 15, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1A7A4A"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,122,74,0.30)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#0A0A0A"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.12)"; }}>
                      Continue →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
                  <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 18, color: "#0A0A0A", marginBottom: 4, letterSpacing: "-0.02em" }}>
                    Availability
                  </h2>
                  <Field label="Current Status" error={errors.status}>
                    <PillToggle options={STATUS_OPTIONS} value={form.status} onChange={v => setForm(f => ({ ...f, status: v as string }))} />
                    {errors.status && <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#E05050" }}>{errors.status}</span>}
                  </Field>
                  <Field label="When can you start?">
                    <CustomSelect options={AVAILABILITY} value={form.availability} onChange={v => setForm(f => ({ ...f, availability: v }))} />
                  </Field>
                  <Field label="Preferred Work Type">
                    <PillToggle options={WORK_TYPES} value={form.workType} onChange={v => setForm(f => ({ ...f, workType: v as string[] }))} multi />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Salary Expectation" optional hint="Stays confidential. Helps us match you to the right roles.">
                      <input value={form.salary} onChange={set("salary")} placeholder="e.g. £70k–£90k or $120k+" style={inputStyle()}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}/>
                    </Field>
                  </div>
                  <Field label="Anything else you'd like us to know?" optional>
                    <textarea value={form.notes} onChange={set("notes")}
                      placeholder="Previous companies, what you're looking for, anything relevant."
                      rows={4} style={{ ...inputStyle(), resize: "none", minHeight: 110 }}
                      onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}/>
                  </Field>
                  <div className="flex items-center justify-between mt-2">
                    <button type="button" onClick={() => { setErrors({}); setStep(2); }}
                      style={{ background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 14, color: "#6B6B6B", cursor: "pointer" }}>
                      ← Back
                    </button>
                    <button type="button" onClick={handleSubmit}
                      className="cursor-pointer transition-all duration-200"
                      style={{ background: "#1A7A4A", color: "#FFFFFF", borderRadius: 14, padding: "13px 32px", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 15, border: "none", boxShadow: "0 4px 20px rgba(26,122,74,0.30)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#155E39"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(26,122,74,0.42)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#1A7A4A"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,122,74,0.30)"; }}>
                      Submit Application
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
