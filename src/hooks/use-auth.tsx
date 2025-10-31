'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

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

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setSubscription(data.subscription)
      } else {
        setUser(null)
        setSubscription(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      // Set user state immediately
      setUser(data.user)
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
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (response.ok) {
      setUser(result.user)
      await refreshUser() // Get subscription info
      router.push('/dashboard')
    } else {
      throw new Error(result.error || 'Registration failed')
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setSubscription(null)
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