"use client";

import Link from "next/link";
import { ArrowRight, ImageIcon, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GalleryPreview } from "@/components/gallery-preview";

/** Fond compressé (WebP ~17 Ko, max 1920px) — source : ImagesBackground/ImageBackground.jpg */
const GALLERY_BAND_BG = "/ImagesBackground/image-background.webp";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Bloc hero : aligné sur le header (max-w-7xl) */}
      <div className="mx-auto w-full max-w-7xl px-6 pt-28 pb-0">
        <div className="flex w-full flex-col items-center text-center">
          {/* Chip annonce (réf. NEW + texte + flèche) */}
          <div className="mb-10 flex w-full justify-center px-1 sm:px-0">
            <button
              type="button"
              aria-label="The guided design platform for vibe coders"
              className="group inline-flex max-w-full cursor-pointer flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-full border border-gray-200/90 bg-white py-px pl-px pr-2 font-sans text-inherit shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:scale-[1.01] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:flex-nowrap sm:gap-x-1.5 sm:py-0.5 sm:pl-0.5 sm:pr-2.5"
            >
              <span className="shrink-0 rounded bg-gray-900 px-1 py-px text-[7px] font-bold uppercase tracking-wide text-white sm:px-1.5 sm:py-[1px] sm:text-[8px]">
                New
              </span>
              <span className="min-w-0 max-w-[min(100%,17rem)] text-pretty text-left text-[11px] font-medium leading-snug text-gray-600 sm:max-w-none sm:text-xs">
                The guided design platform for vibe coders
              </span>
              <ArrowRight
                className="size-2.5 shrink-0 text-gray-400 transition-transform duration-200 ease-out group-hover:translate-x-px sm:size-3"
                strokeWidth={2.25}
                aria-hidden
              />
            </button>
          </div>

          {/* Geist léger (réf. Tailark) + Playfair italique sur 2 mots */}
          <h1
            className="max-w-5xl text-balance font-sans font-light leading-[1.15] tracking-tight text-gray-900"
            style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)" }}
          >
            From AI slop to{" "}
            <span
              className="italic"
              style={{
                fontFamily: "var(--font-playfair)",
                fontWeight: 400,
              }}
            >
              intentional design
            </span>
            , screen by screen.
          </h1>

          <p className="mt-12 max-w-2xl text-pretty text-xl font-light leading-relaxed text-gray-500 sm:text-2xl">
            Verve guides you through a structured design process and outputs a
            unified prompt system file so your AI builds an app that looks
            intentionally designed, not generated.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Fond pleine largeur ; preview alignée max-w-7xl comme le header */}
      <div className="relative mt-24 w-full">
        <div className="pointer-events-none absolute inset-0 bg-[#fafafa]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${GALLERY_BAND_BG})` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 bg-gradient-to-b from-[#fafafa] to-transparent sm:h-28"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-[#fafafa] to-transparent sm:h-28"
          aria-hidden
        />

        <div className="relative z-[2] mx-auto w-full max-w-7xl px-6">
          <Tabs defaultValue="gallery" className="w-full">
            <div className="flex justify-center">
              <TabsList className="mb-4 gap-1 bg-gray-100 p-1">
                <TabsTrigger value="gallery" className="flex items-center gap-2 px-5 py-2 text-sm">
                  <ImageIcon size={14} />
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="builder" className="flex items-center gap-2 px-5 py-2 text-sm">
                  <Wand2 size={14} />
                  Builder
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="rounded-none border-x border-t border-b border-gray-300 bg-white shadow-none">
              <TabsContent value="gallery" className="m-0 min-h-0">
                <GalleryPreview />
              </TabsContent>

              <TabsContent value="builder" className="m-0">
                <div className="flex h-[783px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                      <Wand2 size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Guided design process</p>
                    <p className="mt-1 text-xs text-gray-400">Preview coming soon</p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
