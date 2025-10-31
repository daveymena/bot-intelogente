'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Bot } from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.push('/dashboard')
      } else {
        // User is not authenticated, redirect to login
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  // Show loading screen while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 mt-4">Redirigiendo...</p>
      </div>
    </div>
  )
}
