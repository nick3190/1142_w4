import { BentoCard } from "./components/resume/BentoCard";
import { PortfolioGrid } from "./components/resume/PortfolioGrid";

export default function Home() {
  return (
    <main className="min-h-full bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Bento：外層用 CSS Grid；各區塊用 col-span / row-span 控制比例 */}
        <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-[minmax(0,auto)_minmax(0,auto)_minmax(0,1fr)] md:gap-5">
          {/* 頂部橫幅 */}
          <BentoCard
            className="md:col-span-8 md:row-start-1"
            eyebrow="個人履歷"
            title="你的名字 · 一句話介紹"
          >
            <p>
              簡短說明你的專業定位（例如：聲音設計師／作曲／網頁與視覺設計），讓訪客一眼知道你能提供什麼價值。
            </p>
          </BentoCard>

          <BentoCard
            className="md:col-span-4 md:row-start-1"
            eyebrow="聯絡"
            title="保持聯繫"
          >
            <ul className="space-y-2 text-sm">
              <li>Email：you@example.com</li>
              <li>所在地：城市 / 時區</li>
              <li>社群連結欄位</li>
            </ul>
          </BentoCard>

          {/* 關於我 */}
          <BentoCard
            className="md:col-span-5 md:row-start-2"
            eyebrow="區塊 1"
            title="關於我"
          >
            <p>
              撰寫你的背景、專長與工作哲學。可包含學歷、擅長工具、語言能力，或一段能代表你風格的自述。
            </p>
          </BentoCard>

          {/* 經歷 */}
          <BentoCard
            className="md:col-span-7 md:row-start-2"
            eyebrow="區塊 2"
            title="經歷"
          >
            <ol className="space-y-4">
              <li className="border-l-2 border-zinc-300 pl-4 dark:border-zinc-600">
                <p className="font-medium text-zinc-800 dark:text-zinc-100">
                  職稱 · 公司／單位
                </p>
                <p className="text-xs text-zinc-500">2022 — 現在</p>
                <p className="mt-1">
                  重點職責與成果（條列式或一段敘述皆可）。
                </p>
              </li>
              <li className="border-l-2 border-zinc-300 pl-4 dark:border-zinc-600">
                <p className="font-medium text-zinc-800 dark:text-zinc-100">
                  職稱 · 公司／單位
                </p>
                <p className="text-xs text-zinc-500">2019 — 2022</p>
                <p className="mt-1">延續複製此區塊以新增更多經歷。</p>
              </li>
            </ol>
          </BentoCard>

          {/* 作品集（含四類子格） */}
          <div className="md:col-span-12 md:row-start-3">
            <BentoCard eyebrow="區塊 3" title="作品集">
              <p className="mb-5">
                下方為四類作品子區塊，採巢狀{" "}
                <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                  grid
                </code>{" "}
                排版，可依專案量調整卡片高度或改為輪播／分頁。
              </p>
              <PortfolioGrid />
            </BentoCard>
          </div>
        </div>
      </div>
    </main>
  );
}
