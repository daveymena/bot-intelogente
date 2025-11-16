import { Metadata } from 'next'
import StructuredData from '@/components/StructuredData'
import { breadcrumbSchema } from '@/lib/seo-schema'

export const metadata: Metadata = {
  title: 'Catálogo de Productos',
  description: 'Explora nuestro catálogo completo de productos: laptops, motos, cursos digitales y megapacks. Precios competitivos y atención personalizada con IA.',
  openGraph: {
    title: 'Catálogo de Productos - Smart Sales Bot Pro',
    description: 'Descubre laptops, motos, cursos digitales y más. Atención automatizada 24/7.',
  },
}

const breadcrumbs = breadcrumbSchema([
  { name: 'Inicio', url: '/' },
  { name: 'Tienda', url: '/tienda' },
])

export default function CatalogoLayout({
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
