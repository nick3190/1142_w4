import Link from "next/link";

const navItems = [
  {
    href: "/about_me",
    title: "關於我",
    subtitle: "學歷、專長與語言",
  },
  {
    href: "/experience",
    title: "經歷",
    subtitle: "展覽、計畫與展場工作",
  },
  {
    href: "/audio",
    title: "配樂與聲音",
    subtitle: "播放清單與專案介紹",
  },
  {
    href: "/graphic_design",
    title: "平面設計",
    subtitle: "主視覺與印刷／數位",
  },
  {
    href: "/web_design",
    title: "網頁設計",
    subtitle: "網站與互動網頁",
  },
  {
    href: "/device_design",
    title: "裝置設計",
    subtitle: "聲響與新媒體裝置",
  },
  {
    href: "/mixing",
    title: "混音",
    subtitle: "影視後期與收音",
  },
] as const;

export function HomeSidebar() {
  return (
    <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-8 lg:max-w-[280px]">
      <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="flex items-center gap-4">
          <div>
            <img src="/public/self_pic.png" alt="Nick Hsu" className="w-10 h-10 rounded-full" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              許兆豐
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              Nick Hsu
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <a
            href="mailto:uniqueee3190@gmail.com"
            className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border border-zinc-200 px-2 text-[10px] font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Mail
          </a>
        </div>
      </div>

      <nav className="flex flex-col gap-3" aria-label="主要頁面">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-start justify-between gap-3 rounded-3xl border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-sm transition hover:border-violet-400/40 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:hover:border-violet-500/35"
          >
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {item.title}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400">
                {item.subtitle}
              </p>
            </div>
            <span
              className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 transition group-hover:bg-violet-500 dark:bg-zinc-600"
              aria-hidden
            />
          </Link>
        ))}
      </nav>
    </aside>
  );
}
