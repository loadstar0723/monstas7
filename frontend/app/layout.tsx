import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarNew from "@/components/SidebarNew";
import AuthProvider from "@/components/AuthProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import MainContent from "@/components/MainContent";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import MobileBottomNav from "@/components/MobileBottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MONSTA - 퀀텀 AI 크립토 트레이딩",
  description: "세계 최고의 가상화폐 AI 트레이딩 플랫폼",
  keywords: "crypto, trading, AI, bitcoin, ethereum, binance, 암호화폐, 트레이딩",
  authors: [{ name: "MONSTA Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
  manifest: "/manifest.json",
  themeColor: "#8B5CF6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MONSTA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} dark:bg-black dark:text-white bg-white text-gray-900 antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              <ServiceWorkerRegistration />
              <PWAInstallPrompt />
              <div className="min-h-screen">
                <SidebarNew />
                <MainContent>{children}</MainContent>
                <MobileBottomNav />
              </div>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
