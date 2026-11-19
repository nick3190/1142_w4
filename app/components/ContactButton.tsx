"use client";

import { useRef, useState } from "react";
import {
  CONTACT_CATEGORIES,
  CONTACT_LIMITS,
  validateContact,
  type ContactErrors,
  type ContactInput,
} from "@/lib/contact";
import { useMorphModal } from "./portfolio/useMorphModal";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const EMPTY: ContactInput = { email: "", name: "", category: "", details: "" };

/** 首頁右上角的 Contact：按鈕崩解成粒子，在畫面中央拼出聯絡表單 */
export function ContactButton({ className = "" }: { className?: string }) {
  const { activeSlug, open, close, panelRef, closeRef } = useMorphModal();
  const [form, setForm] = useState<ContactInput>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof ContactInput, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [startedAt, setStartedAt] = useState(0);
  const honeypot = useRef<HTMLInputElement | null>(null);

  const { errors } = validateContact(form);
  const valid = Object.keys(errors).length === 0;
  const shown = (k: keyof ContactInput) => serverErrors[k] ?? (touched[k] ? errors[k] : undefined);

  const set = (k: keyof ContactInput, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setServerErrors((e) => ({ ...e, [k]: undefined }));
    if (status.kind === "error") setStatus({ kind: "idle" });
  };

  const onOpen = (el: HTMLElement) => {
    setStartedAt(Date.now());
    if (status.kind === "sent") {
      setForm(EMPTY);
      setTouched({});
      setStatus({ kind: "idle" });
    }
    open("contact", el);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, name: true, category: true, details: true });
    if (!valid || status.kind === "sending") return;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company: honeypot.current?.value ?? "", startedAt }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fields?: ContactErrors;
      };
      if (res.ok && data.ok) {
        setStatus({ kind: "sent" });
        return;
      }
      if (data.fields) setServerErrors(data.fields);
      setStatus({ kind: "error", message: data.error ?? "送出失敗，請稍後再試。" });
    } catch {
      setStatus({ kind: "error", message: "連線失敗，請檢查網路後再試。" });
    }
  };

  const field =
    "mt-1.5 w-full border-0 border-b border-line bg-transparent px-0 py-2 text-[15px] text-paper placeholder:text-mute/60 focus:border-paper focus:ring-0 focus:outline-none";

  return (
    <>
      <button
        type="button"
        onClick={(e) => onOpen(e.currentTarget)}
        aria-haspopup="dialog"
        className={`text-sm text-mute underline-offset-[6px] transition-colors hover:text-paper hover:underline ${className}`}
      >
        Contact
      </button>

      {activeSlug ? (
        <div
          className="modal-backdrop-late fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 p-3 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-title"
          onClick={close}
        >
          <div
            ref={panelRef}
            className="modal-panel-late my-auto w-full max-w-xl border border-line bg-ink p-5 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="contact-title" className="font-serif text-2xl text-paper">
                  聯絡我
                </h2>
                <p className="mt-1 text-sm text-mute">每個欄位都要填寫，我會用 Email 回覆你。</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="shrink-0 text-sm text-mute transition-colors hover:text-paper"
              >
                關閉
              </button>
            </div>

            {status.kind === "sent" ? (
              <div className="py-12" role="status">
                <p className="font-serif text-xl text-paper">已收到你的訊息。</p>
                <p className="mt-2 text-sm text-mute">我會盡快回覆到 {form.email}。</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-6 space-y-6">
                <div>
                  <label htmlFor="c-email" className="text-xs text-mute">Email</label>
                  <input
                    id="c-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    maxLength={CONTACT_LIMITS.email}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    aria-invalid={Boolean(shown("email"))}
                    aria-describedby={shown("email") ? "c-email-err" : undefined}
                    className={field}
                    placeholder="you@example.com"
                  />
                  {shown("email") ? (
                    <p id="c-email-err" className="mt-1 text-xs text-paper/80">{shown("email")}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="c-name" className="text-xs text-mute">名稱或稱謂</label>
                  <input
                    id="c-name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={CONTACT_LIMITS.name}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    aria-invalid={Boolean(shown("name"))}
                    aria-describedby={shown("name") ? "c-name-err" : undefined}
                    className={field}
                    placeholder="例如：王小姐、某某工作室"
                  />
                  {shown("name") ? (
                    <p id="c-name-err" className="mt-1 text-xs text-paper/80">{shown("name")}</p>
                  ) : null}
                </div>

                <fieldset>
                  <legend className="text-xs text-mute">想諮詢的類別</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CONTACT_CATEGORIES.map((c) => (
                      <label key={c} className="cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={c}
                          checked={form.category === c}
                          onChange={() => {
                            set("category", c);
                            setTouched((t) => ({ ...t, category: true }));
                          }}
                          className="peer sr-only"
                          required
                        />
                        <span className="inline-block rounded-full border border-line px-3 py-1 text-sm text-mute transition-colors peer-checked:border-paper peer-checked:bg-paper peer-checked:text-ink peer-checked:hover:text-ink peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-paper hover:border-paper/60 hover:text-paper">
                          {c}
                        </span>
                      </label>
                    ))}
                  </div>
                  {shown("category") ? (
                    <p className="mt-1 text-xs text-paper/80">{shown("category")}</p>
                  ) : null}
                </fieldset>

                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="c-details" className="text-xs text-mute">需求詳細</label>
                    <span className="text-[11px] text-mute tabular-nums">
                      {form.details.length}／{CONTACT_LIMITS.details}
                    </span>
                  </div>
                  <textarea
                    id="c-details"
                    required
                    rows={5}
                    maxLength={CONTACT_LIMITS.details}
                    value={form.details}
                    onChange={(e) => set("details", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, details: true }))}
                    aria-invalid={Boolean(shown("details"))}
                    aria-describedby={shown("details") ? "c-details-err" : undefined}
                    className={`${field} resize-y`}
                    placeholder="專案內容、時程、預算範圍等"
                  />
                  {shown("details") ? (
                    <p id="c-details-err" className="mt-1 text-xs text-paper/80">{shown("details")}</p>
                  ) : null}
                </div>

                {/* 蜜罐：真人看不到、也跳不到這一欄 */}
                <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Company
                    <input ref={honeypot} type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
                  </label>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <p className="min-h-[1.25rem] text-xs text-paper/80" role="status" aria-live="polite">
                    {status.kind === "error" ? status.message : status.kind === "sending" ? "傳送中…" : ""}
                  </p>
                  <button
                    type="submit"
                    disabled={!valid || status.kind === "sending"}
                    className="shrink-0 rounded-full border border-paper px-6 py-2 text-sm text-paper transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:border-line disabled:text-mute disabled:hover:bg-transparent disabled:hover:text-mute"
                  >
                    送出
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
