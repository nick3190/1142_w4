import type { ReactNode } from "react";

type BentoCardProps = {
  title?: string;
  /** 標題上方的小字，例如分類 */
  eyebrow?: string;
  className?: string;
  children: ReactNode;
};

export function BentoCard({
  title,
  eyebrow,
  className = "",
  children,
}: BentoCardProps) {
  return (
    <section className={`flex flex-col gap-4 border-t border-line pt-5 ${className}`}>
      {(eyebrow || title) && (
        <header>
          {eyebrow && <p className="text-xs text-mute">{eyebrow}</p>}
          {title && (
            <h2 className="mt-1 font-serif text-xl text-paper sm:text-2xl">
              {title}
            </h2>
          )}
        </header>
      )}
      <div className="min-h-0 flex-1 text-[15px] leading-relaxed text-paper/85">
        {children}
      </div>
    </section>
  );
}
