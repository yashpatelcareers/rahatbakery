"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Plus,
  Trash2,
  Edit2,
  X,
  Sparkles,
  Key,
} from "lucide-react";
import {
  updateReviewsConfigAction,
  syncReviewsAction,
} from "@/app/admin/reviews/actions";
import type { EffectiveReviewsResult, ReviewsConfig } from "@/lib/server/reviews-service";
import type { GoogleReviewItem } from "@/types";

interface ReviewsManagerProps {
  initialConfig: ReviewsConfig;
  effectiveData: EffectiveReviewsResult;
  hasServerApiKey: boolean;
  hasServerPlaceId: boolean;
}

interface ToastNotice {
  id: string;
  message: string;
  type: "success" | "error";
}

function StarRatingDisplay({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className="flex items-center gap-0.5 text-primary text-sm">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`f-${i}`}>★</span>
      ))}
      {hasHalfStar && <span className="opacity-80">★</span>}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`e-${i}`} className="text-muted-foreground/30">
          ★
        </span>
      ))}
    </div>
  );
}

export function ReviewsManager({
  initialConfig,
  effectiveData,
  hasServerApiKey,
  hasServerPlaceId,
}: ReviewsManagerProps) {
  const [config, setConfig] = useState<ReviewsConfig>(initialConfig);
  const [mode, setMode] = useState<"auto" | "live" | "curated">(initialConfig.mode || "auto");
  const [curatedRating, setCuratedRating] = useState(initialConfig.curatedRating || 5.0);
  const [curatedTotalCount, setCuratedTotalCount] = useState(
    initialConfig.curatedTotalCount || 3
  );
  const [curatedReviews, setCuratedReviews] = useState<GoogleReviewItem[]>(
    initialConfig.curatedReviews || []
  );

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Modal states for adding/editing a curated review
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<GoogleReviewItem | null>(null);
  const [formAuthor, setFormAuthor] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState("");
  const [formTime, setFormTime] = useState("Recently");

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Toast notifications
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

  // Handle manual Google sync
  async function handleSync() {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    try {
      const res = await syncReviewsAction();
      if (res.success) {
        showToast(res.message || "Synchronized reviews successfully!");
        setSyncStatusMsg(res.message || "Synchronized successfully.");
        if (res.config) {
          setConfig(res.config);
        }
      } else {
        showToast(res.error || "Failed to synchronize reviews.", "error");
        setSyncStatusMsg(res.error || "Sync failed.");
      }
    } catch (err) {
      console.error("[Reviews Manager] Sync error:", err);
      showToast("A network error occurred while syncing.", "error");
    } finally {
      setIsSyncing(false);
    }
  }

  // Handle saving review settings
  async function handleSaveSettings() {
    setIsSaving(true);
    const updatedPayload: ReviewsConfig = {
      ...config,
      mode,
      curatedRating: Number(curatedRating),
      curatedTotalCount: Number(curatedTotalCount),
      curatedReviews,
    };

    try {
      const res = await updateReviewsConfigAction(updatedPayload);
      if (res.success && res.config) {
        setConfig(res.config);
        showToast("Review settings and fallback data saved successfully!");
      } else {
        showToast(res.error || "Failed to save review settings.", "error");
      }
    } catch (err) {
      console.error("[Reviews Manager] Save error:", err);
      showToast("A network error occurred while saving.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  // Open Add Modal
  function handleOpenAddModal() {
    setEditingReview(null);
    setFormAuthor("");
    setFormRating(5);
    setFormText("");
    setFormTime("1 week ago");
    setIsEditModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEditModal(review: GoogleReviewItem) {
    setEditingReview(review);
    setFormAuthor(review.authorName);
    setFormRating(review.rating);
    setFormText(review.text);
    setFormTime(review.relativeTime || "Recently");
    setIsEditModalOpen(true);
  }

  // Save Add/Edit Modal
  function handleSaveReviewForm(e: React.FormEvent) {
    e.preventDefault();
    if (!formAuthor.trim() || !formText.trim()) {
      showToast("Please provide author name and review content.", "error");
      return;
    }

    if (editingReview) {
      // Edit existing
      setCuratedReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id
            ? {
                ...r,
                authorName: formAuthor.trim(),
                rating: Number(formRating),
                text: formText.trim(),
                relativeTime: formTime.trim(),
              }
            : r
        )
      );
      showToast("Updated review in curated list. Remember to click 'Save Settings'.");
    } else {
      // Add new
      const newReview: GoogleReviewItem = {
        id: `curated-${Date.now()}`,
        authorName: formAuthor.trim(),
        rating: Number(formRating),
        text: formText.trim(),
        relativeTime: formTime.trim() || "Recently",
        googleMapsUri: config.googleMapsUri,
      };
      setCuratedReviews((prev) => [newReview, ...prev]);
      showToast("Added new review to curated list. Remember to click 'Save Settings'.");
    }

    setIsEditModalOpen(false);
  }

  // Delete review
  function confirmDeleteReview() {
    if (!deleteTargetId) return;
    setCuratedReviews((prev) => prev.filter((r) => r.id !== deleteTargetId));
    setDeleteTargetId(null);
    showToast("Removed review from curated list. Remember to click 'Save Settings'.");
  }

  const isLiveActive = effectiveData.source === "live";

  return (
    <div className="space-y-8">
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
                <AlertTriangle className="w-4 h-4 shrink-0" />
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-2 border border-primary/20">
            <Star className="w-3.5 h-3.5" />
            <span>Social Proof CMS</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Google Reviews Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor Google Places integration health, trigger live syncs, and curate community reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/50 bg-white text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary hover:border-primary/40 transition-colors shadow-2xs"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View Public Reviews</span>
          </Link>

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync from Google"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-black hover:text-white transition-all disabled:opacity-50"
          >
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner if available */}
      {syncStatusMsg && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/25 text-foreground text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncStatusMsg(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Public Rating */}
        <div className="bg-white p-5 rounded-2xl border border-border/40 shadow-2xs space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {isLiveActive ? "Live Google Rating" : "Curated Highlights Rating"}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-foreground">
              {effectiveData.rating > 0 ? effectiveData.rating.toFixed(1) : "5.0"}
            </span>
            <StarRatingDisplay rating={effectiveData.rating > 0 ? effectiveData.rating : 5} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isLiveActive ? "Returned by Places API" : "Selected Community Highlights"}
          </p>
        </div>

        {/* Metric 2: Total Reviews Count */}
        <div className="bg-white p-5 rounded-2xl border border-border/40 shadow-2xs space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {isLiveActive ? "Live Google Reviews Count" : "Curated Display Count"}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-primary">
              {isLiveActive ? effectiveData.userRatingCount : curatedReviews.length}
            </span>
            <span className="text-xs text-muted-foreground font-medium">Reviews</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isLiveActive ? "Official Google Count" : "Active Curated Cards"}
          </p>
        </div>

        {/* Metric 3: Active Delivery Source */}
        <div className="bg-white p-5 rounded-2xl border border-border/40 shadow-2xs space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Active Review Source
          </p>
          <div className="flex items-center gap-2 pt-1">
            {isLiveActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Google Places
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Curated Fallback
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Strategy: <span className="font-mono font-bold capitalize text-foreground">{mode}</span>
          </p>
        </div>

        {/* Metric 4: API Credential Status */}
        <div className="bg-white p-5 rounded-2xl border border-border/40 shadow-2xs space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Server API Credentials
          </p>
          <div className="flex items-center gap-2 pt-1">
            {hasServerApiKey && hasServerPlaceId ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                Configured (.env.local)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                <AlertTriangle className="w-4 h-4" />
                Not Configured (Fallback Active)
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Place Details (New) v1 API
          </p>
        </div>
      </div>

      {/* Mode Selector & Configuration Card */}
      <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-border/30 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">
              Review Delivery Strategy
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose how Rahat Bakery serves customer reviews to public website visitors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mode Option 1: Auto */}
          <label
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              mode === "auto"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                : "border-border/50 bg-[#faf9f6] hover:border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Auto Sync (Recommended)
              </span>
              <input
                type="radio"
                name="deliveryMode"
                value="auto"
                checked={mode === "auto"}
                onChange={() => setMode("auto")}
                className="w-4 h-4 text-primary focus:ring-primary accent-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              Fetches live Google Places data. If credentials are unset or the API is unreachable, seamlessly serves curated community highlights without breaking the site.
            </p>
          </label>

          {/* Mode Option 2: Live Only */}
          <label
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              mode === "live"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                : "border-border/50 bg-[#faf9f6] hover:border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Always Live Google
              </span>
              <input
                type="radio"
                name="deliveryMode"
                value="live"
                checked={mode === "live"}
                onChange={() => setMode("live")}
                className="w-4 h-4 text-primary focus:ring-primary accent-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              Exclusively fetches live Google Places API reviews. Uses ISR server cache to prevent excess requests.
            </p>
          </label>

          {/* Mode Option 3: Curated Only */}
          <label
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              mode === "curated"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                : "border-border/50 bg-[#faf9f6] hover:border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Curated Reviews Only
              </span>
              <input
                type="radio"
                name="deliveryMode"
                value="curated"
                checked={mode === "curated"}
                onChange={() => setMode("curated")}
                className="w-4 h-4 text-primary focus:ring-primary accent-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              Bypasses external API calls completely. Displays verified community highlights managed below with 0 external network requests.
            </p>
          </label>
        </div>

        {/* Curated Rating Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/30">
          <div>
            <label
              htmlFor="curated-rating"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Curated Highlights Rating (Stars)
            </label>
            <input
              id="curated-rating"
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={curatedRating}
              onChange={(e) => setCuratedRating(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="curated-total-count"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80 mb-1.5"
            >
              Curated Total Highlights Count
            </label>
            <input
              id="curated-total-count"
              type="number"
              min="0"
              value={curatedTotalCount}
              onChange={(e) => setCuratedTotalCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Curated Fallback Reviews Management Section */}
      <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">
              Curated Community Testimonials ({curatedReviews.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              These selected customer highlights are displayed when curated fallback is active. They are clearly labeled as &apos;Customer Highlight&apos; on the public site.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-black hover:text-white transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {curatedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl border border-border/40 bg-[#faf9f6] flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StarRatingDisplay rating={rev.rating} />
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {rev.relativeTime}
                  </span>
                </div>

                <p className="text-xs text-foreground/85 leading-relaxed italic line-clamp-4">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                <div>
                  <p className="font-serif font-bold text-sm text-foreground leading-tight">
                    {rev.authorName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Customer Highlight
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(rev)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-white transition-colors"
                    title="Edit Testimonial"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(rev.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete Testimonial"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Google Cloud Documentation */}
      <div className="bg-white rounded-2xl border border-border/40 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">
              Google Cloud API Configuration & Cost Guardrails
            </h2>
            <p className="text-xs text-muted-foreground">
              Security policy and configuration instructions for Google Places API (New).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-muted-foreground">
          <div className="space-y-3 p-4 rounded-xl bg-[#faf9f6] border border-border/30">
            <h3 className="font-serif font-bold text-sm text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Server-Side Execution
            </h3>
            <p>
              Your Google Cloud API Key is executed strictly on the Node.js server and is <strong>never</strong> transmitted to the client browser or included in frontend JavaScript bundles.
            </p>
            <div className="font-mono text-[11px] bg-white p-3 rounded-lg border border-border/40 space-y-1">
              <p className="text-muted-foreground"># Add to .env.local (Never commit to Git):</p>
              <p className="text-foreground font-bold">GOOGLE_PLACES_API_KEY=your_api_key_here</p>
              <p className="text-foreground font-bold">GOOGLE_PLACE_ID=your_place_id_here</p>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-[#faf9f6] border border-border/30">
            <h3 className="font-serif font-bold text-sm text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Narrow Field Mask & Zero-Cost Fallback
            </h3>
            <p>
              To minimize Google Cloud billing costs, our API fetcher uses a narrow field mask (<code>displayName,rating,userRatingCount,reviews,googleMapsUri</code>) and caches responses for 1 hour (3600 seconds).
            </p>
            <p>
              If you do not wish to enable Google Cloud billing, simply leave the variables unset; the curated fallback system will serve reviews at <strong>$0 cost</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">
                {editingReview ? "Edit Curated Testimonial" : "Add Curated Testimonial"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReviewForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5">
                  Reviewer / Customer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Khan"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5">
                    Star Rating (1 - 5)
                  </label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  >
                    <option value={5}>5 Stars (★★★★★)</option>
                    <option value={4}>4 Stars (★★★★☆)</option>
                    <option value={3}>3 Stars (★★★☆☆)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5">
                    Relative Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 week ago"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5">
                  Review Text / Customer Quote
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write the customer review quote here..."
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-border/50 rounded-xl text-xs text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border/50 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-black hover:text-white transition-all"
                >
                  Apply Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-border/50 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-foreground">
                Remove Testimonial?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to remove this testimonial from the curated list?
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 rounded-xl border border-border/50 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteReview}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
