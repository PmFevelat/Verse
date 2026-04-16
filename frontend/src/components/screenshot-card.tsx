"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const PHONE_SCREEN_ASPECT = "aspect-[9/16]";

/** Largeur max d’une « colonne téléphone » — pas de `1fr` en max de piste pour éviter l’étirement quand la zone principale s’élargit (ex. sidebar repliée). */
export const SCREENSHOT_GRID_CLASSNAME = cn(
  "grid content-start [justify-content:center]",
  "gap-x-3 gap-y-8 min-[720px]:gap-x-6 min-[720px]:gap-y-12",
  "[grid-template-columns:repeat(auto-fill,minmax(min(100%,169px),min(100%,243px)))]",
  /* min un peu plus bas à partir de md : une 5e colonne peut tenir là où 208px + max 243px laissait un trou à droite */
  "min-[720px]:[grid-template-columns:repeat(auto-fill,minmax(min(100%,196px),min(100%,243px)))]",
);

function AppLogoTile({
  appName,
  className,
}: {
  appName: string;
  className?: string;
}) {
  const initial = appName.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <div
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-200/90 text-[11px] font-bold text-gray-700",
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function ScreenshotCard({
  appName,
  imageUrl,
  imageAlt,
  onClick,
  selected = false,
  dataCardId,
  overlay,
}: {
  appName: string;
  imageUrl: string;
  imageAlt: string;
  onClick?: () => void;
  selected?: boolean;
  dataCardId?: string;
  overlay?: ReactNode;
}) {
  return (
    <div
      className="flex w-full max-w-[243px] flex-col gap-1.5 justify-self-start"
    >
      <div className="relative" data-inspiration-card={dataCardId}>
        {overlay}
        <article
          onClick={onClick}
          className={cn(
            "group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-150",
            selected
              ? "shadow-[0_0_0_2px_white,0_0_0_4px_#6366f1]"
              : "shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_2px_rgba(99,102,241,0.25),0_4px_12px_-4px_rgba(0,0,0,0.1)]",
          )}
        >
          <div className={cn(PHONE_SCREEN_ASPECT, "w-full overflow-hidden bg-gray-100")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={imageAlt}
              className="size-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        </article>
      </div>

      <div className="flex w-full items-center justify-start gap-1.5 pt-1.5">
        <AppLogoTile appName={appName} className="size-6 text-[10px]" />
        <span className="min-w-0 truncate text-[11px] font-semibold text-gray-900">
          {appName}
        </span>
      </div>
    </div>
  );
}
