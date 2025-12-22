import { NextRequest } from 'next/server'
import { AuthService } from './auth'

/**
 * Obtiene el usuario autenticado desde el token en las cookies o headers
 */
export async function auth(request: NextRequest) {
  try {
    // Intentar obtener token de las cookies
    let token = request.cookies.get('token')?.value

    // Si no hay token en cookies, intentar desde el header Authorization
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return null
    }

    // Obtener usuario desde el token
    const user = await AuthService.getUserFromToken(token)
    return user
  } catch (error) {
    console.error('Error in auth():', error)
    return null
  }
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export function hasRole(user: any, role: string): boolean {
  if (!user) return false
  return user.role === role
}

/**
 * Verifica si el usuario es admin
 */
export function isAdmin(user: any): boolean {
  return hasRole(user, 'ADMIN')
}

/**
 * Verifica si el usuario tiene una suscripción activa
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  return AuthService.hasActiveSubscription(userId)
}

/**
 * Obtiene el estado de la suscripción del usuario
 */
export async function getSubscriptionStatus(userId: string) {
  return AuthService.getSubscriptionStatus(userId)
}
