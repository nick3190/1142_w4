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
    // 觸控裝置記憶體有限：像素密度上限壓低一點
    const maxDpr = window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2;

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      // 手機網址列伸縮只改高度幾十像素：不重配畫布，避免 iOS 在捲動時反覆配置記憶體而崩潰
      if (cssW > 0 && w === cssW && Math.abs(h - cssH) < 160) return;
      dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
      cssW = w;
      cssH = h;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      viz.resize(canvas.width, canvas.height, cssW * cssH, dpr);
    };
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    });
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
    let bass = 0;
    let mid = 0;
    let high = 0;
    let bassSlow = 0;
    let beat = 0;
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

      // 頻段能量（fft 1024、44.1 kHz：每格約 43 Hz）
      const band = (from: number, to: number) => {
        let sum = 0;
        for (let b = from; b < to; b++) sum += spec[b]!;
        return sum / (to - from);
      };
      const k = 1 - Math.exp(-dt * 10);
      bass += (band(1, 7) - bass) * k;
      mid += (Math.min(1, band(7, 47) * 1.4) - mid) * k;
      high += (Math.min(1, band(47, 186) * 2.6) - high) * k;
      // 節拍：低頻突然高過它自己的慢速平均，就觸發一次，之後指數衰減
      bassSlow += (bass - bassSlow) * (1 - Math.exp(-dt * 4));
      const onset = Math.max(0, bass - bassSlow - 0.03) * 6;
      beat = Math.max(beat * Math.exp(-dt * 5), Math.min(1, onset));

      // 旋轉：低頻推轉速、高頻再加一點，鼓點時往前踢一下；停止後約兩秒減速
      const target = playing
        ? viz.playSpeed * (0.25 + bass * 1.1 + high * 0.6 + mid * 0.3)
        : idleSpeed;
      vel += (target - vel) * Math.min(1, dt * (playing ? 2.2 : 0.8));
      // 鼓點往前踢一下（依時間積分，避免連續幾幀疊加），並設上限
      if (playing) vel += onset * viz.playSpeed * 3 * dt;
      vel = Math.min(vel, viz.playSpeed * 1.8);
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
        bass,
        mid,
        high,
        beat,
        rotation: rot,
        dRot: Math.max(0, dRot),
        spin: dt > 0 ? dRot / dt : 0,
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
      window.clearTimeout(resizeTimer);
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
