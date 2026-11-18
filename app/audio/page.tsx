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
    <main className="flex h-[calc(100dvh-5.25rem)] flex-col overflow-hidden bg-ink lg:h-[calc(100dvh-3rem)]">
      <div className="flex w-full min-h-0 flex-1 flex-col px-3 pt-4 pb-3 sm:px-5 lg:px-8">
        <h1 className="shrink-0 pb-3 font-serif text-2xl text-paper sm:text-3xl">
          配樂與聲音設計
        </h1>
        <div className="min-h-0 flex-1">
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
