import { createHash } from "node:crypto";
import { CONTACT_LIMITS, validateContact, type ContactInput } from "@/lib/contact";
import { hitLimit } from "@/lib/rate-limit";

/**
 * 聯絡表單 API。
 * 防護順序：同源檢查 → 大小與格式 → 蜜罐與填寫時間 → 欄位驗證（拒絕 HTML／腳本）
 * → 每人每小時 3 次 → 以純文字寄出（不產生任何 HTML，信件內容無法被當成程式執行）。
 */

const MAX_BODY = 8 * 1024;

function json(body: object, status = 200, extra: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extra },
  });
}

function clientKey(req: Request) {
  const h = req.headers;
  const ip =
    h.get("x-real-ip") ??
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  // 只存雜湊，不保留訪客的原始 IP
  return "contact:" + createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function sendMail(v: ContactInput) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false as const, reason: "not-configured" as const };
  const to = process.env.CONTACT_TO ?? "uniqueee3190@gmail.com";
  const from = process.env.CONTACT_FROM ?? "Portfolio Contact <onboarding@resend.dev>";
  const text = [
    `類別：${v.category}`,
    `名稱：${v.name}`,
    `Email：${v.email}`,
    "",
    "需求內容：",
    v.details,
    "",
    "——",
    "這封信由作品集網站的聯絡表單寄出；直接回覆即可回信給對方。",
  ].join("\n");
  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: v.email,
        subject: `［作品集聯絡］${v.category}｜${v.name}`,
        text,
      }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("contact: 連不到 Resend", err);
    return { ok: false as const, reason: "send-failed" as const };
  }
  if (!res.ok) {
    // 把 Resend 的原因寫進 Vercel 的執行記錄（不會回傳給訪客）
    const detail = await res.text().catch(() => "");
    console.error(`contact: Resend 拒絕寄送（HTTP ${res.status}）from=${from} to=${to} ${detail.slice(0, 500)}`);
    return { ok: false as const, reason: "send-failed" as const };
  }
  return { ok: true as const };
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: "請從網站上的表單送出。" }, 403);
  if (!(req.headers.get("content-type") ?? "").includes("application/json"))
    return json({ ok: false, error: "格式不正確。" }, 415);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: "內容太長。" }, 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch {
    return json({ ok: false, error: "格式不正確。" }, 400);
  }

  // 蜜罐欄位：真人看不到也不會填；被填了就假裝成功，不給機器人任何線索
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return json({ ok: true });
  }
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < CONTACT_LIMITS.minFillMs) {
    return json({ ok: false, error: "送出得太快了，請稍等幾秒再試。" }, 400);
  }

  const { value, errors } = validateContact({
    email: body.email as string,
    name: body.name as string,
    category: body.category as string,
    details: body.details as string,
  });
  if (Object.keys(errors).length > 0) {
    return json({ ok: false, error: "有欄位需要修正。", fields: errors }, 422);
  }

  const limit = await hitLimit(clientKey(req), CONTACT_LIMITS.perHour);
  if (!limit.ok) {
    const minutes = Math.ceil(limit.retryAfterSec / 60);
    return json(
      { ok: false, error: `一小時內最多送出 ${CONTACT_LIMITS.perHour} 次，請約 ${minutes} 分鐘後再試。` },
      429,
      { "Retry-After": String(limit.retryAfterSec) },
    );
  }

  const sent = await sendMail(value);
  if (!sent.ok) {
    if (sent.reason === "not-configured") {
      console.error("contact: RESEND_API_KEY 未設定（Vercel → Settings → Environment Variables，設定後要重新部署）");
    }
    return json(
      { ok: false, error: "訊息暫時寄不出去，請改寄 uniqueee3190@gmail.com。" },
      503,
    );
  }
  return json({ ok: true, remaining: limit.remaining });
}

export function GET() {
  return json({ ok: false }, 405, { Allow: "POST" });
}
