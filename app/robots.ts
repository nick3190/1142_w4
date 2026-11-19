import type { MetadataRoute } from "next";

/** 不開放任何爬蟲與 AI 抓取器收錄（真正的阻擋在 proxy.ts，這裡是給守規矩的爬蟲看的告示） */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
