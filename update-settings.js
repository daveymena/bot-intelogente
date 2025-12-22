
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Actualizando descripción para TODAS las tiendas...')
  const result = await prisma.storeSettings.updateMany({
    data: {
      description: 'Tienda especializada en tecnología, productos digitales, cursos online y servicios de reparación.'
    }
  })

  console.log(`✅ Descripción actualizada en ${result.count} tiendas.`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
