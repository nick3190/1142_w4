import fs from "fs";
import path from "path";

const GEORGIE_DIR = path.join(process.cwd(), "public", "georgie");

/** 第十次固定顯示，不參與隨機池 */
const FINALE_BASENAMES = new Set(["不想出門.JPG", "不想出門.jpg"]);

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

function publicGeorgieUrl(filename: string) {
  return `/georgie/${encodeURIComponent(filename)}`;
}

/**
 * 讀取 `public/georgie` 內所有圖檔（jpg / png / webp / gif），排除隱藏檔與「不想出門」結局圖。
 * 僅供 Server Component 或 server 端匯入使用。
 */
export function getGeorgieRandomPool(): string[] {
  if (!fs.existsSync(GEORGIE_DIR)) return [];

  const names = fs
    .readdirSync(GEORGIE_DIR, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => !name.startsWith(".") && IMAGE_EXT.test(name))
    .filter((name) => !FINALE_BASENAMES.has(name));

  names.sort((a, b) => a.localeCompare(b, "zh-Hant"));

  return names.map(publicGeorgieUrl);
}

export function getGeorgieFinalePath(): string {
  return publicGeorgieUrl("不想出門.JPG");
}
