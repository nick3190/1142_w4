import type { Metadata } from "next";
import { WorkGallery } from "../components/portfolio/WorkGallery";
import { deviceWorks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "裝置設計",
};

export default function DeviceDesignPage() {
  return (
    <main className="min-h-full">
      <div className="px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-serif text-3xl text-paper sm:text-4xl">
            裝置設計
          </h1>
        </header>
        <WorkGallery works={deviceWorks} categoryLabel="裝置設計" />
      </div>
    </main>
  );
}
