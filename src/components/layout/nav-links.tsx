"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/board", label: "Board" },
  { href: "/resumes", label: "Resumes" },
];

/** Main navigation. The current page is marked with aria-current for screen readers. */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-4 sm:gap-6">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "text-sm transition-colors",
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
