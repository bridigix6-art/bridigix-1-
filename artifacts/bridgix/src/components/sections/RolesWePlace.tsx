import { motion } from "framer-motion";
import { useInView } from "../../hooks/use-in-view";

const roles = [
  { label: "Backend Engineers" },
  { label: "Frontend Engineers" },
  { label: "Full Stack Engineers" },
  { label: "AI/ML Engineers" },
  { label: "Mobile Engineers" },
  { label: "DevOps Engineers" },
  { label: "Cloud Engineers" },
  { label: "Data Engineers" },
  { label: "Engineering Leaders" },
  { label: "Founding Engineers" },
];

const roleData = Object.fromEntries(roles.map(r => [r.label, r]));

export function RolesWePlace() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section
      className="py-[88px] relative overflow-hidden"
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ scrollMarginTop: "80px" }}
    >
      <div className="absolute inset-0" style={{ background: "#0B0F0C" }} />

      {/* Exact halftone image as background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/halftone-pattern.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.18,
          mixBlendMode: "screen",
        }}
      />

      <div className="absolute pointer-events-none" style={{
        top: "-60px", left: "50%", transform: "translateX(-50%)",
        width: 800, height: 300,
        background: "radial-gradient(ellipse, rgba(26,122,74,0.14) 0%, transparent 70%)",
        filter: "blur(50px)",
      }} />

      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.25), rgba(26,122,74,0.18), transparent)",
      }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(26,122,74,0.15), transparent)",
      }} />

      <div className="max-w-[1000px] mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <h2
            className="text-[clamp(26px,3vw,40px)] tracking-[-0.04em] leading-[1.05]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.92)" }}
          >
            Engineers for Every Stage of Growth
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto flex max-w-[860px] flex-wrap justify-center gap-3"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.label}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.18 + index * 0.04 }}
              className="relative min-w-[168px] cursor-default rounded-[12px] border border-white/10 bg-[linear-gradient(180deg,rgba(62,62,62,0.97),rgba(22,22,22,0.98))] px-5 py-3 text-center shadow-[0_6px_24px_rgba(0,0,0,0.45)] transition-all duration-250 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
              whileHover={{ scale: 1.01, transition: { duration: 0.18 } }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.92)",
                  letterSpacing: "0.005em",
                }}
              >
                {role.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
