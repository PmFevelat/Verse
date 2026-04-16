"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/app/dashboard/_components/dashboard-header";
import { NewProjectProvider } from "@/app/dashboard/builder/_components/new-project-context";

// ── Step definitions ──────────────────────────────────────────────────────────

export const DEFINE_STEPS = [
  { id: "app-type",     label: "App type",        path: "/dashboard/builder/new/app-type" },
  { id: "job",          label: "Job to be done",  path: "/dashboard/builder/new/job" },
  { id: "inspiration",  label: "Inspiration apps", path: "/dashboard/builder/new/inspiration" },
  { id: "vibe",         label: "Target vibe",     path: "/dashboard/builder/new/vibe" },
  { id: "template",     label: "Flow template",   path: "/dashboard/builder/new/template" },
] as const;

// ── Sidebar ───────────────────────────────────────────────────────────────────

function NewProjectSidebar() {
  const pathname = usePathname();
  const currentIndex = DEFINE_STEPS.findIndex((s) => s.path === pathname);

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-gray-300 bg-[#fafafa]">
      <div className="flex-1 space-y-4 px-3 py-5">

        {/* ── Define ────────────────────────────────────────────────────── */}
        <div>
          <div className="mb-1.5 flex items-center gap-2 px-2">
            <span className="flex size-4 items-center justify-center rounded-full bg-gray-900 text-[9px] font-bold text-white">
              1
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-700">
              Define
            </span>
          </div>

          <div className="flex flex-col gap-px">
            {DEFINE_STEPS.map((step, i) => {
              const isActive = pathname === step.path;
              const isCompleted = i < currentIndex;
              const isLocked = i > currentIndex;

              return (
                <Link
                  key={step.id}
                  href={isLocked ? "#" : step.path}
                  aria-disabled={isLocked}
                  onClick={isLocked ? (e) => e.preventDefault() : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all duration-150",
                    isLocked
                      ? "cursor-not-allowed text-gray-300"
                      : isActive
                        ? "cursor-pointer bg-white font-medium text-gray-900 shadow-sm ring-1 ring-gray-200/80 hover:bg-gray-50/95 hover:shadow-md active:scale-[0.99]"
                        : isCompleted
                          ? "cursor-pointer text-gray-500 hover:bg-white/60 hover:text-gray-800 active:scale-[0.99] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/30"
                          : "cursor-pointer text-gray-600 hover:bg-white/40 hover:text-gray-800",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-gray-400" />
                  ) : isActive ? (
                    <Circle className="size-3.5 shrink-0 fill-gray-900 text-gray-900" />
                  ) : (
                    <Circle className="size-3.5 shrink-0 text-gray-300" />
                  )}
                  <span className="whitespace-nowrap">{step.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Inspire ───────────────────────────────────────────────────── */}
        <div className="opacity-40">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-gray-300 text-[9px] font-bold text-white">
              2
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Inspire
            </span>
            <Lock className="ml-auto size-3 text-gray-400" />
          </div>
        </div>

        {/* ── Export ────────────────────────────────────────────────────── */}
        <div className="opacity-40">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-gray-300 text-[9px] font-bold text-white">
              3
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Export
            </span>
            <Lock className="ml-auto size-3 text-gray-400" />
          </div>
        </div>

      </div>
    </aside>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function NewProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <NewProjectProvider>
      <div className="flex h-svh flex-col overflow-hidden bg-[#fafafa]">
        <DashboardHeader />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <NewProjectSidebar />
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </NewProjectProvider>
  );
}
