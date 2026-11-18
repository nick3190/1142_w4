"use client";

import { useEffect, useRef } from "react";
import { createRing, drawRing, type Ring } from "@/lib/particle-ring";

type ParticleRingProps = {
  className?: string;
  /** 每一幀呼叫；回傳 null 代表靜止狀態 */
  getSpectrum?: () => Uint8Array | null;
  /** 指標靠近環時把粒子推開 */
  interactive?: boolean;
  /** 留下殘影；畫布背後需要是純黑 */
  trail?: boolean;
  /** 半徑 = 短邊 × radius */
  radius?: number;
  /** 圓心高度，0–1 */
  centerY?: number;
  /** 每多少平方像素一顆粒子 */
  density?: number;
  /** 系統要求減少動態時，只畫一張靜止畫面 */
  respectReducedMotion?: boolean;
};

export function ParticleRing({
  className = "",
  getSpectrum,
  interactive = false,
  trail = true,
  radius = 0.32,
  centerY = 0.5,
  density = 260,
  respectReducedMotion = true,
}: ParticleRingProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectrumRef = useRef(getSpectrum);

  useEffect(() => {
    spectrumRef.current = getSpectrum;
  }, [getSpectrum]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce =
      respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ring: Ring = createRing(600);
    let dpr = 1;
    let cssW = 0;
    let cssH = 0;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      const n = Math.round(
        Math.min(2200, Math.max(500, (cssW * cssH) / density)),
      );
      if (Math.abs(n - ring.n) > 60) ring = createRing(n);
      ctx.fillStyle = "#000";
      if (trail) ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // 指標
    const pointer = { x: -1e4, y: -1e4, at: 0 };
    let pStrength = 0;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.at = performance.now();
    };
    if (interactive) window.addEventListener("pointermove", onMove);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    io.observe(canvas);

    const start = performance.now();
    let level = 0;
    let raf = 0;

    const render = (now: number, still: boolean) => {
      const t = still ? 0 : (now - start) / 1000;
      const spec = still ? null : (spectrumRef.current?.() ?? null);

      let lv = 0;
      if (spec) {
        const k = Math.max(1, Math.floor(spec.length * 0.12));
        let s = 0;
        for (let i = 0; i < k; i++) s += spec[i]!;
        lv = s / k / 255;
      }
      level += (lv - level) * 0.12;

      const R = Math.min(cssW, cssH) * radius;
      const cx = cssW / 2;
      const cy = cssH * centerY;

      let p: { angle: number; strength: number } | null = null;
      if (interactive) {
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const dist = Math.hypot(dx, dy);
        const near = Math.exp(-Math.pow((dist - R) / (R * 0.55), 2));
        const fresh = Math.max(0, 1 - (now - pointer.at) / 1600);
        pStrength += (near * fresh * 0.55 - pStrength) * 0.08;
        if (pStrength > 0.002) p = { angle: Math.atan2(dy, dx), strength: pStrength };
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (trail && !still) {
        ctx.fillStyle = "rgba(0,0,0,0.26)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (trail) {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      drawRing(ctx, ring, {
        cx: cx * dpr,
        cy: cy * dpr,
        radius: R * dpr,
        t,
        spectrum: spec,
        level,
        intro: still ? 1 : Math.min(1, t / 1.8),
        pointer: p,
        scale: dpr,
      });
    };

    if (reduce) {
      render(start, true);
      const redraw = () => render(performance.now(), true);
      const ro2 = new ResizeObserver(redraw);
      ro2.observe(canvas);
      return () => {
        ro.disconnect();
        ro2.disconnect();
        io.disconnect();
        window.removeEventListener("pointermove", onMove);
      };
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      render(now, false);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [interactive, trail, radius, centerY, density, respectReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`block h-full w-full ${className}`}
    />
  );
}
