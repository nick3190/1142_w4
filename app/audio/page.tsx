import type { Metadata } from "next";
import { AudioWorksPlayer } from "../components/audio/AudioWorksPlayer";
import { audioTracks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "配樂與聲音設計",
  description: "配樂與聲音設計作品。",
};

export default function AudioPage() {
  return (
    <main className="min-h-full">
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Portfolio
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            配樂與聲音設計
          </h1>
        </header>
        <AudioWorksPlayer tracks={audioTracks} />
      </div>
    </main>
  );
}
