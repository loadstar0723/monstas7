import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import ClientInit from "./ClientInit";
import SafeNumberInit from "./SafeNumberInit";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                var originalToFixed = Number.prototype.toFixed;
                Number.prototype.toFixed = function(fractionDigits) {
                  try {
                    if (this == null || this == undefined) {
                      return '0';
                    }
                    var num = Number(this);
                    if (isNaN(num)) {
                      return '0';
                    }
                    if (!isFinite(num)) {
                      return '0';
                    }
                    return originalToFixed.call(num, fractionDigits);
                  } catch (e) {
                    console.error('[Emergency] toFixed error:', e);
                    return '0';
                  }
                };
              })();
            `
          }}
        />
      </head>
      <body className={`${inter.className} dark:bg-black dark:text-white bg-white text-gray-900 antialiased`}>
        {/* AuthProvider 제거 - next-auth 비활성화 */}
        <ThemeProvider>
          <SidebarProvider>
            <SafeNumberInit />
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
      </body>
    </html>
  );
}