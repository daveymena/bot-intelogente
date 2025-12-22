/**
 * Script para verificar login
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function verificarLogin() {
  try {
    const email = 'daveymena16@gmail.com'
    const password = '671520Dvd.'

    console.log('🔐 Verificando login...')
    console.log('📧 Email:', email)
    console.log('🔑 Contraseña:', password)
    console.log('')

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('✅ Usuario encontrado')
    console.log('👤 Nombre:', user.name)
    console.log('💎 Membresía:', user.membershipType)
    console.log('👑 Rol:', user.role)
    console.log('')

    const isValid = await bcrypt.compare(password, user.password)

    if (isValid) {
      console.log('✅ ¡CONTRASEÑA CORRECTA!')
      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🎉 CREDENCIALES VERIFICADAS')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Email: daveymena16@gmail.com')
      console.log('🔑 Contraseña: 671520Dvd.')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    } else {
      console.log('❌ Contraseña incorrecta')
      console.log('⚠️  Regenerando contraseña...')
      
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Contraseña actualizada correctamente')
      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🎉 NUEVAS CREDENCIALES')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Email: daveymena16@gmail.com')
      console.log('🔑 Contraseña: 671520Dvd.')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarLogin()
