/**
 * DIAGNÓSTICO COMPLETO PARA PRODUCCIÓN
 * Compatible con PostgreSQL y SQLite
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function diagnosticoCompleto() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA PARA PRODUCCIÓN\n')
  console.log('='.repeat(70))
  
  const resultados = {
    baseDatos: false,
    productos: 0,
    serviciosIA: [],
    configuracion: [],
    memoriaConversacional: false,
    whatsapp: false,
    sistemasPago: false,
    problemas: [],
    warnings: []
  }
  
  try {
    // 1. BASE DE DATOS Y PRODUCTOS
    console.log('\n📊 1. BASE DE DATOS Y PRODUCTOS')
    console.log('-'.repeat(70))
    
    const productos = await prisma.product.findMany({
      where: { status: 'AVAILABLE' }
    })
    
    const usuarios = await prisma.user.findMany()
    
    console.log(`✅ Conexión a BD: OK`)
    console.log(`📦 Productos disponibles: ${productos.length}`)
    console.log(`👥 Usuarios registrados: ${usuarios.length}`)
    
    resultados.baseDatos = true
    resultados.productos = productos.length
    
    // Verificar fotos
    let conFotos = 0
    let conDescripcion = 0
    let conPrecio = 0
    
    productos.forEach(p => {
      try {
        const imgs = JSON.parse(p.images || '[]')
        if (imgs.length > 0) conFotos++
      } catch (e) {}
      
      if (p.description && p.description.length > 20) conDescripcion++
      if (p.price > 0) conPrecio++
    })
    
    console.log(`📸 Productos con fotos: ${conFotos} (${((conFotos/productos.length)*100).toFixed(1)}%)`)
    console.log(`📝 Productos con descripción: ${conDescripcion} (${((conDescripcion/productos.length)*100).toFixed(1)}%)`)
    console.log(`💰 Productos con precio: ${conPrecio} (${((conPrecio/productos.length)*100).toFixed(1)}%)`)
    
    if (conFotos < productos.length * 0.8) {
      resultados.warnings.push(`Solo ${conFotos} productos tienen fotos (${((conFotos/productos.length)*100).toFixed(0)}%)`)
    }
    
    // 2. SERVICIOS DE IA
    console.log('\n🤖 2. SERVICIOS DE IA')
    console.log('-'.repeat(70))
    
    const serviciosIA = [
      { path: 'src/lib/deep-reasoning-ai-service-optimized.ts', nombre: 'Razonamiento Profundo' },
      { path: 'src/lib/professional-sales-intelligence.ts', nombre: 'Inteligencia de Ventas' },
      { path: 'src/lib/ai-multi-provider.ts', nombre: 'Multi-Provider IA' },
      { path: 'src/lib/reasoning-service.ts', nombre: 'Servicio de Razonamiento' },
      { path: 'src/lib/product-documentation-service-optimized.ts', nombre: 'Documentación de Productos' }
    ]
    
    serviciosIA.forEach(servicio => {
      const existe = fs.existsSync(path.join(__dirname, servicio.path))
      console.log(`${existe ? '✅' : '❌'} ${servicio.nombre}`)
      if (existe) resultados.serviciosIA.push(servicio.nombre)
      else resultados.problemas.push(`Falta: ${servicio.nombre}`)
    })
    
    // 3. CONFIGURACIÓN DE VARIABLES
    console.log('\n⚙️  3. CONFIGURACIÓN DE VARIABLES')
    console.log('-'.repeat(70))
    
    const envPath = path.join(__dirname, '.env')
    if (fs.existsSync(envPath)) {
      const env = fs.readFileSync(envPath, 'utf8')
      
      const configs = [
        { key: 'GROQ_API_KEY', critico: true },
        { key: 'DATABASE_URL', critico: true },
        { key: 'NEXTAUTH_SECRET', critico: true },
        { key: 'NEXTAUTH_URL', critico: true },
        { key: 'RESEND_API_KEY', critico: false },
        { key: 'MERCADOPAGO_ACCESS_TOKEN', critico: false },
        { key: 'PAYPAL_CLIENT_ID', critico: false }
      ]
      
      configs.forEach(config => {
        const tiene = env.includes(config.key) && !env.includes(`${config.key}=\n`)
        const icon = tiene ? '✅' : (config.critico ? '❌' : '⚠️ ')
        console.log(`${icon} ${config.key}`)
        
        if (tiene) {
          resultados.configuracion.push(config.key)
        } else if (config.critico) {
          resultados.problemas.push(`CRÍTICO: Falta ${config.key}`)
        } else {
          resultados.warnings.push(`Opcional: Falta ${config.key}`)
        }
      })
    } else {
      console.log('❌ Archivo .env no encontrado')
      resultados.problemas.push('CRÍTICO: Falta archivo .env')
    }
    
    // 4. SERVICIOS DE WHATSAPP
    console.log('\n📱 4. SERVICIOS DE WHATSAPP')
    console.log('-'.repeat(70))
    
    const whatsappServices = [
      { path: 'src/lib/baileys-stable-service.ts', nombre: 'Baileys Service' },
      { path: 'src/lib/whatsapp-web-service.ts', nombre: 'WhatsApp Web Service' },
      { path: 'src/lib/whatsapp-auto-connect.ts', nombre: 'Auto-Conexión' }
    ]
    
    let whatsappOK = false
    whatsappServices.forEach(servicio => {
      const existe = fs.existsSync(path.join(__dirname, servicio.path))
      console.log(`${existe ? '✅' : '⚠️ '} ${servicio.nombre}`)
      if (existe) whatsappOK = true
    })
    
    resultados.whatsapp = whatsappOK
    
    if (!whatsappOK) {
      resultados.problemas.push('No hay servicio de WhatsApp configurado')
    }
    
    // 5. MEMORIA CONVERSACIONAL
    console.log('\n💭 5. MEMORIA CONVERSACIONAL')
    console.log('-'.repeat(70))
    
    try {
      // Verificar schema de Prisma
      const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma')
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8')
        
        const tieneConversation = schema.includes('model Conversation')
        const tieneMessage = schema.includes('model Message')
        
        console.log(`${tieneConversation ? '✅' : '❌'} Modelo Conversation en schema`)
        console.log(`${tieneMessage ? '✅' : '❌'} Modelo Message en schema`)
        
        // Intentar contar conversaciones
        if (tieneConversation) {
          try {
            const count = await prisma.conversation?.count() || 0
            console.log(`📊 Conversaciones guardadas: ${count}`)
            resultados.memoriaConversacional = true
          } catch (e) {
            console.log(`⚠️  Tabla existe pero necesita migración`)
            resultados.warnings.push('Ejecutar: npx prisma migrate deploy')
          }
        }
      }
    } catch (error) {
      console.log('⚠️  No se pudo verificar memoria conversacional')
      resultados.warnings.push('Verificar configuración de memoria conversacional')
    }
    
    // 6. SISTEMAS DE PAGO
    console.log('\n💳 6. SISTEMAS DE PAGO')
    console.log('-'.repeat(70))
    
    const sistemasPago = [
      { path: 'src/lib/payment/universal-payment-system.js', nombre: 'Sistema Universal' },
      { path: 'src/app/api/payments/create/route.ts', nombre: 'API de Pagos' }
    ]
    
    let pagoOK = false
    sistemasPago.forEach(sistema => {
      const existe = fs.existsSync(path.join(__dirname, sistema.path))
      console.log(`${existe ? '✅' : '⚠️ '} ${sistema.nombre}`)
      if (existe) pagoOK = true
    })
    
    resultados.sistemasPago = pagoOK
    
    // 7. ARCHIVOS DE CONFIGURACIÓN
    console.log('\n📄 7. ARCHIVOS DE CONFIGURACIÓN')
    console.log('-'.repeat(70))
    
    const archivosConfig = [
      'package.json',
      'next.config.ts',
      'tsconfig.json',
      'prisma/schema.prisma'
    ]
    
    archivosConfig.forEach(archivo => {
      const existe = fs.existsSync(path.join(__dirname, archivo))
      console.log(`${existe ? '✅' : '❌'} ${archivo}`)
    })
    
    // RESUMEN FINAL
    console.log('\n' + '='.repeat(70))
    console.log('📊 RESUMEN PARA PRODUCCIÓN')
    console.log('='.repeat(70))
    
    console.log(`\n✅ COMPONENTES LISTOS:`)
    console.log(`   • Base de datos: ${resultados.baseDatos ? '✅ OK' : '❌ FALLA'}`)
    console.log(`   • Productos: ${resultados.productos} (${conFotos} con fotos)`)
    console.log(`   • Servicios IA: ${resultados.serviciosIA.length}/5`)
    console.log(`   • Configuración: ${resultados.configuracion.length} variables`)
    console.log(`   • WhatsApp: ${resultados.whatsapp ? '✅ OK' : '❌ FALTA'}`)
    console.log(`   • Memoria conversacional: ${resultados.memoriaConversacional ? '✅ OK' : '⚠️  REVISAR'}`)
    console.log(`   • Sistemas de pago: ${resultados.sistemasPago ? '✅ OK' : '⚠️  OPCIONAL'}`)
    
    if (resultados.problemas.length > 0) {
      console.log(`\n❌ PROBLEMAS CRÍTICOS:`)
      resultados.problemas.forEach(p => console.log(`   • ${p}`))
    }
    
    if (resultados.warnings.length > 0) {
      console.log(`\n⚠️  ADVERTENCIAS:`)
      resultados.warnings.forEach(w => console.log(`   • ${w}`))
    }
    
    // Calcular porcentaje de completitud
    const completitud = (
      (resultados.baseDatos ? 20 : 0) +
      (resultados.productos > 50 ? 15 : 5) +
      (conFotos > productos.length * 0.8 ? 10 : 5) +
      (resultados.serviciosIA.length * 6) +
      (resultados.configuracion.length >= 4 ? 15 : 5) +
      (resultados.whatsapp ? 15 : 0) +
      (resultados.memoriaConversacional ? 10 : 0) +
      (resultados.sistemasPago ? 5 : 0)
    )
    
    console.log(`\n📈 COMPLETITUD DEL SISTEMA: ${completitud}%`)
    console.log('='.repeat(70))
    
    if (completitud >= 90 && resultados.problemas.length === 0) {
      console.log(`\n🎉 ¡SISTEMA LISTO PARA PRODUCCIÓN!`)
      console.log(`\n📋 PRÓXIMOS PASOS:`)
      console.log(`   1. Ejecutar: npm run build`)
      console.log(`   2. Probar en local: npm start`)
      console.log(`   3. Desplegar a Easypanel`)
    } else if (completitud >= 70) {
      console.log(`\n⚠️  SISTEMA CASI LISTO`)
      console.log(`\n📋 TAREAS PENDIENTES:`)
      if (resultados.problemas.length > 0) {
        console.log(`   • Resolver ${resultados.problemas.length} problemas críticos`)
      }
      if (resultados.warnings.length > 0) {
        console.log(`   • Revisar ${resultados.warnings.length} advertencias`)
      }
    } else {
      console.log(`\n❌ SISTEMA NECESITA MÁS CONFIGURACIÓN`)
      console.log(`\n📋 TAREAS CRÍTICAS:`)
      resultados.problemas.forEach(p => console.log(`   • ${p}`))
    }
    
  } catch (error) {
    console.error('\n❌ Error en diagnóstico:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

diagnosticoCompleto()
