/**
 * 🏷️ Script para asignar subcategorías automáticamente a productos
 */

import { PrismaClient } from '@prisma/client'
import { findCategoryByKeywords } from '../src/lib/product-categories'

const prisma = new PrismaClient()

async function assignSubcategories() {
  try {
    console.log('🏷️ Iniciando asignación automática de subcategorías...\n')
    
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE'
      }
    })
    
    console.log(`📦 Total de productos: ${products.length}\n`)
    
    let updated = 0
    let notFound = 0
    
    for (const product of products) {
      const searchText = `${product.name} ${product.description || ''}`
      const { category, subcategory } = findCategoryByKeywords(searchText)
      
      if (category && subcategory) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            subcategory: subcategory.name,
            customCategory: category.name
          }
        })
        
        console.log(`✅ ${product.name}`)
        console.log(`   📁 Categoría: ${category.name}`)
        console.log(`   📂 Subcategoría: ${subcategory.name}\n`)
        updated++
      } else if (category) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            customCategory: category.name
          }
        })
        
        console.log(`⚠️  ${product.name}`)
        console.log(`   📁 Categoría: ${category.name}`)
        console.log(`   📂 Subcategoría: No detectada\n`)
        updated++
      } else {
        console.log(`❌ ${product.name}`)
        console.log(`   No se pudo detectar categoría\n`)
        notFound++
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN')
    console.log('='.repeat(60))
    console.log(`✅ Productos actualizados: ${updated}`)
    console.log(`❌ Sin categoría: ${notFound}`)
    console.log(`📦 Total procesados: ${products.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

assignSubcategories()
