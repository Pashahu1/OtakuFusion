import { Section } from '@/components/Section/page';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--color-brand-gray-dark)] pt-[120px] px-4 flex justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-10 pb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-[var(--color-brand-text-primary)] tracking-tight">
          Privacy Policy
        </h1>

        <div className="bg-[var(--color-brand-gray-light)] border border-zinc-800 rounded-2xl shadow-xl p-6 md:p-10 flex flex-col gap-10">
          <p className="text-[var(--color-brand-text-secondary)] text-lg">
            <span className="font-semibold text-[var(--color-brand-orange)]">
              Effective Date:
            </span>
            August 2025
          </p>
          <p className="text-[var(--color-brand-text-primary)] text-lg leading-relaxed">
            At
            <span className="font-semibold text-[var(--color-brand-orange)]">
              OtakuFusion
            </span>
            , we respect your privacy. This page explains how we collect, use,
            and protect your information while you enjoy anime on our platform.
          </p>

          <div className="flex flex-col gap-10">
            <Section
              title="1. Information We Collect"
              items={[
                'Anonymous analytics data (pages visited, device type, browser type).',
                'Cookies or similar technologies for basic site functionality.',
              ]}
            />
            <Section
              title="2. How We Use Your Information"
              items={[
                'Improving site performance and user experience.',
                'Monitoring and preventing misuse or technical issues.',
                'Delivering relevant content and updates.',
              ]}
            />
            <Section
              title="3. Third-Party Services"
              text="We may use minimal ads or analytics services. Any third-party service we use must comply with privacy standards."
            />
            <Section
              title="4. Cookies"
              text="OtakuFusion uses cookies only for essential functionality and analytics. You may disable cookies, but some features may not work correctly."
            />
            <Section
              title="5. Data Security"
              text="We take reasonable measures to protect your data. However, no method of internet transmission is 100% secure."
            />
            <Section
              title="6. Third-Party Links"
              text="Our site may contain links to external websites. We are not responsible for their privacy practices."
            />
            <Section
              title="7. Children’s Privacy"
              text="OtakuFusion is not directed to children under 13. We do not knowingly collect personal information from children."
            />
            <Section
              title="8. Changes to This Policy"
              text="We may update this Privacy Policy from time to time. The 'Effective Date' will always reflect the latest version."
            />
            <Section
              title="9. Contact Us"
              text={
                <>
                  If you have any questions, feel free to contact us at:
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
