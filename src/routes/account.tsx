import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  CheckCircle2,
  Heart,
  Home,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { api, type SavedAddress } from "@/lib/api";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account & Addresses — Terracotta Leather Co." },
      { name: "description", content: "Manage your profile details and saved shipping addresses." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "/account" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, logout, openAuthModal, hydrated, setUser } = useStore();

  // Profile State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<SavedAddress | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  // Address Form State
  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrCountry, setAddrCountry] = useState("India");
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoadingAddresses(true);
      const [profileRes, addrRes] = await Promise.all([
        api.account.profile.get().catch(() => null),
        api.account.addresses.getAll().catch(() => ({ addresses: [] })),
      ]);

      if (profileRes?.profile) {
        setProfileName(profileRes.profile.name || user.name || "");
        setProfilePhone(profileRes.profile.phone || "");
        setProfileEmail(profileRes.profile.email || user.email || "");
      } else {
        setProfileName(user.name || "");
        setProfileEmail(user.email || "");
      }

      if (addrRes?.addresses) {
        setAddresses(addrRes.addresses);
      }
    } catch (err) {
      console.error("Failed to load account data", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await api.account.profile.update({
        name: profileName.trim(),
        ...(profilePhone.trim() ? { phone: profilePhone.trim() } : {}),
      });
      if (user && res.profile) {
        setUser({ ...user, name: res.profile.name });
      }
      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const openNewAddressModal = () => {
    setEditingAddress(null);
    setAddrLabel("Home");
    setAddrFullName(profileName || user?.name || "");
    setAddrPhone(profilePhone || "");
    setAddrLine1("");
    setAddrLine2("");
    setAddrCity("");
    setAddrState("");
    setAddrPincode("");
    setAddrCountry("India");
    setAddrIsDefault(addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setAddrLabel(addr.label || "Home");
    setAddrFullName(addr.fullName || "");
    setAddrPhone(addr.phone || "");
    setAddrLine1(addr.line1 || "");
    setAddrLine2(addr.line2 || "");
    setAddrCity(addr.city || "");
    setAddrState(addr.state || "");
    setAddrPincode(addr.pincode || "");
    setAddrCountry(addr.country || "India");
    setAddrIsDefault(Boolean(addr.isDefault));
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName.trim() || !addrPhone.trim() || !addrLine1.trim() || !addrCity.trim() || !addrState.trim() || !addrPincode.trim()) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        label: addrLabel,
        fullName: addrFullName.trim(),
        phone: addrPhone.trim(),
        line1: addrLine1.trim(),
        ...(addrLine2.trim() ? { line2: addrLine2.trim() } : {}),
        city: addrCity.trim(),
        state: addrState.trim(),
        pincode: addrPincode.trim(),
        country: addrCountry.trim() || "India",
        isDefault: addrIsDefault,
      };

      if (editingAddress) {
        await api.account.addresses.update(editingAddress.id, payload);
        toast.success("Address updated successfully!");
      } else {
        await api.account.addresses.create(payload);
        toast.success("New address saved!");
      }

      setIsAddressModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefault = async (addrId: string) => {
    try {
      await api.account.addresses.update(addrId, { isDefault: true });
      toast.success("Default shipping address updated.");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to set default address.");
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await api.account.addresses.delete(addressToDelete.id);
      toast.success("Address deleted.");
      setAddressToDelete(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete address.");
    }
  };

  if (hydrated && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <div className="rounded-full bg-primary/10 p-5 text-primary">
            <Lock className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-ink">Account Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in or register an account to view and manage your profile details and saved shipping addresses.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary-dark cursor-pointer transition-colors"
          >
            Sign In / Register
          </button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF7]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary font-serif text-2xl font-bold text-primary-foreground shadow-md">
              {profileName ? profileName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
                  {profileName || "My Account"}
                </h1>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  {user?.role === "admin" ? "Store Administrator" : "Artisan Patron"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{profileEmail || user?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/orders"
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-ink shadow-2xs hover:border-primary hover:text-primary transition-colors"
            >
              <Package className="h-3.5 w-3.5" />
              <span>My Orders</span>
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-ink shadow-2xs hover:border-primary hover:text-primary transition-colors"
            >
              <Heart className="h-3.5 w-3.5" />
              <span>Wishlist</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                toast.info("You have been signed out.");
              }}
              className="flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 cursor-pointer transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left Column: Personal Profile Form (4 cols) */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-border/60 bg-[#F0E8DE] sm:bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <UserIcon className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-ink">Personal Profile</h2>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileEmail}
                      disabled
                      className="h-10 w-full rounded-xl border border-border/80 bg-muted/60 px-3 text-xs font-medium text-muted-foreground cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <Check className="h-3 w-3" /> Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-dark cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Changes…</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </form>
            </div>

            {/* Account Guarantee Badge Card */}
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Artisan Account</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-secondary-foreground">
                Your orders and custom embossings are covered by our lifetime guarantee on leather seams and hardware.
              </p>
            </div>
          </div>

          {/* Right Column: Saved Addresses (8 cols) */}
          <div className="space-y-6 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-ink sm:text-2xl">Saved Shipping Addresses</h2>
                <p className="text-xs text-muted-foreground">
                  Manage your delivery destinations for fast, 1-click checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewAddressModal}
                className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-dark cursor-pointer transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {loadingAddresses ? (
              <div className="flex items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-xs font-medium">Loading saved addresses…</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 bg-[#F0E8DE] sm:bg-card p-12 text-center">
                <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <h3 className="text-base font-bold text-ink">No saved addresses yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Save your home or office address to enjoy seamless 1-click checkout.
                </p>
                <button
                  type="button"
                  onClick={openNewAddressModal}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-dark cursor-pointer transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add First Address</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`relative flex flex-col justify-between rounded-3xl border bg-[#F0E8DE] sm:bg-card p-5 shadow-xs transition-all ${
                      addr.isDefault ? "border-primary/60 bg-[#F0E8DE] sm:bg-cream/30" : "border-border/60"
                    }`}
                  >
                    <div>
                      {/* Address Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {addr.label === "Office" || addr.label === "Work" ? (
                            <Building2 className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Home className="h-3.5 w-3.5 text-primary" />
                          )}
                          <span className="text-xs font-bold uppercase tracking-wider text-ink">
                            {addr.label || "Address"}
                          </span>
                        </div>

                        {addr.isDefault && (
                          <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                            <CheckCircle2 className="h-3 w-3" /> Default
                          </span>
                        )}
                      </div>

                      {/* Recipient Details */}
                      <p className="text-sm font-extrabold text-ink">{addr.fullName}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">
                        {addr.phone}
                      </p>

                      {/* Street Address */}
                      <p className="mt-2 text-xs text-secondary-foreground leading-relaxed">
                        {addr.line1}
                        {addr.line2 && <>, {addr.line2}</>}
                        <br />
                        {addr.city}, {addr.state} — <span className="font-semibold text-ink">{addr.pincode}</span>
                        <br />
                        {addr.country || "India"}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                      {!addr.isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr.id)}
                          className="font-bold text-primary hover:underline cursor-pointer"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Default Shipping
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditAddressModal(addr)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-secondary-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors"
                          title="Edit Address"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddressToDelete(addr)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer transition-colors"
                          title="Delete Address"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Address Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-2xl">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="text-xl font-bold text-ink">
              {editingAddress ? "Edit Shipping Address" : "Add New Shipping Address"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your accurate delivery details for swift order dispatch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-3.5 pt-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Address Label
              </label>
              <div className="flex gap-2">
                {["Home", "Work", "Studio", "Other"].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddrLabel(lbl)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      addrLabel === lbl
                        ? "bg-primary text-primary-foreground font-bold"
                        : "border border-border bg-background text-secondary-foreground hover:border-primary"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={addrFullName}
                  onChange={(e) => setAddrFullName(e.target.value)}
                  placeholder="Devika Sharma"
                  required
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                Address Line 1 (Street/Flat/Building) *
              </label>
              <input
                type="text"
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                placeholder="Flat 402, Royal Palms, MG Road"
                required
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                Address Line 2 (Landmark / Area)
              </label>
              <input
                type="text"
                value={addrLine2}
                onChange={(e) => setAddrLine2(e.target.value)}
                placeholder="Near Metro Station (optional)"
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                  City *
                </label>
                <input
                  type="text"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  placeholder="Bengaluru"
                  required
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                  State *
                </label>
                <input
                  type="text"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  placeholder="Karnataka"
                  required
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={addrPincode}
                  onChange={(e) => setAddrPincode(e.target.value)}
                  placeholder="560001"
                  required
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefaultCheckbox"
                checked={addrIsDefault}
                onChange={(e) => setAddrIsDefault(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isDefaultCheckbox" className="text-xs font-semibold text-ink cursor-pointer">
                Set as default shipping address
              </label>
            </div>

            <DialogFooter className="border-t border-border/60 pt-3 flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingAddress}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-dark cursor-pointer disabled:opacity-50 transition-colors"
              >
                {savingAddress && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{editingAddress ? "Update Address" : "Save Address"}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation */}
      <DeleteConfirmDialog
        isOpen={Boolean(addressToDelete)}
        title={`Delete "${addressToDelete?.label || "Address"}"?`}
        description="Are you sure you want to delete this saved shipping address from your account?"
        onCancel={() => setAddressToDelete(null)}
        onConfirm={handleDeleteAddress}
      />

      <SiteFooter />
    </div>
  );
}
