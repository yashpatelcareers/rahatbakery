"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  ExternalLink,
  Globe,
  Navigation,
  Undo2,
} from "lucide-react";
import { updateStoreInfoAction, revertStoreInfoAction } from "@/app/admin/info/actions";
import { formatTime12h, computeSummaryHours } from "@/lib/utils";
import type { SiteConfig, DaySchedule } from "@/types";

interface StoreInfoEditorProps {
  initialConfig: SiteConfig;
}

interface ToastNotice {
  id: string;
  message: string;
  type: "success" | "error";
}

// Custom SVGs for Instagram and TikTok
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );
}

const DEFAULT_DAYS: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday")[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function StoreInfoEditor({ initialConfig }: StoreInfoEditorProps) {
  // Ensure 7-day schedule exists
  const initialSchedule: DaySchedule[] =
    initialConfig.schedule && initialConfig.schedule.length === 7
      ? initialConfig.schedule
      : DEFAULT_DAYS.map((day) => {
          const isWeekend = day === "Friday" || day === "Saturday";
          return {
            day,
            isOpen: true,
            openTime: "13:00",
            closeTime: isWeekend ? "22:00" : "21:00",
            formattedText: isWeekend ? "1:00 PM – 10:00 PM" : "1:00 PM – 9:00 PM",
          };
        });

  // Form states
  const [name, setName] = useState(initialConfig.name || "RAHAT BAKERY");
  const [description, setDescription] = useState(initialConfig.description || "");
  const [url, setUrl] = useState(initialConfig.url || "https://rahatbakers.com");

  // Contact states
  const [phone, setPhone] = useState(initialConfig.contact.phone || "(240) 386-1236");
  const [email, setEmail] = useState(initialConfig.contact.email || "hello@rahatbakers.com");
  const [street, setStreet] = useState(
    initialConfig.contact.addressDetails?.street || "13919 Baltimore Ave"
  );
  const [unit, setUnit] = useState(initialConfig.contact.addressDetails?.unit || "Unit 4");
  const [city, setCity] = useState(initialConfig.contact.addressDetails?.city || "Laurel");
  const [state, setState] = useState(initialConfig.contact.addressDetails?.state || "MD");
  const [zip, setZip] = useState(initialConfig.contact.addressDetails?.zip || "20707");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    initialConfig.contact.googleMapsUrl ||
      "https://maps.google.com/?q=Rahat+Bakers+and+Sweets+Laurel+MD"
  );

  // Social states
  const [instagram, setInstagram] = useState(
    initialConfig.social?.instagram || "https://www.instagram.com/rahatbakerymd/"
  );
  const [tiktok, setTiktok] = useState(
    initialConfig.social?.tiktok || "https://www.tiktok.com/discover/rahat-bakery"
  );

  // 7-Day Schedule state
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  function showToast(message: string, type: "success" | "error" = "success") {
    const nextId = String(toastCounter + 1);
    setToastCounter((c) => c + 1);
    setToasts((prev) => [...prev, { id: nextId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== nextId));
    }, 4500);
  }

  // Update schedule day
  function handleDayScheduleChange(
    index: number,
    field: keyof DaySchedule,
    value: string | boolean
  ) {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  // Compute live preview summary
  const summaryHours = computeSummaryHours(schedule);

  // Save form
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage("Business name cannot be empty.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }
    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      setErrorMessage("Please fill in all address fields (Street, City, State, ZIP).");
      return;
    }

    setIsSubmitting(true);

    const unitPart = unit.trim() ? ` ${unit.trim()}` : "";
    const fullAddress = `${street.trim()}${unitPart}, ${city.trim()}, ${state.trim()} ${zip.trim()}`;

    const payload: SiteConfig = {
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      social: {
        instagram: instagram.trim(),
        tiktok: tiktok.trim(),
      },
      contact: {
        phone: phone.trim(),
        email: email.trim(),
        address: fullAddress,
        addressDetails: {
          street: street.trim(),
          unit: unit.trim(),
          city: city.trim(),
          state: state.trim(),
          zip: zip.trim(),
        },
        googleMapsUrl: googleMapsUrl.trim(),
      },
      hours: summaryHours,
      schedule,
    };

    try {
      const result = await updateStoreInfoAction(payload);

      if (!result.success) {
        setErrorMessage(result.error || "Failed to update store information.");
        showToast(result.error || "Failed to update store information.", "error");
        setIsSubmitting(false);
        return;
      }

      showToast("Store information and hours updated successfully!");
    } catch (err) {
      console.error("[Store Info Editor] Save error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "A network error occurred while saving."
      );
      showToast("Failed to save changes. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 ${
              toast.type === "success"
                ? "bg-emerald-950 text-emerald-100 border-emerald-800"
                : "bg-destructive text-white border-destructive/80"
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium leading-snug">
              {toast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-2 border border-primary/20">
            <Store className="w-3.5 h-3.5" />
            <span>Store Information CMS</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Store Information & Hours
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage business details, operating hours, contact numbers, and social channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/50 bg-white text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary hover:border-primary/40 transition-colors shadow-2xs"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View Live Storefront</span>
          </Link>

          {initialConfig.previousConfig && (
            <button
              type="button"
              onClick={async () => {
                if (
                  !window.confirm(
                    "Revert to previous store information? Any unsaved edits will be replaced."
                  )
                ) {
                  return;
                }
                try {
                  const res = await revertStoreInfoAction();
                  if (res.success && res.updatedConfig) {
                    const cfg = res.updatedConfig;
                    setName(cfg.name || "");
                    setDescription(cfg.description || "");
                    setUrl(cfg.url || "");
                    setPhone(cfg.contact.phone || "");
                    setEmail(cfg.contact.email || "");
                    setStreet(cfg.contact.addressDetails?.street || "");
                    setUnit(cfg.contact.addressDetails?.unit || "");
                    setCity(cfg.contact.addressDetails?.city || "");
                    setState(cfg.contact.addressDetails?.state || "");
                    setZip(cfg.contact.addressDetails?.zip || "");
                    setInstagram(cfg.social.instagram || "");
                    setTiktok(cfg.social.tiktok || "");
                    if (cfg.schedule && cfg.schedule.length === 7) {
                      setSchedule(cfg.schedule);
                    }
                    showToast("Reverted to previous version successfully.");
                  } else {
                    showToast(res.error || "Failed to revert.", "error");
                  }
                } catch {
                  showToast("A network error occurred while reverting.", "error");
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/50 bg-white text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-[#faf9f6] transition-colors shadow-2xs"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Revert</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-black hover:text-white transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/25 text-destructive text-xs font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Business Identity & Description */}
      <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">
              Business Identity
            </h2>
            <p className="text-xs text-muted-foreground">
              Primary brand name and website summary text.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="business-name"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Business Name
            </label>
            <input
              id="business-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-sm font-serif font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="website-url"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Canonical Website URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="website-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="business-description"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Business Description / Summary Text
            </label>
            <textarea
              id="business-description"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact & Physical Location */}
      <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">
              Contact & Location
            </h2>
            <p className="text-xs text-muted-foreground">
              Customer phone number, email, street address, and Google Maps destination.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="store-phone"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="store-phone"
                type="text"
                required
                placeholder="(240) 386-1236"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="store-email"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="store-email"
                type="email"
                required
                placeholder="hello@rahatbakers.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          {/* Address Breakdown */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="street-address"
                className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
              >
                Street Address
              </label>
              <input
                id="street-address"
                type="text"
                required
                placeholder="13919 Baltimore Ave"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="unit-address"
                className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
              >
                Suite / Unit
              </label>
              <input
                id="unit-address"
                type="text"
                placeholder="Unit 4"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="city-address"
                className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
              >
                City
              </label>
              <input
                id="city-address"
                type="text"
                required
                placeholder="Laurel"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="state-address"
                className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
              >
                State
              </label>
              <input
                id="state-address"
                type="text"
                required
                placeholder="MD"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="zip-address"
                className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
              >
                ZIP Code
              </label>
              <input
                id="zip-address"
                type="text"
                required
                placeholder="20707"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="maps-url"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Google Maps Location Link
            </label>
            <div className="relative">
              <Navigation className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="maps-url"
                type="url"
                placeholder="https://maps.google.com/?q=Rahat+Bakers+and+Sweets+Laurel+MD"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. 7-Day Business Operating Hours */}
      <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">
                Operating Hours Schedule
              </h2>
              <p className="text-xs text-muted-foreground">
                Set individual opening and closing times for each day of the week.
              </p>
            </div>
          </div>

          {/* Live Computed Summary Badge */}
          <div className="flex flex-wrap items-center gap-2">
            {summaryHours.map((h, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-[#faf9f6] border border-border/40 text-[10px] font-bold text-primary uppercase tracking-wider"
              >
                {h.day}: {h.hours}
              </span>
            ))}
          </div>
        </div>

        {/* Day-by-Day Schedule List */}
        <div className="divide-y divide-border/25">
          {schedule.map((dayItem, index) => {
            return (
              <div
                key={dayItem.day}
                className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      dayItem.isOpen ? "bg-emerald-500" : "bg-destructive"
                    }`}
                  />
                  <span className="font-serif font-bold text-sm text-foreground">
                    {dayItem.day}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-start sm:justify-end">
                  {/* Open / Closed Toggle */}
                  <label className="inline-flex items-center gap-2 cursor-pointer mr-2">
                    <input
                      type="checkbox"
                      checked={dayItem.isOpen}
                      onChange={(e) =>
                        handleDayScheduleChange(index, "isOpen", e.target.checked)
                      }
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                    />
                    <span className="text-xs font-semibold text-foreground/80">
                      {dayItem.isOpen ? "Open" : "Closed"}
                    </span>
                  </label>

                  {/* Time Inputs */}
                  {dayItem.isOpen ? (
                    <div className="flex items-center gap-2 animate-in fade-in duration-150">
                      <input
                        type="time"
                        value={dayItem.openTime}
                        onChange={(e) =>
                          handleDayScheduleChange(index, "openTime", e.target.value)
                        }
                        className="px-2.5 py-1.5 bg-[#faf9f6] border border-border/50 rounded-lg text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <span className="text-xs text-muted-foreground font-semibold">to</span>
                      <input
                        type="time"
                        value={dayItem.closeTime}
                        onChange={(e) =>
                          handleDayScheduleChange(index, "closeTime", e.target.value)
                        }
                        className="px-2.5 py-1.5 bg-[#faf9f6] border border-border/50 rounded-lg text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <span className="hidden md:inline text-[11px] text-muted-foreground font-light pl-2">
                        ({formatTime12h(dayItem.openTime)} – {formatTime12h(dayItem.closeTime)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-destructive px-3 py-1 bg-destructive/10 rounded-lg">
                      Closed All Day
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Social Media Channels */}
      <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">
              Social Media Channels
            </h2>
            <p className="text-xs text-muted-foreground">
              Official Instagram and TikTok profiles linked in the site header and footer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="instagram-url"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Instagram Profile URL
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <InstagramIcon />
              </div>
              <input
                id="instagram-url"
                type="url"
                placeholder="https://www.instagram.com/rahatbakerymd/"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="tiktok-url"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              TikTok Profile URL
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <TikTokIcon />
              </div>
              <input
                id="tiktok-url"
                type="url"
                placeholder="https://www.tiktok.com/discover/rahat-bakery"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Save Bar */}
      <div className="sticky bottom-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-xl flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground font-medium hidden sm:block">
          Changes will immediately synchronize across the live public website and footer.
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-black hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
