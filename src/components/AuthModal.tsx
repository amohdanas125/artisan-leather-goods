import { useState } from "react";
import {
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

export function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, login, signup } =
    useStore();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!loginPassword) {
      toast.error("Please enter your password.");
      return;
    }

    setLoginLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      toast.success("Welcome back! You are now logged in.");
      setLoginEmail("");
      setLoginPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setSignupLoading(true);
    try {
      await signup(signupName.trim(), signupEmail.trim(), signupPassword, signupPhone.trim());
      toast.success(`Account created! Welcome to Terracotta, ${signupName.trim()}.`);
      setSignupName("");
      setSignupEmail("");
      setSignupPhone("");
      setSignupPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast.info("Please enter your email address above to receive a reset link.");
      return;
    }
    try {
      await api.auth.forgotPassword(loginEmail.trim());
      toast.success(`Password reset link sent to ${loginEmail.trim()}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link.");
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-border bg-card p-0 shadow-2xl">
        {/* Header decoration */}
        <div className="bg-cream px-6 pb-6 pt-8 text-center border-b border-border/60">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Briefcase className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-primary">
            Terra<span className="text-ink">cotta</span>
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground">
            Handcrafted Full-Grain Leather Goods Since 1998
          </DialogDescription>

          {/* Tab Switcher */}
          <div className="mt-5 grid grid-cols-2 rounded-full border border-border/80 bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className={`rounded-full py-1.5 text-xs font-bold transition-all cursor-pointer ${
                authModalTab === "login"
                  ? "bg-card text-ink shadow-xs"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("signup")}
              className={`rounded-full py-1.5 text-xs font-bold transition-all cursor-pointer ${
                authModalTab === "signup"
                  ? "bg-card text-ink shadow-xs"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {authModalTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email or Mobile
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-70 cursor-pointer"
              >
                {loginLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    required
                    className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Get ₹500 off on your first handcrafted leather order!</span>
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-70 cursor-pointer"
              >
                {signupLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
