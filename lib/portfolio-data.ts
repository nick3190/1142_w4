/** 履歷與作品資料。配樂音檔對應 public/portfolio/ 內檔案（每首一檔代表預覽）。 */

export type AudioTrack = {
  slug: string;
  year: string;
  kind: "配樂" | "聲音設計";
  title: string;
  subtitle?: string;
  /** 右欄專案介紹 */
  description: string;
  /** 音檔 URL（站內為 /portfolio/... ） */
  audioUrl?: string;
};

export const audioTracks: AudioTrack[] = [
  {
    slug: "fang-si-fang-sheng",
    year: "2025",
    kind: "配樂",
    title: "短片《方死方生》",
    description:
      "為短片譜寫配樂，以聲響層次支撐敘事節奏。可於此補充創作概念、合作導演與製作團隊、使用樂器或取樣來源等。",
    audioUrl: "/portfolio/FSFS/FSFS_1_FINAL.wav",
  },
  {
    slug: "mossaic",
    year: "2025",
    kind: "配樂",
    title: "遊戲《MOSSAIC》",
    description:
      "遊戲配樂與互動情境聲響設計，強調循環與拼貼感。可補充引擎、合作單位與試玩連結。",
    audioUrl: "/portfolio/mossaic/Moist_Dream.wav",
  },
  {
    slug: "a-story-of",
    year: "2023",
    kind: "配樂",
    title: "金勇短片《A story of...》",
    description:
      "短片配樂製作，依影像調性安排主題動機與配器。可補充影展放映與串流連結。",
    audioUrl: "/portfolio/aStoryOf/1.wav",
  },
  {
    slug: "wo-de-dao",
    year: "2026",
    kind: "配樂",
    title: "短片《我的島》",
    description:
      "短片配樂。可補充故事背景、導演合作與聲音方向關鍵字。",
    audioUrl: "/portfolio/my_island/island_1.wav",
  },
  {
    slug: "gou-yu-ying-er",
    year: "2026",
    kind: "配樂",
    title: "短片《狗與嬰兒》",
    description:
      "短片配樂。可補充配樂與對白、環境聲之間的平衡與混音策略。",
    audioUrl: "/portfolio/DogNBaby/dogshit_1_final.wav",
  },
  {
    slug: "qi-yi-huan-meng",
    year: "2022",
    kind: "配樂",
    title: "傳院影展《奇疫幻夢》展場配樂",
    description:
      "展場空間配樂，配合影像裝置與觀展動線。可補充展期、策展單位與空間聲學考量。",
    audioUrl: "/portfolio/IllnessDream/IllnessDream.mp3",
  },
  {
    slug: "rao-quan-piao-fu",
    year: "2024",
    kind: "聲音設計",
    title: "投影裝置《繞圈，一個漂浮世界》",
    subtitle: "李國鼎科藝獎 銀賞",
    description:
      "投影與空間聲響結合之聲音設計，處理觀眾移動時的聲場變化與材質感。可補充技術架構（喇叭配置、播放系統）與創作發想。",
  },
  {
    slug: "ta-zai-ta-fang",
    year: "2025",
    kind: "聲音設計",
    title: "C-LAB 聲響藝術節 VR 劇場《他在他方》",
    description:
      "VR 劇場聲音設計，著重雙耳空間感與戲劇張力。可補充與導演／技術團隊分工與版本迭代。",
  },
  {
    slug: "xian-ying-yong-ye",
    year: "2025",
    kind: "聲音設計",
    title: "國科會媽祖繞月科藝展 VR《顯影用液》",
    description:
      "科藝展 VR 裝置聲音設計，可補充科學敘事如何轉譯為聽覺隱喻與互動觸發。",
  },
  {
    slug: "pm3000",
    year: "2025",
    kind: "聲音設計",
    title: "國科會媽祖繞月科藝展 VR《PM3000》",
    description:
      "同一科藝展系列之 VR 聲音設計，可補充與《顯影用液》在聲音母題上的對照或延續。",
  },
  {
    slug: "sheng-zao-li-fang",
    year: "2024",
    kind: "聲音設計",
    title: "《聲噪立方》實驗噪音聲光演出",
    description:
      "現場聲光演出之聲音設計與即時性處理。可補充器材、演出場地與與視覺同步方式。",
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
      "可在此補充色彩規範、字體選用、與客戶溝通迭代過程，或連結至 Behance／PDF。",
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
      "可補充靈感來源、實體打樣照片與販售／贈送管道。",
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
    title: "數位展示互動網頁（範例）",
    subtitle: "HTML · CSS · JavaScript",
    summary: "可替換為實際接案或課程專案之外連與截圖。",
    body: [
      "PDF 未單獨列出網頁專案名稱，此為結構保留欄位，請將標題、技術棧與說明改成你的真實案例。",
      "建議附上線上連結、GitHub、或使用情境（展場導覽、活動報名頁等）。",
    ],
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
      "可補充聲音素材來源、喇叭與感測配置、觀眾動線與技術文件連結。",
    ],
    accent: "emerald",
  },
  {
    slug: "chao-nest-2024",
    year: "2024",
    title: "《巢——潮》",
    subtitle: "聲響裝置",
    summary: "以聲響與空間材質探索潮汐與巢居意象。",
    body: [
      "聲響裝置創作，可補充展出場地、合作者、錄音／播放系統與觀眾互動機制。",
    ],
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
    body: [
      "文學院工作坊開幕片《歡店 Madness》後期混音，可補充對白編修、環境聲層次與母帶交付格式。",
    ],
    accent: "violet",
  },
  {
    slug: "xiao-quan",
    year: "2023",
    title: "《小犬》",
    subtitle: "金勇影展入圍片 · 收音／後期混音",
    summary: "劇情短片收音與後期混音。",
    body: [
      "金勇影展入圍片《小犬》收音與後期混音，可補充現場收音挑戰、與導演在聲音情緒上的討論。",
    ],
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
