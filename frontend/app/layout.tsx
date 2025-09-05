import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarNew from "@/components/SidebarNew";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MONSTA - 퀀텀 AI 크립토 트레이딩",
  description: "세계 최고의 가상화폐 AI 트레이딩 플랫폼",
  keywords: "crypto, trading, AI, bitcoin, ethereum, binance, 암호화폐, 트레이딩",
  authors: [{ name: "MONSTA Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <SidebarNew />
        <main className="lg:pl-64 pl-0 min-h-screen">
          <div className="lg:hidden h-16"></div>
          {children}
        </main>
      </body>
    </html>
  );
}
