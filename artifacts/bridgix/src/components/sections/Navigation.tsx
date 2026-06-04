import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

function BridgixLogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.5 4.5L17 3L18.5 5.5L21 5.5L21 8.5L23 10L21.5 12L23 14L21 15.5L21 18.5L18.5 18.5L17 21L14.5 19.5L12 22L9.5 19.5L7 21L5.5 18.5L3 18.5L3 15.5L1 14L2.5 12L1 10L3 8.5L3 5.5L5.5 5.5L7 3L9.5 4.5Z"
        stroke="#1A7A4A" strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" stroke="#1A7A4A" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function BridgixLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <BridgixLogoMark size={22} />
      <span className="font-medium text-[18px] text-[#0A0A0A] tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
        Bridgix
      </span>
    </div>
  );
}

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (y / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "How it works", href: "#how-it-works" },
    { name: "Vetting", href: "#vetting" },
    { name: "Why Bridgix", href: "#why-bridgix" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <>
      {/* Scroll progress bar */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, height: "2px", zIndex: 9999,
          width: `${scrollProgress}%`,
          background: "linear-gradient(90deg, #1A7A4A, #34D399, #F5C518)",
          transition: "width 0.1s linear",
        }}
      />

      {/* Nav — always centered, only visual properties animate */}
      <nav
        style={{
          position: "fixed",
          zIndex: 50,
          left: "50%",
          transform: "translateX(-50%)",
          width: scrolled ? "min(780px, calc(100vw - 40px))" : "100%",
          top: scrolled ? "14px" : "0px",
          transition: "width 0.65s cubic-bezier(0.4, 0, 0.2, 1), top 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "width, top",
        }}
      >
        <div
          style={{
            borderRadius: scrolled ? "100px" : "0px",
            border: scrolled ? "1px solid rgba(0,0,0,0.09)" : "1px solid transparent",
            backdropFilter: scrolled ? "blur(18px)" : "blur(0px)",
            WebkitBackdropFilter: scrolled ? "blur(18px)" : "blur(0px)",
            background: scrolled ? "rgba(255,255,255,0.94)" : "transparent",
            boxShadow: scrolled
              ? "0 4px 28px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.6)"
              : "none",
            transition: [
              "border-radius 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
              "background 0.55s ease",
              "box-shadow 0.55s ease",
              "border-color 0.55s ease",
              "backdrop-filter 0.55s ease",
            ].join(", "),
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              maxWidth: scrolled ? "none" : "1120px",
              margin: "0 auto",
              padding: scrolled ? "11px 22px" : "16px 40px",
              transition: "padding 0.65s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <a href="#" className="flex-shrink-0">
              <BridgixLogo />
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[13px] font-normal text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors duration-200"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {/* Small icon mark accent */}
              <div style={{ opacity: scrolled ? 0 : 0, transition: "opacity 0.3s" }}>
                <BridgixLogoMark size={18} />
              </div>
              <button
                className="text-white font-normal text-[13px] py-[9px] px-[18px] transition-all duration-200 cursor-pointer"
                style={{
                  borderRadius: "100px",
                  background: "linear-gradient(135deg, #1A7A4A, #155E39)",
                  boxShadow: "0 2px 12px rgba(26,122,74,0.25)",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,122,74,0.42)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,122,74,0.25)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Find your engineer
              </button>
            </div>

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 text-[#0A0A0A] cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay Nav */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col p-6">
          <div className="flex items-center justify-between mb-12">
            <BridgixLogo />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#0A0A0A] cursor-pointer">
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[#0A0A0A] text-[20px] font-normal"
                style={{ fontFamily: "'Inter', sans-serif" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button
              className="text-white font-normal text-[15px] py-[14px] px-[24px] mt-4 cursor-pointer"
              style={{ borderRadius: "100px", background: "linear-gradient(135deg, #1A7A4A, #155E39)" }}
            >
              Find your engineer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
