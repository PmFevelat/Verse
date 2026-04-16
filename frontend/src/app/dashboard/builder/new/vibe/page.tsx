"use client";

import { useRouter } from "next/navigation";
import { StepShell, chipClassName } from "@/app/dashboard/builder/_components/step-shell";
import { useNewProject } from "@/app/dashboard/builder/_components/new-project-context";

const VIBES = [
  {
    id: "premium",
    label: "Premium",
    description: "Refined, high-end, deliberate spacing",
  },
  {
    id: "playful",
    label: "Playful",
    description: "Rounded corners, bright accents, friendly tone",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Stripped back, lots of white space, typography-first",
  },
  {
    id: "bold",
    label: "Bold",
    description: "Strong contrast, big type, high visual impact",
  },
  {
    id: "organic",
    label: "Organic",
    description: "Warm tones, natural textures, soft transitions",
  },
  {
    id: "futuristic",
    label: "Futuristic",
    description: "Dark UI, glows, geometric, tech-forward",
  },
] as const;

export default function VibePage() {
  const router = useRouter();
  const { targetVibe, setTargetVibe, advanceMaxStep } = useNewProject();

  function handleContinue() {
    advanceMaxStep(4);
    router.push("/dashboard/builder/new/template");
  }

  return (
    <StepShell
      stepIndex={4}
      totalSteps={5}
      title={<>What&apos;s your <span className="text-gray-800 font-medium">target vibe</span>?</>}
      description="This shapes the visual direction of your screens — tone, spacing, and personality."
      backHref="/dashboard/builder/new/inspiration"
      onContinue={handleContinue}
      continueDisabled={!targetVibe}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {VIBES.map((vibe) => {
          const selected = targetVibe === vibe.id;
          return (
            <button
              key={vibe.id}
              type="button"
              onClick={() => setTargetVibe(vibe.id)}
              className={chipClassName(selected) + " flex-col items-start gap-1.5 px-4 py-3 text-left"}
            >
              <span className="font-medium">{vibe.label}</span>
              <span
                className={
                  selected
                    ? "text-[11px] leading-snug text-white/70"
                    : "text-[11px] leading-snug text-gray-400"
                }
              >
                {vibe.description}
              </span>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
