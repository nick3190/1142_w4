import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { GrainFilters } from "./components/GrainFilters";
import { MediaGuard } from "./components/MediaGuard";
import { SiteNav } from "./components/SiteNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 中文字型直接走 Google Fonts CSS：CJK 字型會被切成上百個 unicode-range 子檔，
// 交給 next/font 在 Vercel（Turbopack）上會建置失敗。
const CJK_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500&family=Noto+Serif+TC:wght@400;700&display=swap";

export const metadata: Metadata = {
  title: {
    default: "Nick Hsu｜許兆豐",
    template: "%s｜Nick Hsu",
  },
  description:
    "許兆豐（Nick Hsu）個人履歷與作品集：配樂、聲音設計、裝置、混音、平面與網頁。",
  // 不讓搜尋引擎收錄、建立快取或索引圖片
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} h-full bg-ink antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={CJK_FONTS_HREF} />
      </head>
      <body className="flex min-h-full flex-col text-paper">
        <GrainFilters />
        <MediaGuard />
        <SiteNav />
        <div className="flex-1">{children}</div>
        <footer className="relative flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line px-5 py-6 text-xs text-mute sm:px-8 lg:px-12">
          <a
            href="mailto:uniqueee3190@gmail.com"
            className="transition-colors hover:text-paper"
          >
            uniqueee3190@gmail.com
          </a>
          <p>Welcome Georgie</p>
          <p>© {new Date().getFullYear()} Nick Hsu</p>
        </footer>
      </body>
    </html>
  );
}
