export type AudioClip = {
  label: string;
  /** 本地音訊（mp3 等）或影片檔（.mov / .mp4），依播放器邏輯選用 */
  url?: string;
  /** 若設定，中央區改為嵌入 YouTube（不支援本地進度條拖曳） */
  youtubeUrl?: string;
  /** 播放音訊時顯示於方塊內的封面圖 */
  coverImageUrl?: string;
  /**
   * 與影片 `url` 並用：影片滿版背景循環，此圖置中並帶毛玻璃底。
   */
  glassImageUrl?: string;
};

/** 聲噪立方等含中文檔名的公開路徑 */
export const noiseCubeVideoPath = `/portfolio/noiseCube/${encodeURIComponent("聲噪立方.mov")}`;

export type AudioIntroSection = {
  heading: string;
  text: string;
};

export type AudioTrack = {
  slug: string;
  year: string;
  kind: "配樂" | "聲音設計";
  title: string;
  subtitle?: string;
  description: string;
  clips?: AudioClip[];
  introSections?: AudioIntroSection[];
};

export const audioTracks: AudioTrack[] = [
  {
    slug: "fang-si-fang-sheng",
    year: "2025",
    kind: "配樂",
    title: "短片《方死方生》",
    description: "為短片譜寫配樂。",
    clips: [
      { label: "FSFS 1", url: "/portfolio/FSFS/FSFS_1_FINAL.mp3" },
      { label: "FSFS 2", url: "/portfolio/FSFS/FSFS_2_FINAL.mp3" },
      { label: "FSFS 3", url: "/portfolio/FSFS/FSFS_3_FINAL.mp3" },
    ],
    introSections: [
      {
        heading: "劇情簡介",
        text: "逃避面對自己的男人，被迫面對自己的選擇，直到最後一刻。",
      },
      {
        heading: "主演",
        text: "邱昊奇 飾演 男人\n吳柏澂 飾演 工作人員\n林威成 飾演 評審",
      },
      {
        heading: "主創成員",
        text: "導演｜楊士傑\n聲音設計｜許柏宸\n配樂｜許兆豐",
      },
    ],
  },
  {
    slug: "mossaic",
    year: "2025",
    kind: "配樂",
    title: "苔蘚綠洲 MOSSAIC",
    subtitle: "3D 橫版冒險解謎遊戲",
    description: "遊戲配樂與互動情境聲響設計。",
    clips: [
      { label: "Moist Dream", url: "/portfolio/mossaic/Moist_Dream.mp3" },
      { label: "Scorched Trail", url: "/portfolio/mossaic/Schorched_Trail.mp3" },
    ],
    introSections: [
      {
        heading: "作品簡介",
        text: "MOSSAIC 是一款 3D 橫版冒險解謎遊戲，以苔蘚微觀的視角探索浩瀚的未知世界，途中需躲避陽光在陰暗的角落中前行，小心經過巨大生物避免引起注意，踏上一段尋找綠洲的旅程。",
      },
      {
        heading: "主創",
        text: "遊戲配樂製作｜許兆豐 Nick Hsu",
      },
    ],
  },
  {
    slug: "a-story-of",
    year: "2023",
    kind: "配樂",
    title: "金勇短片《A story of...》",
    description: "短片配樂。",
    clips: [
      { label: "Cue 1", url: "/portfolio/aStoryOf/1.mp3" },
      { label: "Cue 2", url: "/portfolio/aStoryOf/2.mp3" },
      { label: "Cue 3", url: "/portfolio/aStoryOf/3.mp3" },
      { label: "Cue 4", url: "/portfolio/aStoryOf/4.mp3" },
      { label: "Cue 5", url: "/portfolio/aStoryOf/5.mp3" },
      { label: "Ending", url: "/portfolio/aStoryOf/ending.mp3" },
    ],
    introSections: [
      {
        heading: "作品簡介",
        text: "感受這種抽象的經驗，該來自於什麼，來自於現實嗎？還是虛幻，兩個都可以？或都不是。我不知道，但酒裡有答案，他有答案，調酒的調酒師會有答案的。對吧？",
      },
      {
        heading: "主演",
        text: "鄭子院、鍾浩哲",
      },
      {
        heading: "主創成員",
        text: "導演｜胡庭睿\n配樂｜許兆豐",
      },
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
    introSections: [
      {
        heading: "摘句",
        text: "「我的家是一座小山丘，山坡上長滿了綠綠的草，\n還有好多像笑臉一樣的向日葵。」\n\n「有一天，好像是因為我，我的山丘裂開了，\n它們越漂越遠、越漂越遠。」\n\n┉",
      },
      {
        heading: "劇情簡介",
        text: "他闖進女人的畫室，請求她陪自己一起尋找答案。他們追尋星星王子的繩結，搭建烏雲奶奶和太陽爺爺的彩虹橋——然而，兩座小島始終無法重新靠攏……。",
      },
      {
        heading: "主演",
        text: "李棠澤航 飾 奈威\n夏嘉 飾 女人",
      },
      {
        heading: "主創成員",
        text: "導演｜吳靜恩\n聲音設計｜顧晟安\n配樂｜許兆豐",
      },
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
    introSections: [
      {
        heading: "劇情簡介",
        text: "官司纏身的宗云與葉華為了填補內心的安全感而大吵了一架，兩人之間的愛變了質，卻在其他地方悄悄萌芽……",
      },
      {
        heading: "主演",
        text: "劉丞勛 飾 宗云\n鄭筑勻 飾 葉華\n鄭昀暢 飾 嬰兒\n阿魯 飾 狗",
      },
      {
        heading: "主創成員",
        text: "編導｜胡庭睿\n成音｜紀宗佑\n配樂｜許兆豐",
      },
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
    introSections: [
      {
        heading: "作品簡介",
        text: "傳院影展《奇疫幻夢》展場配樂。",
      },
    ],
  },
  {
    slug: "ta-zai-ta-fang",
    year: "2025",
    kind: "聲音設計",
    title: "C-LAB 聲響藝術節 VR 劇場《他在他方》",
    description: "VR 劇場聲音設計，著重雙耳空間感與戲劇張力。",
    clips: [
      {
        label: "紀錄／預告（YouTube）",
        youtubeUrl: "https://www.youtube.com/watch?v=Sdb2TiOQjPY",
      },
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
    clips: [
      {
        label: "紀錄／預告（YouTube）",
        youtubeUrl: "https://www.youtube.com/watch?v=clA-N9yIa1k",
      },
    ],
  },
  {
    slug: "pm3000",
    year: "2025",
    kind: "聲音設計",
    title: "國科會媽祖繞月科藝展 VR《PM3000》",
    description: "同一科藝展系列之 VR 聲音設計。",
    clips: [
      {
        label: "紀錄／預告（YouTube）",
        youtubeUrl:
          "https://www.youtube.com/watch?v=JhZ15EXuUWA&list=PLshb12quPF9J1wz0eKpHiSdUMs5_Tt1ES",
      },
    ],
  },
  {
    slug: "xian-ying-yong-ye",
    year: "2025",
    kind: "聲音設計",
    title: "國科會媽祖繞月科藝展 VR《顯影用液》",
    description: "科藝展 VR 裝置聲音設計。",
    clips: [
      {
        label: "故事時間軸（音檔）",
        url: "/portfolio/utopia/utopia_StoryTimeline_V3.mp3",
        coverImageUrl: "/portfolio/utopia/utopia.jpg",
      },
    ],
  },
  {
    slug: "sheng-zao-li-fang",
    year: "2024",
    kind: "聲音設計",
    title: "《聲噪立方》實驗噪音聲光演出",
    description: "現場聲光演出之聲音設計與即時性處理。",
    clips: [
      {
        label: "演出紀錄（影片）",
        url: noiseCubeVideoPath,
        glassImageUrl: "/portfolio/noiseCube/performer.png",
      },
    ],
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
    slug: "yuan-zong-batch-commerce-platform",
    year: "2026",
    title: "元榮批發電商平台 全端網站架設",
    subtitle: "React.js · Vite · Tailwind CSS",
    summary: "使用 React 框架建置中大型電商平台",
    body: [
      "使用 React 框架建置中大型電商平台，個人進行全端網頁架設，網站涵蓋完整商品管理、購物車、結帳、會員系統等功能，並提供管理後台進行商品上架、訂單管理等操作。",
    ],
    accent: "violet",
  },
  {
    slug: "",
    year: "2025",
    title: "代理孕母之路 互動網頁遊戲",
    subtitle: "HTML · CSS · JavaScript",
    summary: "透過建置簡易互動網頁遊戲，倡議代理孕母的合法性與倫理議題。",
    body: ["使用 HTML、CSS、JavaScript 建置簡易互動網頁遊戲，倡議代理孕母的合法性與倫理議題。"],
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
    summary: "以聲響與空間材質探索潮濕與念舊之意象。",
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
    title: "《小飛》",
    subtitle: "金勇影展入圍片 · 收音／後期混音",
    summary: "劇情短片收音與後期混音。",
    body: ["金勇影展入圍片《小飛》收音與後期混音。"],
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
