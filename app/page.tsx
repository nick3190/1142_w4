import Link from "next/link";
import { BentoCard } from "./components/resume/BentoCard";

const portfolioLinks = [
  {
    href: "/audio",
    title: "配樂與聲音設計",
    desc: "串流式播放介面：左側清單切換曲目，右側專案介紹。",
  },
  {
    href: "/graphic_design",
    title: "平面設計",
    desc: "Bento 卡片瀏覽作品，hover 動畫、點擊進入介紹頁。",
  },
  {
    href: "/web_design",
    title: "網頁設計",
    desc: "網站與互動網頁專案，同採 Bento 與獨立作品頁。",
  },
  {
    href: "/device_design",
    title: "裝置設計",
    desc: "聲響／新媒體裝置與展場作品。",
  },
  {
    href: "/mixing",
    title: "混音",
    desc: "影視後期混音與收音相關作品。",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-full">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          <BentoCard
            className="md:col-span-8"
            eyebrow="聲音創作者"
            title="許兆豐｜Nick Hsu"
          >
            <p className="text-base">
              22 歲，創作遊走於聲響、音樂與電影之間，投身於展覽工作，持續尋找更多發展的機會。
            </p>
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              國立政治大學廣播電視學系、數位內容與科技學程（2021 至今）
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-4" eyebrow="聯絡" title="Contact">
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-zinc-500">Email</span>
                <br />
                uniqueee3190@gmail.com
              </li>
              <li>
                <span className="text-zinc-500">Phone</span>
                <br />
                0908700909
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Link
                className="rounded-full bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                href="/about_me"
              >
                關於我
              </Link>
              <Link
                className="rounded-full border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
                href="/experience"
              >
                經歷
              </Link>
            </div>
          </BentoCard>

          <div className="md:col-span-12">
            <BentoCard eyebrow="作品集" title="依媒材瀏覽">
              <p className="mb-5 text-sm">
                配樂與聲音設計使用播放清單介面；其餘類別以 Bento
                卡片展示，滑鼠懸停有動畫，點擊可開啟作品說明頁。
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {portfolioLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/10 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:border-violet-500/35"
                  >
                    <h3 className="text-base font-semibold text-zinc-900 group-hover:text-violet-700 dark:text-zinc-50 dark:group-hover:text-violet-300">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {item.desc}
                    </p>
                    <span className="mt-3 inline-block text-xs font-medium text-violet-600 opacity-0 transition group-hover:opacity-100 dark:text-violet-400">
                      前往 →
                    </span>
                  </Link>
                ))}
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </main>
  );
}
