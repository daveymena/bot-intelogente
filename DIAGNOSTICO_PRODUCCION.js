/**
 * DIAGNÓSTICO COMPLETO PARA PRODUCCIÓN
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function diagnosticoCompleto() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA\n')
  console.log('='.repeat(70))
  
  const resultados = {
    baseDatos: false,
    productos: 0,
    serviciosIA: [],
    configuracion: [],
    memoriaConversacional: false,
    whatsapp: false,
    problemas: []
  }
  
  try {
    // 1. BASE DE DATOS
    console.log('\n📊 1. BASE DE DATOS')
    console.log('-'.repeat(70))
    
    const productos = await prisma.product.findMany({
      where: { status: 'AVAILABLE' }
    })
    
    const usuarios = await prisma.user.findMany()
    
    console.log(`✅ Conexión a BD: OK`)
    console.log(`📦 Productos disponibles: ${productos.length}`)
    console.log(`👥 Usuarios: ${usuarios.length}`)
    
    resultados.baseDatos = true
    resultados.productos = productos.length
    
    // Verificar fotos
    let conFotos = 0
    productos.forEach(p => {
      try {
        const imgs = JSON.parse(p.images || '[]')
        if (imgs.length > 0) conFotos++
      } catch (e) {}
    })
    
    console.log(`📸 Productos con fotos: ${conFotos} (${((conFotos/productos.length)*100).toFixed(1)}%)`)
    
    if (conFotos < productos.length) {
      resultados.problemas.push(`${productos.length - conFotos} productos sin fotos`)
    }
    
    // 2. SERVICIOS DE IA
    console.log('\n🤖 2. SERVICIOS DE IA')
    console.log('-'.repeat(70))
    
    const serviciosIA = [
      'src/lib/deep-reasoning-ai-service-optimized.ts',
      'src/lib/professional-sales-intelligence.ts',
      'src/lib/ai-multi-provider.ts',
      'src/lib/reasoning-service.ts',
      'src/lib/product-documentation-service-optimized.ts'
    ]
    
    serviciosIA.forEach(servicio => {
      const existe = fs.existsSync(path.join(__dirname, servicio))
      console.log(`${existe ? '✅' : '❌'} ${servicio}`)
      if (existe) resultados.serviciosIA.push(servicio)
    })
    
    // 3. CONFIGURACIÓN
    console.log('\n⚙️  3. CONFIGURACIÓN')
    console.log('-'.repeat(70))
    
    const envPath = path.join(__dirname, '.env')
    if (fs.existsSync(envPath)) {
      const env = fs.readFileSync(envPath, 'utf8')
      
      const configs = [
        'GROQ_API_KEY',
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL'
      ]
      
      configs.forEach(config => {
        const tiene = env.includes(config)
        console.log(`${tiene ? '✅' : '❌'} ${config}`)
        if (tiene) resultados.configuracion.push(config)
        else resultados.problemas.push(`Falta ${config}`)
      })
    } else {
      console.log('❌ Archivo .env no encontrado')
      resultados.problemas.push('Falta archivo .env')
    }
    
    // 4. SERVICIOS DE WHATSAPP
    console.log('\n📱 4. SERVICIOS DE WHATSAPP')
    console.log('-'.repeat(70))
    
    const whatsappServices = [
      'src/lib/baileys-stable-service.ts',
      'src/lib/whatsapp-web-service.ts'
    ]
    
    let whatsappOK = false
    whatsappServices.forEach(servicio => {
      const existe = fs.existsSync(path.join(__dirname, servicio))
      console.log(`${existe ? '✅' : '❌'} ${servicio}`)
      if (existe) whatsappOK = true
    })
    
    resultados.whatsapp = whatsappOK
    
    if (!whatsappOK) {
      resultados.problemas.push('No hay servicio de WhatsApp configurado')
    }
    
    // 5. MEMORIA CONVERSACIONAL
    console.log('\n💭 5. MEMORIA CONVERSACIONAL')
    console.log('-'.repeat(70))
    
    const tablas = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table'
    `
    
    const tieneConversations = tablas.some(t => t.name === 'Conversation')
    const tieneMessages = tablas.some(t => t.name === 'Message')
    
    console.log(`${tieneConversations ? '✅' : '❌'} Tabla Conversation`)
    console.log(`${tieneMessages ? '✅' : '❌'} Tabla Message`)
    
    resultados.memoriaConversacional = tieneConversations && tieneMessages
    
    if (!resultados.memoriaConversacional) {
      resultados.problemas.push('Falta sistema de memoria conversacional en BD')
    }
    
    // RESUMEN FINAL
    console.log('\n' + '='.repeat(70))
    console.log('📊 RESUMEN PARA PRODUCCIÓN')
    console.log('='.repeat(70))
    
    console.log(`\n✅ COMPONENTES LISTOS:`)
    console.log(`   • Base de datos: ${resultados.baseDatos ? 'OK' : 'FALLA'}`)
    console.log(`   • Productos: ${resultados.productos}`)
    console.log(`   • Servicios IA: ${resultados.serviciosIA.length}/5`)
    console.log(`   • Configuración: ${resultados.configuracion.length}/4`)
    console.log(`   • WhatsApp: ${resultados.whatsapp ? 'OK' : 'FALTA'}`)
    console.log(`   • Memoria conversacional: ${resultados.memoriaConversacional ? 'OK' : 'FALTA'}`)
    
    if (resultados.problemas.length > 0) {
      console.log(`\n⚠️  PROBLEMAS DETECTADOS:`)
      resultados.problemas.forEach(p => console.log(`   • ${p}`))
    } else {
      console.log(`\n🎉 ¡SISTEMA LISTO PARA PRODUCCIÓN!`)
    }
    
    // Calcular porcentaje de completitud
    const completitud = (
      (resultados.baseDatos ? 20 : 0) +
      (resultados.productos > 50 ? 20 : 10) +
      (resultados.serviciosIA.length * 4) +
      (resultados.configuracion.length * 5) +
      (resultados.whatsapp ? 15 : 0) +
      (resultados.memoriaConversacional ? 15 : 0)
    )
    
    console.log(`\n📈 COMPLETITUD: ${completitud}%`)
    
    if (completitud >= 90) {
      console.log(`✅ Sistema listo para producción`)
    } else if (completitud >= 70) {
      console.log(`⚠️  Sistema casi listo, revisar problemas`)
    } else {
      console.log(`❌ Sistema necesita más configuración`)
    }
    
  } catch (error) {
    console.error('\n❌ Error en diagnóstico:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

diagnosticoCompleto()
