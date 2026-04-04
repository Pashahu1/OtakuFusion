import { Header } from '../components/CoreLayout/Header/Header';
import { Footer } from '../components/CoreLayout/Footer/Footer';
import { Montserrat, Playfair_Display, Rubik } from 'next/font/google';
import '../style/main.scss';
import { Suspense } from 'react';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { AppToaster } from '@/components/ui/AppToaster';
import { AuthProvider } from '@/context/AuthContext';
import { env } from '@/lib/env';
import type { Viewport } from 'next';

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? 'https://otakufusion.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OtakuFusion — Watch Anime Online Free | Sub & Dub HD',
    template: '%s | OtakuFusion',
  },
  description:
    'Watch anime online free in HD. Stream sub and dub anime, track your progress, discover new series. Your place for anime streaming.',
  keywords: [
    'anime',
    'watch anime online',
    'anime streaming',
    'anime sub',
    'anime dub',
    'free anime',
    'anime episodes',
    'OtakuFusion',
  ],
  openGraph: {
    type: 'website',
    locale: 'en',
    url: siteUrl,
    siteName: 'OtakuFusion',
    title: 'OtakuFusion — Watch Anime Online Free | Sub & Dub HD',
    description:
      'Watch anime online free in HD. Stream sub and dub anime, track your progress, discover new series.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OtakuFusion — Watch Anime Online Free',
    description:
      'Watch anime online free in HD. Stream sub and dub anime, track your progress.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const montserrat = Montserrat({
  weight: ['400', '700'],
  subsets: ['latin', 'cyrillic'],
});

const rubik = Rubik({
  weight: ['400', '500', '700'],
  subsets: ['latin', 'cyrillic'],
});

const playfair = Playfair_Display({
  weight: ['600', '700'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-hero-display',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" lang="en" suppressHydrationWarning>
      <head>
        {/*
          Preconnect до CDN майже не дає виграшу для next/image: браузер качає з origin (`/_next/image`), а апстрим тягне сервер.
          Render-blocking CSS: у production увімкнено `experimental.inlineCss` у next.config (у `next dev` лишаються окремі .css чанки — це норма).
        */}
      </head>
      <body
        className={`${montserrat.className} ${rubik.className} ${playfair.variable}`}
        suppressHydrationWarning
      >
        <Suspense fallback={<InitialLoader />}>
          <AuthProvider>
            <div className="layout">
              <Header />
              <main className="main">{children}</main>
              <Footer />
            </div>
            <AppToaster />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
