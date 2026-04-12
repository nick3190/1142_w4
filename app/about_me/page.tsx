import type { Metadata } from "next";
import { BentoCard } from "../components/resume/BentoCard";

export const metadata: Metadata = {
  title: "關於我",
};

export default function AboutMePage() {
  return (
    <main className="min-h-full">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          <BentoCard className="md:col-span-7" eyebrow="關於我" title="許兆豐｜Nick Hsu">
            <p>
              23 歲，創作遊走於聲響、音樂與電影之間。
            </p>
            <p className="mt-4">
              專長涵蓋混音、編曲、影視配樂、聲音設計、平面設計與互動程式設計，並熟悉影音剪輯與常見設計／聲音軟體流程。
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-5" eyebrow="學歷" title="國立政治大學">
            <p className="text-xs text-zinc-500">
            （2021 - ）
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              廣播電視學系
            </p>
            <p className="mt-1 text-xs text-zinc-500">數位內容與科技學程</p>
          </BentoCard>

          <BentoCard className="md:col-span-6" eyebrow="技能" title="軟體與技術">
            <ul className="grid gap-3 sm:grid-cols-2">
              <li>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  聲音與音樂
                </p>
                <p className="mt-1">Ableton、Logic Pro、Adobe Audition</p>
              </li>
              <li>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  影音剪輯
                </p>
                <p className="mt-1">Premiere、DaVinci Resolve、After Effects</p>
              </li>
              <li>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  平面／介面
                </p>
                <p className="mt-1">Photoshop、Illustrator、Figma</p>
              </li>
              <li>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  互動與程式
                </p>
                <p className="mt-1">Max MSP、Arduino、Python、C#、HTML、CSS</p>
              </li>
            </ul>
          </BentoCard>

          <BentoCard className="md:col-span-6" eyebrow="語言" title="Language">
            <ul className="space-y-2">
              <li>中文（母語）</li>
              <li>英文（TOEIC 900）</li>
              <li>日文（JLPT N3）</li>
              <li>越南文（基礎）</li>
            </ul>
          </BentoCard>
        </div>
      </div>
    </main>
  );
}
