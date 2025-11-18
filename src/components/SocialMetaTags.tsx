'use client'

import Head from 'next/head'

interface SocialMetaTagsProps {
  title?: string
  description?: string
  image?: string
  url?: string
}

export default function SocialMetaTags({
  title = "Smart Sales Bot Pro - Automatización de Ventas con IA para WhatsApp",
  description = "Bot inteligente de WhatsApp con IA avanzada. Automatiza ventas, gestiona productos y atiende clientes 24/7.",
  image = "/smart-sales-bot-logo.png",
  url
}: SocialMetaTagsProps) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host'
  const fullImageUrl = image.startsWith('http') ? image : `${APP_URL}${image}`
  const fullUrl = url || APP_URL

  return (
    <Head>
      {/* Open Graph */}
      <meta property="og:title" content={title} key="og:title" />
      <meta property="og:description" content={description} key="og:description" />
      <meta property="og:image" content={fullImageUrl} key="og:image" />
      <meta property="og:url" content={fullUrl} key="og:url" />
      
      {/* Twitter */}
      <meta name="twitter:title" content={title} key="twitter:title" />
      <meta name="twitter:description" content={description} key="twitter:description" />
      <meta name="twitter:image" content={fullImageUrl} key="twitter:image" />
    </Head>
  )
}
