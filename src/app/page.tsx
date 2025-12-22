import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirigir siempre a la landing page
  redirect('/landing')
}
