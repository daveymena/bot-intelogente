import { Metadata } from 'next'
import StructuredData from '@/components/StructuredData'
import { breadcrumbSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'Tienda Online',
  description: 'Compra productos de tecnología, motos y cursos digitales. Pagos seguros con MercadoPago, PayPal y más. Envíos a toda Colombia.',
  openGraph: {
    title: 'Tienda Online - Tecnovariedades D&S',
    description: 'Tecnología, motos y cursos digitales. Pagos seguros y envíos a toda Colombia.',
  },
}

const breadcrumbs = breadcrumbSchema([
  { name: 'Inicio', url: '/' },
  { name: 'Tienda', url: '/tienda' },
])

export default function TiendaLayout({
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
