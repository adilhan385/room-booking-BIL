import type { Metadata } from "next";
import { PT_Serif, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const display = PT_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["700"],
  variable: "--font-display",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Расписание помещений",
  description: "Система бронирования школьных помещений",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
