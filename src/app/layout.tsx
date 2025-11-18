import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import PageAssistant from "@/components/PageAssistant";
import PageTransition from "@/components/PageTransition";
import StructuredData from "@/components/StructuredData";
import PWAInstaller from "@/components/PWAInstaller";
import { organizationSchema, softwareApplicationSchema } from "@/lib/seo-schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host'),
  title: {
    default: "Smart Sales Bot Pro - Automatización de Ventas con IA para WhatsApp",
    template: "%s | Smart Sales Bot Pro"
  },
  description: "Potencia tus ventas con nuestro bot inteligente de WhatsApp. IA avanzada con múltiples modelos (Groq, OpenAI, Claude), gestión automática de productos, análisis en tiempo real y respuestas personalizadas 24/7. Ideal para negocios en Colombia.",
  keywords: [
    "bot whatsapp",
    "automatización ventas",
    "inteligencia artificial",
    "chatbot ventas",
    "whatsapp business",
    "bot IA",
    "ventas automáticas",
    "asistente virtual",
    "groq llama",
    "openai gpt",
    "claude ai",
    "bot colombia",
    "tecnovariedades",
    "ventas por whatsapp",
    "ecommerce automation",
    "smart sales",
    "conversational ai",
    "customer service bot"
  ],
  authors: [{ name: "Tecnovariedades D&S", url: "https://smartsalesbot.com" }],
  creator: "Tecnovariedades D&S",
  publisher: "Smart Sales Bot Pro",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/smart-sales-bot-logo.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/smart-sales-bot-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/smart-sales-bot-logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://smartsalesbot.com',
    siteName: "Smart Sales Bot Pro",
    title: "Smart Sales Bot Pro - Automatización de Ventas con IA para WhatsApp",
    description: "Bot inteligente de WhatsApp con IA avanzada. Automatiza ventas, gestiona productos y atiende clientes 24/7. Múltiples modelos de IA, análisis en tiempo real y respuestas personalizadas.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartsalesbot.com'}/smart-sales-bot-logo.png`,
        width: 1200,
        height: 630,
        alt: "Smart Sales Bot Pro - Automatización de Ventas con IA",
        type: "image/png",
      },
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartsalesbot.com'}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Smart Sales Bot Pro - Automatización de Ventas con IA",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Sales Bot Pro - Automatización de Ventas con IA",
    description: "Bot inteligente de WhatsApp con IA avanzada. Automatiza ventas 24/7 con múltiples modelos de IA.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://smartsalesbot.com'}/smart-sales-bot-logo.png`],
    creator: "@smartsalesbot",
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
  verification: {
    google: "google-site-verification-code", // Reemplazar con código real
    // yandex: "yandex-verification-code",
    // bing: "bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <StructuredData data={[organizationSchema, softwareApplicationSchema]} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <PageTransition>
            {children}
          </PageTransition>
          <Toaster />
          <PageAssistant />
          <PWAInstaller />
        </AuthProvider>
      </body>
    </html>
  );
}
