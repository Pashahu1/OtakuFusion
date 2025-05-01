import { Inter } from "next/font/google";
import { Header } from "../../components/Layout/Header/Header";
import { Footer } from "../../components/Layout/Footer/Footer";
import "./globals.css";
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
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
