import type { ReactNode } from "react";

type BentoCardProps = {
  title?: string;
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
    <section
      className={`flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/60 ${className}`}
    >
      {(eyebrow || title) && (
        <header className="space-y-1">
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
          )}
        </header>
      )}
      <div className="min-h-0 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
}
