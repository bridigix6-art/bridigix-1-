import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "../../hooks/use-in-view";
import { ChatModal } from "../modals/ChatModal";

function HalfEarthGlobe() {
  const latLines = [0.22, 0.38, 0.52, 0.65, 0.78];
  const lonLines = [0.15, 0.30, 0.45, 0.60, 0.75, 0.90];
  const r = 160;
  const cx = 180;
  const cy = 200;

  function latArc(t: number) {
    const y = cy - r + t * 2 * r;
    const halfW = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy)));
    if (halfW < 4) return null;
    return `M ${cx - halfW} ${y} A ${halfW} ${halfW * 0.35} 0 0 1 ${cx + halfW} ${y}`;
  }

  function lonPath(t: number) {
    const angle = t * Math.PI;
    const points = [];
    for (let i = 0; i <= 24; i++) {
      const phi = (i / 24) * Math.PI;
      const x = cx + r * Math.sin(phi) * Math.cos(angle - Math.PI / 2);
      const y = cy - r * Math.cos(phi);
      points.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
    }
    return points.join(" ");
  }

  const engineerNodes = [
    { x: 60, y: 90, label: "J.T", color: "#34D399", r: 14, glow: "rgba(52,211,153,0.25)" },
    { x: 295, y: 110, label: "H.M", color: "#F5C518", r: 12, glow: "rgba(245,200,66,0.20)" },
    { x: 40, y: 230, label: "S.F", color: "#34D399", r: 11, glow: "rgba(52,211,153,0.20)" },
    { x: 310, y: 260, label: "A.K", color: "#1A7A4A", r: 10, glow: "rgba(26,122,74,0.25)" },
    { x: 170, y: 45, label: "M.R", color: "#34D399", r: 9, glow: "rgba(52,211,153,0.18)" },
  ];

  const connectionLines = [
    [cx, cy, 60, 90],
    [cx, cy, 295, 110],
    [cx, cy, 40, 230],
    [cx, cy, 310, 260],
    [cx, cy, 170, 45],
    [60, 90, 170, 45],
    [295, 110, 310, 260],
  ];

  return (
    <svg width="360" height="400" viewBox="0 0 360 400" fill="none" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="earth-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(26,122,74,0.12)" />
          <stop offset="70%" stopColor="rgba(26,122,74,0.04)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(52,211,153,0.20)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="half-earth-clip">
          <rect x="0" y={cy - r} width="360" height={r * 2} />
        </clipPath>
      </defs>

      {/* Globe ambient glow */}
      <ellipse cx={cx} cy={cy} rx={r + 30} ry={r + 30} fill="url(#earth-glow)" />

      {/* Latitude lines (horizontal arcs) */}
      {latLines.map((t, i) => {
        const d = latArc(t);
        if (!d) return null;
        return (
          <path
            key={i} d={d}
            stroke="rgba(52,211,153,0.14)"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="3 4"
          />
        );
      })}

      {/* Longitude lines (vertical arcs) */}
      {lonLines.map((t, i) => (
        <path
          key={i}
          d={lonPath(t)}
          stroke="rgba(52,211,153,0.10)"
          strokeWidth="0.8"
          fill="none"
          strokeDasharray="2 5"
        />
      ))}

      {/* Main globe circle outline */}
      <circle
        cx={cx} cy={cy} r={r}
        stroke="rgba(52,211,153,0.22)"
        strokeWidth="1"
        fill="none"
      />
      <circle
        cx={cx} cy={cy} r={r + 8}
        stroke="rgba(52,211,153,0.07)"
        strokeWidth="1"
        fill="none"
      />

      {/* Connection lines to engineer nodes */}
      {connectionLines.map(([x1, y1, x2, y2], i) => (
        <line
          key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(52,211,153,0.13)"
          strokeWidth="0.8"
          strokeDasharray="3 5"
        />
      ))}

      {/* Central Bridgix node */}
      <circle cx={cx} cy={cy} r={28} fill="rgba(26,122,74,0.18)" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" filter="url(#node-glow)" />
      <circle cx={cx} cy={cy} r={20} fill="rgba(26,122,74,0.28)" stroke="rgba(52,211,153,0.35)" strokeWidth="1" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.45)" fontFamily="Inter, sans-serif" letterSpacing="0.1em">BRIDGIX</text>
      <text x={cx} y={cy + 7} textAnchor="middle" fontSize="9" fill="rgba(52,211,153,0.85)" fontFamily="Inter, sans-serif" fontWeight="600">3000+</text>

      {/* Pulse animation on center node */}
      <circle cx={cx} cy={cy} r="28" fill="none" stroke="rgba(52,211,153,0.3)" strokeWidth="1">
        <animate attributeName="r" values="28;46;28" dur="3.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="3.2s" repeatCount="indefinite"/>
      </circle>

      {/* Engineer nodes */}
      {engineerNodes.map((node, i) => (
        <g key={i} filter="url(#node-glow)">
          <circle cx={node.x} cy={node.y} r={node.r + 5} fill="transparent" stroke={node.color} strokeWidth="0.5" opacity="0.25" />
          <circle cx={node.x} cy={node.y} r={node.r} fill={node.glow} stroke={node.color} strokeWidth="1.2" />
          <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central"
            fontSize="7.5" fill="rgba(255,255,255,0.8)" fontFamily="Inter, sans-serif" fontWeight="600">
            {node.label}
          </text>
          {/* Small pulse */}
          <circle cx={node.x} cy={node.y} r={node.r} fill="none" stroke={node.color} strokeWidth="0.8" opacity="0.5">
            <animate attributeName="r" values={`${node.r};${node.r + 10};${node.r}`} dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite"/>
          </circle>
        </g>
      ))}

      {/* Match signal dots on globe surface */}
      {[
        { cx: cx + 90, cy: cy - 60 },
        { cx: cx - 100, cy: cy + 30 },
        { cx: cx + 70, cy: cy + 100 },
        { cx: cx - 50, cy: cy - 110 },
        { cx: cx + 130, cy: cy + 50 },
      ].map((pt, i) => (
        <circle key={i} cx={pt.cx} cy={pt.cy} r="2.5" fill="rgba(52,211,153,0.5)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.8 + i * 0.3}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

export function CTABanner() {
  const { ref, isInView } = useInView({ threshold: 0.15 });
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />

      <section
        className="px-4 md:px-10 pb-0 pt-[60px]"
        ref={ref as React.RefObject<HTMLDivElement>}
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75 }}
          className="rounded-t-[32px] rounded-b-none overflow-hidden relative"
          style={{
            background: "linear-gradient(160deg, #0D1412 0%, #0A0F0D 60%, #0D1210 100%)",
            boxShadow: "0 -8px 60px rgba(0,0,0,0.2), 0 24px 80px rgba(0,0,0,0.35)",
            minHeight: "360px",
          }}
        >
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.6), rgba(26,122,74,0.5), rgba(245,200,66,0.3), transparent)",
          }} />

          {/* Subtle dot texture */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.018) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }} />

          {/* Ambient glow left */}
          <div className="absolute pointer-events-none" style={{
            top: "-80px", left: "-80px", width: 500, height: 500,
            background: "radial-gradient(circle, rgba(26,122,74,0.10) 0%, transparent 65%)",
            filter: "blur(60px)",
          }} />

          {/* Ambient glow right */}
          <div className="absolute pointer-events-none" style={{
            bottom: "-60px", right: "-60px", width: 450, height: 450,
            background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%)",
            filter: "blur(60px)",
          }} />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_360px] items-center gap-0">
            {/* Left: Content */}
            <div className="px-[52px] py-[68px]">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.15 }}
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.30)] mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Ready when you are
                </p>
                <h2
                  className="text-[clamp(26px,3vw,44px)] font-light tracking-[-0.04em] text-white mb-5 leading-[1.08]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Your next engineer is already in our network
                  <span style={{ fontSize: "0.5em", verticalAlign: "super", opacity: 0.3 }}>.</span>
                </h2>

                <p className="text-[15px] font-light text-[rgba(255,255,255,0.48)] mb-10 leading-[1.65] max-w-[380px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Tell us what you need in 5 minutes. Three vetted profiles in your inbox.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <button
                    onClick={() => setChatOpen(true)}
                    className="text-white font-normal text-[14px] cursor-pointer transition-all duration-250 relative overflow-hidden"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      borderRadius: "14px",
                      padding: "15px 32px",
                      background: "linear-gradient(135deg, #1A7A4A 0%, #2A9D5C 80%, #34D399 100%)",
                      boxShadow: "0 6px 30px rgba(26,122,74,0.40), 0 2px 8px rgba(26,122,74,0.25), inset 0 1px 0 rgba(255,255,255,0.14)",
                      border: "none",
                      letterSpacing: "0.01em",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 10px 45px rgba(26,122,74,0.60), 0 4px 14px rgba(26,122,74,0.35), inset 0 1px 0 rgba(255,255,255,0.16)";
                      e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "0 6px 30px rgba(26,122,74,0.40), 0 2px 8px rgba(26,122,74,0.25), inset 0 1px 0 rgba(255,255,255,0.14)";
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                    }}
                  >
                    Find your engineer →
                  </button>

                  <div className="flex items-center gap-2 self-center">
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
                    <span className="text-[12px] text-[rgba(255,255,255,0.32)]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      No fees until you hire
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Half-Earth Globe */}
            <div className="hidden md:flex items-center justify-center py-6 pr-4 opacity-90">
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.25 }}
              >
                <HalfEarthGlobe />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
