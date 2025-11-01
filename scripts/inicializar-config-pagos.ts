/**
 * 🚀 INICIALIZAR CONFIGURACIÓN DE PAGOS
 * Crea configuración por defecto para usuarios existentes
 */

import { db } from '../src/lib/db'

async function inicializarConfigPagos() {
  console.log('🚀 INICIALIZANDO CONFIGURACIÓN DE PAGOS\n')
  
  try {
    // Obtener todos los usuarios
    const users = await db.user.findMany({
      include: { paymentConfig: true }
    })

    console.log(`📊 Usuarios encontrados: ${users.length}\n`)

    for (const user of users) {
      if (user.paymentConfig) {
        console.log(`✅ ${user.email}: Ya tiene configuración`)
        continue
      }

      // Crear configuración por defecto
      await db.paymentConfig.create({
        data: {
          userId: user.id,
          // Los valores por defecto ya están en el schema
        }
      })

      console.log(`✨ ${user.email}: Configuración creada`)
    }

    console.log('\n✅ INICIALIZACIÓN COMPLETADA')
    console.log('\n📝 Los usuarios ahora pueden:')
    console.log('   1. Ir a Dashboard → Configuración de Pagos')
    console.log('   2. Activar/desactivar métodos')
    console.log('   3. Agregar sus credenciales')
    console.log('   4. El bot usará automáticamente la configuración')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

inicializarConfigPagos()
