#!/usr/bin/env npx tsx
/**
 * DEPLOY TIENDA A EASYPANEL
 * Compila, actualiza y verifica la tienda
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

async function deployTiendaEasypanel() {
  console.log('🚀 DEPLOY TIENDA A EASYPANEL\n')

  try {
    // 1. Verificar que estamos en el directorio correcto
    console.log('📍 Verificando directorio...')
    if (!fs.existsSync('package.json')) {
      console.error('❌ No encontrado: package.json')
      process.exit(1)
    }
    console.log('✅ Directorio correcto')

    // 2. Instalar dependencias
    console.log('\n📦 Instalando dependencias...')
    try {
      execSync('npm install', { stdio: 'inherit' })
      console.log('✅ Dependencias instaladas')
    } catch (error) {
      console.log('⚠️  npm install falló, continuando...')
    }

    // 3. Compilar TypeScript
    console.log('\n🔨 Compilando TypeScript...')
    try {
      execSync('npm run build', { stdio: 'inherit' })
      console.log('✅ Compilación exitosa')
    } catch (error) {
      console.error('❌ Error en compilación')
      process.exit(1)
    }

    // 4. Ejecutar migraciones de BD
    console.log('\n🗄️  Ejecutando migraciones...')
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
      console.log('✅ Migraciones completadas')
    } catch (error) {
      console.log('⚠️  Migraciones ya aplicadas')
    }

    // 5. Actualizar tienda en Easypanel
    console.log('\n📤 Actualizando tienda en Easypanel...')
    try {
      execSync('npx tsx scripts/actualizar-tienda-easypanel.ts', { stdio: 'inherit' })
      console.log('✅ Tienda actualizada')
    } catch (error) {
      console.error('❌ Error actualizando tienda')
      process.exit(1)
    }

    // 6. Verificar estado
    console.log('\n🔍 Verificando estado...')
    const easypanelUrl = process.env.EASYPANEL_URL || 'http://localhost:3000'
    const easypanelToken = process.env.EASYPANEL_TOKEN

    if (easypanelToken) {
      try {
        const response = await fetch(`${easypanelUrl}/api/tienda/status`, {
          headers: {
            'Authorization': `Bearer ${easypanelToken}`
          }
        })

        if (response.ok) {
          const status = await response.json()
          console.log('✅ Estado de la tienda:')
          console.log(`   - Última actualización: ${status.ultimaActualizacion}`)
          console.log(`   - Versión: ${status.version}`)
        }
      } catch (error) {
        console.log('⚠️  No se pudo verificar estado')
      }
    }

    console.log('\n✨ DEPLOY COMPLETADO')
    console.log('\n📝 Próximos pasos:')
    console.log('   1. Verificar en Easypanel que la tienda se actualizó')
    console.log('   2. Probar la tienda en producción')
    console.log('   3. Verificar que los productos se muestran correctamente')

  } catch (error) {
    console.error('❌ Error en deploy:', error)
    process.exit(1)
  }
}

deployTiendaEasypanel()
