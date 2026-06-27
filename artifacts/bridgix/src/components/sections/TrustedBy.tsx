import React from "react";

export function TrustedBy() {
  const companies = ["Notion", "Linear", "Vercel", "Figma", "Supabase", "Arc", "Raycast", "Loom", "Pitch", "Cron"];

  return (
    <section
      className="w-full py-[28px] overflow-hidden"
      style={{
        borderTop: "1px solid #E8E8E8",
        borderBottom: "1px solid #E8E8E8",
        background: "linear-gradient(90deg, rgba(244,114,182,0.03) 0%, rgba(255,255,255,1) 20%, rgba(255,255,255,1) 80%, rgba(139,92,246,0.03) 100%)",
      }}
    >
      <div className="max-w-[1120px] mx-auto px-6 flex flex-col md:flex-row md:items-center gap-6">
        <span
          className="text-[11px] font-normal text-[#6B6B6B] uppercase whitespace-nowrap flex-shrink-0"
          style={{ letterSpacing: "0.1em" }}
        >
          Trusted by teams at
        </span>

        <div className="relative w-full overflow-hidden flex items-center">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{
            background: "linear-gradient(to right, rgba(255,255,255,1), transparent)"
          }} />
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{
            background: "linear-gradient(to left, rgba(255,255,255,1), transparent)"
          }} />

          <div className="flex w-max gap-10 animate-marquee hover:[animation-play-state:paused]">
            {[...companies, ...companies].map((company, i) => (
              <React.Fragment key={i}>
                <span className="text-[14px] font-semibold text-[#0A0A0A]" style={{ opacity: 0.45 }}>{company}</span>
                <span className="text-[14px] text-[#D0D0D0]" style={{ opacity: 0.5 }}>·</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
