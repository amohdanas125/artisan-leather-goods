import { Headphones, RotateCcw, ShieldCheck, Wallet } from "lucide-react";

const trust = [
  { label: "100% Genuine Leather", icon: ShieldCheck },
  { label: "Secure Payments", icon: Wallet },
  { label: "Easy 7-Day Returns", icon: RotateCcw },
  { label: "24/7 Support", icon: Headphones },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {trust.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center justify-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-6 w-6" strokeWidth={1.6} />
            </span>
            <span className="text-sm font-semibold text-ink">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
