/**
 * 🚀 PREPARAR SISTEMA PARA PRODUCCIÓN - RÁPIDO
 * Resuelve los problemas críticos en minutos
 */

import { db } from '../src/lib/db'
import * as fs from 'fs'

async function prepararProduccion() {
  console.log('🚀 PREPARANDO SISTEMA PARA PRODUCCIÓN\n')
  console.log('='.repeat(70))
  
  const pasos: Array<{ nombre: string; estado: 'ok' | 'error' | 'skip'; mensaje: string }> = []
  
  try {
    // PASO 1: Verificar email admin
    console.log('\n📧 PASO 1: Verificar Email Admin')
    console.log('-'.repeat(70))
    
    const admin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (!admin) {
      pasos.push({
        nombre: 'Verificar Email Admin',
        estado: 'error',
        mensaje: 'No se encontró usuario admin'
      })
      console.log('❌ No se encontró usuario admin')
    } else if (admin.isEmailVerified) {
      pasos.push({
        nombre: 'Verificar Email Admin',
        estado: 'skip',
        mensaje: 'Email ya verificado'
      })
      console.log(`✅ Email ya verificado: ${admin.email}`)
    } else {
      await db.user.update({
        where: { id: admin.id },
        data: { isEmailVerified: true }
      })
      pasos.push({
        nombre: 'Verificar Email Admin',
        estado: 'ok',
        mensaje: `Email verificado: ${admin.email}`
      })
      console.log(`✅ Email verificado: ${admin.email}`)
    }
    
    // PASO 2: Verificar variables de entorno críticas
    console.log('\n🔐 PASO 2: Variables de Entorno Críticas')
    console.log('-'.repeat(70))
    
    const varsRequeridas = {
      'DATABASE_URL': process.env.DATABASE_URL,
      'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
      'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
      'GROQ_API_KEY': process.env.GROQ_API_KEY || process.env.OLLAMA_BASE_URL,
      'RESEND_API_KEY': process.env.RESEND_API_KEY
    }
    
    let todasOk = true
    for (const [key, value] of Object.entries(varsRequeridas)) {
      if (!value) {
        console.log(`❌ ${key}: NO CONFIGURADA`)
        todasOk = false
      } else {
        console.log(`✅ ${key}: Configurada`)
      }
    }
    
    if (todasOk) {
      pasos.push({
        nombre: 'Variables de Entorno',
        estado: 'ok',
        mensaje: 'Todas las variables críticas configuradas'
      })
    } else {
      pasos.push({
        nombre: 'Variables de Entorno',
        estado: 'error',
        mensaje: 'Faltan variables críticas'
      })
    }
    
    // PASO 3: Verificar EMAIL_FROM
    console.log('\n📨 PASO 3: Configurar EMAIL_FROM')
    console.log('-'.repeat(70))
    
    if (process.env.EMAIL_FROM) {
      console.log(`✅ EMAIL_FROM: ${process.env.EMAIL_FROM}`)
      pasos.push({
        nombre: 'EMAIL_FROM',
        estado: 'ok',
        mensaje: process.env.EMAIL_FROM
      })
    } else {
      console.log('⚠️  EMAIL_FROM no configurado')
      console.log('   Recomendación: Agregar a .env:')
      console.log('   EMAIL_FROM=Tecnovariedades D&S <noreply@tecnovariedades.com>')
      pasos.push({
        nombre: 'EMAIL_FROM',
        estado: 'error',
        mensaje: 'No configurado - agregar a .env'
      })
    }
    
    // PASO 4: Verificar productos
    console.log('\n📦 PASO 4: Verificar Productos')
    console.log('-'.repeat(70))
    
    const productCount = await db.product.count()
    console.log(`   Total de productos: ${productCount}`)
    
    if (productCount === 0) {
      console.log('⚠️  No hay productos cargados')
      console.log('   Ejecutar: npx tsx scripts/seed-products.ts')
      pasos.push({
        nombre: 'Productos',
        estado: 'error',
        mensaje: 'No hay productos - ejecutar seed'
      })
    } else {
      console.log(`✅ ${productCount} productos disponibles`)
      pasos.push({
        nombre: 'Productos',
        estado: 'ok',
        mensaje: `${productCount} productos cargados`
      })
    }
    
    // PASO 5: Verificar sesiones de WhatsApp
    console.log('\n📱 PASO 5: Sesiones de WhatsApp')
    console.log('-'.repeat(70))
    
    const authDir = 'auth_sessions'
    if (fs.existsSync(authDir)) {
      const sessions = fs.readdirSync(authDir)
      if (sessions.length > 0) {
        console.log(`✅ ${sessions.length} sesión(es) guardada(s)`)
        pasos.push({
          nombre: 'Sesiones WhatsApp',
          estado: 'ok',
          mensaje: `${sessions.length} sesión(es) guardada(s)`
        })
      } else {
        console.log('⚠️  No hay sesiones guardadas')
        console.log('   Necesitará escanear QR al conectar')
        pasos.push({
          nombre: 'Sesiones WhatsApp',
          estado: 'error',
          mensaje: 'Sin sesiones - escanear QR al conectar'
        })
      }
    } else {
      console.log('⚠️  Directorio auth_sessions no existe')
      fs.mkdirSync(authDir, { recursive: true })
      console.log('✅ Directorio creado')
      pasos.push({
        nombre: 'Sesiones WhatsApp',
        estado: 'ok',
        mensaje: 'Directorio creado'
      })
    }
    
    // PASO 6: Verificar sistema de IA
    console.log('\n🤖 PASO 6: Sistema de IA')
    console.log('-'.repeat(70))
    
    const aiEnabled = process.env.AI_FALLBACK_ENABLED === 'true'
    const hasOllama = !!process.env.OLLAMA_BASE_URL
    const hasGroq = !!process.env.GROQ_API_KEY
    
    if (aiEnabled && (hasOllama || hasGroq)) {
      console.log('✅ Sistema multi-provider habilitado')
      if (hasOllama) console.log('   • Ollama configurado')
      if (hasGroq) console.log('   • Groq configurado')
      pasos.push({
        nombre: 'Sistema IA',
        estado: 'ok',
        mensaje: 'Multi-provider funcionando'
      })
    } else if (hasGroq) {
      console.log('✅ Groq configurado (modo legacy)')
      pasos.push({
        nombre: 'Sistema IA',
        estado: 'ok',
        mensaje: 'Groq funcionando'
      })
    } else {
      console.log('❌ No hay sistema de IA configurado')
      pasos.push({
        nombre: 'Sistema IA',
        estado: 'error',
        mensaje: 'Sin IA configurada'
      })
    }
    
    // RESUMEN FINAL
    console.log('\n' + '='.repeat(70))
    console.log('📋 RESUMEN DE PREPARACIÓN')
    console.log('='.repeat(70))
    
    const ok = pasos.filter(p => p.estado === 'ok').length
    const errors = pasos.filter(p => p.estado === 'error').length
    const skipped = pasos.filter(p => p.estado === 'skip').length
    
    console.log(`\n✅ Completados: ${ok}`)
    console.log(`⚠️  Requieren atención: ${errors}`)
    console.log(`⏭️  Omitidos: ${skipped}`)
    
    console.log('\n📝 DETALLE:')
    pasos.forEach(paso => {
      const icon = paso.estado === 'ok' ? '✅' : paso.estado === 'error' ? '❌' : '⏭️'
      console.log(`${icon} ${paso.nombre}: ${paso.mensaje}`)
    })
    
    console.log('\n' + '='.repeat(70))
    
    if (errors === 0) {
      console.log('🎉 SISTEMA LISTO PARA PRODUCCIÓN')
      console.log('\nPróximos pasos:')
      console.log('1. npm run build')
      console.log('2. Configurar variables en Easypanel')
      console.log('3. Deploy')
      console.log('4. Conectar WhatsApp')
    } else {
      console.log('⚠️  RESOLVER PROBLEMAS ANTES DE DEPLOY')
      console.log('\nProblemas encontrados:')
      pasos.filter(p => p.estado === 'error').forEach(p => {
        console.log(`   • ${p.nombre}: ${p.mensaje}`)
      })
    }
    
    console.log('='.repeat(70))
    
  } catch (error) {
    console.error('\n❌ Error durante preparación:', error)
  } finally {
    await db.$disconnect()
  }
}

prepararProduccion()
