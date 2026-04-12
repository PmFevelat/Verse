import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WordmarkFit } from "@/components/wordmark-fit";

const footerLinks = {
  Product: [
    { label: "Gallery", href: "/gallery" },
    { label: "Builder", href: "/builder" },
    { label: "Pricing", href: "/pricing" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Blog", href: "/blog" },
    { label: "Changelog", href: "/changelog" },
  ],
  Social: [
    { label: "YouTube", href: "https://youtube.com" },
    { label: "X / Twitter", href: "https://x.com" },
    { label: "Discord", href: "https://discord.com" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-24 mb-0 border-t border-gray-300 bg-[#fafafa] pb-0">
      {/* Top section */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="shrink-0">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-gray-900"
            >
              Verve
            </Link>
            <p className="mt-3 max-w-[200px] text-sm leading-relaxed text-gray-500">
              Ship with spirit. Build with taste.
            </p>
            <div className="mt-4">
              <Button
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800"
                asChild
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Links — groupés et compacts à droite */}
          <div className="flex gap-8 sm:gap-12">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {section}
                </p>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom — copyright serré au-dessus du wordmark */}
      <div className="mb-0 overflow-hidden pb-0">
        <div className="mx-auto max-w-7xl px-6 pb-0 mb-0">
          <div className="flex items-center justify-between gap-4 pb-0 pt-0">
            <p className="m-0 text-xs leading-tight text-gray-400">
              © {new Date().getFullYear()} Verve. All rights reserved.
            </p>
            <p className="m-0 text-xs leading-tight text-gray-400">
              <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
              {" · "}
              <Link href="/terms" className="hover:text-gray-600">Terms</Link>
            </p>
          </div>
          <div className="mt-1.5">
            <WordmarkFit
              text="Verve"
              className="select-none font-extrabold leading-none tracking-[-0.04em] text-gray-900"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
