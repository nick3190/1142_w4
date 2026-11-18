"use client";

import Link from "next/link";
import { emitFromRect } from "@/lib/particle-fx";
import { siteSections } from "@/lib/site-sections";

// 同一個項目短時間內不重複噴粒子
const lastBurst = new Map<string, number>();

function burst(href: string, el: HTMLElement | null) {
  if (!el) return;
  const now = performance.now();
  if (now - (lastBurst.get(href) ?? 0) < 450) return;
  lastBurst.set(href, now);
  emitFromRect(el.getBoundingClientRect(), "dust");
}

export function SectionList({ className = "" }: { className?: string }) {

  return (
    <nav aria-label="主要頁面" className={className}>
      <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4 lg:grid-cols-1 lg:gap-y-1.5">
        {siteSections.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onPointerEnter={(e) =>
                burst(item.href, e.currentTarget.querySelector("[data-fx]"))
              }
              onFocus={(e) =>
                burst(item.href, e.currentTarget.querySelector("[data-fx]"))
              }
              className="group flex flex-col py-1 lg:flex-row lg:items-baseline lg:justify-end lg:gap-4"
            >
              <span className="order-2 text-xs text-mute transition-opacity duration-300 lg:order-1 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
                {item.desc}
              </span>
              <span
                data-fx
                className="order-1 origin-left text-base text-paper transition-transform duration-300 ease-out group-hover:scale-[1.18] motion-reduce:transition-none lg:order-2 lg:origin-right lg:text-lg"
              >
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
