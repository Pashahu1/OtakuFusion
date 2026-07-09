import type { ReactNode } from 'react';
import { Section } from '@/components/Section/Section';

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
              Effective date:
            </span>{' '}
            May 2026
          </p>
          <p className="text-[var(--color-brand-text-primary)] text-lg leading-relaxed">
            <span className="font-semibold text-[var(--color-brand-orange)]">OtakuFusion</span> is an{' '}
            <strong>educational and portfolio project</strong>. It is built to demonstrate software
            engineering skills (UI, APIs, integrations). It is{' '}
            <strong>not a commercial product</strong>, not sold as a streaming service, and may be
            incomplete, experimental, or taken offline at any time. This policy describes privacy in
            that limited context.
          </p>

          <div className="flex flex-col gap-10">
            <Section
              title="1. What this project is (and is not)"
              items={[
                'Personal learning, coursework, and/or portfolio use only unless clearly stated otherwise.',
                'No guarantee of availability, accuracy of metadata, or fitness for any particular purpose.',
                'Streaming or third-party integrations, if enabled, are technical demonstrations; their providers have their own terms and privacy policies.',
              ]}
            />
            <Section
              title="2. Information we may collect"
              items={[
                'Basic account or authentication data you choose to provide (e.g. email), only if such features exist in the deployed build.',
                'Anonymous or aggregated analytics (e.g. pages viewed, device or browser type) if analytics are enabled.',
                'Cookies or similar technologies needed for sessions, preferences, or analytics.',
              ]}
            />
            <Section
              title="3. How we use information"
              items={[
                'Operating and improving the demo application.',
                'Debugging, security, and preventing obvious misuse of a non-production deployment.',
                'No sale of personal data as part of this educational project.',
              ]}
            />
            <Section
              title="4. Third-party services"
              text="The app may call external APIs (for example metadata or media-related endpoints). Those services process data under their own policies. Use of this project does not override their rules."
            />
            <Section
              title="5. Cookies"
              text="Cookies may be used for essential functionality and, if configured, analytics. You can restrict cookies in your browser; some features may then not work."
            />
            <Section
              title="6. Data security"
              text="Reasonable care may be taken to protect data, but no method of transmission over the internet is fully secure. A portfolio or student deployment should not be treated like a regulated production platform."
            />
            <Section
              title="7. Third-party links"
              text="The site may link to external sites. We are not responsible for their content or privacy practices."
            />
            <Section
              title="8. Children’s privacy"
              text="This project is not directed at children under 13, and we do not knowingly collect personal information from children as part of this educational build."
            />
            <Section
              title="9. Changes to this policy"
              text="This policy may be updated as the project evolves. The effective date above reflects the latest version shown on this page."
            />
            <Section
              title="10. Contact"
              text={
                (
                  <>
                    Questions about this policy or the project:{' '}
                    <span className="font-semibold text-[var(--color-brand-orange)]">
                      maks.chudin567@gmail.com
                    </span>
                  </>
                ) as ReactNode
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
