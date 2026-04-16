"use client";

import { useRouter } from "next/navigation";
import { StepShell, chipClassName } from "@/app/dashboard/builder/_components/step-shell";
import { useNewProject } from "@/app/dashboard/builder/_components/new-project-context";

const APP_TYPES = [
  { id: "b2c",         label: "B2C App" },
  { id: "saas",        label: "SaaS" },
  { id: "marketplace", label: "Marketplace" },
  { id: "social",      label: "Social" },
  { id: "fintech",     label: "Fintech" },
  { id: "health",      label: "Health" },
  { id: "ecommerce",   label: "E-commerce" },
  { id: "gaming",      label: "Gaming" },
] as const;

export default function AppTypePage() {
  const router = useRouter();
  const { appType, setAppType, advanceMaxStep } = useNewProject();

  function handleContinue() {
    advanceMaxStep(1);
    router.push("/dashboard/builder/new/job");
  }

  return (
    <StepShell
      stepIndex={1}
      totalSteps={5}
      title={<>What type of app are <span className="text-gray-800 font-medium">you building</span>?</>}
      description="We'll use this to suggest the right screen structure and naming conventions."
      backHref="/dashboard/builder"
      onContinue={handleContinue}
      continueDisabled={!appType}
    >
      <div className="flex flex-wrap gap-2">
        {APP_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setAppType(type.id)}
            className={chipClassName(appType === type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </StepShell>
  );
}
