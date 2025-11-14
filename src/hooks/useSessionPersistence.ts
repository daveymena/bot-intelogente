/**
 * Hook para mantener la sesión activa
 * Verifica periódicamente que la sesión siga válida
 * y la renueva automáticamente
 */

'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function useSessionPersistence() {
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Verificar sesión cada 5 minutos
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include' // Importante: incluir cookies
        })

        if (!response.ok) {
          // Sesión inválida, redirigir a login
          console.log('❌ Sesión expirada, redirigiendo a login')
          router.push('/login')
        } else {
          // Sesión válida, renovar cookies
          console.log('✅ Sesión renovada')
        }
      } catch (error) {
        console.error('Error verificando sesión:', error)
      }
    }

    // Verificar inmediatamente al montar
    checkSession()

    // Verificar cada 5 minutos
    intervalRef.current = setInterval(checkSession, 5 * 60 * 1000)

    // Limpiar intervalo al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [router])

  // Renovar sesión al hacer focus en la ventana
  useEffect(() => {
    const handleFocus = async () => {
      try {
        await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include'
        })
        console.log('✅ Sesión renovada (focus)')
      } catch (error) {
        console.error('Error renovando sesión:', error)
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Renovar sesión antes de que el usuario navegue
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        // Usar sendBeacon para enviar request incluso si la página se cierra
        navigator.sendBeacon('/api/auth/session')
      } catch (error) {
        console.error('Error renovando sesión:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])
}
