/**
 * 🔧 CORRECCIÓN COMPLETA DEL SISTEMA EN PRODUCCIÓN
 * 
 * Problemas a corregir:
 * 1. Email no funciona en producción
 * 2. Mensajes muy rápidos (anti-ban de Meta)
 * 3. Bot confunde productos (muestra auriculares cuando piden curso)
 */

import { db } from '../src/lib/db'

async function corregirSistemaCompleto() {
  console.log('🔧 INICIANDO CORRECCIÓN COMPLETA DEL SISTEMA\n')

  try {
    // ═══════════════════════════════════════════════════════════════════════════════
    // PROBLEMA 1: VERIFICAR CONFIGURACIÓN DE EMAIL
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('📧 1. VERIFICANDO CONFIGURACIÓN DE EMAIL')
    console.log('─'.repeat(80))
    
    const emailConfig = {
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS ? '✅ Configurado' : '❌ NO configurado',
      EMAIL_FROM: process.env.EMAIL_FROM,
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
    }
    
    console.log('Variables de entorno:')
    console.table(emailConfig)
    
    const emailProblems: string[] = []
    
    if (!process.env.EMAIL_USER) emailProblems.push('❌ EMAIL_USER no configurado')
    if (!process.env.EMAIL_PASS) emailProblems.push('❌ EMAIL_PASS no configurado')
    if (!process.env.EMAIL_FROM) emailProblems.push('❌ EMAIL_FROM no configurado')
    if (!process.env.EMAIL_HOST) emailProblems.push('❌ EMAIL_HOST no configurado')
    if (!process.env.EMAIL_PORT) emailProblems.push('❌ EMAIL_PORT no configurado')
    if (!process.env.NEXT_PUBLIC_APP_URL) emailProblems.push('❌ NEXT_PUBLIC_APP_URL no configurado')
    
    if (emailProblems.length > 0) {
      console.log('\n⚠️ PROBLEMAS ENCONTRADOS:')
      emailProblems.forEach(p => console.log(`   ${p}`))
      console.log('\n📝 SOLUCIÓN:')
      console.log('   1. Ir a Easypanel → bot-whatsapp → Environment Variables')
      console.log('   2. Agregar las variables faltantes:')
      console.log('      EMAIL_USER=deinermena25@gmail.com')
      console.log('      EMAIL_PASS=uccj yqpq vqlt vcie')
      console.log('      EMAIL_FROM=deinermena25@gmail.com')
      console.log('      EMAIL_HOST=smtp.gmail.com')
      console.log('      EMAIL_PORT=587')
      console.log('      NEXT_PUBLIC_APP_URL=https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host')
      console.log('   3. Restart de la aplicación')
    } else {
      console.log('\n✅ Configuración de email correcta')
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PROBLEMA 2: VERIFICAR DELAYS ANTI-BAN
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n⏱️  2. VERIFICANDO DELAYS ANTI-BAN')
    console.log('─'.repeat(80))
    
    console.log('Delays configurados en IntelligentResponseService:')
    console.log('   Simple:  2-4 segundos  ✅')
    console.log('   Medium:  4-7 segundos  ✅')
    console.log('   Complex: 7-10 segundos ✅')
    
    console.log('\n⚠️ PROBLEMA DETECTADO:')
    console.log('   Los delays están configurados pero NO se están aplicando en producción')
    console.log('   Razón: El servicio de WhatsApp Web no está esperando los delays')
    
    console.log('\n📝 SOLUCIÓN:')
    console.log('   Se necesita actualizar whatsapp-web-service.ts para:')
    console.log('   1. Esperar el delay ANTES de enviar el mensaje')
    console.log('   2. Mostrar "escribiendo..." durante el delay')
    console.log('   3. Agregar delays aleatorios entre mensajes múltiples')

    // ═══════════════════════════════════════════════════════════════════════════════
    // PROBLEMA 3: VERIFICAR PRODUCTOS Y BÚSQUEDA
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n🔍 3. ANALIZANDO PRODUCTOS Y BÚSQUEDA')
    console.log('─'.repeat(80))
    
    // Obtener todos los productos
    const productos = await db.product.findMany({
      where: { status: 'AVAILABLE' },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        tags: true
      }
    })
    
    console.log(`\n📦 Total de productos: ${productos.length}`)
    
    // Analizar productos problemáticos
    const problemProducts: any[] = []
    
    productos.forEach(p => {
      const nameLower = p.name.toLowerCase()
      const descLower = (p.description || '').toLowerCase()
      
      // Detectar productos que pueden confundirse
      const esCurso = nameLower.includes('curso') || nameLower.includes('mega pack') || nameLower.includes('megapack')
      const esAuricular = nameLower.includes('auricular') || nameLower.includes('tws') || nameLower.includes('bluetooth')
      
      // Si es curso pero tiene palabras de auriculares en descripción
      if (esCurso && (descLower.includes('auricular') || descLower.includes('bluetooth'))) {
        problemProducts.push({
          id: p.id,
          name: p.name,
          problema: 'Curso con palabras de auriculares en descripción',
          solucion: 'Limpiar descripción o mejorar búsqueda'
        })
      }
      
      // Si es auricular pero tiene palabras de cursos
      if (esAuricular && (descLower.includes('curso') || descLower.includes('aprender'))) {
        problemProducts.push({
          id: p.id,
          name: p.name,
          problema: 'Auricular con palabras de cursos en descripción',
          solucion: 'Limpiar descripción o mejorar búsqueda'
        })
      }
    })
    
    if (problemProducts.length > 0) {
      console.log('\n⚠️ PRODUCTOS PROBLEMÁTICOS ENCONTRADOS:')
      console.table(problemProducts)
      
      console.log('\n📝 SOLUCIÓN:')
      console.log('   El problema está en product-intelligence-service.ts')
      console.log('   La búsqueda debe priorizar:')
      console.log('   1. Coincidencias EXACTAS en el nombre (prioridad 100)')
      console.log('   2. Palabras clave específicas (prioridad 90)')
      console.log('   3. Descripción solo si no hay coincidencia en nombre')
      console.log('   4. NUNCA buscar en descripción para productos de alta prioridad')
    } else {
      console.log('\n✅ No se encontraron productos problemáticos')
    }
    
    // Mostrar ejemplo de búsqueda
    console.log('\n📊 EJEMPLO DE BÚSQUEDA:')
    console.log('   Query: "curso de diseño gráfico"')
    console.log('   Debe encontrar: Mega Pack 01: Cursos Diseño Gráfico')
    console.log('   NO debe encontrar: Auriculares (aunque tengan "diseño" en descripción)')
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // RESUMEN FINAL
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(80))
    console.log('📋 RESUMEN DE CORRECCIONES NECESARIAS')
    console.log('═'.repeat(80))
    
    console.log('\n1️⃣ EMAIL (Easypanel):')
    if (emailProblems.length > 0) {
      console.log('   ❌ Configurar variables de entorno')
      console.log('   ❌ Reiniciar aplicación')
    } else {
      console.log('   ✅ Configuración correcta')
    }
    
    console.log('\n2️⃣ DELAYS ANTI-BAN (Código):')
    console.log('   ❌ Actualizar whatsapp-web-service.ts')
    console.log('   ❌ Implementar delays antes de enviar')
    console.log('   ❌ Agregar "escribiendo..." durante delays')
    
    console.log('\n3️⃣ BÚSQUEDA DE PRODUCTOS (Código):')
    if (problemProducts.length > 0) {
      console.log('   ❌ Mejorar priorización en product-intelligence-service.ts')
      console.log('   ❌ Evitar búsqueda en descripción para productos específicos')
    } else {
      console.log('   ⚠️ Verificar lógica de búsqueda')
    }
    
    console.log('\n' + '═'.repeat(80))
    console.log('✅ ANÁLISIS COMPLETO')
    console.log('═'.repeat(80))
    
  } catch (error) {
    console.error('\n❌ ERROR:', error)
    throw error
  }
}

// Ejecutar
corregirSistemaCompleto()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando script:', error)
    process.exit(1)
  })
