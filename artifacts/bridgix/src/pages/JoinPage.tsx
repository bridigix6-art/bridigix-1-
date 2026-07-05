import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/sections/Navigation";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

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

const SKILLS_CATEGORIES: { category: string; skills: string[] }[] = [
  {
    category: "Programming Languages",
    skills: ["Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust", "Kotlin", "Swift", "Dart", "PHP", "Ruby", "Scala", "R", "MATLAB", "Bash/Shell", "SQL", "Perl", "Lua", "Haskell", "Elixir", "Objective-C", "VB.NET"],
  },
  {
    category: "Frontend — Core",
    skills: ["HTML5", "CSS3"],
  },
  {
    category: "Frontend — Frameworks",
    skills: ["React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "Remix", "SolidJS", "Astro"],
  },
  {
    category: "Frontend — Styling",
    skills: ["Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "Sass", "Styled Components", "CSS/SCSS"],
  },
  {
    category: "Frontend — State & Build",
    skills: ["Redux", "Zustand", "MobX", "Recoil", "Context API", "Jotai", "React Query", "Vite", "Webpack"],
  },
  {
    category: "Backend — Node",
    skills: ["Node.js", "Express.js", "NestJS", "Fastify", "Hono", "tRPC"],
  },
  {
    category: "Backend — Python",
    skills: ["Django", "Flask", "FastAPI", "SQLAlchemy"],
  },
  {
    category: "Backend — Java / .NET",
    skills: ["Spring Boot", "Hibernate", "ASP.NET", ".NET Core"],
  },
  {
    category: "Backend — PHP / Ruby",
    skills: ["Laravel", "Symfony", "Ruby on Rails"],
  },
  {
    category: "Backend — Go",
    skills: ["Gin", "Fiber", "Echo", "Chi"],
  },
  {
    category: "Backend — Rust",
    skills: ["Actix", "Axum"],
  },
  {
    category: "Databases — SQL",
    skills: ["PostgreSQL", "MySQL", "MariaDB", "SQL Server", "Oracle", "SQLite"],
  },
  {
    category: "Databases — NoSQL",
    skills: ["MongoDB", "Redis", "Cassandra", "DynamoDB", "Couchbase", "Neo4j", "Firebase", "Elasticsearch"],
  },
  {
    category: "Databases — Specialist",
    skills: ["ClickHouse", "CockroachDB", "PlanetScale", "Neon", "TimescaleDB", "Supabase"],
  },
  {
    category: "Database Skills",
    skills: ["Query Optimization", "Indexing", "Normalization", "Transactions", "Replication", "Sharding"],
  },
  {
    category: "Cloud — AWS",
    skills: ["EC2", "S3", "Lambda", "RDS", "ECS", "EKS", "CloudFormation"],
  },
  {
    category: "Cloud — Azure",
    skills: ["Azure Functions", "Azure DevOps"],
  },
  {
    category: "Cloud — GCP",
    skills: ["Compute Engine", "BigQuery", "Cloud Run", "Google Cloud"],
  },
  {
    category: "Cloud — General",
    skills: ["Cloud Architecture", "Serverless", "Cost Optimization", "Edge Computing", "CDN"],
  },
  {
    category: "DevOps",
    skills: ["Docker", "Kubernetes", "Helm", "Jenkins", "GitHub Actions", "GitLab CI/CD", "CircleCI", "ArgoCD", "Terraform", "Ansible", "Prometheus", "Grafana", "ELK Stack", "Nginx", "Apache", "Datadog", "Sentry", "OpenTelemetry"],
  },
  {
    category: "APIs & Integration",
    skills: ["REST APIs", "GraphQL", "gRPC", "WebSockets", "OAuth", "JWT", "API Design", "API Security", "Rate Limiting"],
  },
  {
    category: "Software Engineering",
    skills: ["Data Structures", "Algorithms", "OOP", "Functional Programming", "SOLID Principles", "Design Patterns", "Clean Code", "System Design", "Distributed Systems", "Scalability", "Concurrency", "Multithreading"],
  },
  {
    category: "Testing",
    skills: ["Unit Testing", "Integration Testing", "End-to-End Testing", "TDD", "BDD", "Jest", "Vitest", "Cypress", "Playwright", "Selenium", "PyTest", "JUnit"],
  },
  {
    category: "Mobile — Android",
    skills: ["Kotlin", "Jetpack Compose"],
  },
  {
    category: "Mobile — iOS",
    skills: ["Swift", "SwiftUI"],
  },
  {
    category: "Mobile — Cross Platform",
    skills: ["Flutter", "React Native", "Ionic", "Expo", "Capacitor"],
  },
  {
    category: "AI / ML Engineering",
    skills: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Scikit-Learn", "LLMs", "RAG", "Prompt Engineering", "Fine Tuning", "Vector Databases", "LangChain", "LlamaIndex", "AI Agents", "Hugging Face", "OpenAI API", "Anthropic API"],
  },
  {
    category: "Data Engineering",
    skills: ["ETL", "Data Pipelines", "Apache Spark", "Hadoop", "Kafka", "Airflow", "Data Warehousing", "RabbitMQ", "Celery"],
  },
  {
    category: "Cybersecurity",
    skills: ["OWASP Top 10", "Authentication", "Authorization", "Encryption", "Secure Coding", "Vulnerability Assessment", "Penetration Testing Basics", "Network Security"],
  },
  {
    category: "Version Control",
    skills: ["Git", "GitHub", "GitLab", "Bitbucket", "Branching Strategies", "Code Reviews", "Pull Requests"],
  },
  {
    category: "System Design",
    skills: ["Load Balancing", "Caching", "Message Queues", "Event Driven Architecture", "Microservices", "Monoliths", "Database Scaling", "CAP Theorem", "Consistency Models", "Domain-Driven Design", "Clean Architecture", "CQRS", "Event Sourcing"],
  },
  {
    category: "Blockchain / Web3",
    skills: ["Solidity", "Ethereum", "Web3.js", "Ethers.js", "Hardhat", "Foundry", "Smart Contracts"],
  },
  {
    category: "Leadership & Process",
    skills: ["Technical Leadership", "Code Review", "Performance Optimization", "Security Engineering", "Architecture Review", "Mentoring"],
  },
];

const ALL_SKILLS = SKILLS_CATEGORIES.flatMap(c => c.skills);

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
  const [showDropdown, setShowDropdown] = useState(false);

  const query = inputVal.toLowerCase().trim();

  const filteredCategories = query
    ? SKILLS_CATEGORIES
        .map(cat => ({
          ...cat,
          skills: cat.skills.filter(s => s.toLowerCase().includes(query) && !value.includes(s)),
        }))
        .filter(cat => cat.skills.length > 0)
    : SKILLS_CATEGORIES.map(cat => ({
        ...cat,
        skills: cat.skills.filter(s => !value.includes(s)),
      })).filter(cat => cat.skills.length > 0);

  const add = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputVal("");
  };

  const addCustom = () => {
    if (inputVal.trim() && !value.includes(inputVal.trim()) && !ALL_SKILLS.includes(inputVal.trim())) {
      add(inputVal);
    } else if (inputVal.trim()) {
      add(inputVal.trim());
    }
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
          onChange={e => { setInputVal(e.target.value); setShowDropdown(true); }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (inputVal.trim()) addCustom();
            }
            if (e.key === "Escape") setShowDropdown(false);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 160)}
          placeholder="Search or add a skill (e.g. React, Python, AWS...)"
          style={{ ...inputStyle(), marginBottom: 0 }}
        />
        <AnimatePresence>
          {showDropdown && filteredCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-1 bg-white rounded-[14px] z-20"
              style={{ border: "1px solid #E8E8E8", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxHeight: 340, overflowY: "auto" }}
            >
              {filteredCategories.map((cat, ci) => (
                <div key={ci}>
                  <div className="px-4 pt-3 pb-1"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {cat.category}
                  </div>
                  {cat.skills.map(s => (
                    <button key={s} type="button" onMouseDown={() => add(s)}
                      className="w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif", color: "#0A0A0A", background: "none", border: "none" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F4FBF7"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ))}
              {inputVal.trim() && !ALL_SKILLS.some(s => s.toLowerCase() === inputVal.toLowerCase()) && (
                <div>
                  <div className="px-4 pt-3 pb-1"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Custom
                  </div>
                  <button type="button" onMouseDown={addCustom}
                    className="w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif", color: "#1A7A4A", background: "none", border: "none", fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F4FBF7"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    + Add "{inputVal.trim()}"
                  </button>
                </div>
              )}
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
  const [, setLocation] = useLocation();
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

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const e = validateStep3();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await supabase.from("join_applications").insert({
        name: form.name,
        email: form.email.toLowerCase(),
        location: form.location,
        role: form.role === "Other" ? form.otherRole : form.role,
        experience: form.experience,
        skills: form.skills,
        github: form.github,
        linkedin: form.linkedin,
        project: form.project,
        environment: form.environment,
        status: form.status,
        availability: form.availability,
        work_type: form.workType ? [form.workType] : [],
        salary: form.salary,
        notes: form.notes,
      });
      if (error) {
        throw new Error(error.message || "Failed to save application");
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ["About You", "Your Work", "Availability"];

  if (submitted) {
    return (
      <div
        className="min-h-screen"
        style={{
          fontFamily: "'Inter', sans-serif",
          backgroundImage: "url('/radar-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
          position: "relative",
        }}
      >
        {/* White overlay to achieve white theme while showing the image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(110deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.93) 45%, rgba(255,255,255,0.70) 70%, rgba(255,255,255,0.30) 100%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Navigation />
        </div>

        <main
          style={{
            position: "relative",
            zIndex: 1,
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            paddingTop: 80,
            paddingLeft: 24,
            paddingRight: 24,
            paddingBottom: 80,
          }}
        >
          <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{ maxWidth: 560 }}
            >
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#F0FBF5",
                  border: "1px solid rgba(26,122,74,0.18)",
                  borderRadius: 100,
                  padding: "6px 14px",
                  marginBottom: 32,
                }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#1A7A4A",
                  display: "inline-block",
                  boxShadow: "0 0 0 3px rgba(26,122,74,0.15)",
                }} />
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#1A7A4A",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}>
                  Application Received
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                  fontSize: "clamp(38px, 5.5vw, 62px)",
                  color: "#0A0A0A",
                  letterSpacing: "-0.045em",
                  lineHeight: 1.05,
                  marginBottom: 24,
                }}
              >
                You're on our radar.
              </motion.h1>

              {/* Body */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  fontWeight: 400,
                  color: "#4A4A4A",
                  lineHeight: 1.75,
                  marginBottom: 44,
                  maxWidth: 460,
                }}
              >
                Every application is reviewed personally. If you're the kind of engineer we work with, you'll hear from us within 48 hours. Keep an eye on your inbox.
              </motion.p>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.35 }}
                style={{
                  height: 1,
                  background: "linear-gradient(90deg, #E0E0E0, transparent)",
                  marginBottom: 40,
                  maxWidth: 460,
                }}
              />

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}
              >
                <button
                  type="button"
                  onClick={() => { window.location.href = import.meta.env.BASE_URL || "/"; }}
                  style={{
                    background: "#0A0A0A",
                    border: "none",
                    color: "#FFFFFF",
                    borderRadius: 12,
                    padding: "13px 28px",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "background 0.2s",
                    letterSpacing: "-0.01em",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1A7A4A"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#0A0A0A"; }}
                >
                  ← Back to Bridigix
                </button>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9B9B9B" }}>
                  Questions?{" "}
                  <a
                    href="mailto:hareem@bridigix.org"
                    style={{ color: "#1A7A4A", textDecoration: "underline", textUnderlineOffset: 3 }}
                  >
                    hareem@bridigix.org
                  </a>
                </span>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <Navigation />

      <main className="pt-[110px] pb-[80px] px-4">
        <div className="max-w-[860px] mx-auto">

          {/* Back button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="mb-6">
            <button
              type="button"
              onClick={() => { window.location.href = import.meta.env.BASE_URL || "/"; }}
              className="flex items-center gap-2 cursor-pointer transition-all duration-200"
              style={{
                background: "none", border: "none", padding: "6px 0",
                fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6B6B6B",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#0A0A0A"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#6B6B6B"; }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-[36px] font-semibold text-[#0A0A0A] tracking-[-0.04em] mb-3 leading-[1.1]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Join the Bridigix Network
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
                <div key={n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: isDone ? "#1A7A4A" : isActive ? "#0A0A0A" : "#E8E8E8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.3s",
                    }}>
                      {isDone ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500, color: isActive ? "white" : "#9B9B9B" }}>{n}</span>
                      )}
                    </div>
                    <span style={{
                      fontFamily: "Inter, sans-serif", fontSize: 11,
                      color: isActive ? "#0A0A0A" : isDone ? "#1A7A4A" : "#9B9B9B",
                      fontWeight: isActive ? 500 : 400,
                      marginTop: 6,
                      whiteSpace: "nowrap",
                    }}>{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className="flex-1 mx-3 mb-5" style={{ height: 1, background: isDone ? "#1A7A4A" : "#E8E8E8", transition: "background 0.3s" }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.3 }}
              className="rounded-[20px] p-8 md:p-10"
              style={{ background: "#FFFFFF", border: "1px solid #F0F0EE", boxShadow: "0 4px 32px rgba(0,0,0,0.05)" }}
            >
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 18, color: "#0A0A0A", letterSpacing: "-0.02em" }}>About You</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Full name" error={errors.name}>
                      <input value={form.name} onChange={set("name")} placeholder="Alex Johnson" style={{ ...inputStyle(!!errors.name), borderColor: errors.name ? "#E05050" : form.name ? "#1A7A4A" : "#E8E8E8" }}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = errors.name ? "#E05050" : form.name ? "#1A7A4A" : "#E8E8E8"; e.target.style.boxShadow = "none"; }}
                      />
                    </Field>
                    <Field label="Email address" error={errors.email}>
                      <input type="email" value={form.email} onChange={set("email")} placeholder="alex@example.com" style={{ ...inputStyle(!!errors.email) }}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = errors.email ? "#E05050" : "#E8E8E8"; e.target.style.boxShadow = "none"; }}
                      />
                    </Field>
                  </div>
                  <Field label="Location" optional>
                    <input value={form.location} onChange={set("location")} placeholder="London, UK / Remote" style={inputStyle()}
                      onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}
                    />
                  </Field>
                  <Field label="Primary role" error={errors.role}>
                    <CustomSelect options={ROLES} value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} error={!!errors.role} />
                  </Field>
                  {form.role === "Other" && (
                    <Field label="Describe your role" error={errors.otherRole}>
                      <input value={form.otherRole} onChange={set("otherRole")} placeholder="e.g. Site Reliability Engineer" style={inputStyle(!!errors.otherRole)}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = errors.otherRole ? "#E05050" : "#E8E8E8"; e.target.style.boxShadow = "none"; }}
                      />
                    </Field>
                  )}
                  <Field label="Years of experience">
                    <CustomSelect options={EXPERIENCE} value={form.experience} onChange={v => setForm(f => ({ ...f, experience: v }))} />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 18, color: "#0A0A0A", letterSpacing: "-0.02em" }}>Your Work</h2>
                  <Field label="Skills & Technologies" error={errors.skills} hint="Search across 250+ technologies by category, or add your own">
                    <SkillsInput value={form.skills} onChange={v => setForm(f => ({ ...f, skills: v }))} />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="GitHub profile" optional>
                      <input value={form.github} onChange={set("github")} placeholder="github.com/username" style={inputStyle()}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}
                      />
                    </Field>
                    <Field label="LinkedIn" optional>
                      <input value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/username" style={inputStyle()}
                        onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                        onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}
                      />
                    </Field>
                  </div>
                  <Field label="Link to a project or portfolio" optional>
                    <input value={form.project} onChange={set("project")} placeholder="yoursite.com or github.com/project" style={inputStyle()}
                      onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}
                    />
                  </Field>
                  <Field label="Environment you thrive in" optional>
                    <PillToggle options={ENVIRONMENTS} value={form.environment} onChange={v => setForm(f => ({ ...f, environment: v as string }))} />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 18, color: "#0A0A0A", letterSpacing: "-0.02em" }}>Availability</h2>
                  <Field label="Current status" error={errors.status}>
                    <PillToggle options={STATUS_OPTIONS} value={form.status} onChange={v => setForm(f => ({ ...f, status: v as string }))} />
                    {errors.status && <span className="text-[11px] text-[#E05050]" style={{ fontFamily: "'Inter', sans-serif" }}>{errors.status}</span>}
                  </Field>
                  <Field label="Available from">
                    <PillToggle options={AVAILABILITY} value={form.availability} onChange={v => setForm(f => ({ ...f, availability: v as string }))} />
                  </Field>
                  <Field label="Open to" optional>
                    <PillToggle options={WORK_TYPES} value={form.workType} onChange={v => setForm(f => ({ ...f, workType: v as string[] }))} multi />
                  </Field>
                  <Field label="Expected salary or rate" optional>
                    <input value={form.salary} onChange={set("salary")} placeholder="e.g. £80–95k / $150/day" style={inputStyle()}
                      onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}
                    />
                  </Field>
                  <Field label="Anything else you'd like us to know?" optional>
                    <textarea value={form.notes} onChange={set("notes")} rows={4} placeholder="Visa status, remote preferences, notice period, etc."
                      style={{ ...inputStyle(), resize: "vertical", minHeight: 100 }}
                      onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                      onBlur={e => { e.target.style.borderColor = "#E8E8E8"; e.target.style.boxShadow = "none"; }}
                    />
                  </Field>

                  {submitError && (
                    <div className="rounded-[10px] px-4 py-3" style={{ background: "rgba(224,80,80,0.06)", border: "1px solid rgba(224,80,80,0.15)" }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#E05050" }}>{submitError}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  window.location.href = import.meta.env.BASE_URL || "/";
                } else {
                  setStep(s => s - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              style={{
                background: "none", border: "1px solid #E8E8E8", borderRadius: 12,
                padding: "12px 24px", fontFamily: "Inter, sans-serif", fontSize: 14,
                color: "#6B6B6B", cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0A0A0A"; e.currentTarget.style.color = "#0A0A0A"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8E8E8"; e.currentTarget.style.color = "#6B6B6B"; }}
            >
              {step === 1 ? "← Home" : "← Back"}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  background: "#0A0A0A", border: "none", borderRadius: 12,
                  padding: "12px 28px", fontFamily: "Inter, sans-serif", fontSize: 14,
                  color: "white", cursor: "pointer", fontWeight: 500, transition: "all 0.2s",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.14)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1A7A4A"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,122,74,0.30)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#0A0A0A"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.14)"; }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  background: submitting ? "#9B9B9B" : "#1A7A4A",
                  border: "none", borderRadius: 12,
                  padding: "12px 28px", fontFamily: "Inter, sans-serif", fontSize: 14,
                  color: "white", cursor: submitting ? "wait" : "pointer", fontWeight: 500, transition: "all 0.2s",
                  boxShadow: submitting ? "none" : "0 4px 20px rgba(26,122,74,0.28)",
                }}
                onMouseEnter={e => { if (!submitting) { e.currentTarget.style.boxShadow = "0 6px 28px rgba(26,122,74,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = submitting ? "none" : "0 4px 20px rgba(26,122,74,0.28)"; e.currentTarget.style.transform = "none"; }}
              >
                {submitting ? "Submitting..." : "Submit Application →"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
