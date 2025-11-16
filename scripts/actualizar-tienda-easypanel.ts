#!/usr/bin/env npx tsx
/**
 * ACTUALIZAR TIENDA EN EASYPANEL
 * Sincroniza los cambios de la tienda con Easypanel
 */

import * as fs from 'fs'
import * as path from 'path'
import fetch from 'node-fetch'

async function actualizarTiendaEasypanel() {
  console.log('🚀 Actualizando tienda en Easypanel...\n')

  try {
    // Obtener variables de entorno
    const easypanelUrl = process.env.EASYPANEL_URL || 'http://localhost:3000'
    const easypanelToken = process.env.EASYPANEL_TOKEN

    if (!easypanelToken) {
      console.error('❌ EASYPANEL_TOKEN no configurado en .env')
      process.exit(1)
    }

    console.log(`📍 URL: ${easypanelUrl}`)
    console.log(`🔑 Token: ${easypanelToken.substring(0, 10)}...`)

    // 1. Obtener datos de la tienda local
    console.log('\n📂 Leyendo datos de la tienda local...')
    
    const tiendaPath = path.join(process.cwd(), 'src', 'app', 'tienda')
    const catalogoPath = path.join(process.cwd(), 'src', 'app', 'catalogo')

    if (!fs.existsSync(tiendaPath)) {
      console.error('❌ No encontrado: src/app/tienda')
      process.exit(1)
    }

    // 2. Leer archivos de configuración
    const pageTsPath = path.join(tiendaPath, 'page.tsx')
    const checkoutPath = path.join(tiendaPath, 'checkout', 'page.tsx')

    let tiendaConfig = {
      actualizado: new Date().toISOString(),
      archivos: {
        tienda: fs.existsSync(pageTsPath),
        checkout: fs.existsSync(checkoutPath),
        catalogo: fs.existsSync(catalogoPath)
      }
    }

    console.log('✅ Configuración leída:')
    console.log(`   - Tienda: ${tiendaConfig.archivos.tienda ? '✓' : '✗'}`)
    console.log(`   - Checkout: ${tiendaConfig.archivos.checkout ? '✓' : '✗'}`)
    console.log(`   - Catálogo: ${tiendaConfig.archivos.catalogo ? '✓' : '✗'}`)

    // 3. Enviar actualización a Easypanel
    console.log('\n📤 Enviando actualización a Easypanel...')

    const response = await fetch(`${easypanelUrl}/api/tienda/actualizar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${easypanelToken}`
      },
      body: JSON.stringify({
        tienda: tiendaConfig,
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`❌ Error: ${response.status}`)
      console.error(error)
      process.exit(1)
    }

    const resultado = await response.json()
    console.log('✅ Actualización enviada exitosamente')
    console.log(`   Respuesta: ${JSON.stringify(resultado, null, 2)}`)

    // 4. Verificar que se actualizó
    console.log('\n🔍 Verificando actualización...')

    const verifyResponse = await fetch(`${easypanelUrl}/api/tienda/status`, {
      headers: {
        'Authorization': `Bearer ${easypanelToken}`
      }
    })

    if (verifyResponse.ok) {
      const status = await verifyResponse.json()
      console.log('✅ Estado de la tienda:')
      console.log(`   - Última actualización: ${status.ultimaActualizacion}`)
      console.log(`   - Versión: ${status.version}`)
    }

    console.log('\n✨ Tienda actualizada en Easypanel')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

actualizarTiendaEasypanel()
