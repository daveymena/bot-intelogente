/**
 * 🔍 Script para verificar configuración de MercadoPago
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarMercadoPago() {
  try {
    console.log('🔍 Verificando configuración de MercadoPago...\n')
    
    // Verificar variables de entorno
    console.log('📋 Variables de Entorno:')
    console.log('='.repeat(60))
    
    const envToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (envToken) {
      console.log('✅ MERCADOPAGO_ACCESS_TOKEN encontrado')
      console.log(`   Longitud: ${envToken.length} caracteres`)
      console.log(`   Primeros 10 caracteres: ${envToken.substring(0, 10)}...`)
    } else {
      console.log('❌ MERCADOPAGO_ACCESS_TOKEN NO encontrado en .env')
    }
    
    // Verificar integraciones en base de datos
    console.log('\n📋 Integraciones en Base de Datos:')
    console.log('='.repeat(60))
    
    const integrations = await prisma.paymentIntegration.findMany()
    
    if (integrations.length === 0) {
      console.log('⚠️  No hay integraciones configuradas en la base de datos')
    } else {
      for (const integration of integrations) {
        console.log(`\n👤 Usuario: ${integration.userId}`)
        console.log(`   MercadoPago: ${integration.mercadopagoAccessToken ? '✅ Configurado' : '❌ No configurado'}`)
        if (integration.mercadopagoAccessToken) {
          console.log(`   Token longitud: ${integration.mercadopagoAccessToken.length} caracteres`)
        }
        console.log(`   PayPal: ${integration.paypalClientId ? '✅ Configurado' : '❌ No configurado'}`)
      }
    }
    
    // Probar conexión con MercadoPago
    console.log('\n🧪 Probando conexión con MercadoPago API:')
    console.log('='.repeat(60))
    
    const testToken = envToken || integrations[0]?.mercadopagoAccessToken
    
    if (!testToken) {
      console.log('❌ No hay token disponible para probar')
      console.log('\n💡 Solución:')
      console.log('   1. Agrega MERCADOPAGO_ACCESS_TOKEN en tu archivo .env')
      console.log('   2. O configura MercadoPago en el dashboard')
      return
    }
    
    try {
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          Authorization: `Bearer ${testToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Conexión exitosa con MercadoPago`)
        console.log(`   Métodos de pago disponibles: ${data.length}`)
      } else {
        const error = await response.json()
        console.log('❌ Error en conexión con MercadoPago')
        console.log(`   Status: ${response.status}`)
        console.log(`   Error: ${JSON.stringify(error, null, 2)}`)
        
        if (response.status === 401) {
          console.log('\n💡 El token parece ser inválido. Verifica que:')
          console.log('   1. El token sea de producción (no de prueba)')
          console.log('   2. El token no haya expirado')
          console.log('   3. El token tenga los permisos correctos')
        }
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error)
    }
    
    // Resumen
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN')
    console.log('='.repeat(60))
    
    if (envToken || integrations.some(i => i.mercadopagoAccessToken)) {
      console.log('✅ MercadoPago está configurado')
      console.log('\n💡 Si los pagos no funcionan, verifica:')
      console.log('   1. Que el token sea válido')
      console.log('   2. Que la URL de la app esté configurada correctamente')
      console.log('   3. Los logs en la consola del navegador')
    } else {
      console.log('❌ MercadoPago NO está configurado')
      console.log('\n💡 Para configurar MercadoPago:')
      console.log('   1. Obtén tu Access Token en: https://www.mercadopago.com.co/developers')
      console.log('   2. Agrégalo en .env como: MERCADOPAGO_ACCESS_TOKEN=tu_token')
      console.log('   3. O configúralo en el dashboard en Configuración > Integraciones')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarMercadoPago()
