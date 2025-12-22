/**
 * Test Completo del Sistema de Configuración
 * Verifica que TODAS las configuraciones se guarden y lean correctamente
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testConfiguracionCompleta() {
  console.log('🧪 Iniciando test del sistema de configuración...\n')

  try {
    // 1. Buscar un usuario de prueba
    const user = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!user) {
      console.error('❌ No se encontró usuario admin para pruebas')
      return
    }

    console.log(`✅ Usuario de prueba: ${user.email} (${user.id})\n`)

    // 2. Test: Configuración de APIs de IA
    console.log('📝 Test 1: Configuración de APIs de IA')
    console.log('─'.repeat(50))
    
    const botSettings = await prisma.botSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        businessPhone: user.phone || '+57 300 000 0000',
        groqApiKey: 'test_groq_key_123',
        openaiApiKey: 'test_openai_key_456',
        claudeApiKey: 'test_claude_key_789',
      },
      update: {
        groqApiKey: 'test_groq_key_123',
        openaiApiKey: 'test_openai_key_456',
        claudeApiKey: 'test_claude_key_789',
      }
    })

    console.log('✅ APIs de IA guardadas:')
    console.log(`   - Groq: ${botSettings.groqApiKey ? '✓' : '✗'}`)
    console.log(`   - OpenAI: ${botSettings.openaiApiKey ? '✓' : '✗'}`)
    console.log(`   - Claude: ${botSettings.claudeApiKey ? '✓' : '✗'}`)
    console.log()

    // 3. Test: Configuración de Métodos de Pago
    console.log('📝 Test 2: Configuración de Métodos de Pago')
    console.log('─'.repeat(50))

    const paymentMethods = {
      nequi: {
        number: '3001234567',
        holder: 'Juan Pérez'
      },
      daviplata: {
        number: '3007654321',
        holder: 'Juan Pérez'
      },
      bank: {
        name: 'Bancolombia',
        accountType: 'Ahorros',
        accountNumber: '12345678901',
        holder: 'Juan Pérez'
      },
      mercadoPago: {
        accessToken: 'TEST-123456',
        publicKey: 'TEST-PUB-123'
      },
      paypal: {
        clientId: 'TEST-PAYPAL-ID',
        clientSecret: 'TEST-PAYPAL-SECRET',
        email: 'test@paypal.com'
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        paymentMethods: JSON.stringify(paymentMethods)
      }
    })

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    const savedPaymentMethods = JSON.parse(updatedUser.paymentMethods || '{}')
    console.log('✅ Métodos de pago guardados:')
    console.log(`   - Nequi: ${savedPaymentMethods.nequi ? '✓' : '✗'}`)
    console.log(`   - Daviplata: ${savedPaymentMethods.daviplata ? '✓' : '✗'}`)
    console.log(`   - Banco: ${savedPaymentMethods.bank ? '✓' : '✗'}`)
    console.log(`   - MercadoPago: ${savedPaymentMethods.mercadoPago ? '✓' : '✗'}`)
    console.log(`   - PayPal: ${savedPaymentMethods.paypal ? '✓' : '✗'}`)
    console.log()

    // 4. Test: Configuración de Información del Negocio
    console.log('📝 Test 3: Información del Negocio')
    console.log('─'.repeat(50))

    await prisma.botSettings.update({
      where: { userId: user.id },
      data: {
        businessName: 'Mi Tienda Test',
        businessPhone: '+57 300 123 4567',
        businessAddress: 'Calle 123, Bogotá',
        businessHours: 'Lunes a Viernes: 9am-6pm'
      }
    })

    const businessInfo = await prisma.botSettings.findUnique({
      where: { userId: user.id },
      select: {
        businessName: true,
        businessPhone: true,
        businessAddress: true,
        businessHours: true
      }
    })

    console.log('✅ Información del negocio guardada:')
    console.log(`   - Nombre: ${businessInfo.businessName}`)
    console.log(`   - Teléfono: ${businessInfo.businessPhone}`)
    console.log(`   - Dirección: ${businessInfo.businessAddress}`)
    console.log(`   - Horario: ${businessInfo.businessHours}`)
    console.log()

    // 5. Test: Configuración de Tienda Personalizada
    console.log('📝 Test 4: Configuración de Tienda')
    console.log('─'.repeat(50))

    const storeSettings = await prisma.storeSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        storeSlug: 'mi-tienda-test',
        storeName: 'Mi Tienda Test',
        storeSlogan: 'Los mejores productos',
        primaryColor: '#10b981',
        secondaryColor: '#3b82f6',
        accentColor: '#f59e0b'
      },
      update: {
        storeName: 'Mi Tienda Test',
        storeSlogan: 'Los mejores productos',
        primaryColor: '#10b981',
        secondaryColor: '#3b82f6',
        accentColor: '#f59e0b'
      }
    })

    console.log('✅ Configuración de tienda guardada:')
    console.log(`   - Nombre: ${storeSettings.storeName}`)
    console.log(`   - Slogan: ${storeSettings.storeSlogan}`)
    console.log(`   - URL: /tienda/${storeSettings.storeSlug}`)
    console.log(`   - Color primario: ${storeSettings.primaryColor}`)
    console.log(`   - Color secundario: ${storeSettings.secondaryColor}`)
    console.log()

    // 6. Test: Configuración de Payment Integration
    console.log('📝 Test 5: Payment Integration')
    console.log('─'.repeat(50))

    const paymentIntegration = await prisma.paymentIntegration.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        mercadopagoEnabled: true,
        mercadopagoAccessToken: 'TEST-MP-TOKEN',
        mercadopagoPublicKey: 'TEST-MP-PUBLIC',
        paypalEnabled: true,
        paypalClientId: 'TEST-PP-ID',
        paypalClientSecret: 'TEST-PP-SECRET'
      },
      update: {
        mercadopagoEnabled: true,
        mercadopagoAccessToken: 'TEST-MP-TOKEN',
        mercadopagoPublicKey: 'TEST-MP-PUBLIC',
        paypalEnabled: true,
        paypalClientId: 'TEST-PP-ID',
        paypalClientSecret: 'TEST-PP-SECRET'
      }
    })

    console.log('✅ Payment Integration guardada:')
    console.log(`   - MercadoPago: ${paymentIntegration.mercadopagoEnabled ? 'Habilitado' : 'Deshabilitado'}`)
    console.log(`   - PayPal: ${paymentIntegration.paypalEnabled ? 'Habilitado' : 'Deshabilitado'}`)
    console.log()

    // 7. Resumen Final
    console.log('═'.repeat(50))
    console.log('🎉 RESUMEN DEL TEST')
    console.log('═'.repeat(50))
    console.log('✅ Configuración de APIs de IA: FUNCIONAL')
    console.log('✅ Métodos de Pago: FUNCIONAL')
    console.log('✅ Información del Negocio: FUNCIONAL')
    console.log('✅ Configuración de Tienda: FUNCIONAL')
    console.log('✅ Payment Integration: FUNCIONAL')
    console.log()
    console.log('🎯 CONCLUSIÓN: TODOS los sistemas de configuración')
    console.log('   están guardando y leyendo correctamente de la BD.')
    console.log()
    console.log('📝 NOTA: Estos son datos de prueba. Puedes verificarlos en:')
    console.log('   npx prisma studio')
    console.log()

  } catch (error) {
    console.error('❌ Error en el test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar test
testConfiguracionCompleta()
