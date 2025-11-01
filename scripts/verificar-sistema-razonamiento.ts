/**
 * 🔍 VERIFICAR SISTEMA DE RAZONAMIENTO
 * Verifica que todo esté listo para probar el razonamiento
 */

import { db } from '../src/lib/db'

async function verificar() {
  console.log('🔍 VERIFICANDO SISTEMA DE RAZONAMIENTO\n')
  console.log('=' .repeat(70))

  let allOk = true

  // 1. Verificar usuarios
  console.log('\n1️⃣ VERIFICANDO USUARIOS...')
  const users = await db.user.findMany()
  
  if (users.length === 0) {
    console.log('   ❌ No hay usuarios en la base de datos')
    console.log('   💡 Crea un usuario con: npx tsx scripts/create-admin.ts')
    allOk = false
  } else {
    console.log(`   ✅ ${users.length} usuario(s) encontrado(s)`)
    users.forEach(u => {
      console.log(`      - ${u.email} (${u.businessName || 'Sin nombre'})`)
    })
  }

  // 2. Verificar productos
  console.log('\n2️⃣ VERIFICANDO PRODUCTOS...')
  const products = await db.product.findMany({
    where: { status: 'AVAILABLE' }
  })
  
  if (products.length === 0) {
    console.log('   ❌ No hay productos disponibles')
    console.log('   💡 Importa productos con: npx tsx scripts/import-productos-completos.ts')
    allOk = false
  } else {
    console.log(`   ✅ ${products.length} producto(s) disponible(s)`)
    
    // Mostrar algunos productos
    const sampleProducts = products.slice(0, 5)
    sampleProducts.forEach(p => {
      console.log(`      - ${p.name} ($${p.price.toLocaleString('es-CO')})`)
    })
    
    if (products.length > 5) {
      console.log(`      ... y ${products.length - 5} más`)
    }
  }

  // 3. Verificar productos con links de pago
  console.log('\n3️⃣ VERIFICANDO PRODUCTOS CON LINKS DE PAGO...')
  const productsWithLinks = products.filter(p => {
    try {
      const tags = p.tags ? JSON.parse(p.tags) : []
      return tags.some((t: string) => 
        t.startsWith('hotmart:') || 
        t.startsWith('mercadopago:') || 
        t.startsWith('paypal:') ||
        t.startsWith('http')
      )
    } catch {
      return false
    }
  })
  
  if (productsWithLinks.length === 0) {
    console.log('   ⚠️  No hay productos con links de pago configurados')
    console.log('   💡 Algunos productos necesitan tags con links')
  } else {
    console.log(`   ✅ ${productsWithLinks.length} producto(s) con links de pago`)
    productsWithLinks.slice(0, 3).forEach(p => {
      console.log(`      - ${p.name}`)
    })
  }

  // 4. Verificar servicios
  console.log('\n4️⃣ VERIFICANDO SERVICIOS...')
  
  try {
    const { ReasoningService } = await import('../src/lib/reasoning-service')
    console.log('   ✅ ReasoningService cargado')
  } catch (error) {
    console.log('   ❌ Error cargando ReasoningService:', error)
    allOk = false
  }

  try {
    const { ProductIntelligenceService } = await import('../src/lib/product-intelligence-service')
    console.log('   ✅ ProductIntelligenceService cargado')
  } catch (error) {
    console.log('   ❌ Error cargando ProductIntelligenceService:', error)
    allOk = false
  }

  try {
    const { ConversationContextService } = await import('../src/lib/conversation-context-service')
    console.log('   ✅ ConversationContextService cargado')
  } catch (error) {
    console.log('   ❌ Error cargando ConversationContextService:', error)
    allOk = false
  }

  // Resultado final
  console.log('\n' + '=' .repeat(70))
  
  if (allOk) {
    console.log('\n✅ TODO LISTO PARA PROBAR EL RAZONAMIENTO\n')
    console.log('Ejecuta las pruebas:')
    console.log('  npx tsx scripts/test-reasoning.ts')
    console.log('  npx tsx scripts/test-link-pago.ts')
  } else {
    console.log('\n⚠️  SISTEMA NO ESTÁ COMPLETO\n')
    console.log('Completa los pasos indicados arriba y vuelve a ejecutar este script.')
  }
  
  console.log('\n' + '=' .repeat(70))
}

// Ejecutar
verificar()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
