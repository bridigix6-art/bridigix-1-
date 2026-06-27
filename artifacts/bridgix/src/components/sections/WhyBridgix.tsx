import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/use-in-view";

const cells = [
  {
    title: "People-First Hiring",
    body: "We believe hiring is about people, not pipelines. Every founder deserves care, attention, and a process that respects the stakes involved.",
    borderGrad: "linear-gradient(135deg, #1A7A4A 0%, #34D399 50%, #F5C518 100%)",
    glowColor: "rgba(26,122,74,0.07)",
    dotColor: "#1A7A4A",
    topBar: "linear-gradient(90deg, #1A7A4A, #34D399)",
    side: "left",
    widthFactor: "58%",
    yOffset: 0,
    padding: "36px",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A7A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: "Real Match Quality",
    body: "We don't fill roles. We get the fit right. That means understanding how someone works, what they have built, and whether they genuinely belong on your team.",
    borderGrad: "linear-gradient(135deg, #F5C518 0%, #34D399 50%, #1A7A4A 100%)",
    glowColor: "rgba(245,200,66,0.07)",
    dotColor: "#1A7A4A",
    topBar: "linear-gradient(90deg, #F5C518, #34D399)",
    side: "right",
    widthFactor: "48%",
    yOffset: -12,
    padding: "28px",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    title: "Clarity at Every Step",
    body: "No black box. You always know what we are doing, why we are doing it, and what comes next. Hiring should feel collaborative, not opaque.",
    borderGrad: "linear-gradient(135deg, #34D399 0%, #1A7A4A 60%, #F5C518 100%)",
    glowColor: "rgba(52,211,153,0.06)",
    dotColor: "#1A7A4A",
    topBar: "linear-gradient(90deg, #34D399, #1A7A4A)",
    side: "left",
    widthFactor: "54%",
    yOffset: 6,
    padding: "32px",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A7A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    title: "Founder-Built Thinking",
    body: "We built Bridigix inside the same pressure founders live in. That is why everything we do removes friction, not adds process.",
    borderGrad: "linear-gradient(135deg, #F5C518 0%, #34D399 40%, #1A7A4A 100%)",
    glowColor: "rgba(245,200,66,0.08)",
    dotColor: "#1A7A4A",
    topBar: "linear-gradient(90deg, #F5C518, #34D399)",
    side: "right",
    widthFactor: "52%",
    yOffset: 0,
    padding: "38px",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
];

function TimelineCard({ cell, index, isInView }: { cell: typeof cells[0]; index: number; isInView: boolean }) {
  const isLeft = cell.side === "left";

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className={`flex items-center gap-0 w-full ${isLeft ? "flex-row" : "flex-row-reverse"}`}
      style={{ transform: `translateY(${cell.yOffset}px)` }}
    >
      <div style={{ width: cell.widthFactor, flexShrink: 0 }}>
        <div style={{
          padding: "1px",
          borderRadius: "20px",
          background: cell.borderGrad,
          transition: "all 0.3s ease",
        }}
          className="group"
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.10)`;
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          }}
        >
          <div
            className="relative bg-white rounded-[19px] overflow-hidden cursor-default"
            style={{
              padding: cell.padding,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: cell.topBar }} />

            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-400 rounded-[19px]"
              style={{ background: `radial-gradient(circle at ${isLeft ? "80%" : "20%"} 80%, ${cell.glowColor}, transparent 65%)` }}
            />

            <div className="relative z-10 flex items-start gap-3 mb-4">
              <div
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: cell.glowColor, border: "1px solid rgba(0,0,0,0.06)" }}
              >
                {cell.icon}
              </div>
              <h3
                className="text-[18px] text-[#0A0A0A] leading-tight pt-1"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
              >
                {cell.title}
              </h3>
            </div>

            <p
              className="text-[14px] leading-[1.75] relative z-10"
              style={{ color: "#545454", fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
            >
              {cell.body}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center flex-shrink-0 px-8">
        <div style={{
          width: 11, height: 11,
          borderRadius: "50%",
          background: "#1A7A4A",
          boxShadow: "0 0 0 3px rgba(26,122,74,0.15), 0 0 8px rgba(26,122,74,0.25)",
          flexShrink: 0,
        }} />
      </div>

      <div className="flex-1" />
    </motion.div>
  );
}

export function WhyBridgix() {
  const { ref, isInView } = useInView({ threshold: 0.05 });
  const timelineRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    if (isInView && timelineRef.current) {
      const target = timelineRef.current.scrollHeight;
      let start: number | null = null;
      const animate = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 900, 1);
        const eased = 1 - Math.pow(1 - p, 2);
        setLineHeight(eased * target);
        if (p < 1) requestAnimationFrame(animate);
      };
      setTimeout(() => requestAnimationFrame(animate), 150);
    }
  }, [isInView]);

  return (
    <section
      id="why-bridgix"
      className="py-[110px] px-6 relative overflow-hidden"
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        scrollMarginTop: "80px",
        background: "#FFFFFF",
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
        backgroundSize: "36px 36px",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
      }} />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(26,122,74,0.03) 0%, transparent 60%), radial-gradient(ellipse at 0% 60%, rgba(245,200,66,0.03) 0%, transparent 50%)",
      }} />

      <div className="max-w-[1040px] mx-auto relative">
        <div className="mb-14">
          <span className="section-label text-[#6B6B6B] block mb-4">Why Bridigix</span>
          <h2
            className="text-[clamp(32px,3.5vw,48px)] tracking-[-0.04em] text-[#0A0A0A] leading-[1.05]"
          >
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>Different by </span>
            <span
              className="font-seasons"
              style={{
                fontSize: "1.05em",
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              design
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.5em", verticalAlign: "super", opacity: 0.4 }}>.</span>
          </h2>
        </div>

        <div ref={timelineRef} className="relative">
          <div className="absolute left-1/2 top-0 pointer-events-none" style={{
            transform: "translateX(-50%)",
            width: "2px",
            height: `${lineHeight}px`,
            maxHeight: "100%",
            background: "linear-gradient(to bottom, transparent 0%, rgba(26,122,74,0.25) 10%, rgba(26,122,74,0.20) 80%, transparent 100%)",
            transition: "height 0.08s linear",
          }} />

          {isInView && (
            <div className="absolute left-1/2 top-0 pointer-events-none" style={{
              transform: "translateX(-50%)",
              width: "4px",
              height: `${lineHeight}px`,
              maxHeight: "100%",
              background: "linear-gradient(to bottom, transparent, #34D399 20%, #1A7A4A 70%, transparent)",
              filter: "blur(2px)",
              opacity: 0.5,
              transition: "height 0.08s linear",
            }} />
          )}

          <div className="flex flex-col gap-8">
            {cells.map((cell, i) => (
              <TimelineCard key={cell.title} cell={cell} index={i} isInView={isInView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
