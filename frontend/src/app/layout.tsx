import { Inter } from "next/font/google";
import { Header } from "../../components/Layout/Header/Header";
import { Footer } from "../../components/Layout/Footer/Footer";
import "./globals.css";
import { Suspense } from "react";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Header />
        <div className="main-container">
          <Suspense fallback={<div>Loading...</div>}>
            <main className="main">{children}</main>
          </Suspense>
        </div>
        <Footer />
      </body>
    </html>
  );
}
