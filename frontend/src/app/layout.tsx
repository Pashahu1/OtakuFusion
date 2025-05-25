"use client";
import { Inter } from "next/font/google";
import { Header } from "../components/Layout/Header/Header";
import { Footer } from "../components/Layout/Footer/Footer";
import "./globals.css";
import { Suspense } from "react";
const inter = Inter({ subsets: ["latin"] });
import { Loader } from "../components/shared/Loader/Loader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Suspense fallback={<Loader />}>
          <Header />
          <main className="main">{children}</main>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
