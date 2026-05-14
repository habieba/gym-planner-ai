"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Plan", href: "/plan" },
  { label: "Schedule", href: "/schedule" },
  { label: "Workout", href: "/workout", activePaths: ["/workout", "/exercises"] },
  { label: "Settings", href: "/settings" },
];

function isActivePath(pathname, link) {
  const activePaths = link.activePaths || [link.href];

  return activePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export default function AppNav() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/onboarding")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 text-foreground backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-foreground">
          Gym Planner
        </Link>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {navLinks.map((link) => {
            const isActive = isActivePath(pathname, link);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary bg-card text-primary"
                    : "border-transparent text-muted hover:border-border hover:bg-card hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
