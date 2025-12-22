/**
 * ✅ VERIFICAR EMAIL DEL ADMIN
 * Marca el email como verificado para permitir acceso completo
 */

import { db } from '../src/lib/db'

async function verificarEmailAdmin() {
  console.log('📧 VERIFICANDO EMAIL DEL ADMINISTRADOR\n')
  
  try {
    // Buscar usuario admin
    const admin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (!admin) {
      console.error('❌ No se encontró usuario administrador')
      return
    }
    
    console.log(`👤 Usuario encontrado: ${admin.email}`)
    console.log(`   Nombre: ${admin.name || 'Sin nombre'}`)
    console.log(`   Email verificado: ${admin.isEmailVerified ? 'Sí' : 'No'}`)
    
    if (admin.isEmailVerified) {
      console.log('\n✅ El email ya está verificado. No se requiere acción.')
      return
    }
    
    // Verificar email
    const updated = await db.user.update({
      where: { id: admin.id },
      data: {
        isEmailVerified: true
      }
    })
    
    console.log('\n✅ EMAIL VERIFICADO EXITOSAMENTE')
    console.log(`   Email verificado: ${updated.isEmailVerified}`)
    console.log('\n🎉 El usuario admin ahora tiene acceso completo al sistema')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

verificarEmailAdmin()
