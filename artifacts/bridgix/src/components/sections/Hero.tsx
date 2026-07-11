import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useInView } from "../../hooks/use-in-view";
import jonathanPhoto from "@assets/pexels-salvador-olague-682304070-18032391_1780481869516.jpg";
import hennaPhoto from "@assets/pexels-mikhail-nilov-8730389_1780508877001_1780625194226.jpg";
import sofiaPhoto from "@assets/pexels-jessica-stefany-m-1002024697-31512052_1780456563453.jpg";
import blobSticker from "@assets/gradient-colors-with-blurry-effect-abstract-shape-element-png__1780481869559.jpg";

function useCountUp(target: number, trigger: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    const duration = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target]);
  return val;
}

const heroCards = [
  {
    photo: jonathanPhoto,
    name: "Jonathan T.",
    role: "Backend Developer",
    accentGrad: "linear-gradient(90deg, #1A7A4A 0%, #34D399 50%, #F5C518 100%)",
    ringColor: "#1A7A4A",
    delay: 0.2,
  },
  {
    photo: hennaPhoto,
    name: "Henna M.",
    role: "AI/ML Engineer",
    accentGrad: "linear-gradient(90deg, #F5C518 0%, #34D399 50%, #1A7A4A 100%)",
    ringColor: "#34D399",
    delay: 0.35,
  },
  {
    photo: sofiaPhoto,
    name: "Sofia F.",
    role: "Full Stack Engineer",
    accentGrad: "linear-gradient(90deg, #155E39 0%, #1A7A4A 50%, #34D399 100%)",
    ringColor: "#1A7A4A",
    delay: 0.5,
  },
];

const cardPositions = [
  { top: 18,  left: 8,  right: "auto" },
  { top: 148, left: "auto", right: 4 },
  { top: 278, left: 18, right: "auto" },
];

export function Hero() {
  const { ref, isInView } = useInView();
  const engineersCount = useCountUp(3000, isInView);
  const acceptanceCount = useCountUp(5, isInView);
  const [, navigate] = useLocation();

  return (
    <>
      <section
        className="relative pt-[108px] pb-[56px] px-6 flex items-center overflow-hidden"
        ref={ref as React.RefObject<HTMLDivElement>}
        style={{
          background: "linear-gradient(180deg, #FAFAF8 0%, #FFFFFF 70%)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #D0D0D0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
            opacity: 0.4,
          }}
        />

        <div className="absolute pointer-events-none" style={{
          top: "-60px", right: "-40px", width: 500, height: 500,
          background: "radial-gradient(circle, rgba(52,211,153,0.09) 0%, rgba(26,122,74,0.06) 45%, transparent 70%)",
          filter: "blur(60px)",
        }} />
        <div className="absolute pointer-events-none" style={{
          bottom: "0", left: "-100px", width: 440, height: 440,
          background: "radial-gradient(circle, rgba(245,197,24,0.09) 0%, rgba(26,122,74,0.05) 55%, transparent 80%)",
          filter: "blur(60px)",
        }} />

        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{
          background: "linear-gradient(to top, rgba(255,255,255,0.9), transparent)",
        }} />

        <div className="relative w-full max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-[55%_45%] gap-8 md:gap-4 items-center">

          <div className="flex flex-col items-start">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-[clamp(40px,4.2vw,60px)] tracking-[-0.05em] leading-[1.0] text-[#0A0A0A] mb-5"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
            >
              Hire{" "}
              <span style={{ color: "#0A0A0A", fontWeight: 500 }}>exceptional</span>
              {" "}engineers
              <span style={{ fontSize: "0.5em", verticalAlign: "super", opacity: 0.4 }}>.</span>
              <br />
              Chosen for your team
              <span style={{ fontSize: "0.5em", verticalAlign: "super", opacity: 0.4 }}>.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="text-[15px] text-[#4A4A4A] leading-[1.7] mb-8"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, maxWidth: "480px" }}
            >
              A faster, more considered way to hire. Through carefully vetted engineers, personal matching, and a process designed around founders who can't afford to get this wrong.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.26 }}
              className="flex flex-row gap-[10px] mb-10"
            >
              <button
                onClick={() => navigate("/recruiter-intake")}
                className="text-white text-[14px] transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  borderRadius: "12px",
                  padding: "13px 26px",
                  background: "linear-gradient(135deg, #1A7A4A 0%, #2A9D5C 100%)",
                  boxShadow: "0 4px 20px rgba(26,122,74,0.24), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,122,74,0.4)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,122,74,0.24), inset 0 1px 0 rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Find your engineer
              </button>
              <button
                onClick={() => navigate("/join")}
                className="text-[14px] text-[#0A0A0A] transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  borderRadius: "12px",
                  padding: "13px 26px",
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(0,0,0,0.10)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.18)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                Join talent network
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.36 }}
              className="flex flex-row gap-0"
              style={{
                boxShadow: "0 2px 14px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                overflow: "hidden",
              }}
            >
              {[
                { num: engineersCount.toLocaleString(), suffix: "+", label: "Engineers in network", color: "#1A7A4A" },
                { num: acceptanceCount, suffix: "%", label: "Acceptance rate", color: "#d97706" },
              ].map((stat, i, arr) => (
                <div key={i} className="flex items-stretch">
                  <div className="flex flex-col px-8 py-4">
                    <span
                      className="text-[30px] leading-none mb-1 text-[#0A0A0A]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, letterSpacing: "-0.03em" }}
                    >
                      <span>{stat.num}</span>
                      <span style={{ color: stat.color, fontSize: 22, fontWeight: 500 }}>{stat.suffix}</span>
                    </span>
                    <span className="text-[11px] text-[#6B6B6B]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                      {stat.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{
                      width: "1px",
                      background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.07), transparent)",
                      margin: "10px 0",
                    }} />
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          <div className="relative w-full hidden md:block" style={{ height: "390px" }}>
            <div
              className="absolute pointer-events-none select-none"
              style={{
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 320, height: 320,
                opacity: 0.22,
                zIndex: 0,
                filter: "blur(2px)",
              }}
            >
              <img src={blobSticker} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            {heroCards.map((card, i) => {
              const pos = cardPositions[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.7, delay: card.delay }}
                  className="absolute"
                  style={{
                    top: pos.top,
                    left: pos.left !== "auto" ? pos.left : undefined,
                    right: pos.right !== "auto" ? pos.right : undefined,
                    width: 215,
                    zIndex: i + 1,
                  }}
                >
                  <div
                    className="bg-white rounded-[16px] overflow-hidden"
                    style={{
                      border: "1px solid rgba(0,0,0,0.07)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                      padding: "16px",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: card.accentGrad }} />

                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-full p-[2px]"
                        style={{
                          background: `linear-gradient(135deg, ${card.ringColor}, rgba(255,255,255,0.85))`,
                          boxShadow: `0 0 0 1px rgba(255,255,255,0.9), 0 8px 20px rgba(0,0,0,0.08)`,
                        }}
                      >
                        <img
                          src={card.photo}
                          alt={card.name}
                          style={{
                            width: 46, height: 46,
                            borderRadius: "50%",
                            objectFit: "cover",
                            objectPosition: "center",
                            flexShrink: 0,
                            background: "linear-gradient(135deg, rgba(245,200,66,0.12), rgba(26,122,74,0.12))",
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-[13px] text-[#0A0A0A] leading-tight" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                          {card.name}
                        </div>
                        <div className="text-[11px] text-[#6B6B6B] mt-0.5" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                          {card.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-3">
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#1A7A4A", flexShrink: 0 }} />
                      <span className="text-[10px] text-[#6B6B6B]" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Available now
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
