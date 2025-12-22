import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Obtener userId de las cookies
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      // Si no hay userId en cookies, crear uno por defecto
      const defaultUserId = 'default-user-' + Date.now()
      
      return NextResponse.json({
        id: defaultUserId,
        isDefault: true
      })
    }

    // Verificar si el usuario existe en la base de datos
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (!user) {
      return NextResponse.json({
        id: userId,
        isDefault: false
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error getting user:', error)
    
    // Retornar un usuario por defecto en caso de error
    return NextResponse.json({
      id: 'default-user',
      isDefault: true
    })
  }
}
