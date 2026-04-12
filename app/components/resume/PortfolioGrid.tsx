import { BentoCard } from "./BentoCard";

const categories = [
  { title: "配樂", description: "影視、遊戲或品牌配樂作品預覽與連結。" },
  { title: "聲音設計", description: "音效、環境聲與聲音敘事案例。" },
  { title: "網站設計", description: "互動介面與前端實作相關專案。" },
  { title: "平面設計", description: "視覺識別、編排與印刷／數位素材。" },
] as const;

export function PortfolioGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {categories.map((item) => (
        <BentoCard
          key={item.title}
          eyebrow="作品集"
          title={item.title}
          className="min-h-[140px]"
        >
          <p>{item.description}</p>
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            在此放入縮圖、嵌入播放器或專案連結。
          </p>
        </BentoCard>
      ))}
    </div>
  );
}
