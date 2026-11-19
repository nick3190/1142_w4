import { NextResponse, type NextRequest } from "next/server";

/**
 * 內容保護（在每個請求抵達頁面或檔案之前執行）：
 * 1. 已知的爬蟲、AI 抓取器與指令列下載工具：整站一律 403。
 * 2. 音訊、影片、圖片：只允許本站頁面內的播放與顯示。
 *    直接在網址列打開或下載、從其他網站嵌入（盜連）都會被擋。
 *
 * 這能擋住絕大多數的爬蟲與一般下載，但無法擋住刻意偽造標頭的人；
 * 瀏覽器能播放的東西，技術上就一定能被錄下來。
 */

const BOT_UA =
  /(bot\b|bot\/|crawl|spider|slurp|scrapy|python-requests|python-urllib|aiohttp|httpx|curl\/|wget|libwww|httpclient|go-http-client|java\/|okhttp|axios|node-fetch|undici|headlesschrome|phantomjs|puppeteer|playwright|selenium|gptbot|chatgpt|oai-searchbot|ccbot|claudebot|claude-web|anthropic|perplexity|bytespider|amazonbot|applebot|petalbot|ahrefs|semrush|mj12|dotbot|dataforseo|facebookexternalhit|meta-externalagent|imagesift|diffbot|cohere|youbot|timpibot|omgili)/i;

const AV = /\.(mp3|wav|m4a|aac|flac|ogg|mov|mp4|m4v|webm)$/i;
const IMAGE = /\.(png|jpe?g|webp|gif|avif|svg)$/i;

function forbidden(message: string) {
  return new NextResponse(message, {
    status: 403,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" },
  });
}

/**
 * strict（音訊、影片）：一定要證明是本站頁面發出的。
 * 寬鬆（圖片）：瀏覽器有說明來源時才擋（直接開啟、跨站嵌入）；
 * 沒有說明時放行，因為圖片最佳化服務讀原圖時不會帶這些標頭。
 */
function fromThisSite(req: NextRequest, strict: boolean) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const site = req.headers.get("sec-fetch-site");
  const dest = req.headers.get("sec-fetch-dest");

  // 在網址列直接開啟、或用連結觸發下載
  if (dest === "document" || dest === "iframe" || dest === "embed" || dest === "object") return false;
  if (site) return site === "same-origin";

  // 沒有 Sec-Fetch 標頭的舊瀏覽器：退而檢查 Referer
  const referer = req.headers.get("referer");
  if (!referer) return !strict;
  try {
    return new URL(referer).host === host;
  } catch {
    return false;
  }
}

export function proxy(req: NextRequest) {
  // Next.js 內部轉發（例如圖片最佳化讀取原圖）的請求連 Host 都沒有；
  // 真實的 HTTP 請求一定帶 Host，所以這不會被外部冒用
  if (!req.headers.get("host")) return NextResponse.next();

  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return forbidden("Automated access is not allowed.");

  const path = req.nextUrl.pathname;
  const isAV = AV.test(path);
  const isMedia = isAV || IMAGE.test(path) || path.startsWith("/_next/image");
  if (isMedia && !fromThisSite(req, isAV)) {
    return forbidden("This file can only be viewed on the site.");
  }

  const res = NextResponse.next();
  if (isMedia) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noimageindex, noarchive");
    res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    res.headers.set("Content-Disposition", "inline");
  }
  return res;
}

export const config = {
  matcher: [
    // 除了 Next.js 自己的程式碼與樣式檔，其他全部經過這裡（包含 public 裡的音檔與圖片）
    "/((?!_next/static|_next/webpack-hmr|favicon.ico|robots.txt).*)",
  ],
};
