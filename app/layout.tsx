import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/nav/Navbar";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto", weight: ["400", "500", "700", "900"] });

export const metadata: Metadata = {
  title: "KanjiLearn — Master Japanese Kanji",
  description: "Learn all JLPT N5-N1 kanji with spaced repetition. Track progress, create custom decks, and level up efficiently.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
