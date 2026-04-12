export type AudioClip = {
  label: string;
  url: string;
};

export type AudioTrack = {
  slug: string;
  year: string;
  kind: "配樂" | "聲音設計";
  title: string;
  subtitle?: string;
  description: string;
  clips?: AudioClip[];
};

export const audioTracks: AudioTrack[] = [
  {
    slug: "fang-si-fang-sheng",
    year: "2025",
    kind: "配樂",
    title: "短片《方死方生》",
    description: "為短片譜寫配樂，以聲響層次支撐敘事節奏。",
    clips: [
      { label: "FSFS 1", url: "/portfolio/FSFS/FSFS_1_FINAL.mp3" },
      { label: "FSFS 2", url: "/portfolio/FSFS/FSFS_2_FINAL.mp3" },
      { label: "FSFS 3", url: "/portfolio/FSFS/FSFS_3_FINAL.mp3" },
    ],
  },
  {
    slug: "mossaic",
    year: "2025",
    kind: "配樂",
    title: "遊戲《MOSSAIC》",
    description: "遊戲配樂與互動情境聲響設計，強調循環與拼貼感。",
    clips: [
      { label: "Moist Dream", url: "/portfolio/mossaic/Moist_Dream.mp3" },
      { label: "Scorched Trail", url: "/portfolio/mossaic/Schorched_Trail.mp3" },
    ],
  },
  {
    slug: "a-story-of",
    year: "2023",
    kind: "配樂",
    title: "金勇短片《A story of...》",
    description: "短片配樂製作，依影像調性安排主題動機與配器。",
    clips: [
      { label: "Cue 1", url: "/portfolio/aStoryOf/1.mp3" },
      { label: "Cue 2", url: "/portfolio/aStoryOf/2.mp3" },
      { label: "Cue 3", url: "/portfolio/aStoryOf/3.mp3" },
      { label: "Cue 4", url: "/portfolio/aStoryOf/4.mp3" },
      { label: "Cue 5", url: "/portfolio/aStoryOf/5.mp3" },
      { label: "Ending", url: "/portfolio/aStoryOf/ending.mp3" },
    ],
  },
  {
    slug: "wo-de-dao",
    year: "2026",
    kind: "配樂",
    title: "短片《我的島》",
    description: "短片配樂。",
    clips: [
      { label: "Island 1", url: "/portfolio/my_island/island_1.mp3" },
      { label: "Island 2", url: "/portfolio/my_island/island_2.mp3" },
      { label: "Island 3", url: "/portfolio/my_island/island_3.mp3" },
      { label: "Island 4", url: "/portfolio/my_island/island_4.mp3" },
      { label: "Island 5", url: "/portfolio/my_island/island_5.mp3" },
      { label: "Island 6", url: "/portfolio/my_island/island_6.mp3" },
    ],
  },
  {
    slug: "gou-yu-ying-er",
    year: "2026",
    kind: "配樂",
    title: "短片《狗與嬰兒》",
    description: "短片配樂。",
    clips: [
      { label: "Dog & Baby 1", url: "/portfolio/DogNBaby/dogshit_1_final.mp3" },
      { label: "Dog & Baby 2", url: "/portfolio/DogNBaby/dogshit_2_final.mp3" },
      { label: "Dog & Baby 3", url: "/portfolio/DogNBaby/dogshit_3_final.mp3" },
      { label: "Dog & Baby 4", url: "/portfolio/DogNBaby/dogshit_4_final.mp3" },
    ],
  },
  {
    slug: "qi-yi-huan-meng",
    year: "2022",
    kind: "配樂",
    title: "傳院影展《奇疫幻夢》展場配樂",
    description: "展場空間配樂，配合影像裝置與觀展動線。",
    clips: [
      { label: "Illness Dream", url: "/portfolio/IllnessDream/20220414-2.mp3" },
    ],
  },
  {
    slug: "rao-quan-piao-fu",
    year: "2024",
    kind: "聲音設計",
    title: "投影裝置《繞圈，一個漂浮世界》",
    subtitle: "李國鼎科藝獎 銀賞",
    description:
      "投影與空間聲響結合之聲音設計，處理觀眾移動時的聲場變化與材質感。",
  },
  {
    slug: "ta-zai-ta-fang",
    year: "2025",
    kind: "聲音設計",
    title: "C-LAB 聲響藝術節 VR 劇場《他在他方》",
    description: "VR 劇場聲音設計，著重雙耳空間感與戲劇張力。",
  },
  {
    slug: "xian-ying-yong-ye",
    year: "2025",
    kind: "聲音設計",
    title: "國科會媽祖繞月科藝展 VR《顯影用液》",
    description: "科藝展 VR 裝置聲音設計。",
  },
  {
    slug: "pm3000",
    year: "2025",
    kind: "聲音設計",
    title: "國科會媽祖繞月科藝展 VR《PM3000》",
    description: "同一科藝展系列之 VR 聲音設計。",
  },
  {
    slug: "sheng-zao-li-fang",
    year: "2024",
    kind: "聲音設計",
    title: "《聲噪立方》實驗噪音聲光演出",
    description: "現場聲光演出之聲音設計與即時性處理。",
  },
];

export function getAudioTrack(slug: string) {
  return audioTracks.find((t) => t.slug === slug);
}

export type Accent = "violet" | "cyan" | "amber" | "rose" | "emerald" | "sky";

export type GridWork = {
  slug: string;
  year: string;
  title: string;
  subtitle?: string;
  summary: string;
  body: string[];
  accent: Accent;
};

export const graphicWorks: GridWork[] = [
  {
    slug: "hao-shi-ji-dan-gao",
    year: "2023",
    title: "《好食。雞蛋糕》",
    subtitle: "LOGO 主視覺設計",
    summary: "品牌識別與主視覺發想，應用於包裝與社群素材。",
    body: [
      "為《好食。雞蛋糕》設計 LOGO 與主視覺系統，延伸應用於攤車識別、社群貼文與簡易印刷物。",
    ],
    accent: "amber",
  },
  {
    slug: "wang-hong-tee",
    year: "2025",
    title: "網紅 T 恤設計",
    subtitle: "個人創作",
    summary: "圖像與版型概念，結合社群文化語彙的服飾平面。",
    body: [
      "個人創作之 T 恤圖像設計，實驗字體、插畫與印刷限制下的視覺趣味。",
    ],
    accent: "rose",
  },
];

export const webWorks: GridWork[] = [
  {
    slug: "resume-site-2026",
    year: "2026",
    title: "個人履歷與作品集網站",
    subtitle: "Next.js · Tailwind CSS",
    summary: "Bento 版型、分類作品路由與音訊播放介面之個人站。",
    body: [
      "以 Next.js App Router 建置，Tailwind CSS 與 CSS Grid 構成 Bento 式首頁與作品分類頁。",
      "配樂與聲音設計區採串流式播放介面；平面、網頁、裝置與混音作品可進入獨立介紹頁。",
    ],
    accent: "violet",
  },
  {
    slug: "digital-showcase",
    year: "2024",
    title: "數位展示互動網頁",
    subtitle: "HTML · CSS · JavaScript",
    summary: "互動網頁與數位展示。",
    body: ["HTML、CSS、JavaScript。"],
    accent: "cyan",
  },
];

export const deviceWorks: GridWork[] = [
  {
    slug: "immersion-2023",
    year: "2023",
    title: "《浸聲 Immersion》",
    subtitle: "DCT 華山園區特展",
    summary: "展場聲響裝置與空間體驗，含發想與展務執行。",
    body: [
      "DCT 華山園區特展作品，負責作品發想設計與執行，並擔任展務人員。",
    ],
    accent: "emerald",
  },
  {
    slug: "chao-nest-2024",
    year: "2024",
    title: "《巢——潮》",
    subtitle: "聲響裝置",
    summary: "以聲響與空間材質探索潮汐與巢居意象。",
    body: ["聲響裝置創作。"],
    accent: "sky",
  },
];

export const mixingWorks: GridWork[] = [
  {
    slug: "huan-dian-madness",
    year: "2023",
    title: "《歡店 Madness》",
    subtitle: "文學院工作坊開幕片 · 後期混音",
    summary: "開幕短片之後期混音與聲音整理。",
    body: ["文學院工作坊開幕片《歡店 Madness》後期混音。"],
    accent: "violet",
  },
  {
    slug: "xiao-quan",
    year: "2023",
    title: "《小犬》",
    subtitle: "金勇影展入圍片 · 收音／後期混音",
    summary: "劇情短片收音與後期混音。",
    body: ["金勇影展入圍片《小犬》收音與後期混音。"],
    accent: "cyan",
  },
];

const accentGradients: Record<
  Accent,
  string
> = {
  violet: "from-violet-500/35 via-fuchsia-500/20 to-transparent",
  cyan: "from-cyan-500/35 via-teal-500/20 to-transparent",
  amber: "from-amber-500/40 via-orange-500/20 to-transparent",
  rose: "from-rose-500/35 via-pink-500/20 to-transparent",
  emerald: "from-emerald-500/35 via-lime-500/15 to-transparent",
  sky: "from-sky-500/35 via-blue-500/20 to-transparent",
};

export function workCoverClass(accent: Accent) {
  return `bg-gradient-to-br ${accentGradients[accent]}`;
}

export function getGridWork(
  category: "graphic" | "web" | "device" | "mixing",
  slug: string,
): GridWork | undefined {
  const map = {
    graphic: graphicWorks,
    web: webWorks,
    device: deviceWorks,
    mixing: mixingWorks,
  }[category];
  return map.find((w) => w.slug === slug);
}
