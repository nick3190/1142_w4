import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteNav } from "./components/SiteNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "許兆豐 Nick Hsu｜聲音 · 配樂 · 設計",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-zinc-200/80 bg-zinc-100/90 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-950/90 dark:text-zinc-400">
          <p>
            uniqueee3190@gmail.com · 0908700909
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Nick Hsu</p>
        </footer>
      </body>
    </html>
  );
}
