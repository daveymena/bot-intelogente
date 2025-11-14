import { db } from '../src/lib/db'

async function getUserId() {
  const user = await db.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true }
  })
  
  if (user) {
    console.log('👤 Usuario encontrado:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.name}`)
  } else {
    console.log('❌ No se encontró usuario admin')
  }
  
  await db.$disconnect()
}

getUserId().catch(console.error)
