"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteSections } from "@/lib/site-sections";

export function SiteNav() {
  const pathname = usePathname();
  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-sm">
      <div className="flex flex-col gap-2 px-5 py-3 sm:px-8 lg:flex-row lg:items-baseline lg:justify-between lg:gap-6 lg:px-12">
        <Link
          href="/"
          className="font-serif text-base text-paper transition-colors hover:text-mute"
        >
          許兆豐
        </Link>
        <nav
          aria-label="主要頁面"
          className="-mx-1 flex items-baseline gap-x-4 overflow-x-auto pb-0.5 text-sm whitespace-nowrap"
        >
          {siteSections.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 px-1 underline-offset-[6px] transition-colors ${
                  active
                    ? "text-paper underline decoration-1"
                    : "text-mute hover:text-paper"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
