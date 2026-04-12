import type { Metadata } from "next";
import { AudioWorksPlayer } from "../components/audio/AudioWorksPlayer";
import { audioTracks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "配樂與聲音設計",
  description: "配樂與聲音設計作品。",
};

type PageProps = {
  searchParams: Promise<{ slug?: string; autoplay?: string; play?: string }>;
};

export default async function AudioPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const initialAutoplay =
    sp.autoplay === "1" ||
    sp.autoplay === "true" ||
    sp.play === "1" ||
    sp.play === "true";

  return (
    <main className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-[100rem] min-h-0 flex-1 flex-col px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
        <header className="shrink-0 border-b border-zinc-200/80 pb-2 dark:border-zinc-800/80">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Audio
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
            配樂與聲音設計
          </h1>
        </header>
        <div className="min-h-0 flex-1 pt-2">
          <AudioWorksPlayer
            tracks={audioTracks}
            initialSlug={sp.slug}
            initialAutoplay={initialAutoplay}
          />
        </div>
      </div>
    </main>
  );
}
