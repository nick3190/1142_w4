"use client";

import { useEffect, useRef } from "react";

/**
 * 換頁轉場：黑幕中央先浮出一條粒子聲波，接著聲波沿中線裂開，
 * 上下兩片黑幕被推向畫面邊緣，露出新頁面。
 * 純 CSS 的保險（.page-veil）會在 1.2 秒後強制隱藏，避免 JS 失效時擋住內容。
 */

const WAVE_MS = 260;
const OPEN_MS = 560;

export function PageTransition() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      canvas.style.display = "none";
      return;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(window.innerWidth * dpr);
    const H = Math.round(window.innerHeight * dpr);
    canvas.width = W;
    canvas.height = H;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    canvas.style.background = "transparent";

    const N = Math.round(Math.min(700, Math.max(240, window.innerWidth * 0.55)));
    const xs = new Float32Array(N);
    const dir = new Int8Array(N);
    const jit = new Float32Array(N);
    const sz = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      xs[i] = ((i + Math.random()) / N) * W;
      dir[i] = Math.random() < 0.5 ? -1 : 1;
      jit[i] = Math.random();
      sz[i] = (0.8 + Math.random() * 1.1) * dpr;
    }

    const cy = H / 2;
    const ease = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const el = now - start;
      const open = ease(Math.min(1, Math.max(0, (el - WAVE_MS) / OPEN_MS)));
      const half = open * (H / 2 + 4);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, Math.max(0, cy - half));
      ctx.fillRect(0, cy + half, W, Math.max(0, H - cy - half));

      const waveIn = Math.min(1, el / WAVE_MS);
      const amp = H * 0.06 * Math.sin(waveIn * Math.PI * 0.5) * (1 - open);
      const t = el / 1000;
      ctx.fillStyle = "#fff";
      for (let i = 0; i < N; i++) {
        const x = xs[i]!;
        const u = x / W;
        const env = Math.sin(u * Math.PI);
        const wave =
          Math.sin(u * 22 + t * 9) * 0.6 +
          Math.sin(u * 57 - t * 13 + jit[i]! * 2) * 0.4;
        const y =
          cy + wave * amp * env + dir[i]! * half * (0.985 + jit[i]! * 0.03);
        ctx.globalAlpha = Math.min(1, waveIn) * (1 - open * open) * (0.4 + jit[i]! * 0.6);
        ctx.fillRect(x, y, sz[i]!, sz[i]!);
      }
      ctx.globalAlpha = 1;

      if (el < WAVE_MS + OPEN_MS) {
        raf = requestAnimationFrame(frame);
      } else {
        canvas.style.display = "none";
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="page-veil pointer-events-none fixed inset-0 z-30 h-full w-full bg-black"
    />
  );
}
