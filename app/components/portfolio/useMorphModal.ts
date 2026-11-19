"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { emitFromRect, morphRect } from "@/lib/particle-fx";

/**
 * 作品卡 → modal 的崩解重組：
 * 點卡片時卡片打散淡出，粒子飛到 modal 面板的位置重新拼出輪廓，面板隨後浮現；
 * 關閉時面板炸成粒子，卡片回來。
 */
export function useMorphModal() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const fromRect = useRef<DOMRect | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((slug: string, card: HTMLElement) => {
    fromRect.current = card.getBoundingClientRect();
    opener.current = card;
    setActiveSlug(slug);
  }, []);

  const close = useCallback(() => {
    const el = panelRef.current;
    if (el) emitFromRect(el.getBoundingClientRect(), "scatter");
    setActiveSlug(null);
    // 焦點回到原本的卡片
    const back = opener.current;
    requestAnimationFrame(() => back?.focus({ preventScroll: true }));
  }, []);

  // 面板掛上去後量它的位置，從卡片飛過去
  useEffect(() => {
    if (!activeSlug) return;
    const id = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const to = panel.getBoundingClientRect();
      if (fromRect.current) morphRect(fromRect.current, to);
      else emitFromRect(to, "gather");
      closeRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [activeSlug]);

  // Esc 關閉、鎖住背景捲動
  useEffect(() => {
    if (!activeSlug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [activeSlug, close]);

  return { activeSlug, open, close, panelRef, closeRef };
}
