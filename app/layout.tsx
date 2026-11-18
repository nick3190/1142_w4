import type { Metadata } from "next";
import { Geist, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { SiteNav } from "./components/SiteNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSans = Noto_Sans_TC({
  variable: "--font-noto-sans",
  weight: ["400", "500"],
  preload: false,
});

const notoSerif = Noto_Serif_TC({
  variable: "--font-noto-serif",
  weight: ["400", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "許兆豐 Nick Hsu｜聲音、配樂與設計",
    template: "%s｜Nick Hsu",
  },
  description:
    "許兆豐（Nick Hsu）個人履歷與作品集：配樂、聲音設計、裝置、混音、平面與網頁。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${notoSans.variable} ${notoSerif.variable} h-full bg-ink antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink text-paper">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <footer className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line px-5 py-6 text-xs text-mute sm:px-8 lg:px-12">
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
