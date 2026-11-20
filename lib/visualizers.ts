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
  /** 0–1：低頻、中頻、高頻能量，與節拍包絡（鼓點瞬間跳高再衰減） */
  bass: number;
  mid: number;
  high: number;
  beat: number;
  rotation: number;
  /** 這一幀轉了多少（含捲動造成的） */
  dRot: number;
  intro: number;
  pointer: { angle: number; strength: number } | null;
  playing: boolean;
};

export type Viz = {
  /** 播放時的基本轉速（弧度／秒）；實際轉速再乘上音樂能量 */
  playSpeed: number;
  /** 傳給 <Visualizer>：首頁等沒有聲音的情況下用 */
  idleTilt?: boolean;
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

/** 與幀率無關的指數平滑：rate 越大越快跟上 */
function approach(cur: number, target: number, rate: number, dt: number) {
  return cur + (target - cur) * (1 - Math.exp(-rate * dt));
}

/* ───────────── ring ───────────── */

/**
 * 把頻譜整理成環形輪廓，讓整圈 360 度都平均起伏：
 * 1. 以對數間距切成 N 段（約 43 Hz–8.6 kHz），低、中、高頻各佔差不多的弧長；
 * 2. 每段除以它自己約 3 秒的平均（頻譜白化）：本來就小聲的高頻也和低頻一樣有反應，
 *    只有「比平常大聲」的那一段會鼓起，所以是此起彼落的波動，不是整圈一起脹大；
 * 3. 和左右鄰段平滑，避免鋸齒。
 * 參數是用 Möbius 實際播放時擷取的 540 幀頻譜調出來的。
 */
const RING_BANDS = 40;
const BAND_EDGES = (() => {
  const lo = 1;
  const hi = 200;
  const edges: number[] = [];
  for (let i = 0; i <= RING_BANDS; i++) edges.push(Math.round(lo * Math.pow(hi / lo, i / RING_BANDS)));
  return edges;
})();
const WHITEN_TAU = 3; // 秒
const WHITEN_FLOOR = 0.95; // 低於平均的 95% 視為沒有起伏
const WHITEN_GAIN = 5;
const WHITEN_CAP = 0.85;

function ringShaper() {
  let avg: Float32Array | null = null;
  const raw = new Float32Array(RING_BANDS);
  const norm = new Float32Array(RING_BANDS);
  const shape = new Float32Array(RING_BANDS);
  return (spec: Float32Array, dt: number): Float32Array | null => {
    let total = 0;
    for (let i = 0; i < RING_BANDS; i++) {
      const a = BAND_EDGES[i]!;
      const b = Math.max(a + 1, BAND_EDGES[i + 1]!);
      let sum = 0;
      for (let k = a; k < b; k++) sum += spec[k] ?? 0;
      raw[i] = sum / (b - a);
      total += raw[i]!;
    }
    total /= RING_BANDS;
    // 幾乎沒有聲音時交回給待機的呼吸動畫，平均值也重新開始累積
    if (total < 0.004) {
      avg = null;
      return null;
    }
    if (!avg) avg = Float32Array.from(raw, (r) => Math.max(r, 0.02));
    const follow = 1 - Math.exp(-dt / WHITEN_TAU);
    for (let i = 0; i < RING_BANDS; i++) {
      avg[i] = avg[i]! + (raw[i]! - avg[i]!) * follow;
      const w = raw[i]! / Math.max(avg[i]!, 0.02);
      norm[i] = Math.max(0, Math.min(1, (w - WHITEN_FLOOR) * WHITEN_GAIN)) * WHITEN_CAP;
    }
    // 整體音量很小時（例如剛按暫停、頻譜正在退）也一起收小
    const gate = Math.min(1, total / 0.05);
    for (let i = 0; i < RING_BANDS; i++) {
      const n = (norm[Math.max(0, i - 1)]! + norm[i]! * 2 + norm[Math.min(RING_BANDS - 1, i + 1)]!) / 4;
      shape[i] = n * gate;
    }
    return shape;
  };
}

function ringViz(o: VizOptions): Viz {
  let ring: Ring = createRing(600);
  const shaper = ringShaper();
  return {
    playSpeed: 0.42,
    resize(_w, _h, area) {
      const n = Math.round(Math.min(2400, Math.max(500, area / o.density)));
      if (Math.abs(n - ring.n) > 60) ring = createRing(n);
    },
    draw(f) {
      // 只在正面旋轉，不做立體傾斜；轉速仍由音樂決定（見 Visualizer）

      fade(f.ctx, f.w, f.h, 0.42);
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
        bass: f.bass,
        beat: f.beat,
        gain: 1.8,
        shape: shaper(f.spec, f.dt),
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
      // 一打開就是一整圈隨機頻譜，而不是全黑
      if (octx) {
        const { R } = geom();
        const fake = new Float32Array(128);
        const p1 = Math.random() * TAU;
        const p2 = Math.random() * TAU;
        const width = (3 * D) / R;
        for (let a = 0; a < TAU; a += width) {
          const swell = 0.55 + 0.25 * Math.sin(a * 3 + p1) + 0.2 * Math.sin(a * 7 + p2);
          for (let b = 0; b < fake.length; b++) {
            const fall = Math.pow(1 - b / fake.length, 1.3);
            const band = 0.5 + 0.5 * Math.sin(b * 0.21 + a * 4 + p2);
            fake[b] = Math.max(0, fall * swell * (0.6 + 0.45 * band) + (Math.random() - 0.5) * 0.25);
          }
          ray(a, fake, width);
        }
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

  let pitch = 0.5;
  let roll = 0;
  return {
    playSpeed: 0.38,
    resize(_w, _h, area) {
      const c = Math.round(Math.min(6000, Math.max(1800, area / (o.density * 0.3))));
      if (Math.abs(c - n) > 100) build(c, 256);
    },
    draw(f) {
      const { ctx } = f;
      fade(ctx, f.w, f.h, 0.62);
      const yaw = f.rotation;
      // 中頻把立方體往前翻、高頻讓它側傾
      pitch = approach(pitch, 0.45 + Math.sin(f.t * 0.3) * 0.12 + f.mid * 0.7 + f.beat * 0.2, 2.5, f.dt);
      roll = approach(roll, (f.high * 0.8 + f.bass * 0.2) * Math.sin(f.t * 0.45), 2, f.dt);
      const cr = Math.cos(roll);
      const sr = Math.sin(roll);
      const cy0 = Math.cos(yaw);
      const sy0 = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const introE = 1 - Math.pow(1 - f.intro, 3);
      const S = Math.min(f.w, f.h) * 0.168 * (1 + f.bass * 0.3 + f.beat * 0.18) * (0.6 + 0.4 * introE);
      const cx = f.w / 2;
      const cy = f.h / 2;
      const camZ = 3.4;
      ctx.fillStyle = "#fff";
      for (let i = 0; i < n; i++) {
        const m = f.spec[bin[i]!]!;
        const push = m * 0.34 + f.beat * 0.12 + Math.sin(f.t * 1.7 + ph[i]!) * (0.008 + m * 0.05);
        let x = pos[i * 3]! + nrm[i * 3]! * push;
        let y = pos[i * 3 + 1]! + nrm[i * 3 + 1]! * push;
        let z = pos[i * 3 + 2]! + nrm[i * 3 + 2]! * push;
        // yaw（y 軸）
        const x1 = x * cy0 + z * sy0;
        const z1 = -x * sy0 + z * cy0;
        // pitch（x 軸）
        const y2 = y * cp - z1 * sp;
        const z2 = y * sp + z1 * cp;
        // roll（z 軸）
        x = x1 * cr - y2 * sr;
        y = x1 * sr + y2 * cr;
        z = z2;
        const persp = camZ / (camZ + z);
        const s = f.dpr * (0.6 + m * 1.3) * persp;
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
