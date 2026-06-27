import React from "react";

export function Logomark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-2 h-2 rotate-45 border-[1.5px] border-[#1A7A4A] flex-shrink-0" />
      <span className="font-semibold text-[18px] text-[#0A0A0A] tracking-[-0.02em] leading-none">
        Bridigix
      </span>
    </div>
  );
}