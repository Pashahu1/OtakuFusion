import { Header } from '../components/CoreLayout/Header/Header';
import { Footer } from '../components/CoreLayout/Footer/Footer';
import { Montserrat, Rubik } from 'next/font/google';
import '../style/main.scss';
import { Suspense } from 'react';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'OtakuFusion',
  description: 'A clone of the Crunchyroll website built with Next.js',
};

const montserrat = Montserrat({
  weight: ['400', '700'],
  subsets: ['latin', 'cyrillic'],
});

const rubik = Rubik({
  weight: ['400', '500', '700'],
  subsets: ['latin', 'cyrillic'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} ${rubik.className}`}>
        <Suspense fallback={<InitialLoader />}>
          <AuthProvider>
            <div className="layout">
              <Header />
              <main className="main">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
