import { useState } from "react";
import { toast } from "sonner";

import { track } from "@/lib/analytics";

export function NewsletterBand({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="bg-primary-dark">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 lg:flex-row">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-extrabold text-primary-foreground">
            Stay Updated with Best Offers
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/75">
            New drops, care tips and members-only pricing — straight to your inbox.
          </p>
        </div>
        <form
          className="flex w-full max-w-md flex-col sm:flex-row gap-3"
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
            className="h-12 w-full flex-1 rounded-full bg-card px-5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
          <button className="h-12 w-full sm:w-auto shrink-0 rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark cursor-pointer shadow-md">
            {done ? "Subscribed" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
