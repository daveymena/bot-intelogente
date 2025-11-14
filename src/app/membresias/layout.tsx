import { Metadata } from 'next'
import StructuredData from '@/components/StructuredData'
import { breadcrumbSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'Planes de Membresía',
  description: 'Elige el plan perfecto para tu negocio. Prueba gratis 7 días. Automatiza tus ventas por WhatsApp con IA avanzada.',
  openGraph: {
    title: 'Planes de Membresía - Smart Sales Bot Pro',
    description: 'Automatiza tus ventas con IA. Prueba gratis 7 días.',
  },
}

const breadcrumbs = breadcrumbSchema([
  { name: 'Inicio', url: '/' },
  { name: 'Membresías', url: '/membresias' },
])

export default function MembresiasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <StructuredData data={breadcrumbs} />
      {children}
    </>
  )
}
