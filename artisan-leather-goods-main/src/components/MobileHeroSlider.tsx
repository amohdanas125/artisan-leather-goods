import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import heroImg from "@/assets/hero-leather.jpg";
import crossbodyImg from "@/assets/p-crossbody.jpg";
import duffelImg from "@/assets/p-duffel.jpg";
import walletImg from "@/assets/p-wallet.jpg";
import { track } from "@/lib/analytics";

interface Slide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaSlug: string;
  img: string;
  accent?: string;
}

const slides: Slide[] = [
  {
    id: "lifetime-leather",
    badge: "HANDCRAFTED HERITAGE",
    title: "Leather Crafted to Last a Lifetime",
    subtitle: "Everyday carry to travel essentials — made from full-grain leather that only gets better with age.",
    ctaText: "Shop Now",
    ctaSlug: "bags",
    img: heroImg,
  },
  {
    id: "travel-duffels",
    badge: "WEEKEND ESCAPES",
    title: "Timeless Travel & Duffel Bags",
    subtitle: "Engineered for spontaneous escapes with solid brass hardware and reinforced stitching.",
    ctaText: "Explore Travel",
    ctaSlug: "travel",
    img: duffelImg,
  },
  {
    id: "crossbody-totes",
    badge: "URBAN ESSENTIALS",
    title: "Hawthorn Crossbody & Totes",
    subtitle: "Structured, durable leather designed for daily commutes and weekend adventures.",
    ctaText: "Explore Bags",
    ctaSlug: "bags",
    img: crossbodyImg,
  },
  {
    id: "slim-wallets",
    badge: "ARTISAN SLIMLINE",
    title: "Minimalist Wallets & Cardholders",
    subtitle: "Hand-stitched full-grain leather designed for effortless front-pocket carry.",
    ctaText: "Shop Wallets",
    ctaSlug: "wallets",
    img: walletImg,
  },
];

export function MobileHeroSlider() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    resetTimer();
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    resetTimer();
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    resetTimer();
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-black select-none sm:hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ height: "calc(100vh - 60px)", minHeight: "520px", maxHeight: "680px" }}
    >
      {/* Slides Container */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {/* Background Image */}
              <img
                src={slide.img}
                alt={slide.title}
                className="h-full w-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
              />

              {/* Dark Gradient Overlay for Maximum Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

              {/* Genuine Leather Floating Tag (Top Right) */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white/90 border border-white/15">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>100% Genuine</span>
              </div>

              {/* Text & Content Overlay (Centered/Bottom aligned) */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 pb-16 text-center">
                {/* Badge */}
                <div className="mb-2.5 flex justify-center">
                  <span className="inline-flex items-center rounded-full bg-primary px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary-foreground shadow-sm">
                    {slide.badge}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-extrabold leading-tight text-white tracking-tight drop-shadow-md">
                  {slide.title}
                </h2>

                {/* Subtitle */}
                <p className="mt-2 text-xs leading-relaxed text-white/80 max-w-xs mx-auto drop-shadow-xs">
                  {slide.subtitle}
                </p>

                {/* CTA Button */}
                <div className="mt-5 flex justify-center">
                  <Link
                    to="/category/$slug"
                    params={{ slug: slide.ctaSlug }}
                    onClick={() => track("cta_click", { cta: `mobile_hero_${slide.id}` })}
                    className="w-full max-w-xs rounded-full bg-primary py-3 px-6 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary-dark active:scale-95 transition-all text-center cursor-pointer"
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Left / Right Circular Buttons) */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 shadow-md active:scale-90 transition-all cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 shadow-md active:scale-90 transition-all cursor-pointer"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Bottom Dot Indicators */}
      <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => goToSlide(idx)}
            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
              idx === current ? "w-6 bg-white shadow-xs" : "w-1.5 bg-white/45"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
