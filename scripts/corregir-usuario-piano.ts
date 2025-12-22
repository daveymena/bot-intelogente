import { db } from '../src/lib/db'

async function corregirUsuarioPiano() {
  console.log('🔧 Corrigiendo usuario del Curso de Piano...\n')
  
  // Obtener el usuario correcto (el primero)
  const user = await db.user.findFirst({
    orderBy: { createdAt: 'asc' }
  })
  
  if (!user) {
    console.log('❌ No se encontró usuario')
    return
  }
  
  console.log(`✅ Usuario correcto: ${user.email} (${user.id})`)
  
  // Actualizar todos los productos que no pertenecen a este usuario
  const result = await db.product.updateMany({
    where: {
      userId: {
        not: user.id
      }
    },
    data: {
      userId: user.id
    }
  })
  
  console.log(`✅ ${result.count} productos actualizados`)
  
  // Verificar
  const piano = await db.product.findFirst({
    where: { name: { contains: 'Piano' } }
  })
  
  if (piano) {
    console.log(`\n✅ Curso de Piano ahora pertenece a: ${piano.userId}`)
    console.log(`   Match: ${piano.userId === user.id}`)
  }
  
  await db.$disconnect()
}

corregirUsuarioPiano()
