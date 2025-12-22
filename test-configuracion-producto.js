/**
 * Test: Verificar que la configuración personalizada se carga en la página de producto
 * 
 * REQUISITO: El servidor debe estar corriendo en http://localhost:3000
 * Ejecuta primero: npm run dev
 */

async function testConfiguracionProducto() {
  console.log('🧪 Probando carga de configuración en página de producto...\n')

  try {
    // Verificar que el servidor esté corriendo
    console.log('🔍 Verificando servidor...')
    const healthCheck = await fetch('http://localhost:3000/api/products').catch(() => null)
    
    if (!healthCheck) {
      console.log('❌ ERROR: El servidor no está corriendo')
      console.log('\n📋 Para ejecutar este test:')
      console.log('   1. Abre otra terminal')
      console.log('   2. Ejecuta: npm run dev')
      console.log('   3. Espera a que inicie el servidor')
      console.log('   4. Vuelve a ejecutar: node test-configuracion-producto.js')
      return
    }
    
    console.log('✅ Servidor detectado\n')

    // 1. Obtener un producto de ejemplo
    const productRes = await fetch('http://localhost:3000/api/products')
    const productData = await productRes.json()
    
    if (!productData.products || productData.products.length === 0) {
      console.log('❌ No hay productos para probar')
      return
    }

    const producto = productData.products[0]
    console.log('📦 Producto de prueba:', {
      id: producto.id,
      nombre: producto.name,
      userId: producto.userId
    })

    // 2. Obtener configuración del usuario del producto
    const userId = producto.userId || 'default'
    const configRes = await fetch(`http://localhost:3000/api/store-settings/public?userId=${userId}`)
    const configData = await configRes.json()

    console.log('\n🎨 Configuración cargada:')
    console.log('  - Nombre tienda:', configData.settings?.storeName || 'No configurado')
    console.log('  - Slogan:', configData.settings?.storeSlogan || 'No configurado')
    console.log('  - Color primario:', configData.settings?.primaryColor || 'No configurado')
    console.log('  - Color secundario:', configData.settings?.secondaryColor || 'No configurado')
    console.log('  - Color acento:', configData.settings?.accentColor || 'No configurado')
    console.log('  - Logo:', configData.settings?.logo ? '✅ Configurado' : '❌ No configurado')

    // 3. Verificar que no sea la configuración por defecto
    if (configData.settings?.storeName === 'Smart Sales Bot') {
      console.log('\n⚠️  ADVERTENCIA: Aún se está usando la configuración por defecto')
      console.log('   Asegúrate de haber guardado tu configuración personalizada en el dashboard')
    } else {
      console.log('\n✅ Configuración personalizada detectada correctamente')
    }

    // 4. Simular la URL de la página de producto
    console.log(`\n🌐 URL de prueba: http://localhost:3000/tienda/producto/${producto.id}`)
    console.log('   Abre esta URL en tu navegador para verificar visualmente')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Ejecutar test
testConfiguracionProducto()
