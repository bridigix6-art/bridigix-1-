import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "../../hooks/use-in-view";

const faqs = [
  { q: "How do you decide who makes the shortlist?", a: "We match based on your specific context — what you're building, your team's working style, and where you've struggled in hiring before. It's not keyword matching. It's judgment." },
  { q: "What if your 'good fit' is different from mine?", a: "We get to know that upfront. The intake process asks exactly that. And if the first batch misses, you tell us why — we use that feedback to recalibrate." },
  { q: "Why only a small number of candidates?", a: "Because three strong fits are more useful than twenty maybes. We save you the cognitive overhead of sorting through a list and present only the people we'd genuinely recommend." },
  { q: "How do I know candidates aren't being reused across clients?", a: "We track active matching. A candidate shown to one client is locked from simultaneous presentation to another in the same space. We're also transparent about this in every intro note." },
  { q: "What happens if someone looks good but doesn't perform after hiring?", a: "That's what the 14-day guarantee is for. Within the first two weeks, if the fit isn't working, we replace the candidate at no additional charge." },
  { q: "Are you optimizing for speed or quality?", a: "Quality, without sacrificing speed. 72 hours is the delivery window because we've built the network in advance — not because we're cutting corners." },
  { q: "Can I still run my own hiring process alongside Bridgix?", a: "Yes. Some founders use us in parallel with job boards or in-house recruiting. We're not exclusive unless you want us to be." },
  { q: "What kinds of roles do you struggle with?", a: "Truly niche specializations — deep research roles, hardware-adjacent software, or highly regulated domains where our network is thinner. We'll tell you honestly before you start." }
];

const accentColors = ["#1A7A4A", "#8B5CF6", "#F472B6", "#d97706", "#1A7A4A", "#8B5CF6", "#F472B6", "#d97706"];

export function FAQ() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="py-[100px] px-6 relative overflow-hidden"
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        scrollMarginTop: "80px",
        background: "linear-gradient(180deg, #F8F8F6 0%, #FFFFFF 100%)",
      }}
    >
      <div className="absolute pointer-events-none" style={{
        top: "10%", right: "-80px", width: 320, height: 320,
        background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
        filter: "blur(50px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "10%", left: "-60px", width: 280, height: 280,
        background: "radial-gradient(circle, rgba(244,114,182,0.05) 0%, transparent 70%)",
        filter: "blur(50px)",
      }} />

      <div className="max-w-[720px] mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2
            className="text-[clamp(28px,3.5vw,40px)] font-light tracking-[-0.04em] text-[#0A0A0A]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Still have questions? We got you
            <span style={{ fontSize: "0.55em", verticalAlign: "super", opacity: 0.4 }}>.</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const accent = accentColors[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                style={{
                  borderRadius: "14px",
                  border: isOpen ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(0,0,0,0.07)",
                  background: isOpen ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                  boxShadow: isOpen ? "0 4px 20px rgba(0,0,0,0.06)" : "0 1px 4px rgba(0,0,0,0.03)",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full py-[18px] px-[20px] flex justify-between items-center text-left cursor-pointer"
                >
                  <span
                    className="text-[15px] pr-6 transition-colors duration-200"
                    style={{
                      fontFamily: "'Glacial Indifference', 'Inter', sans-serif",
                      color: isOpen ? "#0A0A0A" : "#2A2A2A",
                      fontWeight: 400,
                    }}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`flex-shrink-0 w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "rotate-45" : "rotate-0"}`}
                    style={{
                      background: isOpen ? `${accent}15` : "#F4F4F2",
                      border: `1px solid ${isOpen ? accent : "rgba(0,0,0,0.08)"}`,
                      color: isOpen ? accent : "#6B6B6B",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2V14M14 8H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden"
                    >
                      <div className="px-[20px] pb-[18px]">
                        <div style={{ width: "100%", height: 1, background: "rgba(0,0,0,0.05)", marginBottom: 14 }} />
                        <p
                          className="text-[14px] leading-[1.75]"
                          style={{
                            fontFamily: "'Glacial Indifference', 'Inter', sans-serif",
                            color: "#4A4A4A",
                            fontWeight: 400,
                          }}
                        >
                          {faq.a}
                        </p>
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
