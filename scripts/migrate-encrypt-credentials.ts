/**
 * 🔄 Script de Migración de Credenciales
 * 
 * Encripta todas las credenciales existentes en la base de datos
 * que aún están en texto plano.
 * 
 * Uso:
 *   npx tsx scripts/migrate-encrypt-credentials.ts
 */

import { db } from '../src/lib/db'
import { EncryptionService } from '../src/lib/encryption-service'

async function migrateCredentials() {
  console.log('🔄 Iniciando migración de credenciales...\n')
  
  try {
    // Obtener todas las integraciones
    const integrations = await db.paymentIntegration.findMany()
    
    console.log(`📊 Encontradas ${integrations.length} integraciones\n`)
    
    if (integrations.length === 0) {
      console.log('ℹ️  No hay integraciones para migrar')
      return
    }
    
    let migrated = 0
    let skipped = 0
    let errors = 0
    
    for (const integration of integrations) {
      try {
        const updates: any = {}
        let hasChanges = false
        
        console.log(`\n👤 Usuario: ${integration.userId}`)
        
        // MercadoPago Access Token
        if (integration.mercadopagoAccessToken && 
            !EncryptionService.isEncrypted(integration.mercadopagoAccessToken)) {
          updates.mercadopagoAccessToken = EncryptionService.encrypt(integration.mercadopagoAccessToken)
          console.log('  🔐 Encriptando MercadoPago Access Token')
          hasChanges = true
        }
        
        // MercadoPago Public Key
        if (integration.mercadopagoPublicKey && 
            !EncryptionService.isEncrypted(integration.mercadopagoPublicKey)) {
          updates.mercadopagoPublicKey = EncryptionService.encrypt(integration.mercadopagoPublicKey)
          console.log('  🔐 Encriptando MercadoPago Public Key')
          hasChanges = true
        }
        
        // PayPal Client ID
        if (integration.paypalClientId && 
            !EncryptionService.isEncrypted(integration.paypalClientId)) {
          updates.paypalClientId = EncryptionService.encrypt(integration.paypalClientId)
          console.log('  🔐 Encriptando PayPal Client ID')
          hasChanges = true
        }
        
        // PayPal Client Secret
        if (integration.paypalClientSecret && 
            !EncryptionService.isEncrypted(integration.paypalClientSecret)) {
          updates.paypalClientSecret = EncryptionService.encrypt(integration.paypalClientSecret)
          console.log('  🔐 Encriptando PayPal Client Secret')
          hasChanges = true
        }
        
        // Hotmart API Key
        if (integration.hotmartApiKey && 
            !EncryptionService.isEncrypted(integration.hotmartApiKey)) {
          updates.hotmartApiKey = EncryptionService.encrypt(integration.hotmartApiKey)
          console.log('  🔐 Encriptando Hotmart API Key')
          hasChanges = true
        }
        
        // Stripe Secret Key
        if (integration.stripeSecretKey && 
            !EncryptionService.isEncrypted(integration.stripeSecretKey)) {
          updates.stripeSecretKey = EncryptionService.encrypt(integration.stripeSecretKey)
          console.log('  🔐 Encriptando Stripe Secret Key')
          hasChanges = true
        }
        
        // Stripe Publishable Key
        if (integration.stripePublishableKey && 
            !EncryptionService.isEncrypted(integration.stripePublishableKey)) {
          updates.stripePublishableKey = EncryptionService.encrypt(integration.stripePublishableKey)
          console.log('  🔐 Encriptando Stripe Publishable Key')
          hasChanges = true
        }
        
        // Actualizar si hay cambios
        if (hasChanges) {
          await db.paymentIntegration.update({
            where: { id: integration.id },
            data: updates
          })
          migrated++
          console.log('  ✅ Migrado exitosamente')
        } else {
          skipped++
          console.log('  ⏭️  Ya está encriptado, omitiendo')
        }
        
      } catch (error: any) {
        errors++
        console.error(`  ❌ Error migrando usuario ${integration.userId}:`, error.message)
      }
    }
    
    // Resumen
    console.log('\n' + '='.repeat(50))
    console.log('📊 RESUMEN DE MIGRACIÓN')
    console.log('='.repeat(50))
    console.log(`✅ Migrados exitosamente: ${migrated}`)
    console.log(`⏭️  Omitidos (ya encriptados): ${skipped}`)
    console.log(`❌ Errores: ${errors}`)
    console.log(`📝 Total procesados: ${integrations.length}`)
    console.log('='.repeat(50))
    
    if (errors === 0) {
      console.log('\n🎉 ¡Migración completada exitosamente!')
    } else {
      console.log('\n⚠️  Migración completada con errores. Revisa los logs arriba.')
    }
    
  } catch (error: any) {
    console.error('\n❌ Error fatal en migración:', error.message)
    process.exit(1)
  }
}

// Ejecutar migración
console.log('🚀 Script de Migración de Credenciales')
console.log('📅 Fecha:', new Date().toLocaleString())
console.log('')

migrateCredentials()
  .catch((error) => {
    console.error('❌ Error no manejado:', error)
    process.exit(1)
  })
  .finally(() => {
    console.log('\n👋 Finalizando script...')
    setTimeout(() => process.exit(0), 1000)
  })
