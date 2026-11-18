import type { Metadata } from "next";
import { DynamicVideoGallery } from "../components/portfolio/DynamicVideoGallery";
import { dynamicVideoWorks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "動態影像",
};

export default function DynamicVideoPage() {
  return (
    <main className="min-h-full">
      <div className="px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-serif text-3xl text-paper sm:text-4xl">
            動態影像
          </h1>
        </header>
        <DynamicVideoGallery works={dynamicVideoWorks} />
      </div>
    </main>
  );
}
