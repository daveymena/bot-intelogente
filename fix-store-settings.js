
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 1. Obtener el primer usuario (asumiendo que es el dueño)
  const user = await prisma.user.findFirst()

  if (!user) {
    console.error('❌ No se encontró ningún usuario en la base de datos.')
    return
  }

  console.log(`✅ Usuario encontrado: ${user.name} (${user.email}) - ID: ${user.id}`)

  // 2. Crear o actualizar BotSettings
  await prisma.botSettings.upsert({
    where: { userId: user.id },
    update: {
      businessName: 'Tecnovariedades D&S',
      businessDescription: 'Tienda especializada en tecnología, productos digitales, cursos online y servicios de reparación.',
      businessPhone: user.phone || '+573005560186'
    },
    create: {
      userId: user.id,
      businessName: 'Tecnovariedades D&S',
      businessDescription: 'Tienda especializada en tecnología, productos digitales, cursos online y servicios de reparación.',
      businessPhone: user.phone || '+573005560186',
      isActive: true
    }
  })
  console.log('✅ BotSettings actualizados.')

  // 3. Crear o actualizar StoreSettings
  await prisma.storeSettings.upsert({
    where: { userId: user.id },
    update: {
      storeName: 'Tecnovariedades D&S',
      description: 'Tienda especializada en tecnología, productos digitales, cursos online y servicios de reparación.',
      currency: 'COP',
      language: 'es'
    },
    create: {
      userId: user.id,
      storeName: 'Tecnovariedades D&S',
      description: 'Tienda especializada en tecnología, productos digitales, cursos online y servicios de reparación.',
      currency: 'COP',
      language: 'es'
    }
  })
  console.log('✅ StoreSettings actualizados.')
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
