import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-100 p-4 rounded-full">
            <FileQuestion className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800">Página no encontrada</h2>
          <p className="text-gray-600">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/dashboard">
              Ir al Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              Volver al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
