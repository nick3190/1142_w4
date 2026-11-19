"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

const DEFAULT_AVATAR = "/self_pic.png";
/** 預設不顯示一句話，而是三個領域；喬治彩蛋觸發時才換成文字說明 */
const DEFAULT_CAPTION = "";
const ROLES = ["聲音設計", "影視配樂", "互動設計"];
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
  // 換頭像時重新顯示載入中（在 render 中比對，不另跑 effect）
  const [loadingFor, setLoadingFor] = useState(avatarSrc);
  if (loadingFor !== avatarSrc) {
    setLoadingFor(avatarSrc);
    setImageLoading(true);
  }

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
    <div className="min-w-0">
      <div className="flex items-end gap-4 sm:gap-6">
        <div className="relative h-20 w-20 shrink-0 sm:h-28 sm:w-28">
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
            sizes="112px"
            className="rounded-full object-cover contrast-125 grayscale"
            unoptimized
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </div>
        {/* 字級跟著視窗寬度走，任何寬度都保持一行 */}
        <h1 className="min-w-0 font-serif text-[clamp(1rem,6.4vw,3.5rem)] leading-[1] font-bold tracking-[-0.01em] whitespace-nowrap text-paper lg:text-[clamp(2.5rem,4.2vw,5rem)]">
          Nick Hsu｜許兆豐
        </h1>
      </div>
      {caption ? (
        <p className="mt-5 text-base leading-relaxed text-paper sm:text-lg">{caption}</p>
      ) : (
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-base text-paper sm:text-lg">
          {ROLES.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>
      )}
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
