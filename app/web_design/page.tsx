import type { Metadata } from "next";
import { WorkBentoCard } from "../components/resume/WorkBentoCard";
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
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {webWorks.map((work) => (
            <WorkBentoCard
              key={work.slug}
              work={work}
              href={`/web_design/${work.slug}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
