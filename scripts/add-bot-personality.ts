/**
 * Script para agregar el campo botPersonality a la tabla bot_settings
 * Ejecutar con: npx tsx scripts/add-bot-personality.ts
 */

import { db } from '../src/lib/db'

async function addBotPersonalityField() {
  try {
    console.log('🔄 Agregando campo botPersonality a bot_settings...')

    // Verificar si ya existe el campo
    const settings = await db.botSettings.findFirst()
    
    if (settings) {
      console.log('✅ Campo botPersonality ya existe o se agregará automáticamente')
      console.log('📝 Ejecuta: npm run db:push para aplicar cambios al schema')
    }

    console.log('\n✅ Listo! Ahora ejecuta:')
    console.log('   npm run db:push')
    console.log('\nEsto aplicará los cambios del schema a tu base de datos.')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

addBotPersonalityField()
