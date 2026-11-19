import "server-only";

/**
 * 一小時的固定時間窗計數。
 * 有設定 Upstash Redis（UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN）時用它，
 * 所有伺服器實例共用同一份計數；沒有設定時退回單一實例的記憶體計數。
 */

const WINDOW_SEC = 3600;
const memory = new Map<string, { count: number; resetAt: number }>();

export type LimitResult = { ok: boolean; remaining: number; retryAfterSec: number };

export async function hitLimit(key: string, limit: number): Promise<LimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, String(WINDOW_SEC), "NX"],
          ["TTL", key],
        ]),
        cache: "no-store",
      });
      if (res.ok) {
        const out = (await res.json()) as { result: number }[];
        const count = Number(out[0]?.result ?? 0);
        const ttl = Math.max(1, Number(out[2]?.result ?? WINDOW_SEC));
        return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfterSec: ttl };
      }
    } catch {
      /* Redis 連不上時退回記憶體計數，而不是讓表單整個壞掉 */
    }
  }

  const now = Date.now();
  // 順手清掉過期的紀錄，避免記憶體越長越大
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
  }
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + WINDOW_SEC * 1000 });
    return { ok: true, remaining: limit - 1, retryAfterSec: WINDOW_SEC };
  }
  entry.count += 1;
  return {
    ok: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
  };
}
