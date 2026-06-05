import { motion } from "framer-motion";
import { useInView } from "../../hooks/use-in-view";
import jonathanPhoto from "@assets/pexels-salvador-olague-682304070-18032391_1780481869516.jpg";
import muhammadPhoto from "@assets/pexels-augustocarneirojr-30468636_1780456563501.jpg";
import sofiaPhoto from "@assets/pexels-jessica-stefany-m-1002024697-31512052_1780456563453.jpg";
import jamesPhoto from "@assets/pexels-nana-qwacy-listowell-249813867-19098114_1780456563486.jpg";

const candidateCards = [
  {
    photo: jonathanPhoto,
    name: "Jonathan Taylor",
    role: "Backend Engineer",
    accentColor: "#1A7A4A",
  },
  {
    photo: muhammadPhoto,
    name: "Muhammad K.",
    role: "AI Automation Specialist",
    accentColor: "#8B5CF6",
  },
  {
    photo: sofiaPhoto,
    name: "Sofia Fisher",
    role: "QA Engineer",
    accentColor: "#F472B6",
  },
  {
    photo: jamesPhoto,
    name: "James K.",
    role: "Backend Engineer",
    accentColor: "#d97706",
  },
];

export function PartnerIntro() {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <section
      id="partner-intro"
      className="py-[100px] px-6 relative overflow-hidden"
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        scrollMarginTop: "80px",
        background: "linear-gradient(180deg, #FFFFFF 0%, #FAFAF8 100%)",
      }}
    >
      {/* Subtle gradient orbs */}
      <div className="absolute pointer-events-none" style={{
        top: "-40px", right: "-60px", width: 380, height: 380,
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        filter: "blur(60px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "0", left: "-60px", width: 340, height: 340,
        background: "radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 70%)",
        filter: "blur(60px)",
      }} />

      <div className="max-w-[960px] mx-auto relative">

        {/* Centered headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2
            className="text-[clamp(32px,3.8vw,50px)] font-light tracking-[-0.04em] leading-[1.05] text-[#0A0A0A]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Your partner for finding the right engineer
            <span style={{ fontSize: "0.5em", verticalAlign: "super", opacity: 0.4 }}>.</span>
          </h2>
        </motion.div>

        {/* 3-line description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-16"
        >
          <p
            className="text-[clamp(15px,1.5vw,18px)] font-light leading-[1.65] text-[#505050]"
            style={{ fontFamily: "'Inter', sans-serif", maxWidth: 720, margin: "0 auto" }}
          >
            The hardest part of hiring isn't finding people<br />
            it's knowing who belongs on your team<span style={{ fontSize: "0.6em", verticalAlign: "super", opacity: 0.4 }}>.</span><br />
            Bridigix takes that weight off your plate
            <span style={{ fontSize: "0.6em", verticalAlign: "super", opacity: 0.4 }}>.</span>
          </p>
        </motion.div>

        {/* Candidate cards grid — image #3 layout */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <div
            className="rounded-[24px] p-5 grid grid-cols-2 md:grid-cols-4 gap-3"
            style={{
              background: "rgba(243,243,241,0.85)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            {candidateCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                className="relative rounded-[16px] overflow-hidden group cursor-default"
                style={{
                  aspectRatio: "3/4",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
              >
                {/* Full image */}
                <img
                  src={card.photo}
                  alt={card.name}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    objectPosition: "top center",
                    display: "block",
                  }}
                />

                {/* Transparent grey overlay bar at bottom */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    padding: "32px 12px 12px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.0) 100%)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.65)",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      marginBottom: 2,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {card.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.92)",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {card.role}
                  </div>
                </div>

                {/* Gradient top accent line on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${card.accentColor}, transparent)` }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
