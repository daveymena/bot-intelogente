/**
 * 🕷️ Scraper Completo de MegaComputer
 * Extrae productos de todas las categorías
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://megacomputer.com.co'

async function scrapeCategoria(page, url, nombreCategoria) {
  try {
    console.log(`\n📂 Scrapeando categoría: ${nombreCategoria}`)
    console.log(`   URL: ${url}`)
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await new Promise(resolve => setTimeout(resolve, 2000))

    const productos = await page.evaluate(() => {
      const items = []
      
      // Selectores específicos para WooCommerce (común en tiendas)
      const productElements = document.querySelectorAll(
        '.product, .type-product, [class*="product-item"], article.post'
      )

      productElements.forEach(elem => {
        const nombre = 
          elem.querySelector('.woocommerce-loop-product__title, h2, h3, .product-title')?.textContent?.trim() ||
          elem.querySelector('a')?.getAttribute('title') ||
          ''

        const precioElem = elem.querySelector('.price, .amount, [class*="price"]')
        const precio = precioElem?.textContent?.trim() || ''

        const imgElem = elem.querySelector('img')
        const imagen = imgElem?.src || imgElem?.getAttribute('data-src') || ''

        const linkElem = elem.querySelector('a')
        const link = linkElem?.href || ''

        if (nombre && nombre.length > 3) {
          items.push({
            nombre,
            precio,
            imagen,
            link,
            categoria: ''
          })
        }
      })

      return items
    })

    console.log(`   ✅ Encontrados ${productos.length} productos`)
    return productos.map(p => ({ ...p, categoria: nombreCategoria }))

  } catch (error) {
    console.error(`   ❌ Error en categoría ${nombreCategoria}:`, error.message)
    return []
  }
}

async function scrapeCompleto() {
  let browser
  
  try {
    console.log('🕷️ Iniciando scraping completo de MegaComputer...\n')

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

    // Categorías principales a scrapear
    const categorias = [
      { nombre: 'Portátiles', url: `${BASE_URL}/categoria-producto/computadores/portatiles/` },
      { nombre: 'Monitores', url: `${BASE_URL}/categoria-producto/monitores/` },
      { nombre: 'Mouse', url: `${BASE_URL}/categoria-producto/accesorios/mouse/` },
      { nombre: 'Teclados', url: `${BASE_URL}/categoria-producto/accesorios/teclados/` },
      { nombre: 'Diademas', url: `${BASE_URL}/categoria-producto/zona-gaming/diademas-gaming/` },
      { nombre: 'Impresoras', url: `${BASE_URL}/categoria-producto/impresoras-scanners/` },
      { nombre: 'Parlantes', url: `${BASE_URL}/categoria-producto/audio-video/parlantes/` }
    ]

    let todosLosProductos = []

    for (const cat of categorias) {
      const productos = await scrapeCategoria(page, cat.url, cat.nombre)
      todosLosProductos = todosLosProductos.concat(productos)
      
      // Pausa entre categorías para no saturar el servidor
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`\n✅ Total de productos extraídos: ${todosLosProductos.length}`)

    // Guardar productos
    const outputPath = path.join(__dirname, 'productos-megacomputer-completo.json')
    fs.writeFileSync(outputPath, JSON.stringify(todosLosProductos, null, 2))
    
    console.log('💾 Productos guardados en:', outputPath)
    
    // Mostrar resumen por categoría
    console.log('\n📊 Resumen por categoría:')
    const resumen = {}
    todosLosProductos.forEach(p => {
      resumen[p.categoria] = (resumen[p.categoria] || 0) + 1
    })
    Object.entries(resumen).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} productos`)
    })

    // Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de productos extraídos:')
    todosLosProductos.slice(0, 5).forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.nombre}`)
      console.log(`   Categoría: ${p.categoria}`)
      console.log(`   Precio: ${p.precio}`)
      console.log(`   Link: ${p.link}`)
    })

    await browser.close()
    return todosLosProductos

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (browser) await browser.close()
    throw error
  }
}

// Ejecutar
scrapeCompleto()
  .then(productos => {
    console.log(`\n🎉 Scraping completado exitosamente!`)
    console.log(`📦 ${productos.length} productos listos para importar`)
    console.log('\n💡 SIGUIENTE PASO:')
    console.log('   Ejecuta: npx tsx scripts/importar-megacomputer-db.ts')
    console.log('   Para importar los productos a la base de datos')
  })
  .catch(err => console.error('\n❌ Error fatal:', err))
