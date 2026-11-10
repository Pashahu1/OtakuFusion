'use client';

import { useTranslation } from 'react-i18next';

import { Section } from '@/components/Section/Section';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen w-full bg-[var(--color-brand-gray-dark)] pt-[120px] px-4 flex justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-10 pb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-[var(--color-brand-text-primary)] tracking-tight">
          {t('privacy.title')}
        </h1>

        <div className="bg-[var(--color-brand-gray-light)] border border-zinc-800 rounded-2xl shadow-xl p-6 md:p-10 flex flex-col gap-10">
          <p className="text-[var(--color-brand-text-secondary)] text-lg">
            <span className="font-semibold text-[var(--color-brand-orange)]">
              {t('privacy.effective')}
            </span>{' '}
            {t('privacy.effectiveDate')}
          </p>
          <p className="text-[var(--color-brand-text-primary)] text-lg leading-relaxed">
            {t('privacy.intro')}
          </p>

          <div className="flex flex-col gap-10">
            <Section
              title={t('privacy.s1Title')}
              items={[t('privacy.s1i1'), t('privacy.s1i2'), t('privacy.s1i3')]}
            />
            <Section
              title={t('privacy.s2Title')}
              items={[t('privacy.s2i1'), t('privacy.s2i2'), t('privacy.s2i3')]}
            />
            <Section
              title={t('privacy.s3Title')}
              items={[t('privacy.s3i1'), t('privacy.s3i2'), t('privacy.s3i3')]}
            />
            <Section title={t('privacy.s4Title')} text={t('privacy.s4Text')} />
            <Section title={t('privacy.s5Title')} text={t('privacy.s5Text')} />
            <Section title={t('privacy.s6Title')} text={t('privacy.s6Text')} />
            <Section title={t('privacy.s7Title')} text={t('privacy.s7Text')} />
            <Section title={t('privacy.s8Title')} text={t('privacy.s8Text')} />
            <Section title={t('privacy.s9Title')} text={t('privacy.s9Text')} />
            <Section
              title={t('privacy.s10Title')}
              text={
                <>
                  {t('privacy.s10Text')}{' '}
                  <span className="font-semibold text-[var(--color-brand-orange)]">
                    maks.chudin567@gmail.com
                  </span>
                </>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
