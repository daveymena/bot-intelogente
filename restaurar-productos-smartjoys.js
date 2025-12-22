/**
 * Script para restaurar productos de dropshipping de SmartJoys
 * Productos típicos de tecnología y accesorios
 * Ejecutar: node restaurar-productos-smartjoys.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const productosSmartJoys = [
  // ==================== AUDÍFONOS ====================
  {
    name: "Audífonos Bluetooth TWS Pro",
    description: "🎧 Audífonos Bluetooth TWS Pro\n\n✅ Bluetooth 5.0\n✅ Cancelación de ruido\n✅ Estuche de carga\n✅ 20 horas de batería\n✅ Resistentes al agua IPX5\n\n🚚 Envío gratis a toda Colombia\n📦 Producto de dropshipping",
    price: 89900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"],
    tags: ["audifonos", "bluetooth", "tws", "dropshipping", "smartjoys"],
    stock: 50
  },

  {
    name: "Audífonos Gamer RGB con Micrófono",
    description: "🎮 Audífonos Gamer RGB\n\n✅ Sonido envolvente 7.1\n✅ Micrófono con cancelación de ruido\n✅ Iluminación RGB\n✅ Almohadillas cómodas\n✅ Compatible PC/PS4/Xbox\n\n🚚 Envío gratis",
    price: 129900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1599669454699-248893623440?w=800"],
    tags: ["audifonos", "gamer", "rgb", "dropshipping", "smartjoys"],
    stock: 30
  },

  // ==================== SMARTWATCHES ====================
  {
    name: "Smartwatch Serie 9 Plus Ultra",
    description: "⌚ Smartwatch Serie 9 Plus\n\n✅ Pantalla AMOLED 1.9\"\n✅ Monitor de salud completo\n✅ Llamadas Bluetooth\n✅ Resistente al agua IP68\n✅ Batería 7 días\n✅ +100 modos deportivos\n\n🚚 Envío gratis",
    price: 89000,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"],
    tags: ["smartwatch", "reloj", "tecnología", "dropshipping", "smartjoys"],
    stock: 50
  },

  {
    name: "Smartwatch Deportivo GPS",
    description: "⌚ Smartwatch Deportivo GPS\n\n✅ GPS integrado\n✅ Monitor cardíaco\n✅ Resistente al agua 5ATM\n✅ Batería 15 días\n✅ Notificaciones inteligentes\n\n🚚 Envío gratis",
    price: 149900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"],
    tags: ["smartwatch", "deportivo", "gps", "dropshipping", "smartjoys"],
    stock: 30
  },

  // ==================== PARLANTES ====================
  {
    name: "Parlante Bluetooth Portátil 20W",
    description: "🔊 Parlante Bluetooth Portátil\n\n✅ 20W de potencia\n✅ Bluetooth 5.0\n✅ Resistente al agua IPX7\n✅ Batería 12 horas\n✅ Luces LED\n\n🚚 Envío gratis",
    price: 79900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"],
    tags: ["parlante", "bluetooth", "speaker", "dropshipping", "smartjoys"],
    stock: 40
  },

  {
    name: "Parlante Karaoke con Micrófono",
    description: "🎤 Parlante Karaoke\n\n✅ 2 micrófonos inalámbricos\n✅ Bluetooth y USB\n✅ Luces LED disco\n✅ Control remoto\n✅ Batería recargable\n\n🚚 Envío gratis",
    price: 199900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800"],
    tags: ["parlante", "karaoke", "microfono", "dropshipping", "smartjoys"],
    stock: 20
  },

  // ==================== CARGADORES Y CABLES ====================
  {
    name: "Cargador Rápido 65W USB-C",
    description: "⚡ Cargador Rápido 65W\n\n✅ Carga rápida PD 3.0\n✅ 3 puertos (2 USB-C + 1 USB-A)\n✅ Compatible con laptops\n✅ Protección múltiple\n✅ Compacto y portátil\n\n🚚 Envío gratis",
    price: 69900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1591290619762-c588f0e0e3f9?w=800"],
    tags: ["cargador", "usb-c", "rapido", "dropshipping", "smartjoys"],
    stock: 60
  },

  {
    name: "Cable USB-C a Lightning 2m",
    description: "🔌 Cable USB-C a Lightning\n\n✅ Certificado MFi\n✅ Carga rápida 20W\n✅ 2 metros de largo\n✅ Trenzado reforzado\n✅ Compatible iPhone\n\n🚚 Envío gratis",
    price: 29900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800"],
    tags: ["cable", "usb-c", "lightning", "dropshipping", "smartjoys"],
    stock: 100
  },

  // ==================== POWER BANKS ====================
  {
    name: "Power Bank 20000mAh Carga Rápida",
    description: "🔋 Power Bank 20000mAh\n\n✅ 20000mAh capacidad\n✅ Carga rápida 22.5W\n✅ 3 puertos de salida\n✅ Display LED\n✅ Carga inalámbrica\n\n🚚 Envío gratis",
    price: 89900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800"],
    tags: ["powerbank", "bateria", "portatil", "dropshipping", "smartjoys"],
    stock: 50
  },

  {
    name: "Power Bank Solar 30000mAh",
    description: "☀️ Power Bank Solar 30000mAh\n\n✅ Panel solar integrado\n✅ 30000mAh capacidad\n✅ 4 puertos USB\n✅ Linterna LED\n✅ Resistente al agua\n\n🚚 Envío gratis",
    price: 119900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800"],
    tags: ["powerbank", "solar", "bateria", "dropshipping", "smartjoys"],
    stock: 30
  },

  // ==================== ACCESORIOS MÓVILES ====================
  {
    name: "Soporte Celular para Auto Magnético",
    description: "🚗 Soporte Magnético para Auto\n\n✅ Montaje magnético fuerte\n✅ Rotación 360°\n✅ Compatible con todos los celulares\n✅ Fácil instalación\n✅ No daña el celular\n\n🚚 Envío gratis",
    price: 39900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800"],
    tags: ["soporte", "auto", "magnetico", "dropshipping", "smartjoys"],
    stock: 80
  },

  {
    name: "Anillo de Luz LED para Selfies",
    description: "💡 Anillo de Luz LED\n\n✅ 10\" de diámetro\n✅ 3 modos de iluminación\n✅ Brillo ajustable\n✅ Trípode incluido\n✅ Control remoto Bluetooth\n\n🚚 Envío gratis",
    price: 59900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800"],
    tags: ["anillo", "luz", "led", "selfie", "dropshipping", "smartjoys"],
    stock: 40
  },

  // ==================== GAMING ====================
  {
    name: "Control Inalámbrico para PC/PS3/Android",
    description: "🎮 Control Inalámbrico Universal\n\n✅ Bluetooth y cable USB\n✅ Compatible PC/PS3/Android\n✅ Vibración dual\n✅ Batería recargable\n✅ Diseño ergonómico\n\n🚚 Envío gratis",
    price: 79900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800"],
    tags: ["control", "gaming", "inalambrico", "dropshipping", "smartjoys"],
    stock: 50
  },

  {
    name: "Mouse Gamer RGB 7200 DPI",
    description: "🖱️ Mouse Gamer RGB\n\n✅ 7200 DPI ajustable\n✅ 7 botones programables\n✅ Iluminación RGB\n✅ Cable trenzado\n✅ Sensor óptico preciso\n\n🚚 Envío gratis",
    price: 49900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1527814050087-3793815479db?w=800"],
    tags: ["mouse", "gamer", "rgb", "dropshipping", "smartjoys"],
    stock: 60
  },

  {
    name: "Teclado Mecánico RGB Gamer",
    description: "⌨️ Teclado Mecánico RGB\n\n✅ Switches mecánicos\n✅ Iluminación RGB personalizable\n✅ Anti-ghosting\n✅ Reposamuñecas\n✅ Cable USB trenzado\n\n🚚 Envío gratis",
    price: 149900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=800"],
    tags: ["teclado", "mecanico", "gamer", "rgb", "dropshipping", "smartjoys"],
    stock: 30
  },

  // ==================== CÁMARAS Y SEGURIDAD ====================
  {
    name: "Cámara de Seguridad WiFi 1080P",
    description: "📷 Cámara de Seguridad WiFi\n\n✅ Resolución 1080P Full HD\n✅ Visión nocturna\n✅ Detección de movimiento\n✅ Audio bidireccional\n✅ App móvil\n\n🚚 Envío gratis",
    price: 99900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800"],
    tags: ["camara", "seguridad", "wifi", "dropshipping", "smartjoys"],
    stock: 40
  },

  {
    name: "Webcam Full HD 1080P con Micrófono",
    description: "🎥 Webcam Full HD 1080P\n\n✅ Resolución 1080P\n✅ Micrófono estéreo\n✅ Enfoque automático\n✅ Clip universal\n✅ Compatible Windows/Mac\n\n🚚 Envío gratis",
    price: 79900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800"],
    tags: ["webcam", "camara", "streaming", "dropshipping", "smartjoys"],
    stock: 50
  },

  // ==================== ILUMINACIÓN ====================
  {
    name: "Tira LED RGB 5m con Control Remoto",
    description: "💡 Tira LED RGB 5 metros\n\n✅ 5 metros de longitud\n✅ RGB multicolor\n✅ Control remoto\n✅ Adhesivo 3M\n✅ Sincronización con música\n\n🚚 Envío gratis",
    price: 49900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1550985616-10810253b84d?w=800"],
    tags: ["led", "rgb", "iluminacion", "dropshipping", "smartjoys"],
    stock: 70
  },

  {
    name: "Lámpara de Escritorio LED Recargable",
    description: "💡 Lámpara LED de Escritorio\n\n✅ 3 niveles de brillo\n✅ Batería recargable\n✅ Cuello flexible\n✅ Protección ocular\n✅ Puerto USB\n\n🚚 Envío gratis",
    price: 59900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"],
    tags: ["lampara", "led", "escritorio", "dropshipping", "smartjoys"],
    stock: 40
  },

  // ==================== PROYECTORES ====================
  {
    name: "Proyector Portátil HY320 Android WiFi Bluetooth",
    description: "📽️ Proyector Portátil HY320\n\n✅ Android integrado\n✅ WiFi y Bluetooth\n✅ 1080P Full HD\n✅ Portátil y compacto\n✅ Control remoto\n✅ Altavoces integrados\n\n🚚 Envío gratis",
    price: 250000,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800"],
    tags: ["proyector", "android", "tecnología", "dropshipping", "smartjoys"],
    stock: 20
  }
]

async function restaurarSmartJoys() {
  console.log('🔄 ========================================')
  console.log('🔄 RESTAURANDO PRODUCTOS SMARTJOYS')
  console.log('🔄 ========================================\n')
  
  try {
    const usuario = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'daveymena16@gmail.com' },
          { email: 'deinermena25@gmail.com' }
        ]
      }
    })

    if (!usuario) {
      console.error('❌ No se encontró usuario admin')
      return
    }

    console.log(`✅ Usuario: ${usuario.email}`)
    console.log(`📦 Productos SmartJoys a restaurar: ${productosSmartJoys.length}\n`)

    let creados = 0
    let actualizados = 0
    let errores = 0

    for (const producto of productosSmartJoys) {
      try {
        const existente = await prisma.product.findFirst({
          where: {
            name: producto.name,
            userId: usuario.id
          }
        })

        if (existente) {
          await prisma.product.update({
            where: { id: existente.id },
            data: {
              description: producto.description,
              price: producto.price,
              currency: producto.currency,
              category: producto.category,
              status: producto.status,
              images: JSON.stringify(producto.images),
              tags: JSON.stringify(producto.tags),
              stock: producto.stock
            }
          })
          console.log(`🔄 Actualizado: ${producto.name}`)
          actualizados++
        } else {
          await prisma.product.create({
            data: {
              ...producto,
              images: JSON.stringify(producto.images),
              tags: JSON.stringify(producto.tags),
              userId: usuario.id
            }
          })
          console.log(`✅ Creado: ${producto.name}`)
          creados++
        }
      } catch (error) {
        console.error(`❌ Error con ${producto.name}:`, error.message)
        errores++
      }
    }

    console.log('\n📊 ========================================')
    console.log('📊 RESUMEN FINAL')
    console.log('📊 ========================================')
    console.log(`✅ Productos creados: ${creados}`)
    console.log(`🔄 Productos actualizados: ${actualizados}`)
    console.log(`❌ Errores: ${errores}`)
    console.log(`📦 Total procesados: ${productosSmartJoys.length}`)
    console.log('\n✅ ¡Productos SmartJoys restaurados!')

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restaurarSmartJoys()
