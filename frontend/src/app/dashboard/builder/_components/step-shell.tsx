"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type StepShellProps = {
  stepIndex: number;
  totalSteps: number;
  title: ReactNode;
  description: string;
  backHref: string;
  continueLabel?: string;
  onContinue?: () => void;
  continueHref?: string;
  continueDisabled?: boolean;
  children: ReactNode;
};

export function StepShell({
  stepIndex,
  totalSteps,
  title,
  description,
  backHref,
  continueLabel = "Continue →",
  onContinue,
  continueHref,
  continueDisabled = false,
  children,
}: StepShellProps) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-[540px]">

        {/* Back */}
        <Link
          href={backHref}
          className="mb-8 inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-all duration-150 hover:bg-black/[0.06] hover:text-gray-800 active:scale-95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40"
          aria-label="Retour"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </Link>

        {/* Step counter */}
        <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-gray-400">
          Step {stepIndex} of {totalSteps} &nbsp;·&nbsp; Define
        </p>

        {/* Title */}
        <h1 className="text-2xl font-normal leading-snug tracking-tight text-gray-600 md:text-[1.65rem]">
          {title}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-400">{description}</p>

        {/* Content */}
        <div className="mt-8">{children}</div>

        {/* Continue */}
        <div className="mt-8">
          {continueHref ? (
            <Link
              href={continueDisabled ? "#" : continueHref}
              onClick={continueDisabled ? (e) => e.preventDefault() : onContinue}
              className={cn(
                "inline-flex h-9 w-full items-center justify-center rounded-md text-sm font-medium text-white transition-all duration-150",
                continueDisabled
                  ? "cursor-not-allowed bg-gray-300"
                  : "cursor-pointer bg-gray-900 shadow-sm hover:bg-neutral-700 hover:shadow-md active:scale-[0.99] active:bg-neutral-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500/50",
              )}
            >
              {continueLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onContinue}
              disabled={continueDisabled}
              className={cn(
                "h-9 w-full rounded-md text-sm font-medium text-white transition-all duration-150",
                continueDisabled
                  ? "cursor-not-allowed bg-gray-300"
                  : "cursor-pointer bg-gray-900 shadow-sm hover:bg-neutral-700 hover:shadow-md active:scale-[0.99] active:bg-neutral-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500/50",
              )}
            >
              {continueLabel}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Shared chip styles ────────────────────────────────────────────────────────

export function chipClassName(selected: boolean) {
  return cn(
    "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition-all duration-150 select-none active:scale-[0.98] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40",
    selected
      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/80 hover:shadow-sm",
  );
}

export function sectionLabel(text: string) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      {text}
    </p>
  );
}
