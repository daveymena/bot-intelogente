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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host';
const LOGO_VERSION = '?v=20251120v2'; // Cambiar este número para forzar actualización del logo

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#075e54',
}

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
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
    url: APP_URL,
    siteName: "Smart Sales Bot Pro",
    title: "Smart Sales Bot Pro - Automatización de Ventas con IA para WhatsApp",
    description: "Bot inteligente de WhatsApp con IA avanzada. Automatiza ventas, gestiona productos y atiende clientes 24/7. Múltiples modelos de IA, análisis en tiempo real y respuestas personalizadas.",
    images: [
      {
        url: `${APP_URL}/smart-sales-bot-logo.png${LOGO_VERSION}`,
        width: 512,
        height: 512,
        alt: "Smart Sales Bot Pro - Bot de WhatsApp con IA",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Sales Bot Pro - Automatización de Ventas con IA",
    description: "Bot inteligente de WhatsApp con IA avanzada. Automatiza ventas 24/7 con múltiples modelos de IA.",
    images: [`${APP_URL}/smart-sales-bot-logo.png${LOGO_VERSION}`],
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
        
        {/* ========== OPEN GRAPH (Facebook, WhatsApp, LinkedIn) ========== */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={APP_URL} />
        <meta property="og:title" content="Smart Sales Bot Pro - Automatización de Ventas con IA para WhatsApp" />
        <meta property="og:description" content="Bot inteligente de WhatsApp con IA avanzada. Automatiza ventas, gestiona productos y atiende clientes 24/7." />
        <meta property="og:site_name" content="Smart Sales Bot Pro" />
        <meta property="og:locale" content="es_CO" />
        
        {/* Imagen principal - TODAS las variantes */}
        <meta property="og:image" content={`${APP_URL}/smart-sales-bot-logo.png${LOGO_VERSION}`} />
        <meta property="og:image:url" content={`${APP_URL}/smart-sales-bot-logo.png${LOGO_VERSION}`} />
        <meta property="og:image:secure_url" content={`${APP_URL}/smart-sales-bot-logo.png${LOGO_VERSION}`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content="Smart Sales Bot Pro - Bot de WhatsApp con IA" />
        
        {/* ========== TWITTER / X ========== */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@smartsalesbot" />
        <meta name="twitter:creator" content="@smartsalesbot" />
        <meta name="twitter:title" content="Smart Sales Bot Pro - Automatización de Ventas con IA" />
        <meta name="twitter:description" content="Bot inteligente de WhatsApp con IA avanzada. Automatiza ventas 24/7 con múltiples modelos de IA." />
        <meta name="twitter:image" content={`${APP_URL}/smart-sales-bot-logo.png${LOGO_VERSION}`} />
        <meta name="twitter:image:src" content={`${APP_URL}/smart-sales-bot-logo.png${LOGO_VERSION}`} />
        <meta name="twitter:image:alt" content="Smart Sales Bot Pro - Automatización de Ventas con IA" />
        
        {/* ========== WHATSAPP ESPECÍFICO ========== */}
        <meta property="og:image" content={`${APP_URL}/smart-sales-bot-logo.png${LOGO_VERSION}`} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        
        {/* ========== TELEGRAM ========== */}
        <meta name="telegram:channel" content="@smartsalesbot" />
        
        {/* ========== GENERAL ========== */}
        <meta name="description" content="Bot inteligente de WhatsApp con IA avanzada. Automatiza ventas, gestiona productos y atiende clientes 24/7." />
        <meta name="image" content={`${APP_URL}/smart-sales-bot-logo.png${LOGO_VERSION}`} />
        <link rel="image_src" href={`${APP_URL}/smart-sales-bot-logo.png${LOGO_VERSION}`} />
        
        {/* ========== CANONICAL ========== */}
        <link rel="canonical" href={APP_URL} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
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
