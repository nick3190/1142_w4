"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_AVATAR = "/self_pic.png";
const DEFAULT_CAPTION = "23 歲，創作遊走於聲響、音樂與電影之間。";

const FINALE_CAPTION = "我要回家了，掰。";

export type GeorgieHeroProps = {
  /** 由伺服端讀取 `public/georgie` 後傳入（已編碼的公開路徑） */
  georgiePoolPaths: string[];
  finalePath: string;
};

function captionFromPath(urlPath: string): string {
  const seg = urlPath.split("/").pop() ?? "";
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

/** 顯示用：不含副檔名 */
function displayNameFromPath(urlPath: string): string {
  const base = captionFromPath(urlPath);
  return base.replace(/\.(jpe?g|png|gif|webp|bmp|svg)$/i, "");
}

export function GeorgieHero({ georgiePoolPaths, finalePath }: GeorgieHeroProps) {
  const [clicks, setClicks] = useState(0);
  const [locked, setLocked] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);
  const [caption, setCaption] = useState(DEFAULT_CAPTION);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageLoading(true);
  }, [avatarSrc]);

  const onGeorgie = useCallback(() => {
    if (locked) return;
    const next = clicks + 1;
    setClicks(next);

    if (next === 10) {
      setAvatarSrc(finalePath);
      setCaption(FINALE_CAPTION);
      return;
    }
    if (next === 11) {
      setAvatarSrc(DEFAULT_AVATAR);
      setCaption(DEFAULT_CAPTION);
      setLocked(true);
      return;
    }
    if (next > 11) return;

    const pool = georgiePoolPaths;
    const pick =
      pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)]!
        : DEFAULT_AVATAR;
    setAvatarSrc(pick);
    setCaption(
      pick === DEFAULT_AVATAR ? DEFAULT_CAPTION : displayNameFromPath(pick),
    );
  }, [clicks, locked, georgiePoolPaths, finalePath]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-32 w-32 sm:h-40 sm:w-40">
        {imageLoading ? (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-zinc-200/85 ring-4 ring-white dark:bg-zinc-800/90 dark:ring-zinc-800"
            role="status"
          >
            <span className="sr-only">照片載入中</span>
            <div
              className="h-9 w-9 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400"
              aria-hidden
            />
          </div>
        ) : null}
        <Image
          key={avatarSrc}
          src={avatarSrc}
          alt=""
          fill
          sizes="160px"
          className="rounded-full object-cover ring-4 ring-white shadow-md dark:ring-zinc-800"
          unoptimized
          onLoad={() => setImageLoading(false)}
          onLoadingComplete={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
      </div>
      <h1 className="mt-8 text-2xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        歡迎來到 Nick Hsu 的個人網站
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-600 dark:text-zinc-300">
        {caption}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onGeorgie}
          className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 sm:px-7 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          看看我的寵物喬治
        </button>
        <Link
          href="/about_me"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          關於我
        </Link>
      </div>
    </div>
  );
}
