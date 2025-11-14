// Schema.org structured data for better SEO
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Smart Sales Bot Pro",
  "alternateName": "Tecnovariedades D&S",
  "url": "https://smartsalesbot.com",
  "logo": "https://smartsalesbot.com/logo.png",
  "description": "Automatización de ventas con IA para WhatsApp. Bot inteligente con múltiples modelos de IA.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CO",
    "addressLocality": "Colombia"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["Spanish", "es"]
  },
  "sameAs": [
    "https://facebook.com/smartsalesbot",
    "https://twitter.com/smartsalesbot",
    "https://instagram.com/smartsalesbot"
  ]
}

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Smart Sales Bot Pro",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "COP",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127"
  },
  "description": "Bot inteligente de WhatsApp con IA avanzada para automatizar ventas. Soporta múltiples modelos de IA (Groq, OpenAI, Claude), gestión de productos, análisis en tiempo real y respuestas personalizadas 24/7.",
  "featureList": [
    "Integración con WhatsApp",
    "Múltiples modelos de IA",
    "Gestión automática de productos",
    "Análisis en tiempo real",
    "Respuestas personalizadas 24/7",
    "Transcripción de audio",
    "Procesamiento de imágenes",
    "Sistema de pagos integrado"
  ]
}

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es Smart Sales Bot Pro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Smart Sales Bot Pro es un sistema de automatización de ventas por WhatsApp que utiliza inteligencia artificial avanzada. Permite gestionar conversaciones, productos y ventas de forma automática 24/7."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué modelos de IA soporta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Soporta múltiples modelos de IA incluyendo Groq (Llama 3.1), OpenAI GPT-4, Claude, Gemini, Mistral y Ollama. El sistema tiene fallback automático entre proveedores."
      }
    },
    {
      "@type": "Question",
      "name": "¿Funciona con WhatsApp real?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, se conecta directamente a tu cuenta de WhatsApp personal o business mediante código QR, sin necesidad de la API oficial de WhatsApp Business."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ofrecemos un plan gratuito de 7 días de prueba. Después puedes elegir entre diferentes planes de membresía según tus necesidades."
      }
    },
    {
      "@type": "Question",
      "name": "¿Puedo gestionar productos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, incluye un sistema completo de gestión de productos con importación/exportación CSV, imágenes, precios, stock y categorías. También soporta dropshipping."
      }
    }
  ]
}

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
})

export const productSchema = (product: {
  name: string
  description: string
  price: number
  currency: string
  image?: string
  availability?: string
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image || "https://smartsalesbot.com/logo.png",
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": product.currency,
    "availability": product.availability || "https://schema.org/InStock"
  }
})
