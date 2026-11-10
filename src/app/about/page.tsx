'use client';

import { useTranslation } from 'react-i18next';

import { Section } from '@/components/Section/Section';

export default function AboutPage() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen w-full bg-[var(--color-brand-gray-dark)] pt-[120px] px-4 flex justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-10 pb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-[var(--color-brand-text-primary)] tracking-tight">
          {t('about.title')}
        </h1>

        <div className="bg-[var(--color-brand-gray-light)] border border-zinc-800 rounded-2xl shadow-xl p-6 md:p-10 flex flex-col gap-10">
          <p className="text-[var(--color-brand-text-primary)] text-lg leading-relaxed">
            {t('about.intro')}
          </p>

          <div className="flex flex-col gap-10">
            <Section title={t('about.s1Title')} text={t('about.s1Text')} />
            <Section title={t('about.s2Title')} text={t('about.s2Text')} />
            <Section
              title={t('about.s3Title')}
              items={[
                t('about.s3i1'),
                t('about.s3i2'),
                t('about.s3i3'),
                t('about.s3i4'),
                t('about.s3i5'),
                t('about.s3i6'),
                t('about.s3i7'),
              ]}
            />
          </div>

          <p className="text-[var(--color-brand-text-primary)] text-lg leading-relaxed">
            {t('about.outro')}
          </p>

          <p className="text-lg text-center mt-4 font-medium text-[var(--color-brand-orange)]">
            {t('about.cta')}
          </p>
        </div>
      </div>
    </div>
  );
}
