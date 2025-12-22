/**
 * 🧪 Script de prueba para el sistema de categorías
 */

import { CategorySearchService } from '../src/lib/category-search-service'
import { findCategoryByKeywords, generateCategoriesMessage } from '../src/lib/product-categories'

async function testCategories() {
  console.log('🧪 PRUEBA DEL SISTEMA DE CATEGORÍAS\n')
  console.log('='.repeat(60))
  
  // Test 1: Mostrar todas las categorías
  console.log('\n📋 TEST 1: Mostrar todas las categorías')
  console.log('='.repeat(60))
  const allCategories = generateCategoriesMessage()
  console.log(allCategories)
  
  // Test 2: Buscar por palabras clave
  console.log('\n🔍 TEST 2: Buscar categorías por palabras clave')
  console.log('='.repeat(60))
  
  const testQueries = [
    'portatil',
    'laptop gaming',
    'monitor',
    'teclado mecanico',
    'audífonos',
    'moto',
    'curso de piano',
    'megapack diseño',
    'impresora laser',
    'celular'
  ]
  
  for (const query of testQueries) {
    const result = findCategoryByKeywords(query)
    console.log(`\n📝 Query: "${query}"`)
    if (result.category) {
      console.log(`   ✅ Categoría: ${result.category.emoji} ${result.category.name}`)
      if (result.subcategory) {
        console.log(`   ✅ Subcategoría: ${result.subcategory.emoji} ${result.subcategory.name}`)
      }
    } else {
      console.log(`   ❌ No se encontró categoría`)
    }
  }
  
  // Test 3: Detectar si está pidiendo categorías
  console.log('\n\n🎯 TEST 3: Detectar solicitud de categorías')
  console.log('='.repeat(60))
  
  const categoryRequests = [
    'que productos tienen',
    'mostrar categorias',
    'ver catalogo',
    'que venden',
    'menu'
  ]
  
  for (const query of categoryRequests) {
    const isAsking = CategorySearchService.isAskingForCategories(query)
    console.log(`\n📝 Query: "${query}"`)
    console.log(`   ${isAsking ? '✅' : '❌'} ${isAsking ? 'SÍ' : 'NO'} está pidiendo categorías`)
  }
  
  console.log('\n\n✅ Pruebas completadas')
}

testCategories()
