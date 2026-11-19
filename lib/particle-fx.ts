/**
 * 全站共用的粒子特效層：一張固定在最上層、不攔截指標的畫布。
 * 只有在有粒子存活時才跑 requestAnimationFrame。
 *
 * dust    從元素邊緣飄散的細塵（hover）
 * gather  從四周聚攏到元素輪廓上（打開 modal）
 * scatter 從元素範圍向外炸開（關閉 modal）
 */

type Particle = {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
  tween: boolean;
  /** 聚攏時先淡入；炸開時一出現就最亮 */
  fadeIn: boolean;
  /** 崩解重組：一路保持亮度，抵達前才淡出 */
  hold?: boolean;
  alpha: number;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let parts: Particle[] = [];
let raf = 0;
let dpr = 1;

function reduced() {
  return (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function ensure() {
  if (canvas || typeof document === "undefined") return;
  canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100vw",
    height: "100lvh",
    pointerEvents: "none",
    zIndex: "70",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  let lastW = 0;
  let lastH = 0;
  const resize = () => {
    if (!canvas) return;
    // 畫布固定為 100lvh（網址列收起時的最大高度），量它本身的尺寸
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // 手機網址列伸縮時只差幾十像素，不必重配畫布
    if (lastW && w === lastW && Math.abs(h - lastH) < 160) return;
    lastW = w;
    lastH = h;
    const maxDpr = window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2;
    dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  };
  resize();
  let timer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(resize, 150);
  });
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

function tick(now: number) {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  const alive: Particle[] = [];
  for (const p of parts) {
    const k = (now - p.born) / p.life;
    if (k >= 1) continue;
    if (k < 0) {
      alive.push(p);
      continue;
    }
    alive.push(p);
    let x: number;
    let y: number;
    let a: number;
    if (p.tween) {
      const e = easeOut(k);
      x = p.sx + (p.tx - p.sx) * e;
      y = p.sy + (p.ty - p.sy) * e;
      a =
        (p.hold
          ? k < 0.72
            ? 1
            : (1 - k) / 0.28
          : p.fadeIn
            ? Math.sin(k * Math.PI)
            : Math.pow(1 - k, 1.5)) * p.alpha;
    } else {
      const sec = (now - p.born) / 1000;
      x = p.sx + p.vx * sec;
      y = p.sy + p.vy * sec;
      a = (1 - k) * (1 - k) * p.alpha;
    }
    ctx.globalAlpha = a;
    ctx.fillRect(x * dpr, y * dpr, p.size * dpr, p.size * dpr);
  }
  ctx.globalAlpha = 1;
  parts = alive;
  raf = parts.length ? requestAnimationFrame(tick) : 0;
  if (!parts.length) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function kick() {
  if (!raf) raf = requestAnimationFrame(tick);
}

function pointOnRect(r: DOMRect) {
  // 沿著外框隨機取一點
  const per = 2 * (r.width + r.height);
  let d = Math.random() * per;
  if (d < r.width) return { x: r.left + d, y: r.top };
  d -= r.width;
  if (d < r.height) return { x: r.right, y: r.top + d };
  d -= r.height;
  if (d < r.width) return { x: r.right - d, y: r.bottom };
  d -= r.width;
  return { x: r.left, y: r.bottom - d };
}

export type FxMode = "dust" | "gather" | "scatter";

export function emitFromRect(
  rect: DOMRect,
  mode: FxMode = "dust",
  count?: number,
) {
  if (reduced()) return;
  ensure();
  const now = performance.now();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const n =
    count ??
    (mode === "dust"
      ? Math.round(18 + rect.width * 0.25)
      : Math.round(Math.min(700, 160 + (rect.width + rect.height) * 0.35)));

  for (let i = 0; i < n; i++) {
    if (mode === "dust") {
      const p = Math.random() < 0.6 ? pointOnRect(rect) : {
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
      };
      const ang = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 0.9;
      const sp = 14 + Math.random() * 42;
      parts.push({
        sx: p.x,
        sy: p.y,
        tx: 0,
        ty: 0,
        vx: Math.cos(ang) * sp - 10,
        vy: Math.sin(ang) * sp - 8,
        born: now + Math.random() * 120,
        life: 500 + Math.random() * 600,
        size: 0.8 + Math.random() * 1.1,
        tween: false,
        fadeIn: false,
        alpha: 0.5 + Math.random() * 0.5,
      });
    } else if (mode === "gather") {
      const t = pointOnRect(rect);
      const ang = Math.atan2(t.y - cy, t.x - cx) + (Math.random() - 0.5) * 0.6;
      const dist = 60 + Math.random() * 220;
      parts.push({
        sx: t.x + Math.cos(ang) * dist,
        sy: t.y + Math.sin(ang) * dist,
        tx: t.x,
        ty: t.y,
        vx: 0,
        vy: 0,
        born: now + Math.random() * 140,
        life: 520 + Math.random() * 320,
        size: 0.8 + Math.random() * 1.2,
        tween: true,
        fadeIn: true,
        alpha: 0.5 + Math.random() * 0.5,
      });
    } else {
      const inside = Math.random() < 0.5;
      const p = inside
        ? {
            x: rect.left + Math.random() * rect.width,
            y: rect.top + Math.random() * rect.height,
          }
        : pointOnRect(rect);
      const ang = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 0.5;
      const dist = 40 + Math.random() * 200;
      parts.push({
        sx: p.x,
        sy: p.y,
        tx: p.x + Math.cos(ang) * dist,
        ty: p.y + Math.sin(ang) * dist,
        vx: 0,
        vy: 0,
        born: now,
        life: 450 + Math.random() * 350,
        size: 0.8 + Math.random() * 1.2,
        tween: true,
        fadeIn: false,
        alpha: 0.5 + Math.random() * 0.5,
      });
    }
  }
  kick();
}

/**
 * 崩解重組：粒子從 from（被點的作品卡）各處散開，
 * 沿弧線飛到 to（modal 面板）的輪廓與內部，拼出新的形狀。
 */
export function morphRect(from: DOMRect, to: DOMRect, count?: number) {
  if (reduced()) return;
  ensure();
  const now = performance.now();
  const n = count ?? Math.round(Math.min(900, 260 + (to.width + to.height) * 0.4));
  for (let i = 0; i < n; i++) {
    const sx = from.left + Math.random() * from.width;
    const sy = from.top + Math.random() * from.height;
    const t =
      Math.random() < 0.7
        ? pointOnRect(to)
        : { x: to.left + Math.random() * to.width, y: to.top + Math.random() * to.height };
    parts.push({
      sx,
      sy,
      tx: t.x,
      ty: t.y,
      vx: 0,
      vy: 0,
      // 由卡片左上往右下依序剝落
      born: now + ((sx - from.left) / Math.max(1, from.width) + (sy - from.top) / Math.max(1, from.height)) * 110 + Math.random() * 60,
      life: 620 + Math.random() * 380,
      size: 0.8 + Math.random() * 1.3,
      tween: true,
      fadeIn: false,
      hold: true,
      alpha: 0.55 + Math.random() * 0.45,
    });
  }
  kick();
}
