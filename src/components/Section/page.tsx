import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  text?: string | ReactNode;
  items?: string[];
}

export function Section({ title, text, items }: SectionProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <h2 className="text-xl font-bold tracking-wide text-[var(--color-brand-orange)] sm:text-2xl">
        {title}
      </h2>
      {text != null && (
        <p className="text-base leading-relaxed text-[var(--color-brand-text-primary)] sm:text-lg">
          {text}
        </p>
      )}
      {items && (
        <ul className="list-inside list-disc flex flex-col gap-2 text-base text-[var(--color-brand-text-primary)] sm:text-lg">
          {items.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
