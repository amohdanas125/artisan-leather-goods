import { Headphones, RotateCcw, ShieldCheck, Wallet } from "lucide-react";

const trustItems = [
  { label: "100% Genuine Leather", icon: ShieldCheck },
  { label: "Secure Payments", icon: Wallet },
  { label: "Easy 7-Day Returns", icon: RotateCcw },
  { label: "24/7 Support", icon: Headphones },
];

// Duplicate items to guarantee a continuous, uninterrupted infinite loop
const marqueeItems = [...trustItems, ...trustItems, ...trustItems, ...trustItems];

export function TrustStrip() {
  return (
    <section className="relative w-full overflow-hidden bg-[#3E2010] py-2.5 sm:py-3 lg:py-2 border-y border-[#522D18] shadow-inner">
      {/* Left and right fade gradient masks for smooth edge transitions */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 sm:w-20 bg-gradient-to-r from-[#3E2010] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 sm:w-20 bg-gradient-to-l from-[#3E2010] to-transparent" />

      {/* Infinite Scrolling Marquee Track */}
      <div className="flex w-max animate-marquee items-center gap-8 sm:gap-12 lg:gap-14 select-none hover:[animation-play-state:paused]">
        {marqueeItems.map(({ label, icon: Icon }, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 lg:h-7.5 lg:w-7.5 items-center justify-center rounded-full bg-[#F5EDE4] text-[#3E2010] shadow-2xs">
              <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" strokeWidth={2} />
            </span>
            <span className="text-xs sm:text-[13px] lg:text-xs font-bold text-white whitespace-nowrap tracking-wide">
              {label}
            </span>
            <span className="ml-5 sm:ml-7 lg:ml-8 h-1.5 w-1.5 rounded-full bg-[#F5EDE4]/50 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
