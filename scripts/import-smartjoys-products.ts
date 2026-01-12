import { db } from '../src/lib/db'
import * as cheerio from 'cheerio'

/**
 * Script para extraer productos de https://smartjoys.co/
 * y agregarlos a la base de datos
 */

interface ScrapedProduct {
  name: string
  url: string
  price?: number
  image?: string
  description?: string
  category?: string
}

// Lista de URLs de productos extraídos de la página
const productUrls = [
  'https://smartjoys.co/producto/combo-celular-infantil-q13-camara-infantil-de-dinosaurio/',
  'https://smartjoys.co/producto/combo-kit-de-arte-145-piezas-lapiz-3d/',
  'https://smartjoys.co/producto/kit-cartera-de-maquillaje-infantil-diamante/',
  'https://smartjoys.co/producto/kit-de-maquillaje-carroza-para-ninas/',
  'https://smartjoys.co/producto/audifonos-airpods-pro-3-1-1/',
  'https://smartjoys.co/producto/combo-kemei-2-en-1-recortadora-afeitadora-km-1559/',
  'https://smartjoys.co/producto/consola-de-videojuegos-g7-tv-box/',
  'https://smartjoys.co/producto/xiaomi-smart-band-10/',
  'https://smartjoys.co/producto/cepillo-electrico-secador-y-modelador-7-en-1-re-2587/',
  'https://smartjoys.co/producto/soporte-tripode-ajustable-para-parlante-hasta-110cm/',
  'https://smartjoys.co/producto/cable-tipo-c-a-tipo-c-carga-rapida-1hora-cab252/',
  'https://smartjoys.co/producto/audifonos-alambricos-deep-bass-3-5mm-1hora-aut117/',
  'https://smartjoys.co/producto/cargador-adaptador-carga-rapida-tipo-c-30w-gar164/',
  'https://smartjoys.co/producto/audifonos-alambricos-deep-bass-3-5mm-1hora-aut123/',
  'https://smartjoys.co/producto/taladro-percutor-atornillador-recargable-2-baterias/',
  'https://smartjoys.co/producto/camara-de-seguridad-doble-lente-v380-gris/',
  'https://smartjoys.co/producto/combo-2-intercomunicadores-para-casco-de-moto-q58-max/',
  'https://smartjoys.co/producto/combo-para-ninos-mini-kr-818-smartwatch-consola-audifonos/',
  'https://smartjoys.co/producto/combo-tecnologia-5-en-1-k16/',
  'https://smartjoys.co/producto/compresor-de-aire-electrico-atj-8466/',
  'https://smartjoys.co/producto/convertidor-tv-box-con-magis-tv/',
  'https://smartjoys.co/producto/hidrolavadora-amarilla-inalambrica-portatil-recargable-bateria-48v/',
  'https://smartjoys.co/producto/juego-de-copas-ratchet-trabajo-liviano-x-46-piezas/',
  'https://smartjoys.co/producto/juguete-de-dinosaurio-t-rex-con-control-remoto/',
  'https://smartjoys.co/producto/organizador-escurridor-de-platos-65-cm-doble-puerta/',
  'https://smartjoys.co/producto/combo-entretenimiento-proyector-hy300-smarttv-stick-watch-onn-full-hd/',
  'https://smartjoys.co/producto/combo-hidrolavadora-inalambrica-compresor-czk-3665-intercomunicador-q58-max/',
  'https://smartjoys.co/producto/combo-2-pares-de-audifonos-f9-5/',
  'https://smartjoys.co/producto/audifonos-samsung-galaxy-buds3/',
  'https://smartjoys.co/producto/lampara-cubo-de-tulipanes-infinitos/',
  'https://smartjoys.co/producto/audifonos-ultrapods-pro/',
  'https://smartjoys.co/producto/consola-juegos-inalambrica-game-stick-m15/',
  'https://smartjoys.co/producto/celular-inteligente-para-ninos/',
  'https://smartjoys.co/producto/kit-de-arte-con-maleta-de-lujo-145-piezas/',
  'https://smartjoys.co/producto/depiladora-laser-ipl/',
  'https://smartjoys.co/producto/consola-de-videojuegos-portatil-r36s/',
  'https://smartjoys.co/producto/hidrolavadora-inalambrica-2-baterias-48v-boquilla-6-en-1/',
  'https://smartjoys.co/producto/pistola-de-hidrogel-shooting-elite-st708b/',
  'https://smartjoys.co/producto/smartwatch-g-tide-r5-3-manillas/',
  'https://smartjoys.co/producto/marcadores-264-piezas-doble-punta-base-de-alcohol/',
  'https://smartjoys.co/producto/combo-k20-2-reloj-inteligente-audifonos/',
  'https://smartjoys.co/producto/audifonos-deportivos-inalambricos-movisun-s-1/',
  'https://smartjoys.co/producto/smartwatch-h10-ultra-plus-con-7-pulsos/',
  'https://smartjoys.co/producto/mouse-inalambrico-ultra-silencioso-1hora-rat001/',
  'https://smartjoys.co/producto/decodificador-tv-digital-terrestre-tdt-dxg-2526/',
  'https://smartjoys.co/producto/parlante-bearbrick-oso-b5/',
  'https://smartjoys.co/producto/audifonos-realme-buds-t100/',
  'https://smartjoys.co/producto/proyector-led-vf260/',
  'https://smartjoys.co/producto/cepillo-modelador-giratorio-3-en-1-new-turbo-plus-2300/',
]

async function scrapeProduct(url: string): Promise<ScrapedProduct | null> {
  try {
    console.log(`📥 Extrayendo: ${url}`)
    
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    // Extraer nombre del producto
    const name = $('h1.product_title').text().trim() || 
                 $('.product-title').text().trim() ||
                 $('meta[property="og:title"]').attr('content') || ''

    // Extraer precio
    let price = 0
    const priceText = $('.woocommerce-Price-amount').first().text() ||
                     $('.price').first().text() ||
                     $('meta[property="product:price:amount"]').attr('content') || '0'
    
    // Limpiar precio y convertir a número
    price = parseInt(priceText.replace(/[^\d]/g, '')) || 0

    // Extraer imagen
    const image = $('.woocommerce-product-gallery__image img').first().attr('src') ||
                 $('.product-image img').first().attr('src') ||
                 $('meta[property="og:image"]').attr('content') || ''

    // Extraer descripción
    const description = $('.woocommerce-product-details__short-description').text().trim() ||
                       $('.product-description').text().trim() ||
                       $('meta[property="og:description"]').attr('content') || ''

    // Determinar categoría basada en el nombre
    let category = 'PHYSICAL'
    if (name.toLowerCase().includes('curso') || 
        name.toLowerCase().includes('pack') ||
        name.toLowerCase().includes('digital')) {
      category = 'DIGITAL'
    }

    if (!name) {
      console.log(`⚠️ No se pudo extraer el nombre de: ${url}`)
      return null
    }

    return {
      name,
      url,
      price,
      image,
      description: description.substring(0, 500), // Limitar descripción
      category: category as any
    }

  } catch (error) {
    console.error(`❌ Error extrayendo ${url}:`, error)
    return null
  }
}

async function importProducts() {
  try {
    console.log('🚀 Iniciando extracción de productos de SmartJoys...\n')

    // Obtener usuario admin
    const user = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!user) {
      console.log('❌ No se encontró usuario admin')
      return
    }

    console.log(`👤 Importando para usuario: ${user.email}\n`)

    let imported = 0
    let skipped = 0
    let errors = 0

    for (const url of productUrls) {
      const productData = await scrapeProduct(url)

      if (!productData) {
        errors++
        continue
      }

      // Verificar si ya existe
      const existing = await db.product.findFirst({
        where: {
          name: productData.name,
          userId: user.id
        }
      })

      if (existing) {
        console.log(`⏭️  Ya existe: ${productData.name}`)
        skipped++
        continue
      }

      // Crear producto
      await db.product.create({
        data: {
          name: productData.name,
          description: productData.description || '',
          price: productData.price,
          currency: 'COP',
          category: productData.category as any,
          status: 'AVAILABLE',
          images: productData.image ? JSON.stringify([productData.image]) : null,
          userId: user.id,
          mainCategory: 'Tecnología', // Se puede mejorar con categorización automática
          stock: 100
        }
      })

      console.log(`✅ Importado: ${productData.name} - $${productData.price.toLocaleString()}`)
      imported++

      // Esperar un poco entre requests para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`\n📊 Resumen:`)
    console.log(`  ✅ Importados: ${imported}`)
    console.log(`  ⏭️  Omitidos (ya existían): ${skipped}`)
    console.log(`  ❌ Errores: ${errors}`)
    console.log(`  📦 Total procesados: ${productUrls.length}`)

  } catch (error) {
    console.error('❌ Error en importación:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  importProducts()
}

export { importProducts, scrapeProduct }
