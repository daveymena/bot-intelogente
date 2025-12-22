/**
 * Script para verificar que la configuración del bot esté completa
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function verificarConfiguracion() {
  console.log('🔍 VERIFICANDO CONFIGURACIÓN COMPLETA DEL BOT\n')

  let todoBien = true

  try {
    // 1. Verificar base de datos
    console.log('📊 1. Verificando Base de Datos...')
    try {
      const userCount = await prisma.user.count()
      console.log(`   ✅ Conexión a BD: OK (${userCount} usuarios)`)
    } catch (error) {
      console.log('   ❌ Error conectando a BD:', error.message)
      todoBien = false
    }

    // 2. Verificar usuario administrador
    console.log('\n👤 2. Verificando Usuario Administrador...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'daveymena16@gmail.com' }
    })

    if (adminUser) {
      console.log(`   ✅ Usuario admin encontrado: ${adminUser.name}`)
      console.log(`   📧 Email: ${adminUser.email}`)
      console.log(`   🏢 Empresa: ${adminUser.businessName}`)
      console.log(`   🔑 Contraseña: ${adminUser.password ? 'Configurada' : 'NO CONFIGURADA'}`)
    } else {
      console.log('   ❌ Usuario administrador NO encontrado')
      todoBien = false
    }

    // 3. Verificar configuración de bot
    console.log('\n🤖 3. Verificando Configuración de Bot...')
    const botSettings = await prisma.botSettings.findFirst()
    if (botSettings) {
      console.log('   ✅ Configuración de bot encontrada')
      console.log(`   🏢 Empresa: ${botSettings.businessName}`)
      console.log(`   📱 Teléfono: ${botSettings.businessPhone}`)
    } else {
      console.log('   ❌ Configuración de bot NO encontrada')
      todoBien = false
    }

    // 4. Verificar archivo .env
    console.log('\n⚙️ 4. Verificando Archivo .env...')
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')

      // Verificar claves críticas
      const checks = [
        { name: 'DATABASE_URL', pattern: /DATABASE_URL=file:.*\.db/ },
        { name: 'GROQ_API_KEY', pattern: /GROQ_API_KEY=gsk_/ },
        { name: 'GROQ_API_KEY_2', pattern: /GROQ_API_KEY_2=gsk_/ },
        { name: 'GROQ_API_KEY_3', pattern: /GROQ_API_KEY_3=gsk_/ },
        { name: 'HYBRID_SYSTEM_ENABLED', pattern: /HYBRID_SYSTEM_ENABLED=true/ },
        { name: 'ENABLE_HYBRID_SYSTEM', pattern: /ENABLE_HYBRID_SYSTEM=true/ },
        { name: 'FULL_SYSTEM_ACTIVATED', pattern: /FULL_SYSTEM_ACTIVATED=true/ }
      ]

      checks.forEach(check => {
        if (check.pattern.test(envContent)) {
          console.log(`   ✅ ${check.name}: Configurado`)
        } else {
          console.log(`   ❌ ${check.name}: NO configurado o incorrecto`)
          todoBien = false
        }
      })

      // Verificar que no haya configuraciones conflictivas
      if (envContent.includes('FORCE_OLLAMA_ONLY=true')) {
        console.log('   ⚠️  ADVERTENCIA: FORCE_OLLAMA_ONLY está activado (solo usa Ollama)')
      }

    } else {
      console.log('   ❌ Archivo .env NO encontrado')
      todoBien = false
    }

    // 5. Verificar productos en BD
    console.log('\n📦 5. Verificando Productos...')
    const productCount = await prisma.product.count()
    console.log(`   📊 Total productos: ${productCount}`)

    if (productCount === 0) {
      console.log('   ⚠️  No hay productos en la base de datos')
      console.log('   💡 Necesitas agregar productos desde el dashboard')
    } else {
      console.log('   ✅ Productos encontrados')
    }

    // 6. Verificar dependencias críticas
    console.log('\n📚 6. Verificando Dependencias...')
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const criticalDeps = [
      '@whiskeysockets/baileys',
      '@prisma/client',
      'groq-sdk',
      'bcryptjs'
    ]

    criticalDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`   ✅ ${dep}: Instalado`)
      } else {
        console.log(`   ❌ ${dep}: NO instalado`)
        todoBien = false
      }
    })

    // 7. Verificar archivos críticos
    console.log('\n📁 7. Verificando Archivos Críticos...')
    const criticalFiles = [
      'src/lib/baileys-stable-service.ts',
      'src/agents/orchestrator.ts',
      'src/lib/intelligent-conversation-engine.ts',
      'src/conversational-module/index.ts'
    ]

    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}: Existe`)
      } else {
        console.log(`   ❌ ${file}: NO encontrado`)
        todoBien = false
      }
    })

    // 8. Verificar conexión de WhatsApp
    console.log('\n📱 8. Verificando Conexión WhatsApp...')
    const whatsappConnection = await prisma.whatsAppConnection.findFirst()
    if (whatsappConnection) {
      console.log(`   📊 Estado: ${whatsappConnection.status}`)
      console.log(`   📱 Número: ${whatsappConnection.phoneNumber || 'No configurado'}`)
      console.log(`   🔗 Conectado: ${whatsappConnection.isConnected ? 'Sí' : 'No'}`)

      if (whatsappConnection.status === 'CONNECTED') {
        console.log('   ✅ WhatsApp conectado y listo')
      } else {
        console.log('   ⚠️  WhatsApp no conectado - necesitas escanear QR')
      }
    } else {
      console.log('   ❌ No hay conexión WhatsApp configurada')
    }

    console.log('\n' + '='.repeat(50))

    if (todoBien) {
      console.log('🎉 CONFIGURACIÓN COMPLETA Y CORRECTA')
      console.log('\n🚀 El bot está listo para responder mensajes!')
      console.log('\n📋 Próximos pasos:')
      console.log('1. Ejecuta: npm run dev')
      console.log('2. Ve a http://localhost:3000')
      console.log('3. Inicia sesión con daveymena16@gmail.com / 6715320Dvd')
      console.log('4. Escanea el QR de WhatsApp')
      console.log('5. ¡El bot responderá automáticamente!')
    } else {
      console.log('❌ CONFIGURACIÓN INCOMPLETA')
      console.log('\n🔧 Revisa los errores arriba y corrígelos')
    }

  } catch (error) {
    console.error('❌ Error verificando configuración:', error)
    todoBien = false
  } finally {
    await prisma.$disconnect()
  }

  console.log('\n' + '='.repeat(50))
  return todoBien
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verificarConfiguracion()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

module.exports = { verificarConfiguracion }