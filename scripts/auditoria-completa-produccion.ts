/**
 * 🔍 AUDITORÍA COMPLETA DEL SISTEMA
 * Verificar qué falta para producción
 */

import { db } from '../src/lib/db'
import * as fs from 'fs'
import * as path from 'path'

async function auditarSistema() {
  console.log('🔍 AUDITORÍA COMPLETA DEL SISTEMA PARA PRODUCCIÓN\n')
  console.log('='.repeat(70))

  const problemas: string[] = []
  const advertencias: string[] = []
  const ok: string[] = []

  try {
    // 1. VERIFICAR BASE DE DATOS
    console.log('\n📊 1. BASE DE DATOS')
    console.log('-'.repeat(70))
    
    try {
      await db.$connect()
      console.log('✅ Conexión a base de datos: OK')
      ok.push('Base de datos conectada')
      
      // Verificar tablas críticas
      const userCount = await db.user.count()
      const productCount = await db.product.count()
      const conversationCount = await db.conversation.count()
      
      console.log(`   Usuarios: ${userCount}`)
      console.log(`   Productos: ${productCount}`)
      console.log(`   Conversaciones: ${conversationCount}`)
      
      if (userCount === 0) {
        problemas.push('❌ No hay usuarios en el sistema')
      } else {
        ok.push(`${userCount} usuario(s) registrado(s)`)
      }
      
      if (productCount === 0) {
        advertencias.push('⚠️  No hay productos cargados')
      } else {
        ok.push(`${productCount} producto(s) disponible(s)`)
      }
      
    } catch (error) {
      problemas.push('❌ Error conectando a base de datos')
      console.error('❌ Error:', error)
    }

    // 2. VERIFICAR VARIABLES DE ENTORNO CRÍTICAS
    console.log('\n🔐 2. VARIABLES DE ENTORNO')
    console.log('-'.repeat(70))
    
    const envVars = {
      // Críticas
      'DATABASE_URL': { required: true, secret: true },
      'NEXTAUTH_SECRET': { required: true, secret: true },
      'NEXTAUTH_URL': { required: true, secret: false },
      
      // IA
      'AI_FALLBACK_ENABLED': { required: false, secret: false },
      'GROQ_API_KEY': { required: false, secret: true },
      'OLLAMA_BASE_URL': { required: false, secret: false },
      'OPENROUTER_API_KEY': { required: false, secret: true },
      
      // Email
      'RESEND_API_KEY': { required: false, secret: true },
      'EMAIL_FROM': { required: false, secret: false },
      
      // Pagos
      'MERCADOPAGO_ACCESS_TOKEN': { required: false, secret: true },
      'PAYPAL_CLIENT_ID': { required: false, secret: true },
      
      // WhatsApp
      'WHATSAPP_PHONE_NUMBER': { required: false, secret: false }
    }
    
    for (const [key, config] of Object.entries(envVars)) {
      const value = process.env[key]
      
      if (!value) {
        if (config.required) {
          problemas.push(`❌ Variable crítica faltante: ${key}`)
          console.log(`❌ ${key}: NO CONFIGURADA (CRÍTICA)`)
        } else {
          advertencias.push(`⚠️  Variable opcional faltante: ${key}`)
          console.log(`⚠️  ${key}: No configurada (opcional)`)
        }
      } else {
        const displayValue = config.secret ? '***' : value
        console.log(`✅ ${key}: ${displayValue}`)
        ok.push(`${key} configurada`)
      }
    }

    // 3. VERIFICAR ARCHIVOS CRÍTICOS
    console.log('\n📁 3. ARCHIVOS DEL SISTEMA')
    console.log('-'.repeat(70))
    
    const archivosRequeridos = [
      'src/lib/baileys-service.ts',
      'src/lib/ai-service.ts',
      'src/lib/ai-multi-provider.ts',
      'src/lib/reasoning-service.ts',
      'src/lib/product-intelligence-service.ts',
      'src/lib/conversation-context-service.ts',
      'src/lib/payment-service.ts',
      'src/lib/email-service.ts',
      'src/app/api/whatsapp/connect/route.ts',
      'src/app/api/auth/login/route.ts',
      'prisma/schema.prisma',
      'package.json',
      '.env'
    ]
    
    for (const archivo of archivosRequeridos) {
      if (fs.existsSync(archivo)) {
        console.log(`✅ ${archivo}`)
        ok.push(`Archivo ${archivo} existe`)
      } else {
        problemas.push(`❌ Archivo faltante: ${archivo}`)
        console.log(`❌ ${archivo}: NO ENCONTRADO`)
      }
    }

    // 4. VERIFICAR FUNCIONALIDADES
    console.log('\n⚙️  4. FUNCIONALIDADES DEL SISTEMA')
    console.log('-'.repeat(70))
    
    // Verificar si hay usuario admin
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      console.log(`✅ Usuario admin: ${adminUser.email}`)
      ok.push('Usuario admin configurado')
      
      // Verificar si email está verificado
      if (adminUser.emailVerified) {
        console.log('✅ Email verificado')
        ok.push('Email admin verificado')
      } else {
        advertencias.push('⚠️  Email admin no verificado')
        console.log('⚠️  Email no verificado')
      }
      
      // Verificar membresía
      const membership = await db.membership.findUnique({
        where: { userId: adminUser.id }
      })
      
      if (membership) {
        console.log(`✅ Membresía: ${membership.plan} (${membership.status})`)
        
        if (membership.status === 'ACTIVE') {
          ok.push('Membresía activa')
        } else if (membership.status === 'TRIAL') {
          advertencias.push('⚠️  Membresía en período de prueba')
          console.log(`   Expira: ${membership.trialEndsAt}`)
        } else {
          problemas.push('❌ Membresía no activa')
        }
      } else {
        problemas.push('❌ No hay membresía configurada')
        console.log('❌ Sin membresía')
      }
      
    } else {
      problemas.push('❌ No hay usuario administrador')
      console.log('❌ No hay usuario admin')
    }

    // 5. VERIFICAR SERVICIOS DE IA
    console.log('\n🤖 5. SERVICIOS DE IA')
    console.log('-'.repeat(70))
    
    const aiEnabled = process.env.AI_FALLBACK_ENABLED === 'true'
    console.log(`AI Multi-Provider: ${aiEnabled ? '✅ Habilitado' : '⚠️  Deshabilitado'}`)
    
    if (aiEnabled) {
      const fallbackOrder = process.env.AI_FALLBACK_ORDER || 'groq'
      console.log(`Orden de fallback: ${fallbackOrder}`)
      ok.push('Sistema multi-provider configurado')
      
      const providers = fallbackOrder.split(',')
      for (const provider of providers) {
        const p = provider.trim()
        if (p === 'ollama' && process.env.OLLAMA_BASE_URL) {
          console.log(`✅ Ollama: ${process.env.OLLAMA_BASE_URL}`)
        } else if (p === 'groq' && process.env.GROQ_API_KEY) {
          console.log(`✅ Groq: Configurado`)
        } else if (p === 'openrouter' && process.env.OPENROUTER_API_KEY) {
          console.log(`✅ OpenRouter: Configurado`)
        } else {
          advertencias.push(`⚠️  Provider ${p} en fallback pero no configurado`)
        }
      }
    } else {
      advertencias.push('⚠️  Sistema multi-provider deshabilitado')
    }

    // 6. VERIFICAR SISTEMA DE PAGOS
    console.log('\n💳 6. SISTEMA DE PAGOS')
    console.log('-'.repeat(70))
    
    const mercadoPago = !!process.env.MERCADOPAGO_ACCESS_TOKEN
    const paypal = !!process.env.PAYPAL_CLIENT_ID
    
    console.log(`MercadoPago: ${mercadoPago ? '✅ Configurado' : '⚠️  No configurado'}`)
    console.log(`PayPal: ${paypal ? '✅ Configurado' : '⚠️  No configurado'}`)
    
    if (!mercadoPago && !paypal) {
      advertencias.push('⚠️  No hay métodos de pago automáticos configurados')
    } else {
      ok.push('Al menos un método de pago configurado')
    }

    // 7. VERIFICAR SISTEMA DE EMAILS
    console.log('\n📧 7. SISTEMA DE EMAILS')
    console.log('-'.repeat(70))
    
    const resendKey = !!process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM
    
    console.log(`Resend API: ${resendKey ? '✅ Configurado' : '⚠️  No configurado'}`)
    console.log(`Email From: ${emailFrom || '⚠️  No configurado'}`)
    
    if (!resendKey) {
      advertencias.push('⚠️  Sistema de emails no configurado (verificación de email no funcionará)')
    } else {
      ok.push('Sistema de emails configurado')
    }

    // 8. VERIFICAR WHATSAPP
    console.log('\n📱 8. WHATSAPP')
    console.log('-'.repeat(70))
    
    const authSessionsDir = 'auth_sessions'
    if (fs.existsSync(authSessionsDir)) {
      const sessions = fs.readdirSync(authSessionsDir)
      console.log(`✅ Directorio de sesiones existe`)
      console.log(`   Sesiones guardadas: ${sessions.length}`)
      
      if (sessions.length > 0) {
        ok.push('Sesiones de WhatsApp guardadas')
      } else {
        advertencias.push('⚠️  No hay sesiones de WhatsApp guardadas (necesitará escanear QR)')
      }
    } else {
      advertencias.push('⚠️  Directorio de sesiones no existe')
      console.log('⚠️  Directorio auth_sessions no existe')
    }

    // RESUMEN FINAL
    console.log('\n' + '='.repeat(70))
    console.log('📋 RESUMEN DE AUDITORÍA')
    console.log('='.repeat(70))
    
    console.log(`\n✅ FUNCIONANDO CORRECTAMENTE (${ok.length}):`)
    ok.forEach(item => console.log(`   • ${item}`))
    
    if (advertencias.length > 0) {
      console.log(`\n⚠️  ADVERTENCIAS (${advertencias.length}):`)
      advertencias.forEach(item => console.log(`   • ${item}`))
    }
    
    if (problemas.length > 0) {
      console.log(`\n❌ PROBLEMAS CRÍTICOS (${problemas.length}):`)
      problemas.forEach(item => console.log(`   • ${item}`))
    }
    
    console.log('\n' + '='.repeat(70))
    
    if (problemas.length === 0 && advertencias.length === 0) {
      console.log('🎉 SISTEMA LISTO PARA PRODUCCIÓN')
    } else if (problemas.length === 0) {
      console.log('✅ SISTEMA FUNCIONAL (con advertencias menores)')
    } else {
      console.log('⚠️  SISTEMA REQUIERE ATENCIÓN ANTES DE PRODUCCIÓN')
    }
    
    console.log('='.repeat(70))

  } catch (error) {
    console.error('\n❌ Error durante auditoría:', error)
  } finally {
    await db.$disconnect()
  }
}

auditarSistema()
