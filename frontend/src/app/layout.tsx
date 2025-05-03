"use client";
import { Inter } from "next/font/google";
import { Header } from "../../components/Layout/Header/Header";
import { Footer } from "../../components/Layout/Footer/Footer";
import "./globals.css";
import { Suspense } from "react";
const inter = Inter({ subsets: ["latin"] });
import { Provider } from "react-redux";
import { store } from "../../store/store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Provider store={store}>
        <body className={inter.className}>
          <Header />
          <Suspense>
            <main className="main">{children}</main>
          </Suspense>
          <Footer />
        </body>
      </Provider>
    </html>
  );
}
