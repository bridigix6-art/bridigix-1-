import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "../../hooks/use-in-view";
import jessicaPhoto from "@assets/pexels-jessica-stefany-m-1002024697-31512052_1780456563453.jpg";
import nanaPhoto from "@assets/pexels-nana-qwacy-listowell-249813867-19098114_1780456563486.jpg";
import augustoPhoto from "@assets/pexels-augustocarneirojr-30468636_1780456563501.jpg";
import jonathanPhoto from "@assets/pexels-salvador-olague-682304070-18032391_1780481869516.jpg";
import hennaPhoto from "@assets/pexels-mikhail-nilov-8730389_1780508877001_1780625194226.jpg";
import bridgixLogo from "@assets/Screenshot_2026-06-04-07-57-10-533_com.canva.editor-edit_17805_1780625194177.jpg";

function ChatMockup() {
  return (
    <div className="h-full flex flex-col rounded-[14px] overflow-hidden" style={{ background: "#FAFAF8", border: "1px solid #EBEBEA" }}>
      <div className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid #EBEBEA", background: "#FFFFFF" }}>
        <div className="w-[28px] h-[28px] rounded-full overflow-hidden flex-shrink-0 border border-[#E8E8E8]">
          <img src={bridgixLogo} alt="Bridigix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-medium block text-[#0A0A0A]">Bridigix</span>
          <div className="flex items-center gap-1">
            <div className="w-[5px] h-[5px] rounded-full bg-[#1A7A4A]" />
            <span className="text-[9px] text-[#6B6B6B]">Active now</span>
          </div>
        </div>
      </div>
      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-hidden">
        <div className="flex gap-2 items-start">
          <div className="w-[20px] h-[20px] rounded-full overflow-hidden flex-shrink-0 mt-0.5 border border-[#E8E8E8]">
            <img src={bridgixLogo} alt="Bridigix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div className="rounded-[10px_10px_10px_3px] px-3 py-2.5 max-w-[78%]" style={{ background: "#F0F0EE", border: "1px solid #E8E8E8" }}>
            <p className="text-[10px] leading-[1.6] text-[#3D3D3D]">Tell me a bit about what you're building — what does your company do?</p>
          </div>
        </div>
        <div className="flex gap-2 items-start justify-end">
          <div className="rounded-[10px_10px_3px_10px] px-3 py-2.5 max-w-[76%]" style={{ background: "linear-gradient(135deg, #1A7A4A, #155E39)" }}>
            <p className="text-[10px] leading-[1.6] text-white">Senior backend engineer — Go, AWS, Postgres. Series A, 12-person team.</p>
          </div>
          <div className="w-[20px] h-[20px] rounded-full flex-shrink-0 mt-0.5 overflow-hidden" style={{ boxShadow: "0 0 0 1.5px #E8E8E8" }}>
            <img src={jonathanPhoto} alt="You" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <div className="w-[20px] h-[20px] rounded-full overflow-hidden flex-shrink-0 mt-0.5 border border-[#E8E8E8]">
            <img src={bridgixLogo} alt="Bridigix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div className="rounded-[10px_10px_10px_3px] px-3 py-2.5 max-w-[82%]" style={{ background: "#F0F0EE", border: "1px solid #E8E8E8" }}>
            <p className="text-[10px] leading-[1.6] text-[#3D3D3D]">Got it — have you tried hiring for this role before? What went wrong?</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-[20px] h-[20px] rounded-full overflow-hidden flex-shrink-0 border border-[#E8E8E8]">
            <img src={bridgixLogo} alt="Bridigix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-[10px_10px_10px_3px]" style={{ background: "#F0F0EE", border: "1px solid #E8E8E8" }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="w-[5px] h-[5px] rounded-full bg-[#B0B0B0]"
                style={{ animation: `bounce-dot 1.2s ease infinite ${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-4 mb-4 flex items-center gap-2 rounded-[10px] px-3 py-2.5 flex-shrink-0"
        style={{ background: "#FFFFFF", border: "1px solid #EBEBEA", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <span className="text-[9px] flex-1 text-[#B0B0B0]">Type your reply…</span>
        <div className="w-[20px] h-[20px] rounded-[6px] flex items-center justify-center flex-shrink-0" style={{ background: "#1A7A4A" }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2 8L8 2M8 2H3M8 2V7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function NetworkSearchMockup() {
  const candidates = [
    { photo: nanaPhoto, name: "James K.", role: "Senior Backend Eng.", skills: ["Go", "AWS", "Postgres"], match: 94, color: "#1A7A4A", bar: "linear-gradient(90deg, #1A7A4A, #34D399)" },
    { photo: jessicaPhoto, name: "Sofia F.", role: "Full-Stack Engineer", skills: ["React", "Node.js", "TypeScript"], match: 91, color: "#8B5CF6", bar: "linear-gradient(90deg, #8B5CF6, #A78BFA)" },
    { photo: hennaPhoto, name: "Henna M.", role: "Backend · Go Specialist", skills: ["Go", "gRPC", "Redis"], match: 88, color: "#F472B6", bar: "linear-gradient(90deg, #F472B6, #F5C518)" },
  ];
  return (
    <div className="h-full flex flex-col rounded-[14px] overflow-hidden" style={{ background: "#FAFAF8", border: "1px solid #EBEBEA" }}>
      <div className="px-4 pt-3.5 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid #EBEBEA", background: "#FFFFFF" }}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-medium text-[#0A0A0A]">Network Search</span>
          <span className="text-[9px] px-2 py-1 rounded-full" style={{ background: "rgba(26,122,74,0.10)", color: "#1A7A4A" }}>3000+ engineers</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["Go", "AWS", "Series A", "Senior"].map((f, i) => {
            const colors = ["#1A7A4A", "#8B5CF6", "#F472B6", "#d97706"];
            const bgs = ["rgba(26,122,74,0.10)", "rgba(139,92,246,0.10)", "rgba(244,114,182,0.10)", "rgba(245,200,66,0.12)"];
            return (
              <span key={f} className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: bgs[i], color: colors[i], border: `1px solid ${colors[i]}25` }}>{f}</span>
            );
          })}
        </div>
      </div>
      <div className="flex-1 px-3 py-3 flex flex-col gap-2 overflow-hidden">
        {candidates.map((c, i) => (
          <div key={i} className="rounded-[10px] p-2.5 flex items-center gap-2.5" style={{ background: "#FFFFFF", border: "1px solid #EBEBEA", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: `0 0 0 2px white, 0 0 0 3px ${c.color}` }}>
              <img src={c.photo} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-medium text-[#0A0A0A] truncate">{c.name}</span>
                <span className="text-[9px] font-semibold flex-shrink-0 ml-2" style={{ color: c.color }}>{c.match}%</span>
              </div>
              <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: "#EBEBEA" }}>
                <div className="h-full rounded-full" style={{ width: `${c.match}%`, background: c.bar }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterviewMockup() {
  const criteria = [
    { label: "Technical Depth", score: 5, color: "#1A7A4A" },
    { label: "Communication", score: 4, color: "#8B5CF6" },
    { label: "Startup Fit", score: 5, color: "#F472B6" },
    { label: "Ownership Mindset", score: 4, color: "#d97706" },
    { label: "Problem-Solving", score: 5, color: "#1A7A4A" },
  ];
  return (
    <div className="h-full flex flex-col rounded-[14px] overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #EBEBEA" }}>
      <div className="px-4 pt-3.5 pb-3 flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(26,122,74,0.04), rgba(52,211,153,0.02))", borderBottom: "1px solid #EBEBEA" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-[36px] h-[36px] rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: "0 0 0 2px white, 0 0 0 3px #1A7A4A" }}>
            <img src={nanaPhoto} alt="James K." style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-medium text-[#0A0A0A]">James K.</div>
            <div className="text-[9px] text-[#6B6B6B]">Senior Backend Engineer · Go · AWS</div>
          </div>
          <span className="text-[9px] font-medium px-2 py-1 rounded-full" style={{ background: "rgba(26,122,74,0.12)", color: "#1A7A4A", border: "1px solid rgba(26,122,74,0.2)" }}>
            Passed ✓
          </span>
        </div>
      </div>
      <div className="flex-1 px-4 py-3.5 flex flex-col gap-2.5 overflow-hidden">
        <span className="text-[9px] font-medium uppercase text-[#6B6B6B]" style={{ letterSpacing: "0.1em" }}>Assessment Rubric</span>
        {criteria.map(({ label, score, color }) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className="text-[10px] text-[#3D3D3D] w-[100px] flex-shrink-0">{label}</span>
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="flex-1 h-[4px] rounded-full" style={{ background: n <= score ? color : "#F0F0EE" }} />
              ))}
            </div>
            <span className="text-[9px] font-bold w-[22px] text-right flex-shrink-0" style={{ color }}>{score}/5</span>
          </div>
        ))}
        <div className="mt-2 rounded-[8px] p-2.5 flex flex-col gap-1.5" style={{ background: "#F8F8F6" }}>
          <span className="text-[9px] font-medium text-[#6B6B6B] uppercase" style={{ letterSpacing: "0.08em" }}>Notes</span>
          {[85, 60, 72].map((w, i) => (
            <div key={i} className="h-[3px] rounded-full" style={{ width: `${w}%`, background: "#D8D8D4" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ShortlistMockup() {
  const profiles = [
    { photo: nanaPhoto, name: "James K.", role: "Backend Engineer", tags: ["Go", "AWS"], accent: "#1A7A4A", bar: "linear-gradient(90deg,#1A7A4A,#34D399)" },
    { photo: jessicaPhoto, name: "Sofia F.", role: "Full-Stack Eng.", tags: ["React", "Node"], accent: "#8B5CF6", bar: "linear-gradient(90deg,#8B5CF6,#A78BFA)" },
    { photo: hennaPhoto, name: "Henna M.", role: "Backend · Go", tags: ["Go", "gRPC"], accent: "#F472B6", bar: "linear-gradient(90deg,#F472B6,#F5C518)" },
  ];
  return (
    <div className="h-full flex flex-col rounded-[14px] overflow-hidden" style={{ background: "#FAFAF8", border: "1px solid #EBEBEA" }}>
      <div className="px-4 pt-3.5 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid #EBEBEA", background: "#FFFFFF" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-[18px] h-[18px] rounded-full overflow-hidden flex-shrink-0 border border-[#E8E8E8]">
            <img src={bridgixLogo} alt="Bridigix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <span className="text-[9px] text-[#6B6B6B]">hareem@bridigix.org</span>
          <span className="text-[8px] ml-auto px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,200,66,0.15)", color: "#d97706" }}>72hr ⚡</span>
        </div>
        <p className="text-[11px] font-medium text-[#0A0A0A]">Your Engineer Shortlist — 3 Matched Profiles</p>
      </div>
      <div className="flex-1 px-3 py-3 flex flex-col gap-2 overflow-hidden">
        {profiles.map((p, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-[10px] p-2.5" style={{ background: "#FFFFFF", border: "1px solid #EBEBEA", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="w-[3px] self-stretch rounded-full flex-shrink-0" style={{ background: p.bar }} />
            <div className="w-[26px] h-[26px] rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: `0 0 0 2px white, 0 0 0 3px ${p.accent}` }}>
              <img src={p.photo} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-[#0A0A0A]">{p.name}</div>
              <div className="flex gap-1 mt-0.5">
                {p.tags.map(t => (
                  <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-[4px]" style={{ background: "#F0F0EE", color: "#6B6B6B" }}>{t}</span>
                ))}
              </div>
            </div>
            <span className="text-[8px] font-medium flex-shrink-0 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(26,122,74,0.08)", color: "#1A7A4A" }}>Pick</span>
          </div>
        ))}
        <div className="rounded-[8px] p-2.5 mt-1" style={{ background: "rgba(26,122,74,0.04)", border: "1px solid rgba(26,122,74,0.10)" }}>
          <span className="text-[9px] font-medium text-[#1A7A4A] block mb-1">Hareem's Note</span>
          {[90, 70].map((w, i) => (
            <div key={i} className="h-[2.5px] rounded-full mb-1" style={{ width: `${w}%`, background: "rgba(26,122,74,0.20)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarMockup() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div className="h-full flex flex-col rounded-[14px] overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #EBEBEA" }}>
      <div className="px-4 pt-3.5 pb-3 flex-shrink-0 flex items-center justify-between" style={{ borderBottom: "1px solid #EBEBEA" }}>
        <span className="text-[11px] font-medium text-[#0A0A0A]">June 2025</span>
        <div className="flex gap-0.5">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className="w-[26px] text-center text-[8px] font-medium text-[#B0B0B0]">{d}</div>
          ))}
        </div>
      </div>
      <div className="flex-1 px-4 pt-2 overflow-hidden">
        <div className="grid grid-cols-7 gap-0.5">
          {days.map(d => (
            <div key={d} className="w-[26px] h-[26px] flex items-center justify-center rounded-[6px] text-[9px] mx-auto cursor-pointer"
              style={{
                background: d === 14 ? "linear-gradient(135deg, #1A7A4A, #34D399)" : d === 18 ? "rgba(139,92,246,0.10)" : "transparent",
                color: d === 14 ? "white" : d === 18 ? "#8B5CF6" : "#3D3D3D",
                fontWeight: d === 14 || d === 18 ? "600" : "400",
              }}>{d}</div>
          ))}
        </div>
      </div>
      <div className="mx-3 mb-3 rounded-[10px] p-3 flex items-center gap-3 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, rgba(26,122,74,0.07), rgba(52,211,153,0.04))", border: "1px solid rgba(26,122,74,0.12)" }}>
        <div className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1A7A4A, #34D399)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="white" strokeWidth="2"/>
            <path d="M8 2V6M16 2V6M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-[#0A0A0A]">Interview Confirmed</div>
          <div className="text-[9px] text-[#6B6B6B] mt-0.5">James K. · 14 Jun · 2:30 PM</div>
        </div>
        <div className="w-[5px] h-[5px] rounded-full flex-shrink-0 bg-[#34D399]" />
      </div>
    </div>
  );
}

function GuaranteeMockup() {
  const items = ["Replacement at no extra charge", "No questions asked", "Turnaround within 48 hours"];
  return (
    <div className="h-full flex flex-col items-center justify-center rounded-[14px] overflow-hidden relative px-8"
      style={{ background: "#FFFFFF", border: "1px solid #EBEBEA" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(26,122,74,0.06) 0%, transparent 70%)"
      }} />
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #34D399, #1A7A4A)" }} />
      <div className="relative z-10 mb-5">
        <svg width="48" height="56" viewBox="0 0 52 60" fill="none">
          <defs>
            <linearGradient id="shield-grad-light" x1="0" y1="0" x2="52" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399"/>
              <stop offset="100%" stopColor="#1A7A4A"/>
            </linearGradient>
          </defs>
          <path d="M26 4L6 12V28C6 40.5 14.5 51.5 26 56C37.5 51.5 46 40.5 46 28V12L26 4Z"
            stroke="url(#shield-grad-light)" strokeWidth="2" strokeLinejoin="round" fill="rgba(26,122,74,0.05)"/>
          <path d="M17 29L23 35L35 23" stroke="url(#shield-grad-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="relative z-10 text-center mb-6">
        <span className="text-[44px] font-light leading-none text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>14</span>
        <span className="text-[14px] font-normal text-[#6B6B6B] block mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Day Guarantee</span>
      </div>
      <div className="relative z-10 flex flex-col gap-2.5 w-full max-w-[240px]">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-[16px] h-[16px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(26,122,74,0.10)", border: "1px solid rgba(26,122,74,0.25)" }}>
              <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#1A7A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[10px] text-[#3D3D3D]" style={{ fontFamily: "'Inter', sans-serif" }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const steps = [
  {
    title: "Tell us what you're building",
    body: "Have a 5-minute conversation — no forms, no calls to schedule. Tell us what you're building, who you need, and what's gone wrong before. We take it from there.",
    badge: "5 min · No scheduling",
    Mockup: ChatMockup,
  },
  {
    title: "We find the right people.",
    body: "We search our network of 3000+ pre-vetted engineers for candidates who fit your team specifically — not just your job spec. We don't send everyone. Only the ones we'd stake our reputation on.",
    badge: "3000+ vetted engineers",
    Mockup: NetworkSearchMockup,
  },
  {
    title: "Every candidate is interviewed by us.",
    body: "Before you see anyone, we speak with them ourselves. We look at what they've built, how they think under pressure, and what they're like to work with day-to-day.",
    badge: "60–90 min assessment",
    Mockup: InterviewMockup,
  },
  {
    title: "You receive a curated shortlist.",
    body: "Within 72 hours, you get a small set of profiles we'd genuinely put in front of your team. Each comes with a personal note explaining exactly why we chose them for you.",
    badge: "Delivered in 72 hours",
    Mockup: ShortlistMockup,
  },
  {
    title: "Meet them. Hire when it feels right.",
    body: "Click Interested and the interview is booked instantly. If someone isn't right, leave feedback — we use it to sharpen every match going forward.",
    badge: "Instant scheduling",
    Mockup: CalendarMockup,
  },
  {
    title: "If it doesn't work, we fix it.",
    body: "Every placement includes a 14-day trial period. If the fit isn't right, we replace the candidate — no questions, no extra charge, no awkward conversations.",
    badge: "14-day guarantee",
    Mockup: GuaranteeMockup,
  },
];

export function ProcessAccordion() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const { ref, isInView } = useInView({ threshold: 0.05 });

  return (
    <section
      id="how-it-works"
      className="py-[80px] px-6 relative overflow-hidden"
      style={{ scrollMarginTop: "80px", background: "#F8F8F6" }}
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(26,122,74,0.18), rgba(52,211,153,0.12), transparent)",
      }} />

      <div className="max-w-[1120px] mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <span className="section-label text-[#6B6B6B] block mb-5">The Process</span>
          <h2
            className="text-[clamp(28px,3.2vw,42px)] tracking-[-0.04em] text-[#0A0A0A] leading-[1.08]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
          >
            How Bridigix Works
          </h2>
        </motion.div>

        <div className="flex flex-col gap-2">
          {steps.map((step, i) => {
            const isOpen = openStep === i;

            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06, layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}
                style={{
                  borderRadius: "16px",
                  border: `1px solid ${isOpen ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.06)"}`,
                  background: "#FFFFFF",
                  boxShadow: isOpen ? "0 8px 32px rgba(0,0,0,0.07)" : "0 1px 6px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                  transition: "box-shadow 0.35s ease, border-color 0.35s ease",
                }}
              >
                <button
                  onClick={() => setOpenStep(isOpen ? null : i)}
                  className="w-full flex items-center gap-5 px-6 py-5 text-left cursor-pointer group"
                  style={{ background: "none", border: "none" }}
                >
                  <span
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: isOpen ? "#1A7A4A" : "#F0F0EE",
                      color: isOpen ? "white" : "#6B6B6B",
                      fontSize: 10,
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.3s ease",
                      boxShadow: isOpen ? "0 2px 8px rgba(26,122,74,0.25)" : "none",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3
                    className="flex-1 text-[17px] text-left"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      color: isOpen ? "#0A0A0A" : "#3D3D3D",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {step.title}
                  </h3>

                  <span
                    className="hidden md:block text-[11px] font-normal px-3 py-1.5 rounded-full flex-shrink-0 transition-all duration-300"
                    style={{
                      background: isOpen ? "rgba(26,122,74,0.08)" : "#F5F5F3",
                      color: isOpen ? "#1A7A4A" : "#8A8A8A",
                      border: `1px solid ${isOpen ? "rgba(26,122,74,0.15)" : "transparent"}`,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {step.badge}
                  </span>

                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: isOpen ? "#1A7A4A" : "#F0F0EE",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      color: isOpen ? "white" : "#6B6B6B",
                      transition: "background 0.3s ease, color 0.3s ease",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </motion.div>
                </button>

                {/* Smooth content reveal */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="flex flex-col md:flex-row gap-8 px-6 pb-8">
                        <div className="flex-1 min-w-0">
                          <div className="h-px w-full mb-6" style={{ background: "rgba(0,0,0,0.06)" }} />
                          <p
                            className="text-[15px] leading-[1.75] mb-6"
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, color: "#4A4A4A" }}
                          >
                            {step.body}
                          </p>
                          <span
                            className="inline-flex text-[12px] font-medium px-3 py-1.5 rounded-full"
                            style={{
                              background: "rgba(26,122,74,0.08)",
                              color: "#1A7A4A",
                              border: "1px solid rgba(26,122,74,0.14)",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {step.badge}
                          </span>
                        </div>
                        <div
                          className="flex-shrink-0 w-full md:w-[340px] rounded-[16px] overflow-hidden"
                          style={{ height: 280, border: "1px solid rgba(0,0,0,0.06)" }}
                        >
                          <step.Mockup />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
