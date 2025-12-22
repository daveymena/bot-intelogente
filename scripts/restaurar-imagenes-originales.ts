/**
 * Script para restaurar las imágenes originales de los productos
 * Usa las rutas locales que se convertirán a URLs públicas con el dominio de producción
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Imágenes originales por tipo de producto
const IMAGENES_ORIGINALES: Record<string, string[]> = {
  // Megapacks individuales ($20,000)
  'megapack_individual': ['/fotos/megapak-20.png'],
  
  // Megapack completo
  'megapack_completo': ['/fotos/megapack completo.png', '/fotos/megapack2.jpg'],
  
  // Curso de Piano
  'piano': ['/fotos/curso de piano completo .jpg'],
  
  // Moto
  'moto': ['/fotos/moto2.jpg', '/fotos/moto 3.jpg', '/fotos/moto4.jpg']
}

async function main() {
  console.log('🔄 Restaurando imágenes originales...\n')
  
  // 1. Restaurar Megapacks individuales ($20,000)
  const megapacksIndividuales = await prisma.product.findMany({
    where: {
      name: { contains: 'Mega Pack', mode: 'insensitive' },
      price: 20000
    }
  })
  
  console.log(`📦 Megapacks individuales encontrados: ${megapacksIndividuales.length}`)
  
  for (const pack of megapacksIndividuales) {
    await prisma.product.update({
      where: { id: pack.id },
      data: { images: JSON.stringify(IMAGENES_ORIGINALES.megapack_individual) }
    })
    console.log(`   ✅ ${pack.name}`)
  }
  
  // 2. Restaurar Megapack completo
  const megapackCompleto = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'PACK COMPLETO', mode: 'insensitive' } },
        { name: { contains: 'Megapack Completo', mode: 'insensitive' } }
      ]
    }
  })
  
  console.log(`\n📦 Megapack completo encontrado: ${megapackCompleto.length}`)
  
  for (const pack of megapackCompleto) {
    await prisma.product.update({
      where: { id: pack.id },
      data: { images: JSON.stringify(IMAGENES_ORIGINALES.megapack_completo) }
    })
    console.log(`   ✅ ${pack.name}`)
  }
  
  // 3. Restaurar Curso de Piano
  const cursoPiano = await prisma.product.findMany({
    where: { name: { contains: 'Piano', mode: 'insensitive' } }
  })
  
  console.log(`\n🎹 Curso de Piano encontrado: ${cursoPiano.length}`)
  
  for (const curso of cursoPiano) {
    await prisma.product.update({
      where: { id: curso.id },
      data: { images: JSON.stringify(IMAGENES_ORIGINALES.piano) }
    })
    console.log(`   ✅ ${curso.name}`)
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Imágenes originales restauradas')
  console.log('\n⚠️  IMPORTANTE: Configura NEXT_PUBLIC_APP_URL con tu dominio de producción')
  console.log('   Ejemplo: NEXT_PUBLIC_APP_URL=https://tu-app.easypanel.host')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
