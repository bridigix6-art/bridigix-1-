import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function BridgixLogo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14.5 4.5L17 3L18.5 5.5L21 5.5L21 8.5L23 10L21.5 12L23 14L21 15.5L21 18.5L18.5 18.5L17 21L14.5 19.5L12 22L9.5 19.5L7 21L5.5 18.5L3 18.5L3 15.5L1 14L2.5 12L1 10L3 8.5L3 5.5L5.5 5.5L7 3L9.5 4.5Z"
          stroke={dark ? "#34D399" : "#1A7A4A"} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" stroke={dark ? "#34D399" : "#1A7A4A"} strokeWidth="1.5" fill="none" />
      </svg>
      <span
        className="font-normal text-[17px] tracking-[-0.02em]"
        style={{
          fontFamily: "'Inter', sans-serif",
          color: dark ? "rgba(255,255,255,0.85)" : "#0A0A0A",
        }}
      >
        Bridgix
      </span>
    </div>
  );
}

export function Footer() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <footer
        className="relative overflow-hidden"
        style={{ background: "#09090B" }}
      >
        {/* Top gradient line */}
        <div className="h-px w-full" style={{
          background: "linear-gradient(90deg, transparent, rgba(244,114,182,0.3), rgba(139,92,246,0.3), rgba(26,122,74,0.3), rgba(245,200,66,0.2), transparent)",
        }} />

        {/* Subtle texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(26,122,74,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(139,92,246,0.04) 0%, transparent 50%)",
        }} />

        <div className="relative max-w-[1120px] mx-auto px-6 py-[48px]">
          {/* Main footer row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            {/* Logo + tagline */}
            <div className="flex flex-col gap-3">
              <BridgixLogo dark />
              <p
                className="text-[13px] font-light max-w-[280px] leading-[1.6]"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}
              >
                Engineering hiring that works the first time
                <span style={{ fontSize: "0.6em", verticalAlign: "super", opacity: 0.5 }}>.</span>
              </p>
            </div>

            {/* Nav links */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              {[
                { label: "How it works", href: "#how-it-works" },
                { label: "Vetting", href: "#vetting" },
                { label: "Why Bridgix", href: "#why-bridgix" },
                { label: "FAQ", href: "#faq" },
              ].map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[13px] font-light transition-colors duration-200 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.40)", fontFamily: "'Inter', sans-serif" }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Contact + social */}
            <div className="flex flex-col gap-3 items-start md:items-end">
              <a
                href="mailto:hareem@bridgix.org"
                className="text-[13px] font-light transition-colors duration-200 hover:text-white"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}
              >
                hareem@bridgix.org
              </a>
              <a
                href="https://www.linkedin.com/company/bridigix/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full mb-6" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Bottom row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <span
              className="text-[12px] font-light"
              style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif" }}
            >
              &copy; 2025 Bridgix<span style={{ opacity: 0.5 }}>.</span> All rights reserved
              <span style={{ opacity: 0.5 }}>.</span>
            </span>
            <button
              onClick={() => setModalOpen(true)}
              className="text-[12px] font-light transition-colors duration-200 cursor-pointer hover:text-white"
              style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif", background: "none", border: "none" }}
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, type: "spring", bounce: 0 }}
              className="bg-white rounded-[20px] w-full max-w-[680px] max-h-[80vh] overflow-y-auto relative z-10 shadow-2xl"
              style={{ padding: "32px" }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px]" style={{
                background: "linear-gradient(90deg, #1A7A4A, #8B5CF6, #F472B6)"
              }} />
              <div className="flex justify-between items-start mb-8 mt-2">
                <h2 className="text-[22px] text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>Privacy Policy</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 -mr-2 -mt-2 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="text-[14px] text-[#3D3D3D] leading-[1.8] flex flex-col gap-4 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                <p>Last updated: January 2025. Bridgix ('we', 'our', 'us') is committed to protecting your personal data.</p>
                <p><strong className="font-medium text-[#0A0A0A]">Information We Collect:</strong> We collect information you provide directly to us, such as your name, email address, company name, and role requirements when you enquire about our services.</p>
                <p><strong className="font-medium text-[#0A0A0A]">How We Use Your Information:</strong> We use the information we collect to provide, improve, and personalise our services; match candidates with appropriate opportunities; communicate with you about our services; and comply with legal obligations.</p>
                <p><strong className="font-medium text-[#0A0A0A]">Data Retention:</strong> We retain your personal data only for as long as necessary to provide our services.</p>
                <p><strong className="font-medium text-[#0A0A0A]">Contact Us:</strong> For any data protection queries, contact us at <a href="mailto:hareem@bridgix.org" className="text-[#1A7A4A]">hareem@bridgix.org</a>.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
