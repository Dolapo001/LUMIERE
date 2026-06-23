import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import ChatWidget from "@/components/chat/ChatWidget";

import { ToastProvider } from "@/context/ToastContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumière",
  description: "Curated fashion and luxury goods.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ToastProvider>
          <AuthProvider>
            <AppProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <ChatWidget />
            </AppProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
