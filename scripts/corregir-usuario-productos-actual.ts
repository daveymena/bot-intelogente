import { db } from '../src/lib/db'

async function corregirUsuarioProductos() {
  console.log('🔧 Corrigiendo usuario de productos...\n')
  
  // Obtener el usuario que está logueado actualmente
  const userActual = await db.user.findUnique({
    where: { email: 'daveymena16@gmail.com' }
  })
  
  if (!userActual) {
    console.log('❌ No se encontró el usuario daveymena16@gmail.com')
    return
  }
  
  console.log(`✅ Usuario actual: ${userActual.email} (${userActual.id})`)
  
  // Contar productos actuales
  const productosActuales = await db.product.count({
    where: { userId: userActual.id }
  })
  
  console.log(`📦 Productos actuales del usuario: ${productosActuales}`)
  
  // Actualizar todos los productos para que pertenezcan a este usuario
  const result = await db.product.updateMany({
    where: {
      userId: {
        not: userActual.id
      }
    },
    data: {
      userId: userActual.id
    }
  })
  
  console.log(`✅ ${result.count} productos actualizados`)
  
  // Verificar
  const totalProductos = await db.product.count({
    where: { userId: userActual.id }
  })
  
  console.log(`\n✅ Total de productos del usuario ahora: ${totalProductos}`)
  
  await db.$disconnect()
}

corregirUsuarioProductos()
