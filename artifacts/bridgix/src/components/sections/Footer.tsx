import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@assets/Screenshot_2026-06-04-07-57-10-533_com.canva.editor-edit_17805_1780625194177.jpg";
import { apiEndpoint } from "@/lib/api";

export function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(apiEndpoint("/api/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const quickLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Vetting", href: "#vetting" },
    { label: "Why Bridigix", href: "#why-bridgix" },
    { label: "FAQ", href: "#faq" },
    { label: "Join Network", href: "/join" },
  ];

  const companyLinks = [
    { label: "About", href: "#" },
    { label: "Privacy Policy", onClick: () => setModalOpen(true) },
    { label: "Contact", href: "mailto:hareem@bridigix.org" },
  ];

  return (
    <>
      <footer className="relative overflow-hidden" style={{ background: "#08080A" }}>
        <div className="h-px w-full" style={{
          background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.4), rgba(26,122,74,0.35), rgba(245,200,66,0.2), transparent)",
        }} />

        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.012) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 20% 80%, rgba(26,122,74,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(52,211,153,0.04) 0%, transparent 50%)",
        }} />

        <div className="relative max-w-[1160px] mx-auto px-6">

          {/* Main footer grid */}
          <div className="py-14 grid grid-cols-1 md:grid-cols-4 gap-10 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {/* Brand column */}
            <div className="md:col-span-2 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "transparent",
                }}>
                  <img
                    src={logoImage}
                    alt="Bridigix"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      mixBlendMode: "screen",
                      filter: "brightness(1.15) contrast(1.05)",
                    }}
                  />
                </div>
                <span
                  className="font-medium text-[19px] tracking-[-0.03em]"
                  style={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.92)" }}
                >
                  Bridigix
                </span>
              </div>
              <p
                className="text-[13px] font-light leading-[1.7] max-w-[300px]"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}
              >Engineering hiring that works the first time. We match founders with pre-vetted engineers.</p>

              {/* Newsletter */}
              <div className="mt-2">
                <p className="text-[12px] font-medium mb-3 uppercase tracking-[0.08em]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
                  Stay in the loop
                </p>
                {submitted ? (
                  <div className="flex items-center gap-2">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
                    <span className="text-[13px]" style={{ color: "#34D399", fontFamily: "'Inter', sans-serif" }}>You're in. We'll be in touch.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 text-[13px]"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: "8px",
                        padding: "9px 14px",
                        color: "rgba(255,255,255,0.8)",
                        fontFamily: "'Inter', sans-serif",
                        outline: "none",
                        minWidth: 0,
                      }}
                      onFocus={e => { e.target.style.borderColor = "rgba(52,211,153,0.4)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; }}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="text-[13px] font-medium cursor-pointer flex-shrink-0"
                      style={{
                        background: submitting ? "rgba(26,122,74,0.5)" : "linear-gradient(135deg, #1A7A4A, #2A9D5C)",
                        borderRadius: "8px",
                        padding: "9px 16px",
                        border: "none",
                        color: "white",
                        fontFamily: "'Inter', sans-serif",
                        cursor: submitting ? "wait" : "pointer",
                      }}
                    >
                      {submitting ? "..." : "Subscribe"}
                    </button>
                  </form>
                )}
              </div>

              {/* Social */}
              <div className="flex gap-3 mt-1">
                <a
                  href="https://www.linkedin.com/company/bridigix/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-200 flex items-center justify-center"
                  style={{
                    width: 34, height: 34, borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a
                  href="mailto:hareem@bridigix.org"
                  className="transition-all duration-200 flex items-center justify-center"
                  style={{
                    width: 34, height: 34, borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div className="flex flex-col gap-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.10em]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
                Quick Links
              </h4>
              {quickLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[13px] font-light transition-colors duration-200 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Company */}
            <div className="flex flex-col gap-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.10em]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
                Company
              </h4>
              {companyLinks.map(link => (
                link.onClick ? (
                  <button
                    key={link.label}
                    type="button"
                    onClick={link.onClick}
                    className="text-[13px] font-light transition-colors duration-200 hover:text-white text-left cursor-pointer"
                    style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif", background: "none", border: "none", padding: 0 }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-[13px] font-light transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}
                  >
                    {link.label}
                  </a>
                )
              ))}
              <a
                href="mailto:hareem@bridigix.org"
                className="text-[13px] font-light transition-colors duration-200 hover:text-white mt-1"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}
              >
                hareem@bridigix.org
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-[12px] font-light" style={{ color: "rgba(255,255,255,0.22)", fontFamily: "'Inter', sans-serif" }}>
              &copy; 2025 Bridigix. All rights reserved.
            </span>
            <div className="flex items-center gap-5">
              <span className="text-[12px] font-light" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "'Inter', sans-serif" }}>
                Engineering hiring, done right.
              </span>
              <div className="flex items-center gap-1.5">
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34D399" }} />
                <span className="text-[11px]" style={{ color: "rgba(52,211,153,0.7)", fontFamily: "'Inter', sans-serif" }}>All systems operational</span>
              </div>
            </div>
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
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-2 -mr-2 -mt-2 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="text-[14px] text-[#3D3D3D] leading-[1.8] flex flex-col gap-4 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                <p>Last updated: January 2025. Bridigix ('we', 'our', 'us') is committed to protecting your personal data.</p>
                <p><strong className="font-medium text-[#0A0A0A]">Information We Collect:</strong> We collect information you provide directly to us, such as your name, email address, company name, and role requirements when you enquire about our services. We also collect certain technical data such as IP address, browser timezone, and session information to personalise your experience.</p>
                <p><strong className="font-medium text-[#0A0A0A]">Cookies:</strong> We use cookies and local storage to remember your preferences, track session state, and provide personalised greetings based on your local timezone.</p>
                <p><strong className="font-medium text-[#0A0A0A]">How We Use Your Information:</strong> We use the information we collect to provide, improve, and personalise our services; match candidates with appropriate opportunities; communicate with you about our services; and comply with legal obligations.</p>
                <p><strong className="font-medium text-[#0A0A0A]">Data Retention:</strong> We retain your personal data only for as long as necessary to provide our services.</p>
                <p><strong className="font-medium text-[#0A0A0A]">Contact Us:</strong> For any data protection queries, contact us at <a href="mailto:hareem@bridigix.org" className="text-[#1A7A4A]">hareem@bridigix.org</a>.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
