"use client";

import { useMemo, useState } from "react";
import {
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/app/dashboard/_components/dashboard-header";
import {
  DASHBOARD_SIDEBAR_ITEMS_CONTAINER_CLASSNAME,
  DASHBOARD_SIDEBAR_SECTION_TITLE_CLASSNAME,
  dashboardSidebarItemClassName,
} from "@/app/dashboard/_components/sidebar-nav-styles";
import {
  SCREENSHOT_GRID_CLASSNAME,
  ScreenshotCard,
} from "@/components/screenshot-card";

// ── Types & mock data ─────────────────────────────────────────────────────────

type ScreenItem = {
  id: string;
  title: string;
  app: string;
  categoryId: string;
  imageId: number;
};

const PAGE_TYPE_DEFS = [
  { id: "all", label: "All screens" },
  { id: "welcome", label: "Welcome" },
  { id: "home", label: "Home" },
  { id: "onboarding", label: "Onboarding" },
  { id: "profile", label: "Profile" },
  { id: "settings", label: "Settings" },
  { id: "checkout", label: "Checkout" },
  { id: "search", label: "Search" },
] as const;

const APP_DEFS = [
  { id: "uber", label: "Uber" },
  { id: "airbnb", label: "Airbnb" },
  { id: "linear", label: "Linear" },
  { id: "spotify", label: "Spotify" },
] as const;

const MOCK_SCREENS: ScreenItem[] = [
  { id: "1",  title: "Welcome hero",    app: "Uber",    categoryId: "welcome",    imageId: 201 },
  { id: "2",  title: "Map home",        app: "Uber",    categoryId: "home",       imageId: 202 },
  { id: "3",  title: "Trip summary",    app: "Uber",    categoryId: "home",       imageId: 203 },
  { id: "4",  title: "Stays discovery", app: "Airbnb",  categoryId: "home",       imageId: 204 },
  { id: "5",  title: "Listing detail",  app: "Airbnb",  categoryId: "search",     imageId: 205 },
  { id: "6",  title: "Inbox zero",      app: "Linear",  categoryId: "home",       imageId: 206 },
  { id: "7",  title: "Issue view",      app: "Linear",  categoryId: "profile",    imageId: 207 },
  { id: "8",  title: "Now playing",     app: "Spotify", categoryId: "home",       imageId: 208 },
  { id: "9",  title: "Your library",    app: "Spotify", categoryId: "profile",    imageId: 209 },
  { id: "10", title: "Paywall",         app: "Spotify", categoryId: "checkout",   imageId: 210 },
  { id: "11", title: "Permissions",     app: "Uber",    categoryId: "onboarding", imageId: 211 },
  { id: "12", title: "Account",         app: "Airbnb",  categoryId: "settings",   imageId: 212 },
];

// ── Page ──────────────────────────────────────────────────────────────────────

const panelEase = "cubic-bezier(0.33, 1, 0.68, 1)";
const panelDuration = "500ms";

export default function DashboardGalleryPage() {
  const [categoryId, setCategoryId] = useState<string>("all");
  const [appId, setAppId] = useState<string | null>(null);
  const [appFilterTouched, setAppFilterTouched] = useState(false);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of MOCK_SCREENS) map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1);
    return map;
  }, []);

  const appCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of MOCK_SCREENS) {
      const k = s.app.toLowerCase();
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_SCREENS.filter((s) => {
      if (categoryId !== "all" && s.categoryId !== categoryId) return false;
      if (appId && s.app.toLowerCase() !== appId) return false;
      if (q && !`${s.title} ${s.app}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [categoryId, appId, query]);

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-[#fafafa]">
      <DashboardHeader />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        {/* Collapses to 40px (w-10) instead of 0 so the toggle button stays put */}
        <aside
          className={cn(
            "flex shrink-0 flex-col overflow-hidden border-r border-gray-300 bg-[#fafafa] transition-[width] motion-reduce:transition-none",
            sidebarOpen ? "w-[220px]" : "w-10",
          )}
          style={{ transitionDuration: panelDuration, transitionTimingFunction: panelEase }}
        >
          {/* Largeur interne alignée sur l’aside : quand replié (w-10), une seule colonne pour garder le toggle visible */}
          <div
            className={cn(
              "flex min-h-0 flex-col",
              sidebarOpen ? "w-[220px]" : "w-10",
            )}
          >
            {sidebarOpen ? (
              <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Filter className="size-3.5 shrink-0 text-gray-500" aria-hidden />
                  <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-gray-700">
                    Directory
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen((o) => !o)}
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-all duration-150 hover:bg-gray-200/80 hover:text-gray-800 active:scale-95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                  aria-label="Fermer le directory"
                >
                  <PanelLeftClose className="size-3.5" aria-hidden />
                </button>
              </div>
            ) : (
              <div className="flex h-11 shrink-0 items-center justify-center px-0.5">
                <button
                  type="button"
                  onClick={() => setSidebarOpen((o) => !o)}
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-all duration-150 hover:bg-gray-200/80 hover:text-gray-800 active:scale-95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                  aria-label="Ouvrir le directory"
                >
                  <PanelLeftOpen className="size-3.5" aria-hidden />
                </button>
              </div>
            )}

            {/* Filters */}
            {sidebarOpen ? (
            <div className="flex-1 space-y-4 px-2 py-1">
              {/* Page type */}
              <div>
                <p className={DASHBOARD_SIDEBAR_SECTION_TITLE_CLASSNAME}>
                  Page type
                </p>
                <div className={DASHBOARD_SIDEBAR_ITEMS_CONTAINER_CLASSNAME}>
                  {PAGE_TYPE_DEFS.map((c) => {
                    const count = c.id === "all" ? MOCK_SCREENS.length : (categoryCounts.get(c.id) ?? 0);
                    if (c.id !== "all" && count === 0) return null;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        data-sidebar-active={categoryId === c.id ? "true" : "false"}
                        onClick={() => setCategoryId(c.id)}
                        className={dashboardSidebarItemClassName(categoryId === c.id)}
                      >
                        <span>{c.label}</span>
                        <span className="tabular-nums text-xs text-gray-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* App */}
              <div>
                <p className={DASHBOARD_SIDEBAR_SECTION_TITLE_CLASSNAME}>
                  App
                </p>
                <div className={DASHBOARD_SIDEBAR_ITEMS_CONTAINER_CLASSNAME}>
                  <button
                    type="button"
                    data-sidebar-active={appFilterTouched && appId === null ? "true" : "false"}
                    onClick={() => {
                      setAppId(null);
                      setAppFilterTouched(true);
                    }}
                    className={dashboardSidebarItemClassName(appFilterTouched && appId === null)}
                  >
                    <span>All</span>
                    <span className="tabular-nums text-xs text-gray-400">{MOCK_SCREENS.length}</span>
                  </button>
                  {APP_DEFS.map((a) => {
                    const count = appCounts.get(a.label.toLowerCase()) ?? 0;
                    if (count === 0) return null;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        data-sidebar-active={appFilterTouched && appId === a.id ? "true" : "false"}
                        onClick={() => {
                          setAppId(a.id);
                          setAppFilterTouched(true);
                        }}
                        className={dashboardSidebarItemClassName(appFilterTouched && appId === a.id)}
                      >
                        <span>{a.label}</span>
                        <span className="tabular-nums text-xs text-gray-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            ) : null}
          </div>
        </aside>

        {/* ── Gallery area ─────────────────────────────────────────────────── */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#fafafa]">
          {/* Scrollable area — everything scrolls together */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* Page header + search bar */}
            <div className="px-5 py-4">
              <h1 className="text-[15px] font-semibold text-gray-900">Design gallery</h1>
              <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                Curated screenshots from the best B2C apps. Find inspiration, copy prompts, or start a guided project.
              </p>
              <div className="relative mt-3">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Search screens…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-2.5 text-xs text-gray-700 placeholder:text-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 hover:border-gray-300 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                />
              </div>
            </div>

            {/* Card grid */}
            <div className="px-5 py-5">
            <div className={SCREENSHOT_GRID_CLASSNAME}>
              {filtered.map((screen) => (
                <ScreenshotCard
                  key={screen.id}
                  appName={screen.app}
                  imageUrl={`https://picsum.photos/seed/verve-${screen.categoryId}-${screen.imageId}/360/640`}
                  imageAlt={`${screen.app} — ${screen.title}`}
                  dataCardId={`${screen.app.toLowerCase()}-${screen.id}`}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-gray-500">
                No screens match your filters.
              </p>
            )}
            </div>{/* end grid wrapper */}
          </div>{/* end scrollable area */}
        </div>{/* end gallery area */}
      </div>
    </div>
  );
}
