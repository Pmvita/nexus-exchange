"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/trade", label: "Trade" },
  { href: "/assets", label: "Assets" },
  { href: "/deposit", label: "Deposit" },
  { href: "/withdraw", label: "Withdraw" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms", label: "Terms" }
];

export function Navbar() {
  const pathname = usePathname();
  const setSymbol = useAppStore((s) => s.setSymbol);
  const symbol = useAppStore((s) => s.symbol);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#222226] bg-[#0a0a0c]/90 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight text-nexus-accent"
          >
            <span className="rounded bg-nexus-accent text-black px-2 py-0.5 text-xs font-bold">N</span>
            <span>Nexus Exchange</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-md transition ${
                  pathname === l.href
                    ? "bg-nexus-accent text-black"
                    : "text-nexus-muted hover:text-white hover:bg-[#1a1a1e]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline text-nexus-muted">{symbol}</span>
            <button className="bg-[#1a1a1e] border border-[#222226] rounded px-3 py-1.5 text-nexus-muted hover:text-white">
              Menu
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
