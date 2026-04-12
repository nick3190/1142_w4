import type { Metadata } from "next";
import { AudioWorksPlayer } from "../components/audio/AudioWorksPlayer";
import { audioTracks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "配樂與聲音設計",
  description: "配樂與聲音設計作品，串流式播放介面與專案介紹。",
};

export default function AudioPage() {
  return (
    <main className="min-h-full">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Portfolio
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            配樂與聲音設計
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            左側為可依序點選的曲目清單（配樂／聲音設計分組）；中央為播放控制與視覺區；右側為該曲目的文字介紹。將音檔網址寫入資料檔後即可實際播放。
          </p>
        </header>
        <AudioWorksPlayer tracks={audioTracks} />
      </div>
    </main>
  );
}
