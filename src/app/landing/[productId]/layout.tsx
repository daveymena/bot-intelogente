import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Producto - Smart Sales Bot',
  description: 'Descubre nuestros productos',
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
