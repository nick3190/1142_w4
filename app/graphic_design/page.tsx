import type { Metadata } from "next";
import { WorkGallery } from "../components/portfolio/WorkGallery";
import { graphicWorks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "平面設計",
};

export default function GraphicDesignPage() {
  return (
    <main className="min-h-full">
      <div className="px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-serif text-3xl text-paper sm:text-4xl">
            平面設計
          </h1>
        </header>
        <WorkGallery works={graphicWorks} categoryLabel="平面設計" />
      </div>
    </main>
  );
}
