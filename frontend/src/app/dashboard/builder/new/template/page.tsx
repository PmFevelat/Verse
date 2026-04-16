"use client";

import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";
import { StepShell } from "@/app/dashboard/builder/_components/step-shell";
import { useNewProject } from "@/app/dashboard/builder/_components/new-project-context";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  {
    id: "b2c-standard",
    name: "B2C App Standard",
    screensCount: 14,
    description: "Onboarding, home feed, profile, settings, notifications",
    colorSeed: 1,
  },
  {
    id: "marketplace",
    name: "Marketplace",
    screensCount: 18,
    description: "Browse, listing detail, checkout, seller dashboard",
    colorSeed: 2,
  },
  {
    id: "saas-dashboard",
    name: "SaaS Dashboard",
    screensCount: 10,
    description: "Analytics overview, data tables, settings, billing",
    colorSeed: 3,
  },
  {
    id: "social-community",
    name: "Social / Community",
    screensCount: 16,
    description: "Feed, groups, messaging, user profiles, events",
    colorSeed: 4,
  },
  {
    id: "fintech",
    name: "Fintech",
    screensCount: 15,
    description: "Dashboard, transactions, send money, cards, KYC",
    colorSeed: 5,
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    screensCount: 12,
    description: "Tracker, progress charts, routines, coach chat",
    colorSeed: 6,
  },
] as const;

const CARD_GRADIENTS = [
  ["#e0e7ff", "#c7d2fe"],
  ["#fce7f3", "#fbcfe8"],
  ["#d1fae5", "#a7f3d0"],
  ["#fef3c7", "#fde68a"],
  ["#e0f2fe", "#bae6fd"],
  ["#f3e8ff", "#e9d5ff"],
];

export default function TemplatePage() {
  const router = useRouter();
  const { selectedTemplate, setSelectedTemplate, advanceMaxStep } = useNewProject();

  function handleContinue() {
    advanceMaxStep(5);
    // Keep context data — the inspire module reads inspirationApps + selectedTemplate
    router.push("/dashboard/builder/inspire");
  }

  return (
    <StepShell
      stepIndex={5}
      totalSteps={5}
      title={<>Choose a <span className="text-gray-800 font-medium">flow template</span></>}
      description="We'll pre-fill your screen structure based on your choices. You can always customise it."
      backHref="/dashboard/builder/new/vibe"
      onContinue={handleContinue}
      continueLabel="Create project →"
      continueDisabled={!selectedTemplate}
    >
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((tpl) => {
          const selected = selectedTemplate === tpl.id;
          const [from, to] = CARD_GRADIENTS[(tpl.colorSeed - 1) % CARD_GRADIENTS.length];

          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedTemplate(tpl.id)}
              className={cn(
                "group cursor-pointer overflow-hidden rounded-xl border text-left transition-all duration-150 active:scale-[0.99]",
                selected
                  ? "border-gray-900 shadow-md ring-2 ring-gray-900/10"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
              )}
            >
              {/* Mini thumbnail */}
              <div
                className="flex h-20 items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
              >
                <Layers className="size-5 opacity-30" />
              </div>

              {/* Info */}
              <div className="px-3.5 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("text-[13px] font-medium", selected ? "text-gray-900" : "text-gray-800")}>
                    {tpl.name}
                  </p>
                  <span className="shrink-0 text-[11px] tabular-nums text-gray-400">
                    {tpl.screensCount} screens
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-gray-400">{tpl.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
