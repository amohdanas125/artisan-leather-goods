import { useState } from "react";
import { toast } from "sonner";

import { track } from "@/lib/analytics";

export function NewsletterBand({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="bg-white dark:bg-card border-t border-border/40 py-10 lg:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 lg:flex-row">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-extrabold text-[#2C1810] dark:text-white sm:text-3xl tracking-tight">
            Stay Updated with Best Offers
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#736357] dark:text-muted-foreground">
            New drops, care tips and members-only pricing — straight to your inbox.
          </p>
        </div>
        <form
          className="flex w-full max-w-lg flex-col sm:flex-row items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            track("newsletter_signup", { source, method: "inline_band" });
            track("generate_lead", { source, currency: "INR", value: 200 });
            setDone(true);
            setEmail("");
            toast.success("You're subscribed", {
              description: "Watch your inbox for ₹500 off your first order.",
            });
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            aria-label="Email address"
            className="h-11 sm:h-12 w-full flex-1 rounded-full border border-[#8C6542]/50 bg-white px-5 text-sm text-ink outline-none placeholder:text-[#9E8E81] focus:border-[#3E2010] focus:ring-1 focus:ring-[#3E2010] dark:bg-background dark:border-border dark:text-white"
          />
          <button className="h-11 sm:h-12 w-full sm:w-auto shrink-0 rounded-full bg-[#3E2010] hover:bg-[#2A1509] px-7 text-sm font-bold text-white transition-colors cursor-pointer shadow-sm">
            {done ? "Subscribed" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
