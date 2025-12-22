import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function arreglarLogin() {
  console.log('🔧 ARREGLANDO PROBLEMA DE LOGIN')
  console.log('=' .repeat(70))

  try {
    // Buscar usuario
    const usuario = await db.user.findFirst({
      where: {
        email: 'daveymena16@gmail.com'
      }
    })

    if (!usuario) {
      console.log('❌ Usuario no encontrado')
      console.log('💡 Creando usuario nuevo...')
      
      const hashedPassword = await bcrypt.hash('Davey2020', 10)
      
      const nuevoUsuario = await db.user.create({
        data: {
          email: 'daveymena16@gmail.com',
          password: hashedPassword,
          name: 'Davey Mena',
          role: 'OWNER',
          isActive: true,
          isEmailVerified: true
        }
      })

      console.log('✅ Usuario creado exitosamente')
      console.log(`   ID: ${nuevoUsuario.id}`)
      console.log(`   Email: ${nuevoUsuario.email}`)
      console.log(`   Rol: ${nuevoUsuario.role}`)
      console.log(`   Contraseña: Davey2020`)
      
    } else {
      console.log('✅ Usuario encontrado')
      console.log(`   ID: ${usuario.id}`)
      console.log(`   Email: ${usuario.email}`)
      console.log(`   Rol: ${usuario.role}`)
      console.log(`   Activo: ${usuario.isActive}`)
      
      // Resetear contraseña
      console.log('\n🔑 Reseteando contraseña...')
      const hashedPassword = await bcrypt.hash('Davey2020', 10)
      
      await db.user.update({
        where: { id: usuario.id },
        data: {
          password: hashedPassword,
          isActive: true,
          isEmailVerified: true
        }
      })

      console.log('✅ Contraseña reseteada exitosamente')
      console.log(`   Nueva contraseña: Davey2020`)
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ ARREGLO COMPLETADO')
    console.log('\n📝 CREDENCIALES DE LOGIN:')
    console.log('   Email: daveymena16@gmail.com')
    console.log('   Contraseña: Davey2020')
    console.log('\n💡 Ahora puedes iniciar sesión en: http://localhost:3000')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

arreglarLogin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
  })
