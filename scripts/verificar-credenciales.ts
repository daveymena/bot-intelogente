/**
 * 🔍 VERIFICAR CREDENCIALES DE LOGIN
 */

import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function verificarCredenciales() {
  console.log('🔍 VERIFICANDO CREDENCIALES\n')

  try {
    // Obtener todos los usuarios
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    })

    console.log(`📊 Total de usuarios: ${users.length}\n`)

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos')
      console.log('\n💡 Crea un usuario con:')
      console.log('   npx tsx scripts/create-admin-user.ts')
      return
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. Usuario:`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Nombre: ${user.name || 'Sin nombre'}`)
      console.log(`   Rol: ${user.role}`)
      console.log(`   Password hash: ${user.password.substring(0, 20)}...`)
      console.log()
    })

    // Probar login con credenciales comunes
    console.log('🧪 PROBANDO CREDENCIALES COMUNES:\n')

    const testCredentials = [
      { email: 'admin@admin.com', password: 'admin123' },
      { email: 'admin@tecnovariedades.com', password: 'admin123' },
      { email: 'deinermen25@gmail.com', password: 'admin123' }
    ]

    for (const cred of testCredentials) {
      const user = users.find(u => u.email === cred.email)
      
      if (user) {
        const isValid = await bcrypt.compare(cred.password, user.password)
        console.log(`${isValid ? '✅' : '❌'} ${cred.email} / ${cred.password}`)
      } else {
        console.log(`⚠️  ${cred.email} - No existe`)
      }
    }

    console.log('\n💡 PARA RESETEAR PASSWORD:')
    console.log('   npx tsx scripts/reset-admin-password.ts')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verificarCredenciales()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
