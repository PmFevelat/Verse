"use client";

import { useState, useMemo, useEffect, useCallback, Fragment, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Plus,
  X,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/app/dashboard/_components/dashboard-header";
import { ScreenPickerModal } from "@/app/dashboard/builder/inspire/_components/screen-picker-modal";
import {
  SCREENSHOT_GRID_CLASSNAME,
  ScreenshotCard,
} from "@/components/screenshot-card";

// ── Types ─────────────────────────────────────────────────────────────────────

type FidelityMode = "structure" | "style" | "freely";
type ScreenType = "key-page" | "flow";

type Screen = { id: string; name: string; type: ScreenType };

type CardAnnotation = { fidelityMode: FidelityMode; notes: string };

type ScreenAnnotation = {
  selectedCardIds: string[];
  cardAnnotations: Record<string, CardAnnotation>;
};

type InspirationCard = {
  id: string;
  appId: string;
  appName: string;
  variant: string;
  imageUrl: string;
};

// ── Data ──────────────────────────────────────────────────────────────────────

const TEMPLATE_SCREENS: Record<string, { keyPages: string[]; flows: string[] }> = {
  "b2c-standard": {
    keyPages: ["Welcome", "Sign Up", "Login", "Home", "Profile", "Settings"],
    flows: ["Onboarding Step 1", "Onboarding Step 2", "Onboarding Step 3", "Search", "Detail View", "Checkout"],
  },
  "marketplace": {
    keyPages: ["Home", "Listing", "Profile", "Dashboard", "Messages"],
    flows: ["Browse", "Checkout Flow", "Seller Onboarding", "Search", "Detail View"],
  },
  "saas-dashboard": {
    keyPages: ["Dashboard", "Reports", "Settings", "Profile"],
    flows: ["Onboarding", "Data Import", "Sharing", "Billing"],
  },
  "social-community": {
    keyPages: ["Feed", "Profile", "Groups", "Notifications"],
    flows: ["Sign Up", "Post Creation", "Search", "Messaging", "Events", "Settings"],
  },
  "fintech": {
    keyPages: ["Dashboard", "Transactions", "Cards", "Profile"],
    flows: ["KYC Verification", "Send Money", "Top Up", "Checkout", "Settings"],
  },
  "health-wellness": {
    keyPages: ["Home", "Progress", "Routines", "Profile"],
    flows: ["Onboarding", "Log Activity", "Coach Chat", "Goals Setup", "Settings"],
  },
};

const DEFAULT_SCREENS = TEMPLATE_SCREENS["b2c-standard"];

const APP_NAMES: Record<string, string> = {
  uber: "Uber", airbnb: "Airbnb", spotify: "Spotify", duolingo: "Duolingo",
  revolut: "Revolut", calm: "Calm", notion: "Notion", linear: "Linear",
  figma: "Figma", stripe: "Stripe", vercel: "Vercel", framer: "Framer",
};

// Default apps shown when user skipped the Define inspiration step
const DEFAULT_APPS = ["uber", "airbnb", "spotify", "duolingo"];

// Variantes par app — davantage de cartes = scroll vertical plus lisible
const VARIANTS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

/** Ratio 9:16 — standard écran smartphone en portrait (cohérent pour simuler une capture téléphone) */
const PHONE_SCREEN_ASPECT = "aspect-[9/16]";

const FIDELITY_OPTIONS: { id: FidelityMode; label: string; desc: string }[] = [
  { id: "structure", label: "Follow structure", desc: "Same layout and hierarchy as this screen." },
  { id: "style",     label: "Follow style",     desc: "Visual feel, typography, and colour palette." },
  { id: "freely",    label: "Inspire freely",   desc: "Use as a loose reference only." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function imageSeed(appId: string, screenName: string, variant: string): number {
  const str = `${appId}-${screenName}-${variant}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return (Math.abs(h) % 800) + 100;
}

function buildCards(appIds: string[], screenName: string): InspirationCard[] {
  const apps = appIds.length > 0 ? appIds : DEFAULT_APPS;
  return apps.flatMap((appId) =>
    VARIANTS.map((v) => ({
      id: `${appId}-${v}`,
      appId,
      appName: APP_NAMES[appId] ?? appId,
      variant: v,
      imageUrl: `https://picsum.photos/seed/verve-${imageSeed(appId, screenName, v)}/360/640`,
    })),
  );
}

function buildScreens(template: string | null): Screen[] {
  const { keyPages, flows } = (template && TEMPLATE_SCREENS[template]) ?? DEFAULT_SCREENS;
  return [
    ...keyPages.map((n) => ({ id: `kp-${n}`, name: n, type: "key-page" as ScreenType })),
    ...flows.map((n)  => ({ id: `fl-${n}`, name: n, type: "flow" as ScreenType })),
  ];
}

const INSPIRATION_REMOVE_CONFIRM_MS = 220;

/** Petite modale Cancel / Remove avec entrée & sortie animées (opacity + scale + léger translate). */
function InspirationRemoveConfirm({
  onCancel,
  onRemove,
}: {
  onCancel: () => void;
  onRemove: () => void;
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
    }, INSPIRATION_REMOVE_CONFIRM_MS);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Remove inspiration"
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
          className="min-h-0 flex-1 rounded px-1 py-0.5 text-center font-medium text-gray-700 transition-colors hover:bg-gray-50 [font-size:inherit] [line-height:inherit]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closeWith(onRemove);
          }}
          className="min-h-0 flex flex-1 items-center justify-center gap-0.5 rounded px-1 py-0.5 font-semibold text-red-600 transition-colors hover:bg-red-50 [font-size:inherit] [line-height:inherit]"
        >
          <Trash2 className="size-2.5 shrink-0" strokeWidth={2.25} />
          Remove
        </button>
      </div>
    </div>
  );
}

// ── ScreenNavItem ─────────────────────────────────────────────────────────────

function ScreenNavItem({
  screen, isActive, isDone, onClick,
}: { screen: Screen; isActive: boolean; isDone: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-all duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]",
        "active:scale-[0.99]",
        isActive
          ? "bg-gray-200/70 font-semibold text-gray-900"
          :           isDone
            ? "font-semibold text-gray-900 hover:bg-gray-100/80"
            : "text-gray-400 hover:bg-gray-100/80 hover:text-gray-700",
      )}
    >
      {isDone
        ? (
          <CheckCircle2 className="size-3.5 shrink-0 text-indigo-400 transition-colors group-hover:text-indigo-500" />
        )
        : (
          <Circle className="size-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-gray-400" />
        )}
      <span className="truncate">{screen.name}</span>
    </button>
  );
}

/** Ligne d’insertion entre deux screens — volontairement discrète pour ne pas rivaliser avec les items. */
function ScreenInsertSlot({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="px-2 py-px">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onAdd();
        }}
        aria-label={label}
        title={label}
        className={cn(
          "group flex w-full cursor-pointer items-center gap-1 rounded-md border border-transparent bg-transparent py-0.5 pl-0.5 pr-0.5",
          "transition-all duration-150 hover:bg-gray-100/60 active:scale-[0.99] focus-visible:outline focus-visible:ring-2 focus-visible:ring-gray-400/40",
        )}
      >
        <span
          className="h-px min-w-[10px] flex-1 bg-gray-200/45 transition-colors group-hover:bg-gray-300/80"
          aria-hidden
        />
        <span
          className="flex size-[15px] shrink-0 items-center justify-center rounded-full border border-dashed border-gray-200/90 bg-white/80 text-gray-400 transition-colors group-hover:border-gray-300 group-hover:text-gray-600"
          aria-hidden
        >
          <Plus className="size-2" strokeWidth={2.25} />
        </span>
        <span
          className="h-px min-w-[10px] flex-1 bg-gray-200/45 transition-colors group-hover:bg-gray-300/80"
          aria-hidden
        />
      </button>
    </div>
  );
}

// ── FidelityRadio ─────────────────────────────────────────────────────────────

function FidelityRadio({ value, onChange }: { value: FidelityMode; onChange: (v: FidelityMode) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {FIDELITY_OPTIONS.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "group flex w-full cursor-pointer flex-col gap-1 rounded-xl border px-3 py-2 text-left shadow-none transition-all duration-150",
              "outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]",
              "active:scale-[0.99]",
              selected
                ? "border-[#c7ceff] bg-[#f3f5ff]"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            {/* Ligne 1 : pastille + titre */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  selected ? "border-indigo-500" : "border-gray-300 group-hover:border-gray-400",
                )}
              >
                {selected && <span className="size-2 rounded-full bg-indigo-500" />}
              </span>
              <span
                className={cn(
                  "text-[12px] font-semibold leading-tight",
                  selected ? "text-gray-900" : "text-gray-800",
                )}
              >
                {opt.label}
              </span>
            </div>
            {/* Ligne 2 : description seule, couleur distincte */}
            <p className="text-[6px] font-normal leading-snug text-gray-400">
              {opt.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ── Annotation Modal ──────────────────────────────────────────────────────────

function AnnotationModal({
  open,
  isNew,
  card,
  annotation,
  onBack,
  onSave,
}: {
  open: boolean;
  /** true = première sélection (Back → désélectionne) ; false = existante (Back → ferme sans sauvegarder) */
  isNew: boolean;
  card: InspirationCard | null;
  annotation: CardAnnotation;
  onBack: () => void;
  onSave: (draft: CardAnnotation) => void;
}) {
  // Draft local — les changements ne sont appliqués qu'au clic Save
  const [draft, setDraft] = useState<CardAnnotation>(annotation);

  // Réinitialise le draft à chaque ouverture de modale
  useEffect(() => {
    if (open) setDraft(annotation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape et backdrop → même comportement que Back
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onBack(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onBack]);

  const modalTransition =
    "duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-150 motion-reduce:ease-linear";

  return (
    // Backdrop — ouverture / fermeture fluides (même courbe que le picker d’écran)
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity",
        modalTransition,
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {/* Dim overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity",
          modalTransition,
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onBack}
      />

      {/* Modal panel — screenshot + colonne annotation plus large, pied de page collé en bas */}
      <div
        className={cn(
          "relative flex min-h-[min(560px,88vh)] w-full max-w-[960px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.18)] transition-[opacity,transform]",
          modalTransition,
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-[0.97] opacity-0",
        )}
      >
        {/* ── Left: screenshot — prend la majorité de la largeur ────────── */}
        {/* Cadrage type Mobbin : image plus étroite, beaucoup de marge dans le panneau */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-[#f0f0ef] px-8 py-10 sm:px-14 sm:py-14">
          {card && (
            <div className="w-[min(248px,max(24vw,160px))] max-w-full">
              <div className="overflow-hidden rounded-[18px] shadow-[0_8px_32px_-10px_rgba(0,0,0,0.2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imageUrl}
                  alt={`${card.appName} — ${card.variant}`}
                  className={cn(PHONE_SCREEN_ASPECT, "w-full object-cover object-top")}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Right: annotation — plus large (#FAFAFA), scroll au milieu, CTA en bas */}
        <div className="flex min-h-0 w-[min(100%,400px)] min-w-[300px] shrink-0 flex-col border-l border-gray-200/80 bg-[#fafafa] sm:min-w-[360px] sm:w-[400px]">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-gray-200/80 px-4">
            <h2 className="text-[14px] font-semibold text-gray-900">Annotation</h2>
            <button
              type="button"
              onClick={onBack}
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-all duration-150 hover:bg-gray-200/80 hover:text-gray-800 active:scale-95"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Fidelity mode
                </p>
                <FidelityRadio
                  value={draft.fidelityMode}
                  onChange={(v) => setDraft((d) => ({ ...d, fidelityMode: v }))}
                />
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  What do you like?
                </p>
                <textarea
                  value={draft.notes}
                  onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                  placeholder="e.g., Love the card layout but not the colors…"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] leading-relaxed text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-300 focus:ring-2 focus:ring-gray-900/5"
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200/80 bg-[#fafafa] px-4 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="cursor-pointer border-gray-300 bg-white text-gray-800 shadow-none transition-all duration-150 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 hover:shadow-none active:scale-[0.98] active:bg-gray-100 focus-visible:shadow-none"
            >
              {isNew ? "Cancel" : "Back"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onSave(draft)}
              className="cursor-pointer bg-black text-white shadow-none transition-all duration-150 hover:bg-neutral-700 hover:shadow-none active:scale-[0.98] active:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-500/40 focus-visible:shadow-none"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InspirePage() {
  const router = useRouter();

  const [inspirationApps, setInspirationApps] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("verve-new-project");
      if (saved) {
        const p = JSON.parse(saved);
        setInspirationApps(p.inspirationApps ?? []);
        setSelectedTemplate(p.selectedTemplate ?? null);
      }
    } catch {}
  }, []);

  const [screens, setScreens] = useState<Screen[]>(() => buildScreens(null));

  useEffect(() => {
    setScreens(buildScreens(selectedTemplate));
  }, [selectedTemplate]);

  const [activeIndex, setActiveIndex]     = useState(0);
  const [annotations, setAnnotations]     = useState<Record<string, ScreenAnnotation>>({});
  const [modalCardId, setModalCardId]     = useState<string | null>(null);
  const [modalOpen, setModalOpen]         = useState(false);
  const [modalIsNew, setModalIsNew]       = useState(false);
  /** Card en attente de confirmation avant désélection (popover au-dessus de la card) */
  const [confirmRemoveCardId, setConfirmRemoveCardId] = useState<string | null>(null);
  const [screenPickerOpen, setScreenPickerOpen] = useState(false);
  const [screenPickerSession, setScreenPickerSession] = useState(0);
  const [screenPickerTarget, setScreenPickerTarget] = useState<{
    globalIndex: number;
    sectionType: ScreenType;
  } | null>(null);

  const activeScreen      = screens[activeIndex] ?? screens[0];
  const cards             = useMemo(() => buildCards(inspirationApps, activeScreen?.name ?? ""), [inspirationApps, activeScreen?.name]);
  const screenAnnotation  = annotations[activeScreen?.id ?? ""];
  const selectedCardIds   = screenAnnotation?.selectedCardIds ?? [];

  const completedCount = useMemo(
    () => Object.values(annotations).filter((a) => a.selectedCardIds.length > 0).length,
    [annotations],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const closeModal = useCallback(() => setModalOpen(false), []);

  const insertScreenAt = useCallback((globalIndex: number, type: ScreenType, name: string) => {
    const newScreen: Screen = {
      id: `${type === "key-page" ? "kp" : "fl"}-new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      type,
    };
    setScreens((prev) => {
      const next = [...prev];
      const i = Math.max(0, Math.min(globalIndex, next.length));
      next.splice(i, 0, newScreen);
      return next;
    });
    setActiveIndex((prev) => (globalIndex <= prev ? prev + 1 : prev));
  }, []);

  const closeScreenPicker = useCallback(() => {
    setScreenPickerOpen(false);
    setScreenPickerTarget(null);
  }, []);

  const openScreenPicker = useCallback((globalIndex: number, sectionType: ScreenType) => {
    setModalOpen(false);
    setScreenPickerSession((s) => s + 1);
    setScreenPickerTarget({ globalIndex, sectionType });
    setScreenPickerOpen(true);
  }, []);

  const handleScreenPickerConfirm = useCallback(
    (title: string) => {
      if (!screenPickerTarget) return;
      insertScreenAt(screenPickerTarget.globalIndex, screenPickerTarget.sectionType, title);
      closeScreenPicker();
    },
    [screenPickerTarget, insertScreenAt, closeScreenPicker],
  );

  function openModal(cardId: string, isNew: boolean) {
    setModalCardId(cardId);
    setModalIsNew(isNew);
    setModalOpen(true);
  }

  function handleCardClick(cardId: string) {
    const isSelected = selectedCardIds.includes(cardId);

    if (isSelected) {
      setConfirmRemoveCardId(null);
      // Rouvre la modale sur une card déjà sauvegardée (isNew = false)
      openModal(cardId, false);
      return;
    }

    if (selectedCardIds.length >= 3) return;

    // Ajoute provisoirement à la sélection — sera retiré si l'utilisateur clique "Cancel"
    const screenId = activeScreen.id;
    setAnnotations((prev) => ({
      ...prev,
      [screenId]: {
        selectedCardIds: [...(prev[screenId]?.selectedCardIds ?? []), cardId],
        cardAnnotations: {
          ...(prev[screenId]?.cardAnnotations ?? {}),
          [cardId]: { fidelityMode: "structure", notes: "" },
        },
      },
    }));
    openModal(cardId, true); // isNew = true
  }

  function handleRemoveCard(cardId: string) {
    const screenId = activeScreen.id;
    setAnnotations((prev) => {
      const s = prev[screenId];
      if (!s) return prev;
      const newAnnots = { ...s.cardAnnotations };
      delete newAnnots[cardId];
      return { ...prev, [screenId]: { selectedCardIds: s.selectedCardIds.filter((id) => id !== cardId), cardAnnotations: newAnnots } };
    });
    closeModal();
  }

  // Appelé uniquement par le bouton Save — applique le draft dans l'état principal
  function handleSave(draft: CardAnnotation) {
    if (!modalCardId) return;
    const screenId = activeScreen.id;
    setAnnotations((prev) => ({
      ...prev,
      [screenId]: {
        ...prev[screenId],
        cardAnnotations: {
          ...(prev[screenId]?.cardAnnotations ?? {}),
          [modalCardId]: draft,
        },
      },
    }));
    closeModal();
  }

  // Back / Cancel / Escape / backdrop
  function handleBack() {
    if (modalIsNew && modalCardId) {
      // Première sélection abandonnée → on désélectionne la card
      handleRemoveCard(modalCardId);
    } else {
      // Card existante → on ferme sans appliquer les changements du draft
      closeModal();
    }
  }

  function navigateScreen(dir: 1 | -1) {
    const next = Math.max(0, Math.min(screens.length - 1, activeIndex + dir));
    if (next === activeIndex) return;
    setModalOpen(false);
    setScreenPickerOpen(false);
    setScreenPickerTarget(null);
    setConfirmRemoveCardId(null);
    setActiveIndex(next);
  }

  // Fermer la popover de confirmation au clic extérieur ou Escape
  useEffect(() => {
    if (!confirmRemoveCardId) return;
    function onPointerDown(e: PointerEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest(`[data-inspiration-card="${confirmRemoveCardId}"]`)) return;
      setConfirmRemoveCardId(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmRemoveCardId(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [confirmRemoveCardId]);

  const modalCard = cards.find((c) => c.id === modalCardId) ?? null;
  const modalAnnotation: CardAnnotation = modalCardId
    ? (screenAnnotation?.cardAnnotations?.[modalCardId] ?? { fidelityMode: "structure", notes: "" })
    : { fidelityMode: "structure", notes: "" };

  return (
    <>
      <div className="flex h-svh flex-col overflow-hidden bg-[#fafafa]">
        <DashboardHeader />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* ── Left sidebar ────────────────────────────────────────────────── */}
          <aside className="flex w-[220px] shrink-0 flex-col border-r border-gray-300 bg-[#fafafa]">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-gray-200 px-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Screens</span>
              <span className="text-[10px] font-semibold tabular-nums text-indigo-500">
                {completedCount}/{screens.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard/builder/new/template")}
              className={cn(
                "group flex w-full cursor-pointer items-center gap-1.5 border-b border-gray-100 px-4 py-2 text-left text-[11px] text-gray-500 transition-all duration-150",
                "hover:bg-gray-100/90 hover:text-gray-900",
                "active:scale-[0.99] active:bg-gray-200/60",
                "focus-visible:outline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400/35",
              )}
            >
              <ArrowLeft className="size-3 shrink-0 transition-transform group-hover:-translate-x-px" />
              Back to Define
            </button>

            <div className="flex-1 overflow-y-auto py-3">
              {/* Key Pages — insertions entre les lignes (comme des slides) */}
              <div className="mb-4">
                <p className="mb-1.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Key Pages</p>
                <div className="mb-1.5 px-4 text-[11px] font-normal leading-snug text-gray-500 [text-size-adjust:100%] [-webkit-text-size-adjust:100%]">
                  Use the + between rows to insert a screen anywhere in this list.
                </div>
                <div className="flex flex-col gap-px px-2">
                  {(() => {
                    const keyPages = screens.filter((s) => s.type === "key-page");
                    const firstKeyGlobal = screens.findIndex((s) => s.type === "key-page");
                    return (
                      <>
                        <ScreenInsertSlot
                          label="Add key page screen here"
                          onAdd={() => openScreenPicker(firstKeyGlobal === -1 ? 0 : firstKeyGlobal, "key-page")}
                        />
                        {keyPages.map((screen) => {
                          const g = screens.indexOf(screen);
                          return (
                            <Fragment key={screen.id}>
                              <ScreenNavItem
                                screen={screen}
                                isActive={screen.id === activeScreen?.id}
                                isDone={(annotations[screen.id]?.selectedCardIds.length ?? 0) > 0}
                                onClick={() => {
                                  setModalOpen(false);
                                  closeScreenPicker();
                                  setConfirmRemoveCardId(null);
                                  setActiveIndex(g);
                                }}
                              />
                              <ScreenInsertSlot
                                label={`Add key page screen after ${screen.name}`}
                                onAdd={() => openScreenPicker(g + 1, "key-page")}
                              />
                            </Fragment>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Interaction Flows */}
              <div>
                <p className="mb-1.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Interaction Flows</p>
                <div className="flex flex-col gap-px px-2">
                  {(() => {
                    const flowScreens = screens.filter((s) => s.type === "flow");
                    const firstFlowGlobal = screens.findIndex((s) => s.type === "flow");
                    return (
                      <>
                        <ScreenInsertSlot
                          label="Add flow screen here"
                          onAdd={() => openScreenPicker(firstFlowGlobal === -1 ? screens.length : firstFlowGlobal, "flow")}
                        />
                        {flowScreens.map((screen) => {
                          const g = screens.indexOf(screen);
                          return (
                            <Fragment key={screen.id}>
                              <ScreenNavItem
                                screen={screen}
                                isActive={screen.id === activeScreen?.id}
                                isDone={(annotations[screen.id]?.selectedCardIds.length ?? 0) > 0}
                                onClick={() => {
                                  setModalOpen(false);
                                  closeScreenPicker();
                                  setConfirmRemoveCardId(null);
                                  setActiveIndex(g);
                                }}
                              />
                              <ScreenInsertSlot
                                label={`Add flow screen after ${screen.name}`}
                                onAdd={() => openScreenPicker(g + 1, "flow")}
                              />
                            </Fragment>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main content : zone scroll + barre CTA Next ancrée en bas (toujours visible) ── */}
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* Sticky header */}
              <div className="sticky top-0 z-10 border-b border-gray-100 bg-[#fafafa]/95 px-5 py-3 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-[15px] font-semibold text-gray-900">{activeScreen?.name}</h1>
                    {activeScreen?.type === "key-page" && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">Key page</span>
                    )}
                    {activeScreen?.type === "flow" && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">Flow</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigateScreen(-1)}
                      disabled={activeIndex === 0}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150",
                        "disabled:cursor-not-allowed disabled:opacity-30",
                        "enabled:cursor-pointer enabled:hover:border-gray-400 enabled:hover:bg-gray-50 enabled:hover:text-gray-800 enabled:hover:shadow-sm enabled:active:scale-95",
                        "focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/45",
                      )}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateScreen(1)}
                      disabled={activeIndex === screens.length - 1}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150",
                        "disabled:cursor-not-allowed disabled:opacity-30",
                        "enabled:cursor-pointer enabled:hover:border-gray-400 enabled:hover:bg-gray-50 enabled:hover:text-gray-800 enabled:hover:shadow-sm enabled:active:scale-95",
                        "focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/45",
                      )}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-0.5 text-[12px] text-gray-400">
                  Select 1–3 inspirations, then annotate what you like.
                  {selectedCardIds.length > 0 && (
                    <span className="ml-2 font-medium text-indigo-500">{selectedCardIds.length}/3 selected</span>
                  )}
                </p>
              </div>

              {/* Grille type Mobbin : auto-fill + min colonne responsive, gaps 12→24 & verticaux 48→96 */}
              <div className="px-5 py-5">
                <div className={SCREENSHOT_GRID_CLASSNAME}>
                  {cards.map((card) => {
                    const isSelected = selectedCardIds.includes(card.id);

                    return (
                      <ScreenshotCard
                        key={card.id}
                        appName={card.appName}
                        imageUrl={card.imageUrl}
                        imageAlt={`${card.appName} — ${card.variant}`}
                        dataCardId={card.id}
                        selected={isSelected}
                        onClick={() => handleCardClick(card.id)}
                        overlay={
                          <>
                            {/* Confirm remove — compact, ancré sur la carte (évite le débordement en haut du viewport) */}
                            {confirmRemoveCardId === card.id && (
                              <InspirationRemoveConfirm
                                onCancel={() => setConfirmRemoveCardId(null)}
                                onRemove={() => {
                                  handleRemoveCard(card.id);
                                  setConfirmRemoveCardId(null);
                                }}
                              />
                            )}

                            {/* Badge ✓ → × au hover : clic ouvre la confirmation (pas de désélection directe) */}
                            {isSelected && (
                              <div
                                className="group/badge absolute right-1.5 top-1.5 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmRemoveCardId((prev) => (prev === card.id ? null : card.id));
                                }}
                              >
                                <div className="relative flex size-5 items-center justify-center rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.25)] transition-colors group-hover/badge:bg-red-50">
                                  {/* Checkmark — disparaît au hover */}
                                  <svg
                                    className="size-2.5 text-indigo-500 transition-opacity duration-150 group-hover/badge:opacity-0"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  {/* × — apparaît au hover, positionné par-dessus */}
                                  <X
                                    className="absolute size-2.5 text-red-500 opacity-0 transition-opacity duration-150 group-hover/badge:opacity-100"
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        }
                      />
                    );
                  })}
                </div>

                {/* Export CTA */}
                {completedCount === screens.length && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/builder")}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2)] transition-all duration-150",
                        "hover:bg-neutral-700 hover:shadow-md active:scale-[0.98] active:bg-neutral-900",
                        "focus-visible:outline focus-visible:ring-2 focus-visible:ring-neutral-500/50",
                      )}
                    >
                      Continue to Export →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Next screen — même teinte #FAFAFA que la page + léger flou (éviter /opacity trop basse → rendu blanc) */}
            {selectedCardIds.length > 0 && activeIndex < screens.length - 1 && (
              <div
                className={cn(
                  "shrink-0 border-t border-gray-200/70 px-5 py-3",
                  "bg-[#fafafa]/92 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.05)]",
                  "backdrop-blur-xl backdrop-saturate-100",
                )}
              >
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => navigateScreen(1)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white",
                      "shadow-[0_4px_16px_-4px_rgba(99,102,241,0.55)] transition-all duration-200 ease-out",
                      "hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-[0_10px_28px_-6px_rgba(99,102,241,0.55)]",
                      "active:translate-y-0 active:scale-[0.98] active:bg-indigo-700",
                      "focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
                    )}
                  >
                    Next screen →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Annotation modal ─────────────────────────────────────────────────── */}
      <AnnotationModal
        open={modalOpen}
        isNew={modalIsNew}
        card={modalCard}
        annotation={modalAnnotation}
        onBack={handleBack}
        onSave={handleSave}
      />

      <ScreenPickerModal
        key={screenPickerSession}
        open={screenPickerOpen}
        sectionType={screenPickerTarget?.sectionType ?? "key-page"}
        onClose={closeScreenPicker}
        onConfirm={handleScreenPickerConfirm}
      />
    </>
  );
}
