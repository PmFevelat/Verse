"use client";

import { useRouter } from "next/navigation";
import { StepShell } from "@/app/dashboard/builder/_components/step-shell";
import { useNewProject } from "@/app/dashboard/builder/_components/new-project-context";

export default function JobToBeDonePage() {
  const router = useRouter();
  const { jobToBeDone, setJobToBeDone, advanceMaxStep } = useNewProject();

  function handleContinue() {
    advanceMaxStep(2);
    router.push("/dashboard/builder/new/inspiration");
  }

  return (
    <StepShell
      stepIndex={2}
      totalSteps={5}
      title={<>What&apos;s the <span className="text-gray-800 font-medium">core job to be done</span>?</>}
      description="Describe the main value your app delivers to users. One clear sentence is perfect."
      backHref="/dashboard/builder/new/app-type"
      onContinue={handleContinue}
      continueLabel="Continue →"
    >
      <div className="space-y-2">
        <textarea
          value={jobToBeDone}
          onChange={(e) => setJobToBeDone(e.target.value)}
          placeholder="e.g., Help users book rides in under 60 seconds"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
        />
        <p className="text-[11px] text-gray-400">
          Optional — you can always edit this later.
        </p>
      </div>
    </StepShell>
  );
}
