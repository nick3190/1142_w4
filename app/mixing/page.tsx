import type { Metadata } from "next";
import { WorkGallery } from "../components/portfolio/WorkGallery";
import { mixingWorks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "混音",
};

export default function MixingPage() {
  return (
    <main className="min-h-full">
      <div className="px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-serif text-3xl text-paper sm:text-4xl">
            混音
          </h1>
        </header>
        <WorkGallery works={mixingWorks} categoryLabel="混音" />
      </div>
    </main>
  );
}
