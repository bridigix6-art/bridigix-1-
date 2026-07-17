import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/use-in-view";

const signatureGradient = "linear-gradient(90deg, #F5C518 0%, #34D399 50%, #1A7A4A 100%)";

const stages = [
  {
    title: "Application & CV Screen",
    body: "We review their CV, LinkedIn, and GitHub. We look for consistent experience, real projects, and signals they have worked in fast-moving environments. Communication quality in their application matters — engineers who cannot write clearly often cannot communicate in a remote team.",
    pill: "60% filtered out here",
    pillBg: "rgba(52,211,153,0.12)",
    pillText: "#1A7A4A",
    pillBorder: "rgba(52,211,153,0.28)",
    glowColor: "rgba(52,211,153,0.06)",
    topBar: signatureGradient,
    checkColor: "#1A7A4A",
    gradBorder: signatureGradient,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    title: "20-Minute Screening Call",
    body: "A real conversation — not a script — about how they work, what they have built, and how they handle ambiguity. We are listening for ownership mentality, not just technical vocabulary.",
    pill: "20% filtered out here",
    pillBg: "rgba(52,211,153,0.16)",
    pillText: "#1A7A4A",
    pillBorder: "rgba(52,211,153,0.34)",
    glowColor: "rgba(26,122,74,0.06)",
    topBar: signatureGradient,
    checkColor: "#1A7A4A",
    gradBorder: "linear-gradient(140deg, #34D399 0%, #1A7A4A 50%, #F5C518 100%)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.11 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.88-.88a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    title: "Technical Assessment",
    body: "A 60 to 90 minute real-world problem specific to their stack. Not trivia. We give them a scenario similar to what they would actually face — architecture decisions, debugging, code review. We evaluate the thinking, not just the output.",
    pill: "10% filtered out here",
    pillBg: "rgba(245,200,66,0.14)",
    pillText: "#b45309",
    pillBorder: "rgba(245,200,66,0.35)",
    glowColor: "rgba(245,200,66,0.06)",
    topBar: "linear-gradient(90deg, #F5C518, #34D399, transparent)",
    checkColor: "#d97706",
    gradBorder: "linear-gradient(140deg, #F5C518 0%, #34D399 60%, #1A7A4A 100%)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    title: "Availability & Intent Confirmation",
    body: "We confirm genuine availability, timeline to join, salary expectations, and what they are optimising for next. There is no point placing someone brilliant who takes six months to start or leaves in 90 days.",
    pill: "Top 5% enter the network",
    pillBg: "rgba(52,211,153,0.22)",
    pillText: "#1A7A4A",
    pillBorder: "rgba(52,211,153,0.42)",
    glowColor: "rgba(26,122,74,0.08)",
    topBar: signatureGradient,
    checkColor: "#1A7A4A",
    gradBorder: "linear-gradient(140deg, #34D399 0%, #1A7A4A 50%, #F5C518 100%)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
];

export function Vetting() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  return (
    <section
      id="vetting"
      className="py-[110px] relative overflow-hidden"
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        scrollMarginTop: "80px",
        backgroundColor: "#09090B",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(26,122,74,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(245,200,66,0.04) 0%, transparent 50%)",
      }}
    >
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Subtle orbs */}
      <div className="absolute pointer-events-none" style={{
        top: "-60px", right: "-60px", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(245,200,66,0.08) 0%, rgba(52,211,153,0.04) 45%, transparent 70%)",
        filter: "blur(80px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "-40px", left: "-60px", width: 460, height: 460,
        background: "radial-gradient(circle, rgba(26,122,74,0.10) 0%, rgba(52,211,153,0.04) 50%, transparent 70%)",
        filter: "blur(70px)",
      }} />

      <div className="max-w-[1120px] mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="section-label-dark block mb-5">Vetting Process</span>
          <h2
            className="text-[clamp(32px,4vw,50px)] tracking-[-0.04em] mb-5 leading-[1.08]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              color: "#FFFFFF",
            }}
          >
            When we say pre-vetted,<br />we mean it
            <span style={{ fontSize: "0.5em", verticalAlign: "super", opacity: 0.4 }}>.</span>
          </h2>
          <p
            className="text-[15px] font-light leading-[1.7] max-w-[520px]"
            style={{ color: "rgba(255,255,255,0.60)", fontFamily: "'Inter', sans-serif" }}
          >
            Every engineer passes four stages before you ever see their name. Here is exactly what that process looks like.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] mb-16">
          {stages.map((stage, i) => {
            const isFocused = focusedIndex === i;
            const isBlurred = focusedIndex !== null && !isFocused;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.12 + i * 0.1, type: "spring", stiffness: 100 }}
                onClick={() => setFocusedIndex(isFocused ? null : i)}
                className="relative cursor-pointer select-none"
                style={{
                  borderRadius: "18px",
                  padding: "1px",
                  background: isFocused
                    ? signatureGradient
                    : "linear-gradient(140deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
                  opacity: isBlurred ? 0.55 : 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isFocused ? "scale(1.01)" : isBlurred ? "scale(0.995)" : "scale(1)",
                  boxShadow: isFocused ? "0 18px 45px rgba(0,0,0,0.22)" : "none",
                }}
              >
                <div
                  className="rounded-[17px] h-full flex flex-col p-[30px] relative overflow-hidden"
                  style={{
                    background: isFocused
                      ? "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)"
                      : "rgba(255,255,255,0.025)",
                    boxShadow: isFocused ? "0 24px 60px rgba(0,0,0,0.4)" : "none",
                  }}
                >
                  {/* Top gradient accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[17px]" style={{ background: stage.topBar }} />

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-[17px]"
                    style={{
                      background: `radial-gradient(circle at 20% 20%, ${stage.glowColor}, transparent 65%)`,
                      opacity: isFocused ? 0.08 : 0,
                    }}
                  />

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: stage.pillBg,
                          border: `1px solid ${stage.pillBorder}`,
                          color: stage.checkColor,
                        }}
                      >
                        {stage.icon}
                      </div>
                      <span
                        className="text-[11px] font-normal uppercase"
                        style={{ color: "rgba(255,255,255,0.30)", letterSpacing: "0.12em", fontFamily: "'Inter', sans-serif" }}
                      >
                        Stage 0{i + 1}
                      </span>
                    </div>
                    <span
                      className="text-[11px] font-normal px-[12px] py-[5px] rounded-full flex-shrink-0"
                      style={{
                        background: stage.pillBg,
                        border: `1px solid ${stage.pillBorder}`,
                        color: stage.pillText,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {stage.pill}
                    </span>
                  </div>

                  <h3
                    className="text-[18px] text-white mb-4 relative z-10"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      lineHeight: 1.3,
                    }}
                  >
                    {stage.title}
                  </h3>

                  <p
                    className="text-[14px] font-light leading-[1.75] mt-auto relative z-10"
                    style={{ color: "rgba(255,255,255,0.60)", fontFamily: "'Inter', sans-serif" }}
                  >
                    {stage.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center"
        >
          <span
            className="text-[14px] font-light inline-flex items-center gap-4"
            style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}
          >
            <span className="flex-1 max-w-[80px] h-px inline-block" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15))" }} />
            We go through this so you don't have to
            <span style={{ fontSize: "0.6em", verticalAlign: "super", opacity: 0.5 }}>.</span>
            <span className="flex-1 max-w-[80px] h-px inline-block" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.15))" }} />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
