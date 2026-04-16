"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { StepShell, chipClassName } from "@/app/dashboard/builder/_components/step-shell";
import { useNewProject } from "@/app/dashboard/builder/_components/new-project-context";

const INSPIRATION_APPS = [
  { id: "uber",      label: "Uber",      dot: "#000000" },
  { id: "airbnb",    label: "Airbnb",    dot: "#FF5A5F" },
  { id: "spotify",   label: "Spotify",   dot: "#1DB954" },
  { id: "duolingo",  label: "Duolingo",  dot: "#58CC02" },
  { id: "revolut",   label: "Revolut",   dot: "#0075EB" },
  { id: "calm",      label: "Calm",      dot: "#4A90D9" },
  { id: "notion",    label: "Notion",    dot: "#191919" },
  { id: "linear",    label: "Linear",    dot: "#5E6AD2" },
  { id: "figma",     label: "Figma",     dot: "#F24E1E" },
  { id: "stripe",    label: "Stripe",    dot: "#635BFF" },
  { id: "vercel",    label: "Vercel",    dot: "#000000" },
  { id: "framer",    label: "Framer",    dot: "#0055FF" },
] as const;

export default function InspirationPage() {
  const router = useRouter();
  const {
    inspirationApps,
    uploadedApps,
    toggleInspirationApp,
    addUploadedApp,
    removeUploadedApp,
    advanceMaxStep,
  } = useNewProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((f) => addUploadedApp(f.name));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function handleContinue() {
    advanceMaxStep(3);
    router.push("/dashboard/builder/new/vibe");
  }

  return (
    <StepShell
      stepIndex={3}
      totalSteps={5}
      title={<>Which apps <span className="text-gray-800 font-medium">inspire you</span>?</>}
      description="Select apps whose UX patterns you'd like to draw from. Pick as many as you want."
      backHref="/dashboard/builder/new/job"
      onContinue={handleContinue}
      continueLabel="Continue →"
    >
      <div className="space-y-6">
        {/* Predefined chips */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Select from list
          </p>
          <div className="flex flex-wrap gap-2">
            {INSPIRATION_APPS.map((app) => {
              const selected = inspirationApps.includes(app.id);
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => toggleInspirationApp(app.id)}
                  className={chipClassName(selected)}
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: selected ? "white" : app.dot }}
                  />
                  {app.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload area */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Or upload screenshots
          </p>
          <div
            role="button"
            tabIndex={0}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center transition-all duration-150 hover:border-gray-400 hover:bg-gray-50/50 active:scale-[0.99] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/40"
          >
            <Upload className="size-5 text-gray-400" />
            <p className="text-[13px] text-gray-500">
              Drag & drop screenshots, or{" "}
              <span className="font-medium text-gray-700 underline underline-offset-2">
                browse files
              </span>
            </p>
            <p className="text-[11px] text-gray-400">PNG, JPG, WebP — up to 10 MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Uploaded file pills */}
          {uploadedApps.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {uploadedApps.map((name) => (
                <span
                  key={name}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600"
                >
                  {name}
                  <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUploadedApp(name);
                    }}
                    className="flex size-3.5 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-800 active:scale-90"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </StepShell>
  );
}
