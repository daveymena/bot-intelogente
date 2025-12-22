/**
 * Script para agregar el Curso de Piano a la base de datos
 * Con información completa y detallada
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Descripción CORTA para mostrar inicialmente
const descripcionCorta = `🎹 Aprende piano desde cero hasta nivel avanzado

📚 19 horas de video + 157 recursos

🎵 Estilos: Clásico, Jazz, Blues, Pop, Balada

✅ Sin conocimientos previos necesarios`

// Descripción completa del curso (para "más info")
const descripcionCompleta = `🎹 CURSO DE PIANO COMPLETO

━━━━━━━━━━━━━━━━━━━━

📚 *LO QUE APRENDERÁS*

   🎵 Piano desde cero hasta avanzado

   🎵 Estilos: Clásico, Jazz, Blues, Pop, Balada

   🎵 Improvisación y acompañamiento

   🎵 Lectura de partituras

━━━━━━━━━━━━━━━━━━━━

📦 *INCLUYE*

   ▫️ 19 horas de video

   ▫️ 34 artículos

   ▫️ 157 recursos descargables

━━━━━━━━━━━━━━━━━━━━

✨ *CALIDAD PROFESIONAL*

   ▫️ Video HD

   ▫️ Audio cristalino

   ▫️ Método probado (20+ años)

━━━━━━━━━━━━━━━━━━━━

👤 *PARA QUIÉN ES*

   ▫️ Principiantes desde cero

   ▫️ Músicos que quieren mejorar

   ▫️ Quienes quieren improvisar

━━━━━━━━━━━━━━━━━━━━

⚡ *REQUISITOS*

   ▫️ NO necesitas conocimientos previos

   ▫️ Solo ganas de aprender`

async function main() {
  console.log('🎹 Agregando Curso de Piano Completo...')

  // Buscar el usuario admin
  const admin = await prisma.user.findFirst({
    where: { email: 'daveymena16@gmail.com' }
  })

  if (!admin) {
    console.error('❌ No se encontró el usuario admin')
    process.exit(1)
  }

  console.log(`✅ Usuario encontrado: ${admin.email}`)

  // Tags completos para búsqueda
  const tags = [
    'piano', 'música', 'curso', 'instrumento', 'teclado',
    'clásico', 'jazz', 'blues', 'pop', 'balada', 'dance',
    'aprender piano', 'tocar piano', 'improvisación',
    'partituras', 'acordes', 'escalas', 'acompañamiento',
    'principiantes', 'desde cero', 'nivel avanzado',
    'música moderna', 'teoría musical'
  ]

  // Verificar si ya existe
  const existing = await prisma.product.findFirst({
    where: {
      name: { contains: 'piano', mode: 'insensitive' },
      userId: admin.id
    }
  })

  if (existing) {
    console.log(`⚠️ Ya existe un curso de piano: ${existing.name}`)
    console.log('Actualizando con descripción corta...')
    
    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: 'Mega Pack Curso de Piano Completo',
        description: descripcionCorta,
        price: 25000,
        category: 'DIGITAL',
        tags: JSON.stringify(tags),
        status: 'AVAILABLE'
      }
    })
    
    console.log(`✅ Curso actualizado: ${updated.name}`)
    console.log(`   ID: ${updated.id}`)
    console.log(`   Precio: ${updated.price.toLocaleString('es-CO')} COP`)
  } else {
    // Crear nuevo producto
    const producto = await prisma.product.create({
      data: {
        userId: admin.id,
        name: 'Mega Pack Curso de Piano Completo',
        description: descripcionCorta,
        price: 25000,
        category: 'DIGITAL',
        tags: JSON.stringify(tags),
        status: 'AVAILABLE',
        images: JSON.stringify([]),
        stock: 999
      }
    })

    console.log(`✅ Curso creado exitosamente!`)
    console.log(`   ID: ${producto.id}`)
    console.log(`   Nombre: ${producto.name}`)
    console.log(`   Precio: ${producto.price.toLocaleString('es-CO')} COP`)
  }

  // Mostrar todos los productos
  const productos = await prisma.product.findMany({
    where: { userId: admin.id },
    select: { id: true, name: true, price: true, category: true }
  })

  console.log(`\n📦 Total de productos: ${productos.length}`)
  productos.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP (${p.category})`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
