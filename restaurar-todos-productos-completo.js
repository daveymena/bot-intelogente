/**
 * Script para restaurar TODOS los productos con fotos
 * Incluye: Curso Piano, Laptops MegaComputer, Megapacks, Dropshipping, Moto, etc.
 * Ejecutar: node restaurar-todos-productos-completo.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const productosCompletos = [
  // ==================== CURSO DE PIANO ====================
  {
    name: "Curso Completo de Piano Online",
    description: "🎵 Curso de Piano Completo: Desde Cero hasta Nivel Avanzado 🎹\n\n✅ +80 lecciones en video HD\n✅ 157 recursos descargables\n✅ Acceso de por vida\n✅ Soporte personalizado\n\n🎼 Aprende estilos: Clásico, Balada, Pop, Blues, Jazz\n📚 19 secciones | 283 clases | 18h 55min\n\n🎯 Para principiantes y avanzados\n💡 Método progresivo y fácil de seguir\n🎁 Certificado al finalizar",
    price: 60000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: [
      "/fotos/curso de piano completo .jpg",
      "https://img-c.udemycdn.com/course/750x422/5428206_5f0e_2.jpg"
    ],
    tags: ["curso", "piano", "música", "digital", "online", "lecciones"],
    stock: 999,
    paymentLinkCustom: "https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205"
  },

  // ==================== LAPTOPS MEGACOMPUTER ====================
  {
    name: "Portatil Asus Vivobook Go 15 E1504fa-Nj1961 Amd Ryzen 3 7320u Ram 8gb Ddr5 512 Ssd Pantalla 15.6 Fhd",
    description: "💻 Laptop ASUS VivoBook GO 15\n\n✅ AMD Ryzen 3 7320U\n✅ 8GB DDR5 RAM\n✅ 512GB SSD\n✅ Pantalla 15.6\" FHD\n✅ FreeDOS\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 1329900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "https://megacomputer.com.co/wp-content/uploads/2025/07/1-2025-07-31T165914.749.webp"
    ],
    tags: ["laptop", "portatil", "computador", "asus", "nuevo", "garantia", "ryzen"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-asus-vivobook-go-15-e1504fa-nj1961-amd-ryzen-3-7320u-ram-8gb-ddr5-512-ssd-pantalla-15-6-fhd/"
  },

  {
    name: "Portatil Asus Vivobook 15 X1502za-Ej2443 Intel core I5-12500h Ram 8gb Ddr4 512gb Ssd Pantalla 15.6",
    description: "💻 Laptop ASUS VivoBook 15\n\n✅ Intel Core i5-12500H\n✅ 8GB DDR4 RAM\n✅ 512GB SSD\n✅ Pantalla 15.6\" FHD\n✅ FreeDOS\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 1749900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "https://megacomputer.com.co/wp-content/uploads/2025/04/1-2025-04-15T112035.293.webp"
    ],
    tags: ["laptop", "portatil", "computador", "asus", "nuevo", "garantia", "intel", "i5"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-asus-vivobook-15-x1502za-ej2443-intel-core-i5-12500h-ram-8gb-ddr4-512gb-ssd-pantalla-15-6/"
  },

  {
    name: "Portátil Asus Vivobook Go 15 E1504FA-NJ1382 Amd Ryzen 5 7520u Pantalla 15.6 Ram 16gb Ddr5 512 Ssd",
    description: "💻 Laptop ASUS VivoBook GO 15\n\n✅ AMD Ryzen 5 7520U\n✅ 16GB DDR5 RAM\n✅ 512GB SSD\n✅ Pantalla 15.6\" FHD\n✅ FreeDOS\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 1769900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "https://megacomputer.com.co/wp-content/uploads/2025/03/1-2025-03-22T091807.126.webp"
    ],
    tags: ["laptop", "portatil", "computador", "asus", "nuevo", "garantia", "ryzen"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-asus-vivobook-go-15-e1504fa-nj1382-amd-ryzen-5-7520u-obsequio-morral/"
  },

  {
    name: "Macbook Pro M4 Pro Max 24gb Ram 512gb Ssd Pantalla 14\" Retina Xdr Mac os Space Black",
    description: "💻 MacBook Pro M4 Pro Max\n\n✅ Chip M4 Pro Max\n✅ 24GB RAM\n✅ 512GB SSD\n✅ Pantalla 14\" Retina XDR\n✅ macOS\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 10899900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "https://megacomputer.com.co/wp-content/uploads/2025/10/1-16.webp"
    ],
    tags: ["laptop", "portatil", "computador", "apple", "macbook", "nuevo", "garantia"],
    stock: 2,
    paymentLinkCustom: "https://megacomputer.com.co/producto/macbook-pro-m4-pro-max-24gb-ram-512gb-ssd-pantalla-14-retina-xdr-mac-os-space-black/"
  },

  // ==================== IMPRESORAS MEGACOMPUTER ====================
  {
    name: "Impresora Hp Laserjet M111W Monocromática",
    description: "🖨️ Impresora HP LaserJet M111W\n\n✅ Monocromática\n✅ WiFi\n✅ Compacta\n✅ Ideal para oficina\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 585900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "https://megacomputer.com.co/wp-content/uploads/2024/02/111W-1.png"
    ],
    tags: ["impresora", "printer", "oficina", "hp", "nuevo", "garantia"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/impresora-hp-laserjet-m111w-monocromatica/"
  },

  {
    name: "Impresora Epson Ecotank L1250 Imprime (Copia y Scanea Desde La App) Usb y Wifi",
    description: "🖨️ Impresora Epson EcoTank L1250\n\n✅ Sistema de tanques\n✅ WiFi y USB\n✅ Copia y escanea desde app\n✅ Bajo costo por página\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 719900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "https://megacomputer.com.co/wp-content/uploads/2025/06/1-2025-06-11T095950.195.webp"
    ],
    tags: ["impresora", "printer", "oficina", "epson", "nuevo", "garantia"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/impresora-epson-ecotank-l1250-imprime-copia-y-scanea-desde-la-app-usb/"
  },

  // ==================== MEGAPACKS (40 PACKS) ====================
  {
    name: "Mega Pack 01: Cursos Diseño Gráfico",
    description: "🎨 Mega Pack de Diseño Gráfico\n\n✅ Cursos completos de Photoshop, Illustrator, InDesign\n✅ Técnicas profesionales\n✅ Recursos y plantillas\n\n💾 Entrega inmediata por Google Drive",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "diseño", "grafico", "photoshop", "illustrator", "curso"],
    stock: 999
  },

  {
    name: "Mega Pack 02: Cursos Microsoft Office",
    description: "📊 Mega Pack Microsoft Office\n\n✅ Word, Excel, PowerPoint, Access\n✅ Desde básico hasta avanzado\n✅ Ejercicios prácticos\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "office", "word", "excel", "powerpoint", "curso"],
    stock: 999
  },

  {
    name: "Mega Pack 03: Cursos Inglés",
    description: "🇬🇧 Mega Pack de Inglés\n\n✅ Desde básico hasta avanzado\n✅ Conversación y negocios\n✅ Material de apoyo\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "ingles", "idiomas", "conversacion", "curso"],
    stock: 999
  },

  {
    name: "Mega Pack 04: Cursos Excel",
    description: "📈 Mega Pack Excel Avanzado\n\n✅ Fórmulas y funciones\n✅ Tablas dinámicas\n✅ Macros y VBA\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "excel", "office", "formulas", "macros", "curso"],
    stock: 999
  },

  {
    name: "PACK COMPLETO 40 Mega Packs",
    description: "🎁 PACK COMPLETO - TODOS LOS MEGAPACKS\n\n✅ Acceso a los 40 Mega Packs\n✅ Ahorro de $740.000 COP\n✅ Contenido valorado en $800.000\n✅ Acceso de por vida\n✅ Actualizaciones incluidas\n\n💾 Entrega inmediata por Google Drive",
    price: 60000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megapack completo.png", "/fotos/megapack2.jpg"],
    tags: ["megapacks", "completo", "todo", "ahorro", "cursos"],
    stock: 999
  },

  // ==================== MOTO ====================
  {
    name: "Moto Bajaj Pulsar NS 160 FI1 (2020)",
    description: "🏍️ BAJAJ PULSAR NS 160 FI1 - MODELO 2020\n\n¡Moto en excelentes condiciones, lista para rodar! 🔥\n\n📋 ESPECIFICACIONES:\n🚦 Modelo: 2020\n⚙️ Motor: 160cc Inyección Electrónica (FI1)\n🧾 Papeles: Al día + Traspaso disponible\n🛠️ Mantenimiento: Reciente, todo al día\n💥 Estado: Impecable y muy cuidada\n✅ SOAT y Tecnomecánica vigentes\n\n💰 PRECIOS:\n💵 Precio inicial: $6.500.000 COP\n🎯 Con rebaja: $6.300.000 COP\n🔥 Precio final negociable: $6.000.000 COP\n\n📍 UBICACIÓN:\nCentro Comercial El Diamante 2, San Nicolás, Cali\n\n📞 CONTACTO DIRECTO:\nWhatsApp: +57 304 274 8687",
    price: 6500000,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "/fotos/moto2.jpg",
      "/fotos/moto 3.jpg",
      "/fotos/moto4.jpg",
      "/fotos/moto5.png",
      "/fotos/moto6.png"
    ],
    tags: ["moto", "bajaj", "pulsar", "ns160", "fi1", "160cc", "inyeccion", "2020", "deportiva", "negociable", "papeles al dia", "traspaso", "cali", "san nicolas"],
    stock: 1,
    paymentLinkCustom: "https://wa.me/573042748687"
  },

  // ==================== PRODUCTOS DROPSHIPPING ====================
  {
    name: "Tablet Acer Iconia M10 Wifi 10.1 Wxga Ips 4gb-64gb Champagne",
    description: "📱 Tablet Acer Iconia M10\n\n✅ Pantalla 10.1\" IPS Full HD\n✅ 4GB RAM + 64GB almacenamiento\n✅ Android\n✅ WiFi\n✅ Cámaras 5MP\n\n🚚 Envío gratis a toda Colombia",
    price: 498900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "https://thumb.pccomponentes.com/w-530-530/articles/1086/10861246/1354-acer-iconia-tab-m10-wifi-101-4-64gb-dorada.jpg"
    ],
    tags: ["tablet", "acer", "android", "dropshipping"],
    stock: 10
  },

  {
    name: "Smartwatch Serie 9 Plus Ultra",
    description: "⌚ Smartwatch Serie 9 Plus\n\n✅ Pantalla AMOLED\n✅ Monitor de salud completo\n✅ Llamadas Bluetooth\n✅ Resistente al agua IP68\n✅ Batería 7 días\n\n🚚 Envío gratis",
    price: 89000,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"
    ],
    tags: ["smartwatch", "reloj", "tecnología", "dropshipping"],
    stock: 50
  },

  {
    name: "AirPods Pro (Segunda Generación) Calidad 1:1",
    description: "🎧 AirPods Pro 2da Gen\n\n✅ Cancelación de ruido activa\n✅ Audio espacial\n✅ Resistentes al agua\n✅ Estuche MagSafe\n✅ Calidad premium 1:1\n\n🚚 Envío gratis",
    price: 120000,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"
    ],
    tags: ["airpods", "audifonos", "apple", "dropshipping"],
    stock: 30
  },

  {
    name: "Proyector Portátil HY320 Android WiFi Bluetooth",
    description: "📽️ Proyector Portátil HY320\n\n✅ Android integrado\n✅ WiFi y Bluetooth\n✅ 1080P Full HD\n✅ Portátil y compacto\n✅ Control remoto incluido\n\n🚚 Envío gratis",
    price: 250000,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: [
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800"
    ],
    tags: ["proyector", "android", "tecnología", "dropshipping"],
    stock: 20
  }
]

async function restaurarTodos() {
  console.log('🔄 ========================================')
  console.log('🔄 RESTAURACIÓN COMPLETA DE PRODUCTOS')
  console.log('🔄 ========================================\n')
  
  try {
    // Obtener usuario
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
    console.log(`📦 Productos a restaurar: ${productosCompletos.length}\n`)

    let creados = 0
    let actualizados = 0
    let errores = 0

    for (const producto of productosCompletos) {
      try {
        // Verificar si existe
        const existente = await prisma.product.findFirst({
          where: {
            name: producto.name,
            userId: usuario.id
          }
        })

        if (existente) {
          // Actualizar
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
              stock: producto.stock,
              paymentLinkCustom: producto.paymentLinkCustom
            }
          })
          console.log(`🔄 Actualizado: ${producto.name}`)
          actualizados++
        } else {
          // Crear
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
    console.log(`📦 Total procesados: ${productosCompletos.length}`)
    console.log('\n✅ ¡Restauración completada!')

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
restaurarTodos()
