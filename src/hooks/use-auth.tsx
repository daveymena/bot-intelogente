'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
  role: string
  membershipType: string
  membershipEnds?: Date
  trialEnds?: Date
  isVerified: boolean
  lastLoginAt?: Date
  businessName?: string
  phone?: string
}

interface Subscription {
  hasAccess: boolean
  type: string
  endsAt?: Date
  daysLeft?: number
}

interface AuthContextType {
  user: User | null
  subscription: Subscription | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  name?: string
  phone?: string
  businessName?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Importante: incluir cookies
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setSubscription(data.subscription)
        
        // Guardar timestamp de última verificación
        localStorage.setItem('lastAuthCheck', Date.now().toString())
      } else {
        setUser(null)
        setSubscription(null)
        localStorage.removeItem('lastAuthCheck')
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Verificar sesión al montar y cuando vuelve a la app
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Verificar sesión cuando la página vuelve a estar visible (cambio de app/pestaña)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastCheck = localStorage.getItem('lastAuthCheck')
        const now = Date.now()
        
        // Si han pasado más de 5 minutos, refrescar sesión
        if (!lastCheck || now - parseInt(lastCheck) > 5 * 60 * 1000) {
          console.log('🔄 Refrescando sesión después de volver a la app')
          refreshUser()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refreshUser])

  // Verificar sesión periódicamente (cada 10 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        console.log('🔄 Verificación periódica de sesión')
        refreshUser()
      }
    }, 10 * 60 * 1000) // 10 minutos

    return () => clearInterval(interval)
  }, [user, refreshUser])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante: incluir cookies
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      // Set user state immediately
      setUser(data.user)
      localStorage.setItem('lastAuthCheck', Date.now().toString())
      
      // Force full page reload to dashboard to ensure middleware processes the cookie
      window.location.replace('/dashboard')
    } else {
      throw new Error(data.error || 'Login failed')
    }
  }

  const register = async (data: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante: incluir cookies
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (response.ok) {
      setUser(result.user)
      localStorage.setItem('lastAuthCheck', Date.now().toString())
      await refreshUser() // Get subscription info
      router.push('/dashboard')
    } else {
      throw new Error(result.error || 'Registration failed')
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setSubscription(null)
      localStorage.removeItem('lastAuthCheck')
      
      // Limpiar todas las cookies del lado del cliente
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}