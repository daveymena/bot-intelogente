/**
 * Script de diagnóstico completo de WhatsApp
 * Ejecuta todas las verificaciones necesarias
 */

import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

async function diagnosticoCompleto() {
  console.log('='.repeat(70))
  console.log('🔍 DIAGNÓSTICO COMPLETO DE WHATSAPP')
  console.log('='.repeat(70))
  console.log('')

  const resultados: string[] = []
  let problemas = 0
  let advertencias = 0

  // 1. Verificar Node.js
  console.log('1️⃣  Verificando versión de Node.js...')
  const nodeVersion = process.version
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0])
  
  if (nodeMajor >= 18) {
    console.log(`   ✅ Node.js ${nodeVersion} (OK)`)
    resultados.push(`✅ Node.js: ${nodeVersion}`)
  } else {
    console.log(`   ❌ Node.js ${nodeVersion} (Requiere v18+)`)
    resultados.push(`❌ Node.js: ${nodeVersion} - ACTUALIZAR`)
    problemas++
  }
  console.log('')

  // 2. Verificar Baileys
  console.log('2️⃣  Verificando instalación de Baileys...')
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    )
    const baileysVersion = packageJson.dependencies['@whiskeysockets/baileys']
    
    if (baileysVersion) {
      console.log(`   ✅ Baileys instalado: ${baileysVersion}`)
      resultados.push(`✅ Baileys: ${baileysVersion}`)
    } else {
      console.log(`   ❌ Baileys NO instalado`)
      resultados.push(`❌ Baileys: NO INSTALADO`)
      problemas++
    }
  } catch (error) {
    console.log(`   ⚠️  No se pudo verificar package.json`)
    resultados.push(`⚠️  Baileys: No verificado`)
    advertencias++
  }
  console.log('')

  // 3. Verificar directorio de sesiones
  console.log('3️⃣  Verificando directorio de sesiones...')
  const authDir = path.join(process.cwd(), 'auth_sessions')
  
  if (fs.existsSync(authDir)) {
    const sessions = fs.readdirSync(authDir).filter(f => 
      fs.statSync(path.join(authDir, f)).isDirectory()
    )
    
    console.log(`   ✅ Directorio existe: ${authDir}`)
    console.log(`   📁 Sesiones encontradas: ${sessions.length}`)
    
    if (sessions.length > 0) {
      console.log(`   📋 Sesiones: ${sessions.join(', ')}`)
      resultados.push(`✅ Sesiones: ${sessions.length} encontradas`)
    } else {
      console.log(`   ⚠️  No hay sesiones guardadas`)
      resultados.push(`⚠️  Sesiones: Ninguna`)
      advertencias++
    }
  } else {
    console.log(`   ⚠️  Directorio no existe (se creará automáticamente)`)
    resultados.push(`⚠️  Directorio de sesiones: No existe`)
    advertencias++
  }
  console.log('')

  // 4. Verificar base de datos
  console.log('4️⃣  Verificando conexión a base de datos...')
  try {
    await db.$connect()
    console.log(`   ✅ Conexión exitosa`)
    resultados.push(`✅ Base de datos: Conectada`)
    
    // Verificar conexiones de WhatsApp
    const connections = await db.whatsAppConnection.findMany()
    console.log(`   📊 Conexiones registradas: ${connections.length}`)
    
    if (connections.length > 0) {
      const latest = connections[0]
      console.log(`   📡 Última conexión:`)
      console.log(`      - Estado: ${latest.status}`)
      console.log(`      - Conectado: ${latest.isConnected ? 'Sí' : 'No'}`)
      console.log(`      - Teléfono: ${latest.phoneNumber || 'No registrado'}`)
      console.log(`      - QR presente: ${latest.qrCode ? 'Sí' : 'No'}`)
      
      resultados.push(`📊 Conexiones: ${connections.length}`)
      resultados.push(`📡 Estado: ${latest.status}`)
      
      if (latest.status === 'CONNECTED' && latest.isConnected) {
        resultados.push(`✅ WhatsApp: CONECTADO`)
      } else if (latest.status === 'QR_PENDING' && latest.qrCode) {
        resultados.push(`⚠️  WhatsApp: QR pendiente de escaneo`)
        advertencias++
      } else {
        resultados.push(`❌ WhatsApp: DESCONECTADO`)
        problemas++
      }
    } else {
      console.log(`   ⚠️  No hay conexiones registradas`)
      resultados.push(`⚠️  Conexiones: Ninguna`)
      advertencias++
    }
  } catch (error) {
    console.log(`   ❌ Error conectando a base de datos`)
    console.log(`   Error: ${error instanceof Error ? error.message : 'Desconocido'}`)
    resultados.push(`❌ Base de datos: ERROR`)
    problemas++
  }
  console.log('')

  // 5. Verificar variables de entorno
  console.log('5️⃣  Verificando variables de entorno...')
  const requiredVars = [
    'DATABASE_URL',
    'GROQ_API_KEY',
    'NEXTAUTH_SECRET'
  ]
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName}: Configurada`)
      resultados.push(`✅ ${varName}: OK`)
    } else {
      console.log(`   ❌ ${varName}: NO configurada`)
      resultados.push(`❌ ${varName}: FALTA`)
      problemas++
    }
  }
  console.log('')

  // 6. Verificar conectividad a WhatsApp Web
  console.log('6️⃣  Verificando conectividad a WhatsApp Web...')
  try {
    const https = await import('https')
    
    await new Promise<void>((resolve, reject) => {
      const req = https.request('https://web.whatsapp.com', { method: 'HEAD' }, (res) => {
        if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
          console.log(`   ✅ Conectividad OK (Status: ${res.statusCode})`)
          resultados.push(`✅ WhatsApp Web: Accesible`)
          resolve()
        } else {
          console.log(`   ⚠️  Status inesperado: ${res.statusCode}`)
          resultados.push(`⚠️  WhatsApp Web: Status ${res.statusCode}`)
          advertencias++
          resolve()
        }
      })
      
      req.on('error', (error) => {
        console.log(`   ❌ Error de conectividad: ${error.message}`)
        resultados.push(`❌ WhatsApp Web: No accesible`)
        problemas++
        resolve()
      })
      
      req.setTimeout(5000, () => {
        req.destroy()
        console.log(`   ⚠️  Timeout (5s)`)
        resultados.push(`⚠️  WhatsApp Web: Timeout`)
        advertencias++
        resolve()
      })
      
      req.end()
    })
  } catch (error) {
    console.log(`   ❌ Error verificando conectividad`)
    resultados.push(`❌ WhatsApp Web: Error`)
    problemas++
  }
  console.log('')

  // RESUMEN FINAL
  console.log('='.repeat(70))
  console.log('📊 RESUMEN DEL DIAGNÓSTICO')
  console.log('='.repeat(70))
  console.log('')
  
  for (const resultado of resultados) {
    console.log(resultado)
  }
  
  console.log('')
  console.log('─'.repeat(70))
  console.log(`❌ Problemas críticos: ${problemas}`)
  console.log(`⚠️  Advertencias: ${advertencias}`)
  console.log(`✅ Verificaciones exitosas: ${resultados.filter(r => r.startsWith('✅')).length}`)
  console.log('─'.repeat(70))
  console.log('')

  // RECOMENDACIONES
  console.log('='.repeat(70))
  console.log('💡 RECOMENDACIONES')
  console.log('='.repeat(70))
  console.log('')

  if (problemas === 0 && advertencias === 0) {
    console.log('✅ ¡Todo está configurado correctamente!')
    console.log('')
    console.log('Próximo paso:')
    console.log('   npx tsx scripts/test-qr-console.ts')
    console.log('')
  } else {
    if (problemas > 0) {
      console.log('❌ HAY PROBLEMAS CRÍTICOS QUE RESOLVER:')
      console.log('')
      
      if (resultados.some(r => r.includes('Node.js') && r.includes('❌'))) {
        console.log('1. Actualizar Node.js a v18 o superior')
        console.log('   En Easypanel: Settings → Runtime → Node.js 18+')
        console.log('')
      }
      
      if (resultados.some(r => r.includes('Baileys') && r.includes('❌'))) {
        console.log('2. Instalar Baileys:')
        console.log('   npm install @whiskeysockets/baileys@latest')
        console.log('')
      }
      
      if (resultados.some(r => r.includes('Base de datos') && r.includes('❌'))) {
        console.log('3. Verificar DATABASE_URL en variables de entorno')
        console.log('   Debe apuntar a PostgreSQL válido')
        console.log('')
      }
      
      if (resultados.some(r => r.includes('FALTA'))) {
        console.log('4. Configurar variables de entorno faltantes')
        console.log('   Ver archivo .env.example')
        console.log('')
      }
      
      if (resultados.some(r => r.includes('WhatsApp Web') && r.includes('❌'))) {
        console.log('5. Verificar conectividad de red del servidor')
        console.log('   Contactar soporte de Easypanel si persiste')
        console.log('')
      }
    }
    
    if (advertencias > 0 && problemas === 0) {
      console.log('⚠️  HAY ADVERTENCIAS (no críticas):')
      console.log('')
      
      if (resultados.some(r => r.includes('Sesiones') && r.includes('⚠️'))) {
        console.log('• No hay sesiones guardadas (normal en primera conexión)')
        console.log('')
      }
      
      if (resultados.some(r => r.includes('QR pendiente'))) {
        console.log('• Hay un QR pendiente de escaneo')
        console.log('  Escanéalo desde el dashboard o genera uno nuevo')
        console.log('')
      }
      
      console.log('Puedes continuar con:')
      console.log('   npx tsx scripts/test-qr-console.ts')
      console.log('')
    }
  }

  console.log('='.repeat(70))
  console.log('')

  await db.$disconnect()
  process.exit(problemas > 0 ? 1 : 0)
}

diagnosticoCompleto()
