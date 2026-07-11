import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import logoImage from "@assets/Screenshot_2026-06-04-07-57-10-533_com.canva.editor-edit_17805_1780625194177.jpg";

export function Navigation() {
  const [, navigate] = useLocation();
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
    { name: "Why Bridigix", href: "#why-bridgix" },
    { name: "FAQ", href: "#faq" },
  ];

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div
        style={{
          position: "fixed", top: 0, left: 0, height: "2px", zIndex: 9999,
          width: `${scrollProgress}%`,
          background: "linear-gradient(90deg, #1A7A4A, #34D399, #F5C518)",
          transition: "width 0.1s linear",
        }}
      />

      <nav
        style={{
          position: "fixed",
          zIndex: 50,
          left: "50%",
          transform: "translateX(-50%)",
          width: scrolled ? "min(760px, calc(100vw - 40px))" : "100%",
          top: scrolled ? "12px" : "0px",
          transition: "width 0.65s cubic-bezier(0.4, 0, 0.2, 1), top 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "width, top",
        }}
      >
        <div
          style={{
            borderRadius: scrolled ? "100px" : "0px",
            border: scrolled ? "1px solid rgba(0,0,0,0.07)" : "1px solid transparent",
            backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
            WebkitBackdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
            background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
            boxShadow: scrolled
              ? "0 2px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03), inset 0 0 0 1px rgba(255,255,255,0.6)"
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
              padding: scrolled ? "8px 18px" : "14px 40px",
              transition: "padding 0.65s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <a href="#" onClick={scrollToTop} className="flex-shrink-0 flex items-center gap-2.5">
              <img
                src={logoImage}
                alt="Bridigix"
                style={{ width: scrolled ? 26 : 28, height: scrolled ? 26 : 28, objectFit: "contain", transition: "width 0.3s, height 0.3s" }}
              />
              <span className="font-medium text-[17px] text-[#0A0A0A] tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Bridigix
              </span>
            </a>

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
              <button
                onClick={() => navigate("/recruiter-intake")}
                className="text-white font-normal text-[13px] cursor-pointer"
                style={{
                  borderRadius: "100px",
                  background: "linear-gradient(135deg, #1A7A4A, #155E39)",
                  boxShadow: "0 2px 10px rgba(26,122,74,0.22)",
                  fontFamily: "'Inter', sans-serif",
                  padding: scrolled ? "7px 16px" : "9px 18px",
                  transition: "padding 0.3s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 4px 18px rgba(26,122,74,0.4)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(26,122,74,0.22)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Find your engineer
              </button>
            </div>

            <button
              className="md:hidden p-2 text-[#0A0A0A] cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col p-6">
          <div className="flex items-center justify-between mb-12">
            <a href="#" onClick={e => { scrollToTop(e); setMobileMenuOpen(false); }} className="flex items-center gap-2.5">
              <img src={logoImage} alt="Bridigix" style={{ width: 26, height: 26, objectFit: "contain" }} />
              <span className="font-medium text-[17px] text-[#0A0A0A] tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Bridigix
              </span>
            </a>
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
              onClick={() => navigate("/recruiter-intake")}
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
