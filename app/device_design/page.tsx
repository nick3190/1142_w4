import type { Metadata } from "next";
import { WorkBentoCard } from "../components/resume/WorkBentoCard";
import { deviceWorks } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "裝置設計",
};

export default function DeviceDesignPage() {
  return (
    <main className="min-h-full">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Portfolio
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            裝置設計
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            聲響與新媒體裝置作品；卡片支援 hover 動畫並連結至介紹頁。
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {deviceWorks.map((work) => (
            <WorkBentoCard
              key={work.slug}
              work={work}
              href={`/device_design/${work.slug}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
