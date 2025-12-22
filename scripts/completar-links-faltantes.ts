/**
 * Completar links de entrega faltantes
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Link del MEGA PACK COMPLETO (todos los cursos)
const MEGAPACK_COMPLETO_LINK = 'https://drive.google.com/drive/folders/1nyGxtM-0gOy98e4bAHd50VooPhicvM_8'

// Link de Office (Mega Pack 02)
const OFFICE_LINK = 'https://drive.google.com/open?id=154AjtnTpPp8Xy7gqClutmEA5ByV3UELe'

async function main() {
  console.log('🔧 Completando links de entrega faltantes...\n')
  
  // 1. Mega Pack 02: Cursos Microsoft Office
  const office = await db.product.updateMany({
    where: {
      name: { contains: 'Office' }
    },
    data: {
      deliveryLink: OFFICE_LINK
    }
  })
  console.log(`✅ Office actualizado: ${office.count} productos`)
  
  // 2. PACK COMPLETO 40 Mega Packs - asignar link completo
  const pack40 = await db.product.updateMany({
    where: {
      name: { contains: 'PACK COMPLETO 40' }
    },
    data: {
      deliveryLink: MEGAPACK_COMPLETO_LINK
    }
  })
  console.log(`✅ PACK COMPLETO 40 actualizado: ${pack40.count} productos`)
  
  // 3. Megapack Completo - Todos los Cursos
  const megapackTodos = await db.product.updateMany({
    where: {
      name: { contains: 'Megapack Completo' }
    },
    data: {
      deliveryLink: MEGAPACK_COMPLETO_LINK
    }
  })
  console.log(`✅ Megapack Completo actualizado: ${megapackTodos.count} productos`)
  
  // 4. Mega Pack Curso de Piano Completo
  // Buscar si hay un link específico para piano, si no usar el de música/guitarra
  const pianoLink = 'https://drive.google.com/open?id=1I6NboyUItOOcqiaNDgo44nwQqCkd9e_l' // Guitarra/Música
  const piano = await db.product.updateMany({
    where: {
      name: { contains: 'Piano' }
    },
    data: {
      deliveryLink: pianoLink
    }
  })
  console.log(`✅ Curso Piano actualizado: ${piano.count} productos`)
  
  // Verificar resultado
  console.log('\n📊 Verificando...')
  const sinLink = await db.product.count({
    where: {
      category: 'DIGITAL',
      deliveryLink: null
    }
  })
  console.log(`\n✅ Productos digitales sin link: ${sinLink}`)
  
  const conLink = await db.product.count({
    where: {
      deliveryLink: { not: null }
    }
  })
  console.log(`✅ Productos con link de entrega: ${conLink}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
