import Link from "next/link";

const youtubeId = process.env.NEXT_PUBLIC_SHOWREEL_YOUTUBE_ID?.trim();

const sidebarLinks = [
  { href: "/about_me", title: "關於我", desc: "學歷、專長與語言" },
  { href: "/experience", title: "經歷", desc: "展覽、計畫與展場工作" },
  { href: "/audio", title: "配樂與聲音", desc: "播放清單與專案介紹" },
  { href: "/graphic_design", title: "平面設計", desc: "主視覺與印刷／數位" },
  { href: "/web_design", title: "網頁設計", desc: "網站與互動網頁" },
  { href: "/device_design", title: "裝置設計", desc: "聲響與新媒體裝置" },
  { href: "/mixing", title: "混音", desc: "影視後期與收音" },
] as const;

const portfolioLinks = [
  { href: "/audio", title: "配樂與聲音設計", desc: "串流播放介面、曲目與專案介紹" },
  { href: "/graphic_design", title: "平面設計", desc: "主視覺、識別與版面作品" },
  { href: "/web_design", title: "網頁設計", desc: "網站與互動網頁專案" },
  { href: "/device_design", title: "裝置設計", desc: "聲響／新媒體裝置與展場" },
  { href: "/mixing", title: "混音", desc: "影視後期混音與收音" },
] as const;

export default function Home() {
  return (
    <main className="min-h-full">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start lg:gap-8">
          {/* 左欄 */}
          <div className="order-2 lg:order-1">
            <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-8 lg:max-w-[280px]">
              <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/80">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/self_pic.png"
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
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
                    className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border border-zinc-200 px-2 text-[10px] font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Mail
                  </a>
                  <a
                    href="tel:0908700909"
                    className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border border-zinc-200 px-2 text-[10px] font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Tel
                  </a>
                </div>
              </div>

              <nav className="flex flex-col gap-3" aria-label="主要頁面">
                {sidebarLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-start justify-between gap-3 rounded-3xl border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-sm hover:border-violet-400/40 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:hover:border-violet-500/35"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {item.desc}
                      </p>
                    </div>
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  </Link>
                ))}
              </nav>
            </aside>
          </div>

          {/* 右欄 */}
          <div className="order-1 space-y-6 lg:order-2">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/80 sm:p-10 lg:p-12">
              <div className="flex flex-col items-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/self_pic.png"
                  alt=""
                  width={160}
                  height={160}
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-white shadow-md dark:ring-zinc-800 sm:h-40 sm:w-40"
                />
                <h1 className="mt-8 text-2xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                  歡迎來到 Nick Hsu 的個人網站
                </h1>
                <p className="mt-3 max-w-md text-sm text-zinc-600 dark:text-zinc-300">
                  23 歲，創作遊走於聲響、音樂與電影之間。
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="#showreel"
                    className="rounded-full bg-violet-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400"
                  >
                    開始探索
                  </Link>
                  <Link
                    href="/about_me"
                    className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    關於我
                  </Link>
                </div>
              </div>

              <section id="showreel" className="mt-10 text-left">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Showreel
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  精選影音縮影（YouTube 影片 ID 見環境變數說明）。
                </p>
                <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-900/80">
                  {youtubeId ? (
                    <iframe
                      title="Showreel"
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      設定{" "}
                      <code className="mx-1 rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-800">
                        NEXT_PUBLIC_SHOWREEL_YOUTUBE_ID
                      </code>{" "}
                      後會顯示嵌入影片。
                    </div>
                  )}
                </div>
              </section>
            </section>

            <section
              id="portfolio"
              className="relative mt-2 min-h-[380px] overflow-hidden rounded-3xl border border-zinc-200/60 shadow-lg dark:border-zinc-700/60"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/home-portfolio-bg.png')" }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-zinc-950/45" aria-hidden />
              <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
                <header>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                    Portfolio
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                    作品集
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-white/85">
                    點擊卡片前往各媒材頁面。
                  </p>
                </header>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {portfolioLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-2xl border border-white/25 bg-white/15 p-5 shadow-lg backdrop-blur-xl hover:border-white/40 hover:bg-white/25"
                    >
                      <h3 className="text-base font-semibold text-white underline-offset-2 hover:underline">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/85">{item.desc}</p>
                      <p className="mt-4 text-xs text-white/90">前往 →</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
