import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import Script from "next/script";
// 동적 임포트로 변경 - ChunkLoadError 해결
import dynamic from "next/dynamic";

const ThemeProvider = dynamic(() => import("@/contexts/ThemeContext").then(mod => mod.ThemeProvider), { ssr: false });
const SidebarProvider = dynamic(() => import("@/contexts/SidebarContext").then(mod => mod.SidebarProvider), { ssr: false });
const ClientInit = dynamic(() => import("./ClientInit"), { ssr: false });
const SidebarNew = dynamic(() => import("@/components/SidebarNew"), { ssr: false });
const MainContent = dynamic(() => import("@/components/MainContent"), { ssr: false });
const ServiceWorkerRegistration = dynamic(() => import("@/components/ServiceWorkerRegistration"), { ssr: false });
const PWAInstallPrompt = dynamic(() => import("@/components/PWAInstallPrompt"), { ssr: false });
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });

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
        {/* safe-number-init.js는 public 폴더에서 직접 로드됨 */}
      </head>
      <body className={inter.className}>
        {/* Script 컴포넌트 제거 - ChunkLoadError 해결 */}
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
                .toISOString());
              })();
            `
          }}
        />
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
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}