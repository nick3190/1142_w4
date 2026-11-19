"use client";

import { useEffect } from "react";

const MEDIA = "img, picture, video, audio, canvas, svg, iframe";

/**
 * 擋掉一般使用者「另存圖片／影片」的捷徑：右鍵選單、拖曳圖片到桌面。
 * 這只是增加一點門檻；真正的檔案保護在 proxy.ts。
 */
export function MediaGuard() {
  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(MEDIA)) e.preventDefault();
    };
    const onDrag = (e: DragEvent) => {
      if ((e.target as Element | null)?.closest?.(MEDIA)) e.preventDefault();
    };
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("dragstart", onDrag);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("dragstart", onDrag);
    };
  }, []);
  return null;
}
