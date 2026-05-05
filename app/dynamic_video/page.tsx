import type { Metadata } from "next";
import { DynamicVideoGallery } from "../components/portfolio/DynamicVideoGallery";
import { dynamicVideoWorks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "動態影像",
};

export default function DynamicVideoPage() {
  return (
    <main className="min-h-full">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Portfolio
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            動態影像
          </h1>
        </header>
        <DynamicVideoGallery works={dynamicVideoWorks} />
      </div>
    </main>
  );
}
