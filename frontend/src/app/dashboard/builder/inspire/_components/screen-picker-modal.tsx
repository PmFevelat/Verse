"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ScreenType = "key-page" | "flow";

type PickableScreen = {
  id: string;
  title: string;
  app: string;
  categoryId: string;
  imageId: number;
};

const KEY_PAGE_TYPE_DEFS = [
  { id: "all", label: "All screens" },
  { id: "welcome", label: "Welcome" },
  { id: "home", label: "Home" },
  { id: "onboarding", label: "Onboarding" },
  { id: "profile", label: "Profile" },
  { id: "settings", label: "Settings" },
  { id: "checkout", label: "Checkout" },
  { id: "search", label: "Search" },
] as const;

const FLOW_TYPE_DEFS = [
  { id: "all", label: "All flows" },
  { id: "browse", label: "Browse & search" },
  { id: "checkout", label: "Checkout" },
  { id: "onboarding", label: "Onboarding" },
  { id: "messaging", label: "Messaging" },
  { id: "settings", label: "Settings" },
] as const;

const KEY_PAGE_POOL: PickableScreen[] = [
  { id: "k1", title: "Welcome hero", app: "Uber", categoryId: "welcome", imageId: 801 },
  { id: "k2", title: "Map home", app: "Uber", categoryId: "home", imageId: 802 },
  { id: "k3", title: "Stays discovery", app: "Airbnb", categoryId: "home", imageId: 803 },
  { id: "k4", title: "Listing detail", app: "Airbnb", categoryId: "search", imageId: 804 },
  { id: "k5", title: "Account", app: "Airbnb", categoryId: "settings", imageId: 805 },
  { id: "k6", title: "Inbox zero", app: "Linear", categoryId: "home", imageId: 806 },
  { id: "k7", title: "Issue view", app: "Linear", categoryId: "profile", imageId: 807 },
  { id: "k8", title: "Now playing", app: "Spotify", categoryId: "home", imageId: 808 },
  { id: "k9", title: "Permissions", app: "Uber", categoryId: "onboarding", imageId: 809 },
  { id: "k10", title: "Paywall", app: "Spotify", categoryId: "checkout", imageId: 810 },
];

/** Durée alignée sur le CSS (backdrop + panneau) */
const MODAL_TRANSITION_MS = 320;

const FLOW_POOL: PickableScreen[] = [
  { id: "f1", title: "Browse map", app: "Airbnb", categoryId: "browse", imageId: 901 },
  { id: "f2", title: "Search results", app: "Uber", categoryId: "browse", imageId: 902 },
  { id: "f3", title: "Checkout summary", app: "Stripe", categoryId: "checkout", imageId: 903 },
  { id: "f4", title: "Payment method", app: "Stripe", categoryId: "checkout", imageId: 904 },
  { id: "f5", title: "Welcome steps", app: "Duolingo", categoryId: "onboarding", imageId: 905 },
  { id: "f6", title: "Goal picker", app: "Duolingo", categoryId: "onboarding", imageId: 906 },
  { id: "f7", title: "Thread list", app: "Linear", categoryId: "messaging", imageId: 907 },
  { id: "f8", title: "Conversation", app: "Linear", categoryId: "messaging", imageId: 908 },
  { id: "f9", title: "Notification prefs", app: "Notion", categoryId: "settings", imageId: 909 },
  { id: "f10", title: "Filter sheet", app: "Airbnb", categoryId: "browse", imageId: 910 },
];

export function ScreenPickerModal({
  open,
  sectionType,
  onClose,
  onConfirm,
}: {
  open: boolean;
  sectionType: ScreenType;
  onClose: () => void;
  onConfirm: (title: string) => void;
}) {
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pool = sectionType === "key-page" ? KEY_PAGE_POOL : FLOW_POOL;
  const typeDefs = sectionType === "key-page" ? KEY_PAGE_TYPE_DEFS : FLOW_TYPE_DEFS;

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of pool) map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1);
    return map;
  }, [pool]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter((s) => {
      if (categoryId !== "all" && s.categoryId !== categoryId) return false;
      if (q && !`${s.title} ${s.app}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [pool, categoryId, query]);

  const selected = pool.find((s) => s.id === selectedId) ?? null;

  const [mounted, setMounted] = useState(false);
  const [entering, setEntering] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transitionMs = useMemo(() => {
    if (typeof window === "undefined") return MODAL_TRANSITION_MS;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : MODAL_TRANSITION_MS;
  }, []);

  useEffect(() => {
    if (open) {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      queueMicrotask(() => {
        setMounted(true);
        if (transitionMs === 0) {
          setEntering(true);
          return;
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setEntering(true));
        });
      });
      return undefined;
    }
    queueMicrotask(() => {
      setEntering(false);
      exitTimerRef.current = setTimeout(() => {
        setMounted(false);
        exitTimerRef.current = null;
      }, transitionMs);
    });
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [open, transitionMs]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const heading =
    sectionType === "key-page" ? "Add key page" : "Add interaction flow";

  if (!mounted) return null;

  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
  const tMs = `${transitionMs}ms`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
      role="presentation"
      style={{ pointerEvents: entering ? "auto" : "none" }}
    >
      <div
        className="absolute inset-0 z-0 bg-black/45"
        style={{
          opacity: entering ? 1 : 0,
          transitionProperty: "opacity",
          transitionDuration: tMs,
          transitionTimingFunction: ease,
        }}
        aria-hidden
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="screen-picker-title"
        className="relative z-10 flex max-h-[min(720px,85vh)] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-[#fafafa] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25)]"
        style={{
          opacity: entering ? 1 : 0,
          transform: entering ? "scale(1) translateY(0)" : "scale(0.97) translateY(12px)",
          transitionProperty: "opacity, transform",
          transitionDuration: tMs,
          transitionTimingFunction: ease,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
          <div>
            <h2 id="screen-picker-title" className="text-[15px] font-semibold text-gray-900">
              {heading}
            </h2>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Filter by type on the left, pick a reference — then Save.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-all duration-150 hover:bg-gray-100 hover:text-gray-800 active:scale-95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body: sidebar types à gauche, recherche + grille à droite (comme la gallery) */}
        <div className="flex min-h-[min(380px,50vh)] flex-1 bg-[#fafafa]">
          <aside className="flex w-[200px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-[#fafafa] sm:w-[220px]">
            <div className="px-3 py-3">
              <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Screen type
              </p>
              <div className="flex flex-col gap-px">
                {typeDefs.map((c) => {
                  const count =
                    c.id === "all" ? pool.length : (categoryCounts.get(c.id) ?? 0);
                  if (c.id !== "all" && count === 0) return null;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] transition-all duration-150 active:scale-[0.99] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/30",
                        categoryId === c.id
                          ? "bg-white font-medium text-gray-900 shadow-sm ring-1 ring-gray-200/80"
                          : "text-gray-600 hover:bg-white/60 hover:text-gray-900",
                      )}
                    >
                      <span className="truncate">{c.label}</span>
                      <span className="shrink-0 tabular-nums text-[11px] text-gray-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-gray-100 bg-[#fafafa] px-4 py-3 sm:px-5">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Search screen type or title…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-300 focus:ring-2 focus:ring-gray-900/5"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filtered.map((screen) => {
                  const isSel = selectedId === screen.id;
                  return (
                    <button
                      key={screen.id}
                      type="button"
                      onClick={() => setSelectedId(screen.id)}
                      className={cn(
                        "flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-150 active:scale-[0.99] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40",
                        isSel
                          ? "border-indigo-500 ring-2 ring-indigo-400/40"
                          : "border-gray-200/90 hover:border-gray-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)]",
                      )}
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://picsum.photos/seed/verve-${screen.imageId}/480/360`}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="space-y-1 p-2.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="truncate text-[10px] font-medium uppercase tracking-wide text-gray-400">
                            {screen.app}
                          </span>
                          <Badge variant="outline" className="h-5 shrink-0 border-0 bg-gray-100 px-1.5 text-[10px] font-semibold text-gray-600">
                            Free
                          </Badge>
                        </div>
                        <h3 className="line-clamp-2 text-xs font-medium leading-snug text-gray-900">
                          {screen.title}
                        </h3>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-500">No screens match your filters.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-200 bg-white px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-gray-700 transition-all duration-150 hover:bg-gray-50 active:scale-[0.99] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected.title)}
            className={cn(
              "rounded-lg px-4 py-2 text-[13px] font-semibold transition-all duration-150",
              selected
                ? "cursor-pointer bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow active:scale-[0.99] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/50"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            )}
          >
            Save
          </button>
        </div>

        {selected && (
          <p className="sr-only" aria-live="polite">
            Selected: {selected.title}
          </p>
        )}
      </div>
    </div>
  );
}
