import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import ClientInit from "./ClientInit";
import SidebarNew from "@/components/SidebarNew";
// import AuthProvider from "@/components/AuthProvider"; // next-auth 비활성화
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import MainContent from "@/components/MainContent";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import MobileBottomNav from "@/components/MobileBottomNav";
import ScrollToTopButton from "@/components/ScrollToTopButton";

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MONSTA",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8B5CF6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 모든 스크립트보다 먼저 실행되는 긴급 패치 */}
        <Script
          id="safe-number-emergency"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                var originalToFixed = Number.prototype.toFixed;
                Number.prototype.toFixed = function(fractionDigits) {
                  try {
                    if (this == null || this == undefined) {
                      console.warn('[Emergency] toFixed called on null/undefined');
                      return '0';
                    }
                    var num = Number(this);
                    if (isNaN(num)) {
                      console.warn('[Emergency] toFixed called on NaN');
                      return '0';
                    }
                    if (!isFinite(num)) {
                      console.warn('[Emergency] toFixed called on Infinity');
                      return '0';
                    }
                    return originalToFixed.call(num, fractionDigits);
                  } catch (e) {
                    console.error('[Emergency] toFixed error:', e);
                    return '0';
                  }
                };
                console.log('[Emergency] Number safety patch applied at: ' + new Date().toISOString());
              })();
            `
          }}
        />
      </head>
      <body className={`${inter.className} dark:bg-black dark:text-white bg-white text-gray-900 antialiased`}>
        {/* AuthProvider 제거 - next-auth 비활성화 */}
        <ThemeProvider>
          <SidebarProvider>
            <ClientInit />
            <ServiceWorkerRegistration />
            <PWAInstallPrompt />
            <div className="min-h-screen">
              <SidebarNew />
              <MainContent>{children}</MainContent>
              <MobileBottomNav />
              <ScrollToTopButton />
            </div>
          </SidebarProvider>
        </ThemeProvider>
        {/* 추가 안전장치 */}
        <Script
          id="safe-number-backup"
          strategy="afterInteractive"
          src="/safe-number-init.js"
        />
      </body>
    </html>
  );
}