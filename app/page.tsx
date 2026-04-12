import Image from "next/image";
import Link from "next/link";
import { wangHongTeeImagePath } from "@/lib/portfolio-data";

const SHOWREEL_VIMEO_ID = "1120960224";

const sidebarLinks = [
  { href: "/about_me", title: "關於我", desc: "學歷、專長與語言" },
  { href: "/experience", title: "經歷", desc: "展覽、計畫與展場工作" },
  { href: "/audio", title: "配樂與聲音", desc: "播放清單與專案介紹" },
  { href: "/graphic_design", title: "平面設計", desc: "主視覺與印刷／數位" },
  { href: "/web_design", title: "網頁設計", desc: "網站與互動網頁" },
  { href: "/device_design", title: "裝置設計", desc: "聲響與新媒體裝置" },
  { href: "/mixing", title: "混音", desc: "影視後期與收音" },
] as const;

const featuredWorks = [
  {
    title: "他在他方",
    subtitle: "C-LAB 聲響藝術節 VR 劇場",
    href: "/audio?slug=ta-zai-ta-fang&autoplay=1",
    imageSrc: "https://i.ytimg.com/vi/Sdb2TiOQjPY/hqdefault.jpg",
    remote: true,
  },
  {
    title: "網紅 T 恤設計",
    subtitle: "平面設計 · 亞洲統神主題",
    href: "/graphic_design/wang-hong-tee",
    imageSrc: wangHongTeeImagePath,
    remote: false,
  },
  {
    title: "狗與嬰兒",
    subtitle: "短片配樂",
    href: "/audio?slug=gou-yu-ying-er&autoplay=1",
    imageSrc: "/featured/gou-yu-ying-er.jpg",
    remote: false,
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-full">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-6 lg:block">
          <div className="order-2 lg:order-1">
            <aside className="flex w-full flex-col gap-4 lg:fixed lg:left-[max(1rem,calc(50vw-36rem+1rem))] lg:top-8 lg:z-30 lg:w-[272px] lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/80">
                <div className="flex items-center gap-4">
                  <Image
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

          <div className="order-1 space-y-6 lg:order-2 lg:ml-[300px]">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/80 sm:p-10 lg:p-12">
              <div className="flex flex-col items-center text-center">
                <Image
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
                <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-900/80">
                  <iframe
                    title="Showreel"
                    src={`https://player.vimeo.com/video/${SHOWREEL_VIMEO_ID}`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <a
                    href="https://vimeo.com/1120960224?fl=ip&fe=ec"
                    className="text-violet-600 underline hover:text-violet-500 dark:text-violet-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    在 Vimeo 開啟此影片
                  </a>
                </p>
              </section>
            </section>

            <section
              id="featured"
              className="relative mt-2 min-h-[320px] overflow-hidden rounded-3xl border border-zinc-200/60 shadow-lg dark:border-zinc-700/60"
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
                    Featured
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                    精選作品
                  </h2>
                </header>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredWorks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group relative block overflow-hidden rounded-2xl border border-white/20 bg-zinc-900/40 shadow-xl ring-1 ring-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={item.imageSrc}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition duration-300 ease-out group-hover:scale-[1.03] group-hover:blur-sm motion-reduce:group-hover:blur-none"
                          unoptimized={item.remote}
                        />
                        <div
                          className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/35 group-active:bg-black/30"
                          aria-hidden
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-lg">
                            點擊觀看
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md">
                        <h3 className="text-base font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-white/80">{item.subtitle}</p>
                      </div>
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
