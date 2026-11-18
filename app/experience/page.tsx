import type { Metadata } from "next";
import { BentoCard } from "../components/resume/BentoCard";

export const metadata: Metadata = {
  title: "經歷",
};

type Role = {
  org: string;
  role: string;
  period: string;
  detail: string;
};

const projectRoles: Role[] = [
  {
    org: "C-LAB 聲響藝術節《Diversonics》",
    role: "參展藝術團隊",
    period: "2025.11",
    detail:
      "與團隊共創 VR 虛擬實境劇場作品《他在他方》，參與《MR新聲境》單元，並在 C-LAB 49.4 聲道展演空間，進行為期一週的演出，擔任 Ambisonic 聲響設計與配樂製作。",
  },
  {
    org: "國科會科藝展覽《媽祖繞月-太空站》",
    role: "聲音設計",
    period: "2025.08",
    detail: "參與《顯影用液》與《PM3000》之聲音設計，創作 VR 裝置之實驗性音樂。",
  },
  {
    org: "《繞圈，一個漂浮世界》- 李國鼎科藝獎",
    role: "聲音設計",
    period: "2024.12",
    detail:
      "參與《繞圈，一個漂浮世界》之聲音設計，創作全息投影裝置之實驗性聲響，並與團隊獲得銀賞。",
  },
  {
    org: "2024 台中歌劇院 LABX 青年創作工作室",
    role: "擴增實境計畫",
    period: "2024.07 — 2024.11",
    detail:
      "與團隊入選 2024 NTT XLAB 青年創作工作室，進行擴增實境相關團隊計畫與實作，以虛擬實境闡述「逃逸與監控」之概念與科技反思。",
  },
  {
    org: "DCT 華山園區特展《疊加 Superposition》",
    role: "發想設計、執行與展務",
    period: "2022.09 — 2023.05",
    detail: "《浸聲》作品發想設計與執行，亦負責展務人員。",
  },
];

const exhibitRoles: Role[] = [
  {
    org: "C-LAB 年度大展《Sounds of Babel》",
    role: "展場服務人員",
    period: "2025.06 — 2025.08",
    detail: "擔任展場服務人員，接待觀眾。",
  },
  {
    org: "田中達也特展",
    role: "展場服務人員",
    period: "2025.01 — 2025.04",
    detail: "擔任展場服務人員，接待觀眾。",
  },
  {
    org: "沉浸故宮數位展——捕捉靈光：尋找新感動",
    role: "布展人員",
    period: "2024.03",
    detail: "協助新媒體藝術家設置新媒體互動藝術作品，重現故宮古物之現代樣貌。",
  },
  {
    org: "台灣意象 — 故宮南院屏東六堆移展",
    role: "布展人員",
    period: "2023.10",
    detail: "協助新媒體藝術家擔任布展人員，設置影像與聲音互動裝置。",
  },
];

const otherRoles: Role[] = [
  {
    org: "商業發展研究院",
    role: "計畫助理工讀生",
    period: "2024.04 — 2024.09",
    detail: "擔任計畫助理工讀生，負責數據與資料整理。",
  },
];

function RoleList({ items }: { items: Role[] }) {
  return (
    <ol className="space-y-8">
      {items.map((item) => (
        <li
          key={item.org + item.period}
          className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-6"
        >
          <p className="text-sm text-mute tabular-nums">{item.period}</p>
          <div>
            <p className="text-paper">{item.org}</p>
            <p className="mt-0.5 text-sm text-mute">{item.role}</p>
            <p className="mt-2 max-w-[38em] text-sm leading-relaxed text-paper/80">
              {item.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function ExperiencePage() {
  return (
    <main className="min-h-full">
      <div className="max-w-5xl space-y-14 px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <BentoCard title="專案計畫">
          <RoleList items={projectRoles} />
        </BentoCard>
        <BentoCard title="展務工作">
          <RoleList items={exhibitRoles} />
        </BentoCard>
        <BentoCard title="其他">
          <RoleList items={otherRoles} />
        </BentoCard>
      </div>
    </main>
  );
}
