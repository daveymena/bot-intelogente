/**
 * Script para actualizar las imágenes de los Mega Packs con URLs públicas
 * Las imágenes locales (/fotos/...) no funcionan con WhatsApp
 * Necesitamos URLs públicas accesibles desde internet
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// URLs de imágenes públicas para cada tipo de producto digital
const IMAGENES_MEGAPACKS: Record<string, string> = {
  // Diseño Gráfico
  'diseño': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80',
  'photoshop': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80',
  'illustrator': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80',
  
  // Piano/Música
  'piano': 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&q=80',
  'música': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80',
  
  // Marketing
  'marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
  
  // Programación
  'programación': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
  'python': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80',
  
  // Excel/Office
  'excel': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
  'office': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
  
  // Inglés/Idiomas
  'inglés': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80',
  'idiomas': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80',
  
  // Trading
  'trading': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
  
  // WordPress
  'wordpress': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&q=80',
  
  // Desarrollo Personal
  'personal': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80',
  'crecimiento': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80',
  
  // Memoria
  'memoria': 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=400&q=80',
  
  // Sublimación
  'sublimado': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  
  // Canva
  'canva': 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  'plantillas': 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  
  // Educación
  'educación': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
  'preuniversitario': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
  
  // Resina
  'resina': 'https://images.unsplash.com/photo-1609619385002-f40f1df9b7eb?w=400&q=80',
  
  // Macros
  'macros': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
  
  // Ensamblaje
  'ensamblaje': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  'mantenimiento': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  
  // Álbumes digitales
  'álbumes': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  
  // Pack completo
  'pack completo': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
  '40 mega': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
  
  // Default para megapacks
  'mega pack': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
  'megapack': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
}

function getImageForProduct(productName: string): string {
  const nameLower = productName.toLowerCase()
  
  // Buscar coincidencia en las palabras clave
  for (const [keyword, url] of Object.entries(IMAGENES_MEGAPACKS)) {
    if (nameLower.includes(keyword)) {
      return url
    }
  }
  
  // Default para productos digitales
  return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80'
}

async function main() {
  console.log('🔄 Actualizando imágenes de Mega Packs...\n')
  
  // Buscar productos digitales con imágenes locales
  const products = await prisma.product.findMany({
    where: {
      status: 'AVAILABLE',
      OR: [
        { name: { contains: 'Mega Pack', mode: 'insensitive' } },
        { name: { contains: 'Curso', mode: 'insensitive' } },
        { category: 'DIGITAL' }
      ]
    }
  })
  
  console.log(`📦 Encontrados ${products.length} productos digitales\n`)
  
  let actualizados = 0
  let yaConUrl = 0
  
  for (const product of products) {
    let currentImage: string | null = null
    
    // Obtener imagen actual
    if (product.images) {
      try {
        const images = JSON.parse(product.images as string)
        if (Array.isArray(images) && images.length > 0) {
          currentImage = images[0]
        }
      } catch {
        currentImage = (product.images as string).trim()
      }
    }
    
    // Verificar si ya tiene URL pública
    if (currentImage && (currentImage.startsWith('http://') || currentImage.startsWith('https://')) && !currentImage.includes('localhost')) {
      console.log(`✅ ${product.name} - Ya tiene URL pública`)
      yaConUrl++
      continue
    }
    
    // Obtener nueva imagen
    const newImageUrl = getImageForProduct(product.name)
    
    // Actualizar en la base de datos
    await prisma.product.update({
      where: { id: product.id },
      data: {
        images: JSON.stringify([newImageUrl])
      }
    })
    
    console.log(`📸 ${product.name}`)
    console.log(`   Antes: ${currentImage || 'sin imagen'}`)
    console.log(`   Ahora: ${newImageUrl}`)
    console.log('')
    
    actualizados++
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Actualizados: ${actualizados}`)
  console.log(`📌 Ya tenían URL: ${yaConUrl}`)
  console.log(`📦 Total procesados: ${products.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
