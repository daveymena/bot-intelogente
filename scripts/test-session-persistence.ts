/**
 * Script para probar la persistencia de sesión
 * 
 * Este script simula el flujo completo de autenticación
 * y verifica que la sesión persista correctamente
 */

import fetch from 'node-fetch'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface TestResult {
  test: string
  passed: boolean
  message: string
}

const results: TestResult[] = []

async function testLogin() {
  console.log('\n🧪 Test 1: Login y establecimiento de cookies')
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    })

    const data = await response.json()
    const cookies = response.headers.get('set-cookie')

    if (response.ok && cookies) {
      console.log('✅ Login exitoso')
      console.log('🍪 Cookies establecidas:', cookies)
      
      results.push({
        test: 'Login',
        passed: true,
        message: 'Login exitoso y cookies establecidas'
      })

      return cookies
    } else {
      console.log('❌ Login falló:', data)
      results.push({
        test: 'Login',
        passed: false,
        message: `Login falló: ${data.error || 'Unknown error'}`
      })
      return null
    }
  } catch (error) {
    console.error('❌ Error en login:', error)
    results.push({
      test: 'Login',
      passed: false,
      message: `Error: ${error}`
    })
    return null
  }
}

async function testSessionVerification(cookies: string) {
  console.log('\n🧪 Test 2: Verificación de sesión con cookies')
  
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Cookie': cookies
      }
    })

    const data = await response.json()

    if (response.ok && data.user) {
      console.log('✅ Sesión verificada correctamente')
      console.log('👤 Usuario:', data.user.email)
      console.log('📊 Suscripción:', data.subscription)
      
      results.push({
        test: 'Session Verification',
        passed: true,
        message: 'Sesión verificada correctamente'
      })
      return true
    } else {
      console.log('❌ Verificación de sesión falló:', data)
      results.push({
        test: 'Session Verification',
        passed: false,
        message: `Verificación falló: ${data.error || 'Unknown error'}`
      })
      return false
    }
  } catch (error) {
    console.error('❌ Error en verificación:', error)
    results.push({
      test: 'Session Verification',
      passed: false,
      message: `Error: ${error}`
    })
    return false
  }
}

async function testSessionPersistence(cookies: string) {
  console.log('\n🧪 Test 3: Persistencia de sesión (simulando cambio de app)')
  
  // Simular espera de 2 segundos (como si cambiaras de app)
  console.log('⏳ Esperando 2 segundos...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Cookie': cookies
      }
    })

    const data = await response.json()

    if (response.ok && data.user) {
      console.log('✅ Sesión persiste después de "cambio de app"')
      console.log('👤 Usuario sigue autenticado:', data.user.email)
      
      results.push({
        test: 'Session Persistence',
        passed: true,
        message: 'Sesión persiste correctamente'
      })
      return true
    } else {
      console.log('❌ Sesión no persiste:', data)
      results.push({
        test: 'Session Persistence',
        passed: false,
        message: 'Sesión no persiste después de cambio de app'
      })
      return false
    }
  } catch (error) {
    console.error('❌ Error en persistencia:', error)
    results.push({
      test: 'Session Persistence',
      passed: false,
      message: `Error: ${error}`
    })
    return false
  }
}

async function testLogout(cookies: string) {
  console.log('\n🧪 Test 4: Logout y limpieza de sesión')
  
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': cookies
      }
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Logout exitoso')
      
      // Verificar que la sesión ya no existe
      const verifyResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Cookie': cookies
        }
      })

      if (verifyResponse.status === 401) {
        console.log('✅ Sesión correctamente eliminada')
        results.push({
          test: 'Logout',
          passed: true,
          message: 'Logout exitoso y sesión eliminada'
        })
        return true
      } else {
        console.log('⚠️ Sesión aún existe después de logout')
        results.push({
          test: 'Logout',
          passed: false,
          message: 'Sesión no fue eliminada correctamente'
        })
        return false
      }
    } else {
      console.log('❌ Logout falló:', data)
      results.push({
        test: 'Logout',
        passed: false,
        message: `Logout falló: ${data.error || 'Unknown error'}`
      })
      return false
    }
  } catch (error) {
    console.error('❌ Error en logout:', error)
    results.push({
      test: 'Logout',
      passed: false,
      message: `Error: ${error}`
    })
    return false
  }
}

async function runTests() {
  console.log('🚀 Iniciando tests de persistencia de sesión...')
  console.log('📍 API URL:', API_URL)
  console.log('=' .repeat(60))

  // Test 1: Login
  const cookies = await testLogin()
  if (!cookies) {
    console.log('\n❌ No se pudo continuar sin cookies')
    printResults()
    return
  }

  // Test 2: Verificación de sesión
  await testSessionVerification(cookies)

  // Test 3: Persistencia
  await testSessionPersistence(cookies)

  // Test 4: Logout
  await testLogout(cookies)

  // Imprimir resultados
  printResults()
}

function printResults() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESULTADOS DE LOS TESTS')
  console.log('='.repeat(60))

  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`\n${index + 1}. ${icon} ${result.test}`)
    console.log(`   ${result.message}`)
  })

  const passed = results.filter(r => r.passed).length
  const total = results.length

  console.log('\n' + '='.repeat(60))
  console.log(`📈 Total: ${passed}/${total} tests pasados`)
  console.log('='.repeat(60))

  if (passed === total) {
    console.log('\n🎉 ¡Todos los tests pasaron! La persistencia de sesión funciona correctamente.')
  } else {
    console.log('\n⚠️ Algunos tests fallaron. Revisa los errores arriba.')
  }
}

// Ejecutar tests
runTests().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
