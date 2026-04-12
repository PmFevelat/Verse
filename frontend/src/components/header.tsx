"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const productItems = [
  {
    title: "Gallery",
    href: "/gallery",
    description:
      "Browse thousands of curated screens from the best B2C apps on the market.",
  },
  {
    title: "Builder",
    href: "/builder",
    description:
      "A guided, step-by-step process to define your design direction and export a prompt system.",
  },
  {
    title: "Design System",
    href: "/design-system",
    description:
      "Auto-generated design tokens — colors, typography, spacing — ready for your AI tool.",
  },
  {
    title: "Export",
    href: "/export",
    description:
      "Download a complete project folder with prompts and assets for Cursor, Lovable, or Claude Code.",
  },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-300 bg-[#fafafa]/95 backdrop-blur-sm">
      <div className="relative mx-auto flex h-12 max-w-7xl items-center px-6">
        {/* Gauche — même flex que la droite pour centrer la nav sur toute la barre */}
        <div className="flex min-w-0 flex-1 items-center justify-start">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-gray-900"
            onClick={(e) => {
              setMobileOpen(false);
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Verve
          </Link>
        </div>

        {/* Desktop nav — axe central du header (indépendant des largeurs logo / CTAs) */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex md:items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-8 bg-transparent px-2 py-0 text-sm font-medium text-gray-600 hover:bg-transparent hover:text-gray-900 data-open:bg-transparent">
                  Product
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[480px] grid-cols-2 gap-2 p-4">
                    {productItems.map((item) => (
                      <li key={item.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "block select-none rounded-lg p-3 transition-colors hover:bg-gray-50",
                            )}
                          >
                            <div className="mb-1 text-sm font-medium text-gray-900">
                              {item.title}
                            </div>
                            <p className="text-xs leading-relaxed text-gray-500">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  href="/pricing"
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  Pricing
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Droite — CTAs desktop, menu mobile */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[0.8rem]" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button
              size="sm"
              className="h-7 bg-gray-900 px-3 text-[0.8rem] text-white hover:bg-gray-800"
              asChild
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
          <button
            className="rounded-md p-2 text-gray-500 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 pb-6 pt-4 md:hidden">
          <div className="mb-4 space-y-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Product
            </p>
            {productItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </div>
          <Link
            href="/pricing"
            className="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/login">Login</Link>
            </Button>
            <Button
              size="sm"
              className="w-full bg-gray-900 text-white hover:bg-gray-800"
              asChild
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
