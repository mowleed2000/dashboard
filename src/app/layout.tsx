import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Business Command — Portfolio Operating Environment",
  description: "Personal entrepreneurial headquarters for operating, tracking, and understanding a nine-venture portfolio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--canvas)] text-[var(--ink)] selection:bg-[#E98569]/20 selection:text-[#252820]">
        {children}
      </body>
    </html>
  );
}
