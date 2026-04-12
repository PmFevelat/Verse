"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type License = "free" | "pro";

type ScreenItem = {
  id: string;
  title: string;
  app: string;
  categoryId: string;
  license: License;
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
  { id: "1", title: "Welcome hero", app: "Uber", categoryId: "welcome", license: "free", imageId: 201 },
  { id: "2", title: "Map home", app: "Uber", categoryId: "home", license: "pro", imageId: 202 },
  { id: "3", title: "Trip summary", app: "Uber", categoryId: "home", license: "free", imageId: 203 },
  { id: "4", title: "Stays discovery", app: "Airbnb", categoryId: "home", license: "pro", imageId: 204 },
  { id: "5", title: "Listing detail", app: "Airbnb", categoryId: "search", license: "free", imageId: 205 },
  { id: "6", title: "Inbox zero", app: "Linear", categoryId: "home", license: "pro", imageId: 206 },
  { id: "7", title: "Issue view", app: "Linear", categoryId: "profile", license: "free", imageId: 207 },
  { id: "8", title: "Now playing", app: "Spotify", categoryId: "home", license: "free", imageId: 208 },
  { id: "9", title: "Your library", app: "Spotify", categoryId: "profile", license: "pro", imageId: 209 },
  { id: "10", title: "Paywall", app: "Spotify", categoryId: "checkout", license: "pro", imageId: 210 },
  { id: "11", title: "Permissions", app: "Uber", categoryId: "onboarding", license: "free", imageId: 211 },
  { id: "12", title: "Account", app: "Airbnb", categoryId: "settings", license: "free", imageId: 212 },
];

function countByCategory() {
  const map = new Map<string, number>();
  for (const s of MOCK_SCREENS) {
    map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1);
  }
  return map;
}

function countByApp() {
  const map = new Map<string, number>();
  for (const s of MOCK_SCREENS) {
    const k = s.app.toLowerCase();
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

const galleryToolbarClass =
  "flex h-11 shrink-0 items-center gap-2 border-b border-gray-300 px-4";

/** Courbe type « ease-out » un peu amortie pour le panneau directory */
const directoryPanelEase = "cubic-bezier(0.33, 1, 0.68, 1)";
const directoryPanelDuration = "500ms";

export function GalleryPreview() {
  const [categoryId, setCategoryId] = useState<string>("all");
  const [appId, setAppId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [directoryOpen, setDirectoryOpen] = useState(true);

  const categoryCounts = useMemo(() => countByCategory(), []);
  const appCounts = useMemo(() => countByApp(), []);

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
    <div className="flex h-[min(783px,78vh)] w-full min-h-0 flex-col md:h-[783px] md:flex-row">
      {/* Directory — gauche (aligné côté logo / réf. Tailark) */}
      <aside
        aria-hidden={!directoryOpen}
        className={cn(
          "flex min-h-0 shrink-0 flex-col overflow-hidden border-gray-300 bg-[#f9fafb] motion-reduce:transition-none md:h-full md:min-w-0 md:border-r md:border-b-0",
          "max-md:transition-[max-height,border-color] md:transition-[width,border-color]",
          directoryOpen
            ? "pointer-events-auto max-h-[min(220px,34vh)] border-b md:max-h-none md:w-[280px]"
            : "pointer-events-none max-h-0 border-b-0 md:max-h-none md:w-0 md:border-r-0"
        )}
        style={{
          transitionDuration: directoryPanelDuration,
          transitionTimingFunction: directoryPanelEase,
        }}
      >
        <div className={cn(galleryToolbarClass, "justify-between")}>
          <div className="flex min-w-0 items-center gap-2">
            <Filter className="size-4 shrink-0 text-gray-500" aria-hidden />
            <span className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Directory</span>
          </div>
          <button
            type="button"
            onClick={() => setDirectoryOpen(false)}
            className="shrink-0 rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-200/80 hover:text-gray-800"
            aria-label="Replier le directory"
          >
            <ChevronUp className="size-4 md:hidden" aria-hidden />
            <PanelLeftClose className="size-4 max-md:hidden" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <div>
            <p className="mb-2 px-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
              Page type
            </p>
            <div className="flex flex-col gap-1">
              {PAGE_TYPE_DEFS.map((c) => {
                const count =
                  c.id === "all" ? MOCK_SCREENS.length : (categoryCounts.get(c.id) ?? 0);
                if (c.id !== "all" && count === 0) return null;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                      categoryId === c.id
                        ? "bg-white font-medium text-gray-900 shadow-sm ring-1 ring-gray-200/80"
                        : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                    )}
                  >
                    <span>{c.label}</span>
                    <span className="tabular-nums text-xs text-gray-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 px-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">App</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setAppId(null)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  appId === null
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                All
              </button>
              {APP_DEFS.map((a) => {
                const count = appCounts.get(a.label.toLowerCase()) ?? 0;
                if (count === 0) return null;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAppId(a.id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      appId === a.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {a.label}
                    <span className="ml-1 tabular-nums text-gray-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="px-1 text-[11px] leading-relaxed text-gray-400">
            Curated B2C references — tags align with the Gallery spec (page types, apps, patterns).
          </p>
        </div>
      </aside>

      {/* Feed — droite : grille dense type Tailark (cartes petites, 3 colonnes) */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        <div className={galleryToolbarClass}>
          {/* Desktop : réouverture à gauche (sidebar horizontale), avec -me-2 quand replié pour ne pas décaler la recherche. */}
          <span
            className={cn(
              "max-md:hidden shrink-0 overflow-hidden motion-reduce:transition-none",
              "transition-[width,margin-inline-end,opacity]",
              directoryOpen
                ? "pointer-events-none w-0 min-w-0 opacity-0 -me-2"
                : "w-9 opacity-100"
            )}
            style={{
              transitionDuration: directoryPanelDuration,
              transitionTimingFunction: directoryPanelEase,
            }}
          >
            <button
              type="button"
              onClick={() => setDirectoryOpen(true)}
              className="flex size-9 items-center justify-center rounded-md text-gray-500 transition-colors motion-reduce:transition-none hover:bg-gray-100 hover:text-gray-800"
              aria-label="Afficher le directory"
              tabIndex={directoryOpen ? -1 : 0}
            >
              <PanelLeftOpen className="size-4" aria-hidden />
            </button>
          </span>
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search screens…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50/80 pl-8 pr-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-900/5"
            />
          </div>
          {/* Mobile : même côté que le toggle du header Directory (à droite), y compris quand le panneau est fermé. */}
          <span
            className={cn(
              "md:hidden shrink-0 overflow-hidden motion-reduce:transition-none",
              "transition-[width,margin-inline-start,opacity]",
              directoryOpen
                ? "pointer-events-none w-0 min-w-0 opacity-0 -ms-2"
                : "w-9 opacity-100"
            )}
            style={{
              transitionDuration: directoryPanelDuration,
              transitionTimingFunction: directoryPanelEase,
            }}
          >
            <button
              type="button"
              onClick={() => setDirectoryOpen(true)}
              className="flex size-9 items-center justify-center rounded-md text-gray-500 transition-colors motion-reduce:transition-none hover:bg-gray-100 hover:text-gray-800"
              aria-label="Afficher le directory"
              tabIndex={directoryOpen ? -1 : 0}
            >
              <ChevronDown className="size-4" aria-hidden />
            </button>
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {filtered.map((screen) => (
              <article
                key={screen.id}
                className="group overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://picsum.photos/seed/verve-${screen.imageId}/480/360`}
                    alt=""
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1 p-2.5 sm:p-3">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="truncate text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                      {screen.app}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 shrink-0 border-0 px-1.5 text-[10px] font-semibold",
                        screen.license === "pro"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {screen.license === "pro" ? "Pro" : "Free"}
                    </Badge>
                  </div>
                  <h3 className="line-clamp-2 text-xs font-medium leading-snug text-gray-900 sm:text-[13px]">
                    {screen.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No screens match your filters.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
