"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Star,
  Archive,
  Trash2,
  Plus,
  Search,
  X,
  ChevronDown,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/app/dashboard/_components/dashboard-header";
import {
  DASHBOARD_SIDEBAR_ITEMS_CONTAINER_CLASSNAME,
  dashboardSidebarItemClassName,
} from "@/app/dashboard/_components/sidebar-nav-styles";

// ── Types & mock data ─────────────────────────────────────────────────────────

type ProjectStatus = "draft" | "in-progress" | "done";
type SortKey = "modified" | "created" | "name";
type NavSection = "all" | "starred" | "archived" | "trash";

type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  screensCount: number;
  lastModified: Date;
  createdAt: Date;
  starred: boolean;
  archived: boolean;
  deleted: boolean;
  colorSeed: number;
};

const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Onboarding flow",
    description: "Welcome, sign-up and permission screens",
    status: "in-progress",
    screensCount: 6,
    lastModified: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    starred: true,
    archived: false,
    deleted: false,
    colorSeed: 1,
  },
  {
    id: "2",
    name: "Home dashboard",
    description: "Main feed, activity overview and quick actions",
    status: "draft",
    screensCount: 4,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    starred: false,
    archived: false,
    deleted: false,
    colorSeed: 2,
  },
  {
    id: "3",
    name: "Profile & settings",
    description: "User profile, preferences and account management",
    status: "done",
    screensCount: 9,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    starred: true,
    archived: false,
    deleted: false,
    colorSeed: 3,
  },
  {
    id: "4",
    name: "Checkout & payment",
    description: "Cart, payment method and order confirmation",
    status: "draft",
    screensCount: 5,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    starred: false,
    archived: false,
    deleted: false,
    colorSeed: 4,
  },
  {
    id: "5",
    name: "Search & discovery",
    description: "Search bar, filters and results grid",
    status: "in-progress",
    screensCount: 7,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 72),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
    starred: false,
    archived: true,
    deleted: false,
    colorSeed: 5,
  },
  {
    id: "6",
    name: "Notifications",
    description: "Push notifications and in-app alerts",
    status: "draft",
    screensCount: 3,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 96),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    starred: false,
    archived: false,
    deleted: false,
    colorSeed: 6,
  },
  {
    id: "7",
    name: "Auth & login",
    description: "Sign in, forgot password and magic link screens",
    status: "done",
    screensCount: 5,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
    starred: false,
    archived: false,
    deleted: false,
    colorSeed: 2,
  },
  {
    id: "8",
    name: "Empty states",
    description: "Zero-data screens across the full app",
    status: "in-progress",
    screensCount: 8,
    lastModified: new Date(Date.now() - 1000 * 60 * 45),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    starred: true,
    archived: false,
    deleted: false,
    colorSeed: 4,
  },
  {
    id: "9",
    name: "Messaging & chat",
    description: "Conversation list, thread and media picker",
    status: "draft",
    screensCount: 11,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 5),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    starred: false,
    archived: false,
    deleted: false,
    colorSeed: 6,
  },
  {
    id: "10",
    name: "Maps & location",
    description: "Map view, pin details and routing UI",
    status: "in-progress",
    screensCount: 6,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 28),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
    starred: false,
    archived: false,
    deleted: false,
    colorSeed: 1,
  },
  {
    id: "11",
    name: "Analytics & reports",
    description: "Charts, KPIs and export flows",
    status: "draft",
    screensCount: 7,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 36),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22),
    starred: false,
    archived: false,
    deleted: false,
    colorSeed: 3,
  },
  {
    id: "12",
    name: "Subscription & billing",
    description: "Plan selection, upgrade prompt and invoice history",
    status: "done",
    screensCount: 4,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40),
    starred: true,
    archived: false,
    deleted: false,
    colorSeed: 5,
  },
  {
    id: "13",
    name: "Invite & referral",
    description: "Share link, invite contacts and reward confirmation",
    status: "in-progress",
    screensCount: 4,
    lastModified: new Date(Date.now() - 1000 * 60 * 90),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    starred: false,
    archived: false,
    deleted: false,
    colorSeed: 2,
  },
  {
    id: "14",
    name: "Error & offline states",
    description: "Network errors, timeouts and maintenance pages",
    status: "draft",
    screensCount: 5,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 60),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
    starred: false,
    archived: false,
    deleted: false,
    colorSeed: 6,
  },
  {
    id: "15",
    name: "Onboarding v2",
    description: "Revised onboarding with contextual tips",
    status: "draft",
    screensCount: 8,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 12),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    starred: false,
    archived: false,
    deleted: false,
    colorSeed: 3,
  },
  {
    id: "16",
    name: "Activity feed",
    description: "Timeline, reactions and comment thread",
    status: "in-progress",
    screensCount: 6,
    lastModified: new Date(Date.now() - 1000 * 60 * 20),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    starred: true,
    archived: false,
    deleted: false,
    colorSeed: 1,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

const CARD_GRADIENTS = [
  ["#e0e7ff", "#c7d2fe"],
  ["#fce7f3", "#fbcfe8"],
  ["#d1fae5", "#a7f3d0"],
  ["#fef3c7", "#fde68a"],
  ["#e0f2fe", "#bae6fd"],
  ["#f3e8ff", "#e9d5ff"],
];

const STATUS_META: Record<ProjectStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-500" },
  "in-progress": { label: "In Progress", className: "bg-blue-50 text-blue-600" },
  done: { label: "Done", className: "bg-emerald-50 text-emerald-600" },
};

const NAV_ITEMS = [
  { id: "all" as NavSection, label: "All projects", icon: FolderOpen },
  { id: "starred" as NavSection, label: "Starred", icon: Star },
  { id: "archived" as NavSection, label: "Archived", icon: Archive },
  { id: "trash" as NavSection, label: "Trash", icon: Trash2 },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "modified", label: "Last modified" },
  { key: "created", label: "Date created" },
  { key: "name", label: "Name" },
];

// ── Project thumbnail ─────────────────────────────────────────────────────────

function ProjectThumbnail({ project }: { project: Project }) {
  const [from, to] = CARD_GRADIENTS[(project.colorSeed - 1) % CARD_GRADIENTS.length];
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      <div className="flex flex-col items-center gap-2 opacity-40">
        <Layers className="size-6 text-gray-600" />
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-gray-400"
              style={{ width: `${32 - i * 8}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const PROJECT_DELETE_CONFIRM_MS = 220;

/** Modale de confirmation alignée sur celle de suppression des cards d'inspiration. */
function ProjectDeleteConfirm({
  onCancel,
  onDelete,
}: {
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  function closeWith(action: () => void) {
    setOpen(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      action();
    }, PROJECT_DELETE_CONFIRM_MS);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Delete project"
      className={cn(
        "absolute left-1/2 top-1 z-40 w-[min(calc(100%-8px),188px)] -translate-x-1/2 rounded-md border border-gray-200/90 bg-white px-1.5 py-1 shadow-[0_2px_12px_rgba(0,0,0,0.1)]",
        "origin-top transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "motion-reduce:transition-none",
        open
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1",
      )}
      style={{ fontSize: "9px", lineHeight: 1.15 }}
    >
      <div className="flex items-stretch justify-center gap-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closeWith(onCancel);
          }}
          className="min-h-0 flex-1 cursor-pointer rounded px-1 py-0.5 text-center font-medium text-gray-700 transition-colors hover:bg-gray-50 [font-size:inherit] [line-height:inherit]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closeWith(onDelete);
          }}
          className="min-h-0 flex flex-1 cursor-pointer items-center justify-center gap-0.5 rounded px-1 py-0.5 font-semibold text-red-600 transition-colors hover:bg-red-50 [font-size:inherit] [line-height:inherit]"
        >
          <Trash2 className="size-2.5 shrink-0" strokeWidth={2.25} />
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Project card (grid) ───────────────────────────────────────────────────────

function ProjectCardGrid({
  project,
  isDeleteConfirmOpen,
  onToggleDeleteConfirm,
  onCancelDelete,
  onDelete,
}: {
  project: Project;
  isDeleteConfirmOpen: boolean;
  onToggleDeleteConfirm: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const status = STATUS_META[project.status];
  const metaTextClassName = "font-sans !text-[11px] !leading-none font-normal tabular-nums !text-gray-400";

  return (
    <div className="flex w-full max-w-[243px] flex-col gap-1.5 justify-self-start">
      <article
        data-project-card={project.id}
        className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-150 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] active:scale-[0.99]"
      >
        {isDeleteConfirmOpen && (
          <ProjectDeleteConfirm onCancel={onCancelDelete} onDelete={onDelete} />
        )}
        <button
          type="button"
          aria-label="Delete project"
          onClick={(e) => {
            e.stopPropagation();
            onToggleDeleteConfirm();
          }}
          className="absolute right-1.5 top-1.5 z-30 flex size-5 cursor-pointer items-center justify-center rounded-full bg-white/95 text-red-500 shadow-[0_1px_6px_rgba(0,0,0,0.25)] opacity-0 transition-all duration-150 hover:bg-red-50 active:scale-95 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-300/50"
        >
          <X className="size-2.5" />
        </button>
        {/* Vignette — ratio large (21:9) pour une hauteur plus basse qu’en 16:9 */}
        <div className="relative w-full shrink-0 overflow-hidden bg-gray-50 pt-[42.857142857%]">
          <div className="absolute inset-0">
            <ProjectThumbnail project={project} />
          </div>
        </div>

        <div className="px-2.5 pt-2 pb-2.5">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-tight text-gray-900">
              {project.name}
            </h3>
            {project.starred && (
              <Star className="mt-0.5 size-3 shrink-0 text-amber-400" fill="currentColor" aria-hidden />
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
                status.className,
              )}
            >
              {status.label}
            </span>
            <span className={metaTextClassName}>
              {project.screensCount} screen{project.screensCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </article>

      <span className={metaTextClassName}>Edited {relativeTime(project.lastModified)}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const panelEase = "cubic-bezier(0.33, 1, 0.68, 1)";
const panelDuration = "500ms";

/** Même largeur de pistes que les cards screenshots ; `gap-y` resserré pour les lignes de projets uniquement */
const PROJECT_GRID_CLASSNAME = cn(
  "grid content-start [justify-content:center]",
  "gap-x-3 gap-y-2 min-[720px]:gap-x-6 min-[720px]:gap-y-3",
  "[grid-template-columns:repeat(auto-fill,minmax(min(100%,169px),min(100%,243px)))]",
  "min-[720px]:[grid-template-columns:repeat(auto-fill,minmax(min(100%,196px),min(100%,243px)))]",
);

export default function DashboardBuilderPage() {
  const [allProjects, setAllProjects] = useState<Project[]>(() => MOCK_PROJECTS);
  const [activeSection, setActiveSection] = useState<NavSection>("all");
  const [sortKey, setSortKey] = useState<SortKey>("modified");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<string | null>(null);

  const projects = useMemo(() => {
    let list = allProjects.filter((p) => {
      if (activeSection === "starred") return p.starred && !p.archived && !p.deleted;
      if (activeSection === "archived") return p.archived && !p.deleted;
      if (activeSection === "trash") return p.deleted;
      return !p.archived && !p.deleted;
    });

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query),
      );
    }

    list = [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "created") return b.createdAt.getTime() - a.createdAt.getTime();
      return b.lastModified.getTime() - a.lastModified.getTime();
    });

    return list;
  }, [activeSection, allProjects, sortKey, searchQuery]);

  const sectionLabel = NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? "Projects";
  const currentSort = SORT_OPTIONS.find((s) => s.key === sortKey)!;

  function handleDeleteProject(projectId: string) {
    setAllProjects((prev) => prev.map((project) => (project.id === projectId ? { ...project, deleted: true } : project)));
    setConfirmDeleteProjectId(null);
  }

  // Ferme la popover de suppression au clic extérieur ou Escape (même mécanique que l'inspiration).
  useEffect(() => {
    if (!confirmDeleteProjectId) return;
    function onPointerDown(e: PointerEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest(`[data-project-card="${confirmDeleteProjectId}"]`)) return;
      setConfirmDeleteProjectId(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmDeleteProjectId(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [confirmDeleteProjectId]);

  // Ferme le menu de tri au clic extérieur ou Escape.
  useEffect(() => {
    if (!sortOpen) return;
    function onPointerDown(e: PointerEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-project-sort-dropdown]")) return;
      setSortOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSortOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sortOpen]);

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-[#fafafa]">
      <DashboardHeader />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Sidebar — repli w-10 comme /dashboard/gallery (largeur interne + nav conditionnelle) ── */}
        <aside
          className={cn(
            "flex shrink-0 flex-col overflow-hidden border-r border-gray-300 bg-[#fafafa] transition-[width] motion-reduce:transition-none",
            sidebarOpen ? "w-[220px]" : "w-10",
          )}
          style={{ transitionDuration: panelDuration, transitionTimingFunction: panelEase }}
        >
          <div
            className={cn(
              "flex min-h-0 flex-col",
              sidebarOpen ? "w-[220px]" : "w-10",
            )}
          >
            {sidebarOpen ? (
              <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FolderOpen className="size-3.5 shrink-0 text-gray-500" aria-hidden />
                  <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-gray-700">
                    Projects
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen((o) => !o)}
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-all duration-150 hover:bg-gray-200/80 hover:text-gray-800 active:scale-95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                  aria-label="Fermer la navigation"
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
                  aria-label="Ouvrir la navigation"
                >
                  <PanelLeftOpen className="size-3.5" aria-hidden />
                </button>
              </div>
            )}

            {/* Nav items */}
            {sidebarOpen ? (
            <nav className={cn(DASHBOARD_SIDEBAR_ITEMS_CONTAINER_CLASSNAME, "px-2 py-1")}>
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  data-sidebar-active={activeSection === id ? "true" : "false"}
                  onClick={() => setActiveSection(id)}
                  className={dashboardSidebarItemClassName(activeSection === id, "compact")}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              ))}
            </nav>
            ) : null}
          </div>
        </aside>

        {/* ── Main area ────────────────────────────────────────────────────── */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">

            {/* Top bar */}
            <div className="px-5 py-4">
              <div>
                <h1 className="text-[15px] font-semibold text-gray-900">{sectionLabel}</h1>
                <p className="mt-0.5 text-[12px] text-gray-500">
                  {projects.length} project{projects.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Filter bar */}
              <div className="mt-3 flex items-center gap-2">
                {/* Sort dropdown */}
                <div className="relative" data-project-sort-dropdown>
                  <button
                    type="button"
                    onClick={() => setSortOpen((o) => !o)}
                    className="flex w-[132px] cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 hover:border-gray-300 active:scale-[0.99] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                  >
                    {currentSort.label}
                    <ChevronDown className="size-3 text-gray-400" aria-hidden />
                  </button>
                  {sortOpen && (
                    <div className="absolute left-0 top-9 z-50 w-[132px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => { setSortKey(opt.key); setSortOpen(false); }}
                          className={cn(
                            "w-full cursor-pointer px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none",
                            opt.key === sortKey ? "font-medium text-gray-900" : "text-gray-600",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1" />

                {/* Search */}
                <div className="relative w-full max-w-[264px] shrink-0">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" aria-hidden />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects"
                    className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-2.5 text-xs text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 placeholder:text-gray-400 hover:border-gray-300 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                    aria-label="Search projects"
                  />
                </div>

                <Link
                  href="/dashboard/builder/new"
                  className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-gray-900 px-3 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:bg-neutral-700 hover:shadow-md active:scale-[0.99] focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500/50"
                >
                  <Plus className="size-3.5" aria-hidden />
                  New project
                </Link>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gray-100">
                    <FolderOpen className="size-5 text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-700">No projects here</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Create a new project to get started.
                  </p>
                </div>
              ) : (
                <div className={PROJECT_GRID_CLASSNAME}>
                  {projects.map((project) => (
                    <ProjectCardGrid
                      key={project.id}
                      project={project}
                      isDeleteConfirmOpen={confirmDeleteProjectId === project.id}
                      onToggleDeleteConfirm={() => setConfirmDeleteProjectId((prev) => (prev === project.id ? null : project.id))}
                      onCancelDelete={() => setConfirmDeleteProjectId(null)}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
