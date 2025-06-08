// "use client";
import { Header } from "../components/CoreLayout/Header/Header";
import { Footer } from "../components/CoreLayout/Footer/Footer";
import "./globals.css";
import { Suspense } from "react";
import { Loader } from "../components/shared/Loader/Loader";

export const metadata = {
  title: "OtakuFusion",
  description: "A clone of the Crunchyroll website built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-[#111213] text-white font-crunchy text-base leading-[1.5]">
        <Suspense fallback={<Loader />}>
          <Header />
          <main className="main">{children}</main>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
