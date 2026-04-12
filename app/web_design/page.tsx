import type { Metadata } from "next";
import { WorkBentoCard } from "../components/resume/WorkBentoCard";
import { webWorks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "網頁設計",
};

export default function WebDesignPage() {
  return (
    <main className="min-h-full">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Portfolio
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            網頁設計
          </h1>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
