"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type NewProjectData = {
  appType: string | null;
  jobToBeDone: string;
  inspirationApps: string[];
  uploadedApps: string[];
  targetVibe: string | null;
  selectedTemplate: string | null;
  maxStepIndex: number;
};

type NewProjectCtx = NewProjectData & {
  setAppType: (v: string) => void;
  setJobToBeDone: (v: string) => void;
  toggleInspirationApp: (v: string) => void;
  addUploadedApp: (name: string) => void;
  removeUploadedApp: (name: string) => void;
  setTargetVibe: (v: string) => void;
  setSelectedTemplate: (v: string) => void;
  advanceMaxStep: (index: number) => void;
  reset: () => void;
};

const STORAGE_KEY = "verve-new-project";

const DEFAULT: NewProjectData = {
  appType: null,
  jobToBeDone: "",
  inspirationApps: [],
  uploadedApps: [],
  targetVibe: null,
  selectedTemplate: null,
  maxStepIndex: 0,
};

const Ctx = createContext<NewProjectCtx | null>(null);

export function NewProjectProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<NewProjectData>(DEFAULT);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<NewProjectData>;
        queueMicrotask(() => setData({ ...DEFAULT, ...parsed }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const ctx: NewProjectCtx = {
    ...data,
    setAppType: (v) => setData((d) => ({ ...d, appType: v })),
    setJobToBeDone: (v) => setData((d) => ({ ...d, jobToBeDone: v })),
    toggleInspirationApp: (v) =>
      setData((d) => ({
        ...d,
        inspirationApps: d.inspirationApps.includes(v)
          ? d.inspirationApps.filter((a) => a !== v)
          : [...d.inspirationApps, v],
      })),
    addUploadedApp: (name) =>
      setData((d) => ({
        ...d,
        uploadedApps: d.uploadedApps.includes(name) ? d.uploadedApps : [...d.uploadedApps, name],
      })),
    removeUploadedApp: (name) =>
      setData((d) => ({ ...d, uploadedApps: d.uploadedApps.filter((n) => n !== name) })),
    setTargetVibe: (v) => setData((d) => ({ ...d, targetVibe: v })),
    setSelectedTemplate: (v) => setData((d) => ({ ...d, selectedTemplate: v })),
    advanceMaxStep: (index) =>
      setData((d) => ({ ...d, maxStepIndex: Math.max(d.maxStepIndex, index) })),
    reset: () => {
      setData(DEFAULT);
      localStorage.removeItem(STORAGE_KEY);
    },
  };

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function useNewProject() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNewProject must be used within NewProjectProvider");
  return ctx;
}
