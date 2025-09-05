import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarNew from "@/components/SidebarNew";
import AuthProvider from "@/components/AuthProvider";

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
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            <SidebarNew />
            <main className="flex-1 lg:ml-72 overflow-y-auto">
              <div className="lg:hidden h-14 bg-gray-900 fixed top-0 left-0 right-0 z-40"></div>
              <div className="lg:pt-0 pt-14 px-4 sm:px-6 lg:px-8 pb-8">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
