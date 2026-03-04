import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  text?: string | ReactNode;
  items?: string[];
}

export function Section({ title, text, items }: SectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-[var(--color-brand-orange)] tracking-wide">
        {title}
      </h2>
      {text != null && (
        <p className="text-[var(--color-brand-text-primary)] text-lg leading-relaxed">
          {text}
        </p>
      )}
      {items && (
        <ul className="list-disc list-inside flex flex-col gap-2 text-[var(--color-brand-text-primary)] text-lg">
          {items.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
