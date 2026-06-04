import { motion } from "framer-motion";
import { useInView } from "../../hooks/use-in-view";
import halftoneImage from "@assets/Screenshot_2026-06-02-12-14-14-817_com.android.chrome-edit_1780541934964.jpg";

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

// Scattered layout: 4 rows with natural offsets and slight y-variation per pill
const layout: { roles: string[]; xOffset: number; rowYOffset: number[] }[] = [
  {
    roles: ["Backend Engineers", "Frontend Engineers", "Full Stack Engineers"],
    xOffset: -18,
    rowYOffset: [0, 3, -3],
  },
  {
    roles: ["AI/ML Engineers", "Mobile Engineers", "DevOps Engineers"],
    xOffset: 28,
    rowYOffset: [-2, 0, 4],
  },
  {
    roles: ["Cloud Engineers", "Data Engineers", "Engineering Leaders"],
    xOffset: -8,
    rowYOffset: [3, -2, 0],
  },
  {
    roles: ["Founding Engineers"],
    xOffset: 0,
    rowYOffset: [0],
  },
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
      {/* Base dark background */}
      <div className="absolute inset-0" style={{ background: "#0B0F0C" }} />

      {/* Halftone image background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${halftoneImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.08,
          mixBlendMode: "screen",
        }}
      />

      {/* Subtle green radial at top */}
      <div className="absolute pointer-events-none" style={{
        top: "-60px", left: "50%", transform: "translateX(-50%)",
        width: 800, height: 300,
        background: "radial-gradient(ellipse, rgba(26,122,74,0.14) 0%, transparent 70%)",
        filter: "blur(50px)",
      }} />

      {/* Gradient lines */}
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

        {/* Scattered layout */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="flex flex-col items-center gap-3"
        >
          {layout.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex flex-wrap justify-center gap-2.5"
              style={{ transform: `translateX(${row.xOffset}px)` }}
            >
              {row.roles.map((roleName, j) => {
                const role = roleData[roleName];
                if (!role) return null;
                return (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: row.rowYOffset[j] ?? 0 } : {}}
                    transition={{ duration: 0.45, delay: 0.18 + rowIndex * 0.07 + j * 0.04 }}
                    className="cursor-default transition-all duration-250 relative"
                    style={{
                      background: "linear-gradient(180deg, rgba(62,62,62,0.97) 0%, rgba(22,22,22,0.98) 100%)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: "10px",
                      padding: "11px 22px",
                      boxShadow: [
                        "0 4px 20px rgba(0,0,0,0.55)",
                        "0 1px 0 rgba(255,255,255,0.07) inset",
                        "0 -1px 0 rgba(0,0,0,0.4) inset",
                      ].join(", "),
                    }}
                    whileHover={{
                      background: "linear-gradient(180deg, rgba(72,72,72,0.98) 0%, rgba(28,28,28,0.99) 100%)",
                      boxShadow: [
                        "0 6px 28px rgba(0,0,0,0.65)",
                        "0 1px 0 rgba(255,255,255,0.09) inset",
                        "0 -1px 0 rgba(0,0,0,0.4) inset",
                        "0 0 18px rgba(52,211,153,0.08)",
                      ].join(", "),
                      y: (row.rowYOffset[j] ?? 0) - 2,
                      transition: { duration: 0.18 },
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13.5,
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.92)",
                        whiteSpace: "nowrap",
                        textShadow: [
                          "-0.5px -0.5px 0 rgba(0,0,0,0.55)",
                          "0.5px -0.5px 0 rgba(0,0,0,0.55)",
                          "-0.5px 0.5px 0 rgba(0,0,0,0.55)",
                          "0.5px 0.5px 0 rgba(0,0,0,0.55)",
                        ].join(", "),
                        letterSpacing: "0.005em",
                      }}
                    >
                      {role.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
