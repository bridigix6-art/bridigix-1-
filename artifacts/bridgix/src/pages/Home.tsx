import { Navigation } from "@/components/sections/Navigation";
import { Hero } from "@/components/sections/Hero";
import { PartnerIntro } from "@/components/sections/PartnerIntro";
import { RolesWePlace } from "@/components/sections/RolesWePlace";
import { ProcessAccordion } from "@/components/sections/ProcessAccordion";
import { Vetting } from "@/components/sections/Vetting";
import { WhyBridgix } from "@/components/sections/WhyBridgix";
import { FAQ } from "@/components/sections/FAQ";
import { CTABanner } from "@/components/sections/CTABanner";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <div
        className="bg-[#FFFFFF] min-h-screen text-[#0A0A0A] overflow-x-hidden"
        style={{ WebkitFontSmoothing: "antialiased", textRendering: "optimizeLegibility" } as React.CSSProperties}
      >
        <Navigation />
        <main>
          <Hero />
          <PartnerIntro />
          <RolesWePlace />
          <ProcessAccordion />
          <Vetting />
          <WhyBridgix />
          <FAQ />
          <CTABanner />
        </main>
        <Footer />
      </div>
    </>
  );
}
