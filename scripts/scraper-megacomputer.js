/**
 * 🕷️ Web Scraper para MegaComputer.com.co
 * Extrae productos automáticamente
 */

const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://megacomputer.com.co'

async function scrapeProductos() {
  try {
    console.log('🕷️ Iniciando scraping de MegaComputer...\n')

    // Obtener la página principal
    console.log('📡 Conectando a', BASE_URL)
    const { data } = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(data)
    const productos = []

    // Buscar productos en la página
    // Nota: Necesitamos inspeccionar la estructura HTML real
    $('.product-item, .producto, .item-producto').each((i, elem) => {
      const producto = {
        nombre: $(elem).find('.product-name, .nombre, h3, h4').first().text().trim(),
        precio: $(elem).find('.price, .precio').first().text().trim(),
        imagen: $(elem).find('img').first().attr('src'),
        link: $(elem).find('a').first().attr('href'),
        descripcion: $(elem).find('.description, .descripcion').first().text().trim()
      }

      if (producto.nombre) {
        productos.push(producto)
      }
    })

    console.log(`✅ Encontrados ${productos.length} productos\n`)

    // Guardar en JSON
    const outputPath = path.join(__dirname, 'productos-megacomputer.json')
    fs.writeFileSync(outputPath, JSON.stringify(productos, null, 2))
    
    console.log('💾 Productos guardados en:', outputPath)
    console.log('\n📋 Primeros 5 productos:')
    productos.slice(0, 5).forEach((p, i) => {
      console.log(`${i + 1}. ${p.nombre} - ${p.precio}`)
    })

    return productos

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Headers:', error.response.headers)
    }
    
    throw error
  }
}

// Ejecutar
scrapeProductos()
  .then(() => console.log('\n✅ Scraping completado'))
  .catch(err => console.error('\n❌ Error fatal:', err))
