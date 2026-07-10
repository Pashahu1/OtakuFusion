import { Header } from '../components/CoreLayout/Header/Header';
import { Footer } from '../components/CoreLayout/Footer/Footer';
import { Montserrat, Playfair_Display, Rubik } from 'next/font/google';
import '../style/main.scss';
import { Suspense } from 'react';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { AppToaster } from '@/components/ui/AppToaster';
import { AuthProvider } from '@/context/AuthContext';
import type { Viewport } from 'next';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthQueryBridge } from '@/components/providers/auth-query-bridge';
import { Analytics } from '@vercel/analytics/react';

/** Do not import `@/lib/env` in root layout — `EnvSchema.parse` fails on `next build` without all secrets on Vercel. */
const siteUrl =
  (typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' &&
  process.env.NEXT_PUBLIC_SITE_URL.trim()
    ? process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/+$/, '')
    : null) ?? 'https://otakufusion.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#141414' },
    { media: '(prefers-color-scheme: light)', color: '#141414' },
  ],
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'OtakuFusion',
  title: {
    default: 'OtakuFusion — Free Anime Streaming in HD',
    template: '%s · OtakuFusion',
  },
  description:
    'Stream anime online in HD with subtitles and dubs. Pick up where you left off, browse new releases, and save favorites on OtakuFusion.',
  keywords: [
    'OtakuFusion',
    'anime streaming',
    'watch anime online',
    'anime sub',
    'anime dub',
    'HD anime',
    'continue watching anime',
  ],
  authors: [{ name: 'OtakuFusion' }],
  creator: 'OtakuFusion',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'OtakuFusion',
    title: 'OtakuFusion — Free Anime Streaming in HD',
    description:
      'Stream anime online in HD with subtitles and dubs. Continue watching, discover series, and save favorites.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OtakuFusion — Free Anime Streaming in HD',
    description:
      'Stream anime online in HD with subtitles and dubs on OtakuFusion.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/icon.png', type: 'image/png' }],
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
        <link rel="dns-prefetch" href="https://s4.anilist.co" />
        <link rel="dns-prefetch" href="https://artworks.thetvdb.com" />
      </head>
      <body
        className={`${montserrat.className} ${rubik.className} ${playfair.variable}`}
        suppressHydrationWarning
      >
        <Suspense fallback={<InitialLoader />}>
          <QueryProvider>
            <AuthProvider>
              <AuthQueryBridge />
              <div className="layout">
                <Header />
                <main className="main">{children}</main>
                <Footer />
              </div>
            <AppToaster />
            </AuthProvider>
          </QueryProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
