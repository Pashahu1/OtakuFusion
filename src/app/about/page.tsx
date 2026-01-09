import { Section } from '@/components/Section/page';

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--color-brand-gray-dark)] pt-[120px] px-4 flex justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-10 pb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-[var(--color-brand-text-primary)] tracking-tight">
          About OtakuFusion
        </h1>

        <div className="bg-[var(--color-brand-gray-light)] border border-zinc-800 rounded-2xl shadow-xl p-6 md:p-10 flex flex-col gap-10">
          {/* Intro */}
          <p className="text-[var(--color-brand-text-primary)] text-lg leading-relaxed">
            Anime is loved all around the world, and millions of people search
            for anime online every month. With so many free anime sites
            available, not all of them are equally safe or convenient. That’s
            why we created
            <span className="font-semibold text-[var(--color-brand-orange)]">
              OtakuFusion
            </span>
            — a simple, safe, and enjoyable way for anime fans to watch their
            favorite series online.
          </p>

          <div className="flex flex-col gap-10">
            <Section
              title="1. What is OtakuFusion?"
              text="OtakuFusion is a free platform to watch anime online. You can stream subbed or dubbed episodes in high quality without registration or payment. We keep ads minimal to ensure a smooth and comfortable experience."
            />

            <Section
              title="2. Is OtakuFusion safe?"
              text="Yes! We carefully monitor ads and site behavior to ensure everything stays safe. If you ever notice anything suspicious, let us know — we’ll fix it quickly."
            />

            <Section
              title="3. Why OtakuFusion is a great choice for anime fans:"
              items={[
                'A huge library of popular, classic, and new anime titles.',
                'Subbed and dubbed versions in multiple languages.',
                'Video quality options from 360p to 1080p.',
                'Simple and intuitive navigation.',
                'Frequent updates and new releases.',
                'Works on both desktop and mobile devices.',
                'Fast support for questions and content requests.',
              ]}
            />
          </div>

          <p className="text-[var(--color-brand-text-primary)] text-lg leading-relaxed">
            If you’re looking for a safe and convenient way to watch anime
            online, give
            <span className="font-semibold text-[var(--color-brand-orange)]">
              OtakuFusion
            </span>
            a try. If you enjoy it, share it with your friends and bookmark our
            site!
          </p>

          <p className="text-lg text-center mt-4 font-medium text-[var(--color-brand-orange)]">
            Join us in celebrating the world of anime!
          </p>
        </div>
      </div>
    </div>
  );
}
