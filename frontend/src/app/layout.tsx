import type { Metadata } from "next";
import { Familjen_Grotesk, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingNav } from "@/components/floating-nav";
import { TooltipProvider } from "@/components/ui/tooltip";

const familjenGrotesk = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-familjen",
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kaasu — Expense Tracker",
  description: "Track your expenses with style",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${familjenGrotesk.variable} ${outfit.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
          <FloatingNav />
          <main className="min-h-screen pt-20 px-6 pb-12 jaali-pattern max-w-5xl mx-auto">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}
