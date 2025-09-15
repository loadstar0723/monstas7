"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import SidebarNew from "@/components/SidebarNew";
import MainContent from "@/components/MainContent";
import MobileBottomNav from "@/components/MobileBottomNav";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
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
  );
}