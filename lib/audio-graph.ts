/**
 * 把 <audio>/<video> 接上 AnalyserNode。
 * 一個 media element 只能 createMediaElementSource 一次，所以用 WeakMap 快取；
 * AudioContext 全站共用一個。
 * 只有在 context 真的處於 running 時才接線——否則聲音會被導進一個
 * 暫停中的 graph 而變成靜音。
 */

let ctx: AudioContext | null = null;
const graphs = new WeakMap<HTMLMediaElement, AnalyserNode>();

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  return ctx;
}

function sameOrigin(el: HTMLMediaElement) {
  try {
    const src = el.currentSrc || el.src;
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * 盡量在使用者手勢的同步段落裡呼叫（resume() 需要手勢）。
 * 跨網域音檔沒有 CORS 標頭時會讓輸出變靜音，所以直接略過。
 */
export async function attachAnalyser(
  el: HTMLMediaElement,
): Promise<AnalyserNode | null> {
  const existing = graphs.get(el);
  const c = getCtx();
  if (!c) return existing ?? null;
  if (c.state !== "running") {
    try {
      await c.resume();
    } catch {
      /* 沒有手勢時會失敗，維持原狀 */
    }
  }
  // await 期間可能已有另一個呼叫完成接線
  const raced = existing ?? graphs.get(el);
  if (raced) return raced;
  if (c.state !== "running" || !sameOrigin(el)) return null;
  try {
    const source = c.createMediaElementSource(el);
    const analyser = c.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.82;
    source.connect(analyser);
    analyser.connect(c.destination);
    graphs.set(el, analyser);
    return analyser;
  } catch {
    return null;
  }
}
