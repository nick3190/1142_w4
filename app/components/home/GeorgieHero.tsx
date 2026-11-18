"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_AVATAR = "/self_pic.png";
const DEFAULT_CAPTION = "23 歲，創作遊走於聲響、音樂與電影之間。";
const SHOW_GEORGIE_BUTTON = false;

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
    <div className="max-w-xl">
      <div className="flex items-end gap-4 sm:gap-6">
        <div className="relative h-14 w-14 shrink-0 sm:h-[4.5rem] sm:w-[4.5rem]">
          {imageLoading ? (
            <div
              className="absolute inset-0 z-10 animate-pulse rounded-full bg-faint"
              role="status"
            >
              <span className="sr-only">照片載入中</span>
            </div>
          ) : null}
          <Image
            key={avatarSrc}
            src={avatarSrc}
            alt=""
            fill
            sizes="72px"
            className="rounded-full object-cover contrast-125 grayscale"
            unoptimized
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </div>
        <h1 className="font-serif text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] font-bold tracking-[-0.02em] text-paper">
          許兆豐
        </h1>
      </div>
      <p className="mt-5 text-sm text-mute">Nick Hsu</p>
      <p className="mt-1 text-base leading-relaxed text-paper sm:text-lg">
        {caption}
      </p>
      {SHOW_GEORGIE_BUTTON ? (
        <button
          type="button"
          onClick={onGeorgie}
          className="mt-6 border border-paper px-5 py-2 text-sm text-paper transition-colors hover:bg-paper hover:text-ink"
        >
          看看我的寵物喬治
        </button>
      ) : null}
    </div>
  );
}
