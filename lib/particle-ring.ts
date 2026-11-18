/**
 * 粒子聲環：首頁主視覺與播放器「環」模式共用。
 * 每顆粒子固定一個角度與徑向偏移；半徑由（1）緩慢的低頻擺動、
 * （2）該角度對應的頻譜能量、（3）指標靠近時的擾動 推動。
 * 頻譜左右鏡像，低頻在環的頂端，高頻沉到底部；整個形狀隨 rotation 旋轉。
 */

const TAU = Math.PI * 2;

export type Ring = {
  n: number;
  ang: Float32Array;
  off: Float32Array;
  ph: Float32Array;
  sz: Float32Array;
  al: Float32Array;
  spd: Float32Array;
};

function gauss() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

export function createRing(n: number): Ring {
  const ring: Ring = {
    n,
    ang: new Float32Array(n),
    off: new Float32Array(n),
    ph: new Float32Array(n),
    sz: new Float32Array(n),
    al: new Float32Array(n),
    spd: new Float32Array(n),
  };
  for (let i = 0; i < n; i++) {
    ring.ang[i] = Math.random() * TAU;
    // 多數粒子貼著環，少數散成外圍的塵
    const dust = Math.random() < 0.18;
    ring.off[i] = gauss() * (dust ? 2.4 : 0.55);
    ring.ph[i] = Math.random() * TAU;
    ring.sz[i] = 0.7 + Math.random() * Math.random() * 1.4;
    ring.al[i] = dust ? 0.15 + Math.random() * 0.35 : 0.35 + Math.random() * 0.6;
    ring.spd[i] = (Math.random() - 0.5) * 0.05;
  }
  return ring;
}

export type RingFrame = {
  cx: number;
  cy: number;
  radius: number;
  /** 秒 */
  t: number;
  /** 0–1 的平滑頻譜（低頻在前）；全為 0 代表靜止 */
  spectrum: Float32Array | null;
  /** 0–1，平滑後的整體低頻能量 */
  level: number;
  /** 弧度，整個環的旋轉角 */
  rotation: number;
  /** 0–1，進場程度 */
  intro: number;
  pointer: { angle: number; strength: number } | null;
  /** 裝置像素比 */
  scale: number;
};

export function drawRing(
  ctx: CanvasRenderingContext2D,
  ring: Ring,
  f: RingFrame,
) {
  const spec = f.spectrum;
  const bins = spec ? spec.length : 0;
  const introE = 1 - Math.pow(1 - f.intro, 3);
  const spread = 1 + (1 - introE) * 1.4;
  const R = f.radius;

  ctx.fillStyle = "#fff";
  for (let i = 0; i < ring.n; i++) {
    // local：決定這顆粒子讀哪一段頻譜；th：實際畫的位置（含整體旋轉）
    const local = ring.ang[i]! + f.t * ring.spd[i]!;
    const th = local + f.rotation;
    const u = (((local % TAU) + TAU) % TAU) / TAU;
    // 畫布 y 軸朝下，u = 0.75 是頂端
    const d = Math.abs(u - 0.75);
    const m = Math.min(d, 1 - d) * 2;

    let a =
      0.06 +
      0.06 * Math.sin(local * 4 + f.t * 0.6) +
      0.04 * Math.sin(local * 7 - f.t * 0.9 + 1.7);
    if (spec && bins > 0) {
      const b = Math.min(bins - 1, Math.floor(Math.pow(m, 1.7) * bins));
      const v = spec[b]!;
      a = Math.max(a * (1 - f.level * 4), Math.min(1, Math.pow(v, 1.4) * 1.25));
    }
    if (f.pointer) {
      let dd = th - f.pointer.angle;
      dd = Math.atan2(Math.sin(dd), Math.cos(dd));
      a += f.pointer.strength * Math.exp((-dd * dd) / 0.1);
    }

    const wob =
      Math.sin(3 * local + f.t * 0.7) * 0.5 +
      Math.sin(5 * local - f.t * 1.1) * 0.3 +
      Math.sin(9 * local + f.t * 0.4 + 1.3) * 0.2;

    const r =
      (R * (1 + wob * 0.035 * (1 + f.level * 2.5) + a * 0.26 + f.level * 0.05) +
        ring.off[i]! * R * 0.085 * (1 + a * 3) +
        Math.sin(f.t * 2.3 + ring.ph[i]!) * 1.2 * f.scale) *
      spread;

    const x = f.cx + Math.cos(th) * r;
    const y = f.cy + Math.sin(th) * r;
    const s = ring.sz[i]! * f.scale;
    ctx.globalAlpha = Math.min(1, ring.al[i]! * introE * (0.6 + a * 1.2));
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;
}
