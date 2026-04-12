import Link from "next/link";

const links = [
  { href: "/", label: "首頁" },
  { href: "/about_me", label: "關於我" },
  { href: "/experience", label: "經歷" },
  { href: "/audio", label: "配樂與聲音" },
  { href: "/graphic_design", label: "平面設計" },
  { href: "/web_design", label: "網頁設計" },
  { href: "/device_design", label: "裝置設計" },
  { href: "/mixing", label: "混音" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-zinc-100/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 transition hover:text-violet-600 dark:text-zinc-50 dark:hover:text-violet-400"
        >
          許兆豐 · Nick Hsu
        </Link>
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-2 text-xs sm:text-sm">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-2.5 py-1 text-zinc-600 transition hover:bg-zinc-200/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100 sm:px-3"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
