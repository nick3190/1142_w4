"use client";

import { useEffect, useRef } from "react";
import { createViz, type VizMode } from "@/lib/visualizers";

const BINS = 256;

type VisualizerProps = {
  mode?: VizMode;
  className?: string;
  /** 每幀呼叫；回傳 AnalyserNode 的原始頻譜，未播放時回傳 null */
  getBins?: () => Uint8Array | null;
  /** 指標靠近環時把粒子推開（只對聲環有效） */
  interactive?: boolean;
  /** 頁面捲動時帶動旋轉 */
  scrollSpin?: boolean;
  /** 沒有聲音時的轉速（弧度／秒）；0 = 停止播放後慢慢停下 */
  idleSpeed?: number;
  radius?: number;
  centerY?: number;
  /** 每多少平方像素一顆粒子 */
  density?: number;
  /** 系統要求減少動態時，只畫一張靜止畫面 */
  respectReducedMotion?: boolean;
};

export function Visualizer({
  mode = "ring",
  className = "",
  getBins,
  interactive = false,
  scrollSpin = false,
  idleSpeed = 0,
  radius = 0.3,
  centerY = 0.5,
  density = 220,
  respectReducedMotion = true,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const binsRef = useRef(getBins);

  useEffect(() => {
    binsRef.current = getBins;
  }, [getBins]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce =
      respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const viz = createViz(mode, { radius, centerY, density });
    let dpr = 1;
    let cssW = 0;
    let cssH = 0;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      viz.resize(canvas.width, canvas.height, cssW * cssH, dpr);
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

    // 捲動帶動旋轉
    let lastScroll = window.scrollY;
    let pendingScroll = 0;
    const onScroll = () => {
      pendingScroll += window.scrollY - lastScroll;
      lastScroll = window.scrollY;
    };
    if (scrollSpin) window.addEventListener("scroll", onScroll, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    io.observe(canvas);

    const spec = new Float32Array(BINS);
    let level = 0;
    let rot = 0;
    let vel = idleSpeed;
    const start = performance.now();
    let last = start;
    let raf = 0;

    const render = (now: number, still: boolean) => {
      const dt = still ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = still ? 0 : (now - start) / 1000;

      const bins = still ? null : (binsRef.current?.() ?? null);
      const playing = Boolean(bins);
      if (bins) {
        const n = Math.min(BINS, bins.length);
        for (let b = 0; b < n; b++) {
          const target = bins[b]! / 255;
          const cur = spec[b]!;
          spec[b] = cur + (target - cur) * (target > cur ? 0.6 : 0.25);
        }
      } else {
        // 停止後頻譜慢慢退掉，而不是瞬間歸零
        const k = Math.pow(0.18, dt);
        for (let b = 0; b < BINS; b++) spec[b]! *= k;
      }
      let s = 0;
      for (let b = 0; b < 30; b++) s += spec[b]!;
      level += (s / 30 - level) * 0.15;

      // 旋轉慣性：播放時加速，停止時以約兩秒的時間減速
      const target = playing ? viz.playSpeed * (1 + level * 1.5) : idleSpeed;
      vel += (target - vel) * Math.min(1, dt * (playing ? 2.2 : 0.8));
      let dRot = vel * dt;
      if (pendingScroll !== 0) {
        dRot += pendingScroll * 0.0035;
        pendingScroll = 0;
      }
      rot += dRot;

      const R = Math.min(cssW, cssH) * radius;
      const cx = cssW / 2;
      const cy = cssH * centerY;
      let p: { angle: number; strength: number } | null = null;
      if (interactive && !still) {
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const dist = Math.hypot(dx, dy);
        const near = Math.exp(-Math.pow((dist - R) / (R * 0.55), 2));
        const fresh = Math.max(0, 1 - (now - pointer.at) / 1600);
        pStrength += (near * fresh * 0.55 - pStrength) * 0.08;
        if (pStrength > 0.002) p = { angle: Math.atan2(dy, dx), strength: pStrength };
      }

      if (still) ctx.clearRect(0, 0, canvas.width, canvas.height);
      viz.draw({
        ctx,
        w: canvas.width,
        h: canvas.height,
        dpr,
        t,
        dt,
        spec,
        level,
        rotation: rot,
        dRot: Math.max(0, dRot),
        intro: still ? 1 : Math.min(1, t / 1.6),
        pointer: p,
        playing,
      });
    };

    if (reduce) {
      render(start, true);
      const ro2 = new ResizeObserver(() => render(performance.now(), true));
      ro2.observe(canvas);
      return () => {
        ro.disconnect();
        ro2.disconnect();
        io.disconnect();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
      };
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      render(now, false);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [mode, interactive, scrollSpin, idleSpeed, radius, centerY, density, respectReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`block h-full w-full ${className}`}
    />
  );
}
