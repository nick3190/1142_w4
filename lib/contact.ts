/**
 * 聯絡表單：前端與 API 共用的欄位規則。
 * 前端用來決定能不能按「送出」，伺服端再用同一套規則重新檢查一次——
 * 前端的檢查可以被繞過，伺服端的才算數。
 */

export const CONTACT_CATEGORIES = [
  "配樂",
  "聲音設計",
  "剪輯",
  "平面設計",
  "網頁設計",
  "裝置設計",
  "混音",
  "其他",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export const CONTACT_LIMITS = {
  email: 254,
  name: 40,
  detailsMin: 10,
  details: 2000,
  /** 一小時內同一個人最多送出幾次 */
  perHour: 3,
  /** 打開表單到送出至少要經過的毫秒數：太快通常是機器人 */
  minFillMs: 3000,
} as const;

export type ContactInput = {
  email: string;
  name: string;
  category: string;
  details: string;
};

// 控制字元、零寬字元與雙向文字覆寫字元：可用來藏字或偽造顯示順序
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;
// 任何 HTML 標籤或註解的開頭，例如 <script、</a、<img、<!--
const HTML_TAG = /<\s*[/!?]?\s*[a-z]/i;
// 常見的腳本注入寫法
const SCRIPT_HINT = /(javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|on[a-z]+\s*=)/i;
const EMAIL = /^[^\s@<>()[\]\\,;:"']+@[^\s@<>()[\]\\,;:"']+\.[a-z]{2,}$/i;

/** 正規化並移除看不見的字元；單行欄位連換行一起去掉 */
export function cleanText(value: unknown, max: number, multiline = false): string {
  if (typeof value !== "string") return "";
  let s = value.normalize("NFC").replace(INVISIBLE, "");
  if (!multiline) s = s.replace(/[\r\n\t]+/g, " ");
  else s = s.replace(/\r\n?/g, "\n").replace(/\n{4,}/g, "\n\n\n");
  return s.trim().slice(0, max);
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export function validateContact(raw: ContactInput): {
  value: ContactInput;
  errors: ContactErrors;
} {
  const value: ContactInput = {
    email: cleanText(raw.email, CONTACT_LIMITS.email),
    name: cleanText(raw.name, CONTACT_LIMITS.name),
    category: cleanText(raw.category, 10),
    details: cleanText(raw.details, CONTACT_LIMITS.details, true),
  };
  const errors: ContactErrors = {};

  if (!value.email) errors.email = "請填寫 Email";
  else if (!EMAIL.test(value.email)) errors.email = "Email 格式不正確";

  if (!value.name) errors.name = "請填寫名稱或稱謂";
  else if (/[<>{}]/.test(value.name) || SCRIPT_HINT.test(value.name))
    errors.name = "名稱不可包含 < > { } 或程式碼";

  if (!CONTACT_CATEGORIES.includes(value.category as ContactCategory))
    errors.category = "請選擇諮詢類別";

  if (!value.details) errors.details = "請填寫需求內容";
  else if (value.details.length < CONTACT_LIMITS.detailsMin)
    errors.details = `需求內容至少 ${CONTACT_LIMITS.detailsMin} 個字`;
  else if (HTML_TAG.test(value.details) || SCRIPT_HINT.test(value.details))
    errors.details = "需求內容不可包含 HTML 標籤或程式碼";

  return { value, errors };
}
