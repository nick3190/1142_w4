/**
 * 播放器視覺化的四種模式。每個模式自己負責清畫布與殘影，
 * 共用由 <Visualizer> 算好的平滑頻譜、整體能量與旋轉角。
 *
 * ring    粒子聲環，隨音樂旋轉並留下殘影
 * polar   環形頻譜圖：像雷達一樣掃描，角度是時間、半徑是頻率、亮度是音量
 * cube    粒子立方體：粒子集中在稜線，面中心隨低頻鼓起
 * terrain 頻譜地形：最新的頻譜在前排，往後退成一片山脈
 */

import { createRing, drawRing, type Ring } from "./particle-ring";

const TAU = Math.PI * 2;

export type VizMode = "ring" | "polar" | "cube" | "terrain";

export const VIZ_MODES: { mode: VizMode; label: string }[] = [
  { mode: "ring", label: "聲環" },
  { mode: "polar", label: "頻譜環" },
  { mode: "cube", label: "立方" },
  { mode: "terrain", label: "地形" },
];

export type VizFrame = {
  ctx: CanvasRenderingContext2D;
  /** 裝置像素 */
  w: number;
  h: number;
  dpr: number;
  t: number;
  dt: number;
  /** 0–1，低頻在前 */
  spec: Float32Array;
  level: number;
  rotation: number;
  /** 這一幀轉了多少（含捲動造成的） */
  dRot: number;
  intro: number;
  pointer: { angle: number; strength: number } | null;
  playing: boolean;
};

export type Viz = {
  /** 播放時的基本轉速（弧度／秒） */
  playSpeed: number;
  resize(w: number, h: number, cssArea: number, dpr: number): void;
  draw(f: VizFrame): void;
};

export type VizOptions = {
  radius: number;
  centerY: number;
  density: number;
};

function fade(ctx: CanvasRenderingContext2D, w: number, h: number, a: number) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = `rgba(0,0,0,${a})`;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

/* ───────────── ring ───────────── */

function ringViz(o: VizOptions): Viz {
  let ring: Ring = createRing(600);
  return {
    playSpeed: 0.42,
    resize(_w, _h, area) {
      const n = Math.round(Math.min(2400, Math.max(500, area / o.density)));
      if (Math.abs(n - ring.n) > 60) ring = createRing(n);
    },
    draw(f) {
      fade(f.ctx, f.w, f.h, 0.34);
      drawRing(f.ctx, ring, {
        cx: f.w / 2,
        cy: f.h * o.centerY,
        radius: Math.min(f.w, f.h) * o.radius,
        t: f.t,
        spectrum: f.spec,
        level: f.level,
        rotation: f.rotation,
        intro: f.intro,
        pointer: f.pointer,
        scale: f.dpr,
      });
    },
  };
}

/* ───────────── polar spectrogram ───────────── */

function polarViz(): Viz {
  let off: HTMLCanvasElement | null = null;
  let octx: CanvasRenderingContext2D | null = null;
  let lastA: number | null = null;
  let W = 0;
  let H = 0;
  let D = 1;

  const geom = () => {
    const R = Math.min(W, H) * 0.46;
    return { cx: W / 2, cy: H / 2, R, r0: R * 0.17 };
  };

  const ray = (ang: number, spec: Float32Array, width: number) => {
    if (!octx) return;
    const { cx, cy, R, r0 } = geom();
    // 先清掉這一刀扇形，再畫新的：歷史剛好保留一整圈
    octx.globalCompositeOperation = "destination-out";
    octx.beginPath();
    octx.moveTo(cx, cy);
    octx.arc(cx, cy, R * 1.08, ang - width * 0.5, ang + width * 1.5);
    octx.closePath();
    octx.fill();
    octx.globalCompositeOperation = "source-over";

    const B = spec.length;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    octx.fillStyle = "#fff";
    for (let b = 0; b < B; b++) {
      const v = spec[b]!;
      const grain = Math.random() * 0.06;
      const val = v * (0.8 + Math.random() * 0.4) + grain;
      if (val < 0.045) continue;
      const r = r0 + Math.pow(b / B, 0.75) * (R - r0) + (Math.random() - 0.5) * 2 * D;
      const jx = -sin * (Math.random() - 0.5) * width * r;
      const jy = cos * (Math.random() - 0.5) * width * r;
      const s = D * (0.7 + Math.min(1, val) * 1.6);
      octx.globalAlpha = Math.min(1, val * 1.15);
      octx.fillRect(cx + cos * r + jx, cy + sin * r + jy, s, s);
    }
    octx.globalAlpha = 1;
  };

  return {
    playSpeed: 0.55,
    resize(w, h, _area, dpr) {
      W = w;
      H = h;
      D = dpr;
      off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      octx = off.getContext("2d");
      lastA = null;
      // 先鋪一層很淡的雜訊，靜止時不會是一片空白
      if (octx) {
        const { cx, cy, R, r0 } = geom();
        octx.fillStyle = "#fff";
        for (let i = 0; i < 2600; i++) {
          const a = Math.random() * TAU;
          const r = r0 + Math.random() * (R - r0);
          octx.globalAlpha = 0.04 + Math.random() * 0.1;
          octx.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r, D, D);
        }
        octx.globalAlpha = 1;
      }
    },
    draw(f) {
      if (!off || !octx) return;
      const a = f.rotation - Math.PI / 2;
      if (lastA === null) lastA = a;
      const da = a - lastA;
      const { cx, cy, R, r0 } = geom();
      if (da > 0) {
        const steps = Math.min(24, Math.ceil((da * R) / (2.2 * D)));
        const width = da / steps;
        for (let s = 1; s <= steps; s++) ray(lastA + width * s, f.spec, width);
      }
      lastA = a;

      const { ctx } = f;
      ctx.clearRect(0, 0, f.w, f.h);
      ctx.globalAlpha = f.intro;
      ctx.drawImage(off, 0, 0);
      // 掃描線與內外框
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = D;
      ctx.globalAlpha = 0.45 * f.intro;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * R * 1.04, cy + Math.sin(a) * R * 1.04);
      ctx.stroke();
      ctx.globalAlpha = 0.08 * f.intro;
      ctx.beginPath();
      ctx.arc(cx, cy, r0, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  };
}


/* ───────────── cube ───────────── */

function cubeViz(o: VizOptions): Viz {
  let n = 0;
  let pos = new Float32Array(0);
  let nrm = new Float32Array(0);
  let bin = new Uint16Array(0);
  let ph = new Float32Array(0);

  const build = (count: number, B: number) => {
    n = count;
    pos = new Float32Array(n * 3);
    nrm = new Float32Array(n * 3);
    bin = new Uint16Array(n);
    ph = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let x: number;
      let y: number;
      let z: number;
      let nx = 0;
      let ny = 0;
      let nz = 0;
      let edge: number;
      if (Math.random() < 0.08) {
        // 內部的一點點塵
        x = (Math.random() * 2 - 1) * 0.85;
        y = (Math.random() * 2 - 1) * 0.85;
        z = (Math.random() * 2 - 1) * 0.85;
        const l = Math.hypot(x, y, z) || 1;
        nx = x / l;
        ny = y / l;
        nz = z / l;
        edge = 0.2;
      } else {
        const face = Math.floor(Math.random() * 6);
        const sign = face % 2 === 0 ? 1 : -1;
        const axis = face >> 1;
        let u = Math.random() * 2 - 1;
        let v = Math.random() * 2 - 1;
        // 六成粒子擠到稜線附近
        if (Math.random() < 0.6) {
          const near = (Math.random() < 0.5 ? -1 : 1) * (1 - Math.pow(Math.random(), 3) * 0.3);
          if (Math.random() < 0.5) u = near;
          else v = near;
        }
        edge = Math.max(Math.abs(u), Math.abs(v));
        if (axis === 0) {
          x = sign;
          y = u;
          z = v;
          nx = sign;
        } else if (axis === 1) {
          x = u;
          y = sign;
          z = v;
          ny = sign;
        } else {
          x = u;
          y = v;
          z = sign;
          nz = sign;
        }
      }
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      nrm[i * 3] = nx;
      nrm[i * 3 + 1] = ny;
      nrm[i * 3 + 2] = nz;
      // 面中心讀低頻、稜線讀高頻
      bin[i] = Math.min(B - 1, Math.floor(Math.pow(edge, 1.6) * B * 0.85));
      ph[i] = Math.random() * TAU;
    }
  };

  return {
    playSpeed: 0.38,
    resize(_w, _h, area) {
      const c = Math.round(Math.min(6000, Math.max(1800, area / (o.density * 0.3))));
      if (Math.abs(c - n) > 100) build(c, 256);
    },
    draw(f) {
      const { ctx } = f;
      fade(ctx, f.w, f.h, 0.5);
      const yaw = f.rotation;
      const pitch = 0.5 + Math.sin(f.t * 0.3) * 0.12;
      const cy0 = Math.cos(yaw);
      const sy0 = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const introE = 1 - Math.pow(1 - f.intro, 3);
      const S = Math.min(f.w, f.h) * 0.24 * (1 + f.level * 0.08) * (0.6 + 0.4 * introE);
      const cx = f.w / 2;
      const cy = f.h / 2;
      const camZ = 3.4;
      ctx.fillStyle = "#fff";
      for (let i = 0; i < n; i++) {
        const m = f.spec[bin[i]!]!;
        const push = m * 0.16 + Math.sin(f.t * 1.7 + ph[i]!) * 0.008;
        let x = pos[i * 3]! + nrm[i * 3]! * push;
        let y = pos[i * 3 + 1]! + nrm[i * 3 + 1]! * push;
        let z = pos[i * 3 + 2]! + nrm[i * 3 + 2]! * push;
        // yaw（y 軸）
        const x1 = x * cy0 + z * sy0;
        const z1 = -x * sy0 + z * cy0;
        // pitch（x 軸）
        const y2 = y * cp - z1 * sp;
        const z2 = y * sp + z1 * cp;
        x = x1;
        y = y2;
        z = z2;
        const persp = camZ / (camZ + z);
        const s = f.dpr * (0.6 + m * 0.9) * persp;
        ctx.globalAlpha = Math.min(1, (0.16 + m * 0.7) * persp * introE);
        ctx.fillRect(cx + x * S * persp, cy + y * S * persp, s, s);
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* ───────────── terrain ───────────── */

function terrainViz(): Viz {
  const M = 56;
  const K = 128;
  const hist = new Float32Array(M * K);
  for (let i = 0; i < hist.length; i++) hist[i] = Math.random() * 0.02;
  let head = 0;
  let acc = 0;
  const row = new Float32Array(K);

  const push = (spec: Float32Array) => {
    const B = spec.length;
    for (let k = 0; k < K; k++) {
      const c = Math.abs((k / (K - 1)) * 2 - 1);
      const b = Math.min(B - 1, Math.floor(Math.pow(c, 2) * B * 0.75));
      // 高頻能量本來就小，往兩側補一點增益，山脈才不會只剩中間一座尖峰
      row[k] = Math.min(1, spec[b]! * (0.85 + c * 0.9)) + Math.random() * 0.02;
    }
    head = (head + 1) % M;
    const base = head * K;
    for (let k = 0; k < K; k++) {
      const a = row[Math.max(0, k - 1)]!;
      const b = row[k]!;
      const c = row[Math.min(K - 1, k + 1)]!;
      hist[base + k] = (a + b * 2 + c) / 4;
    }
  };

  return {
    playSpeed: 0.42,
    resize() {},
    draw(f) {
      // 推進速度跟著旋轉速度：停止播放時，地形也慢慢停下來
      acc += f.dRot;
      let guard = 0;
      while (acc > 0.014 && guard < 5) {
        push(f.spec);
        acc -= 0.014;
        guard++;
      }
      if (guard === 5) acc = 0;

      const { ctx, w, h } = f;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const back = 1 / 2.6;
      const introE = 1 - Math.pow(1 - f.intro, 3);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = f.dpr * 0.6;
      for (let i = M - 1; i >= 0; i--) {
        const r = ((head - i) % M + M) % M;
        const z = i / (M - 1);
        const persp = 1 / (1 + z * 1.6);
        const depth = (persp - back) / (1 - back);
        const y0 = h * 0.3 + h * 0.56 * depth;
        const half = w * 0.47 * persp;
        const lift = h * 0.5 * persp * introE;
        const fadeBack = 0.2 + 0.8 * depth;
        ctx.globalAlpha = 0.12 * fadeBack;
        ctx.beginPath();
        for (let k = 0; k < K; k++) {
          const v = hist[r * K + k]!;
          const x = cx + ((k / (K - 1)) * 2 - 1) * half;
          const y = y0 - v * lift;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        for (let k = 0; k < K; k++) {
          const v = hist[r * K + k]!;
          const x = cx + ((k / (K - 1)) * 2 - 1) * half;
          const y = y0 - v * lift;
          ctx.globalAlpha = Math.min(1, (0.16 + v * 0.9) * fadeBack);
          const s = f.dpr * (0.6 + v * 1.3) * (0.5 + persp * 0.5);
          ctx.fillRect(x, y, s, s);
        }
      }
      ctx.globalAlpha = 1;
    },
  };
}

export function createViz(mode: VizMode, o: VizOptions): Viz {
  switch (mode) {
    case "polar":
      return polarViz();
    case "cube":
      return cubeViz(o);
    case "terrain":
      return terrainViz();
    default:
      return ringViz(o);
  }
}
