"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { logout } from "@/lib/auth-actions";

// ── Avatar ────────────────────────────────────────────────────────────────────

function DashboardAvatar() {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!user) return null;

  const initials = (user.displayName ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const photoURL = user.photoURL;

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    router.push("/");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="flex size-7 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-900 text-[11px] font-semibold text-white ring-2 ring-transparent transition-all duration-150 hover:brightness-110 hover:ring-gray-400 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]"
        aria-label="Account menu"
      >
        {photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoURL} alt={user.displayName ?? ""} className="size-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-9 z-50 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate text-xs font-medium text-gray-900">
              {user.displayName ?? "My account"}
            </p>
            <p className="truncate text-[11px] text-gray-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full cursor-pointer px-3 py-2 text-left text-xs text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200/80"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard/gallery", label: "Gallery" },
  { href: "/dashboard/builder", label: "Builder" },
] as const;

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-300 bg-[#fafafa]/95 backdrop-blur-sm">
      <div className="flex h-12 items-center gap-1 px-4">
        <Link
          href="/"
          className="mr-3 cursor-pointer text-base font-semibold tracking-tight text-gray-900 transition-all duration-150 hover:opacity-75 active:scale-[0.98]"
        >
          Verve
        </Link>

        <nav className="flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "cursor-pointer rounded-md px-2.5 py-1 text-sm transition-all duration-150 active:scale-[0.98]",
                  isActive
                    ? "bg-gray-100 font-semibold text-gray-900"
                    : "font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <DashboardAvatar />
      </div>
    </header>
  );
}
