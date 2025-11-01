import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import PageAssistant from "@/components/PageAssistant";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Sales Bot Pro - IA para Ventas por WhatsApp",
  description: "Automatiza tus ventas con WhatsApp usando IA avanzada. Bot inteligente con múltiples modelos, gestión de productos y métricas en tiempo real.",
  keywords: ["WhatsApp Bot", "IA", "Ventas", "Automatización", "Smart Sales Bot", "Chatbot"],
  authors: [{ name: "Tecnovariedades D&S" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Smart Sales Bot Pro",
    description: "Automatiza tus ventas con WhatsApp usando IA avanzada",
    url: "https://smartsalesbot.com",
    siteName: "Smart Sales Bot Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Sales Bot Pro",
    description: "Automatiza tus ventas con WhatsApp usando IA avanzada",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <PageTransition>
            {children}
          </PageTransition>
          <Toaster />
          <PageAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
