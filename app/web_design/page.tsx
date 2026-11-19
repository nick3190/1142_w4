import type { Metadata } from "next";
import { WorkGallery } from "../components/portfolio/WorkGallery";
import { webWorks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "網頁設計",
};

export default function WebDesignPage() {
  return (
    <main className="min-h-full">
      <div className="px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-serif text-3xl text-paper sm:text-4xl">
            網頁設計
          </h1>
        </header>
        <WorkGallery works={webWorks} categoryLabel="網頁設計" />
      </div>
    </main>
  );
}
