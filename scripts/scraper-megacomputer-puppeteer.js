/**
 * 🕷️ Web Scraper Avanzado para MegaComputer con Puppeteer
 * Maneja sitios con JavaScript
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://megacomputer.com.co'

async function scrapeConPuppeteer() {
  let browser
  
  try {
    console.log('🕷️ Iniciando scraping avanzado de MegaComputer...\n')

    // Lanzar navegador
    console.log('🌐 Abriendo navegador...')
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    
    // Configurar user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    console.log('📡 Navegando a', BASE_URL)
    await page.goto(BASE_URL, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })

    console.log('⏳ Esperando que carguen los productos...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Extraer productos
    const productos = await page.evaluate(() => {
      const items = []
      
      // Intentar múltiples selectores comunes
      const selectores = [
        '.product-item',
        '.producto',
        '.item-producto',
        '[class*="product"]',
        '[class*="item"]',
        'article',
        '.card'
      ]

      let elementos = []
      for (const selector of selectores) {
        elementos = document.querySelectorAll(selector)
        if (elementos.length > 0) {
          console.log(`Encontrados ${elementos.length} elementos con selector: ${selector}`)
          break
        }
      }

      elementos.forEach(elem => {
        // Buscar nombre
        const nombre = 
          elem.querySelector('.product-name, .nombre, h3, h4, h2, .title')?.textContent?.trim() ||
          elem.querySelector('a')?.getAttribute('title') ||
          ''

        // Buscar precio
        const precioText = 
          elem.querySelector('.price, .precio, [class*="price"], [class*="precio"]')?.textContent?.trim() ||
          ''

        // Buscar imagen
        const img = elem.querySelector('img')
        const imagen = img?.src || img?.getAttribute('data-src') || ''

        // Buscar link
        const link = elem.querySelector('a')?.href || ''

        // Buscar descripción
        const descripcion = 
          elem.querySelector('.description, .descripcion, p')?.textContent?.trim() ||
          ''

        if (nombre || precioText) {
          items.push({
            nombre,
            precio: precioText,
            imagen,
            link,
            descripcion
          })
        }
      })

      return items
    })

    console.log(`✅ Encontrados ${productos.length} productos\n`)

    if (productos.length === 0) {
      // Guardar HTML para análisis
      const html = await page.content()
      const htmlPath = path.join(__dirname, 'megacomputer-page.html')
      fs.writeFileSync(htmlPath, html)
      console.log('📄 HTML guardado en:', htmlPath)
      console.log('   Revisa este archivo para ver la estructura del sitio')
    }

    // Guardar productos
    const outputPath = path.join(__dirname, 'productos-megacomputer.json')
    fs.writeFileSync(outputPath, JSON.stringify(productos, null, 2))
    
    console.log('💾 Productos guardados en:', outputPath)
    
    if (productos.length > 0) {
      console.log('\n📋 Primeros 10 productos:')
      productos.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.nombre}`)
        console.log(`   Precio: ${p.precio}`)
        console.log(`   Link: ${p.link}`)
        console.log('')
      })
    }

    await browser.close()
    return productos

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (browser) await browser.close()
    throw error
  }
}

// Ejecutar
scrapeConPuppeteer()
  .then(productos => {
    console.log(`\n✅ Scraping completado: ${productos.length} productos extraídos`)
    
    if (productos.length === 0) {
      console.log('\n💡 SIGUIENTE PASO:')
      console.log('   1. Revisa el archivo megacomputer-page.html')
      console.log('   2. Identifica los selectores CSS correctos')
      console.log('   3. Actualiza el script con los selectores correctos')
    } else {
      console.log('\n💡 SIGUIENTE PASO:')
      console.log('   Ejecuta: npx tsx scripts/importar-desde-json.ts')
      console.log('   Para importar los productos a la base de datos')
    }
  })
  .catch(err => console.error('\n❌ Error fatal:', err))
