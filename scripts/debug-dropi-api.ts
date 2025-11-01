/**
 * 🔍 DEBUG DROPI API
 * Diagnostica la respuesta de la API de Dropi
 */

import dotenv from 'dotenv'
dotenv.config()

async function debugDropiAPI() {
  console.log('🔍 DIAGNÓSTICO DE API DROPI\n')
  console.log('='.repeat(70))

  const token = process.env.DROPI_AGENT_TOKEN
  const apiUrl = process.env.DROPI_API_URL || 'https://app.dropi.co/api/v1'

  console.log('\n📋 Configuración:')
  console.log('API URL:', apiUrl)
  console.log('Token:', token ? `${token.substring(0, 50)}...` : 'NO CONFIGURADO')

  if (!token) {
    console.log('\n❌ Token no configurado')
    process.exit(1)
  }

  console.log('\n' + '─'.repeat(70))

  // Probar diferentes endpoints
  const endpoints = [
    '/products',
    '/products?limit=1',
    '/api/products',
    '/v1/products',
    '',
  ]

  for (const endpoint of endpoints) {
    const url = `${apiUrl}${endpoint}`
    console.log(`\n🔌 Probando: ${url}`)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      console.log(`   Status: ${response.status} ${response.statusText}`)
      console.log(`   Content-Type: ${response.headers.get('content-type')}`)

      const text = await response.text()
      
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        console.log(`   ❌ Respuesta HTML (no JSON)`)
        console.log(`   Primeros 200 caracteres:`)
        console.log(`   ${text.substring(0, 200)}...`)
      } else {
        try {
          const json = JSON.parse(text)
          console.log(`   ✅ Respuesta JSON válida`)
          console.log(`   Datos:`, JSON.stringify(json, null, 2).substring(0, 500))
        } catch {
          console.log(`   ⚠️  Respuesta no es JSON ni HTML`)
          console.log(`   Contenido:`, text.substring(0, 200))
        }
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('\n💡 Posibles soluciones:')
  console.log('1. Verifica que la URL de la API sea correcta')
  console.log('2. Confirma que el token JWT sea válido')
  console.log('3. Revisa la documentación de Dropi para el endpoint correcto')
  console.log('4. Contacta a soporte de Dropi si el problema persiste')
  console.log('\n📚 Documentación Dropi: https://app.dropi.co/docs')
}

debugDropiAPI()
  .then(() => {
    console.log('\n✅ Diagnóstico completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
