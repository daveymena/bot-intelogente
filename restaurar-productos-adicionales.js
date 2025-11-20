/**
 * Script para agregar productos adicionales del catálogo completo
 * Ejecutar: node restaurar-productos-adicionales.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const productosAdicionales = [
  // ==================== MÁS LAPTOPS MEGACOMPUTER ====================
  {
    name: "Portátil Asus Vivobook 15 M1502ya-Nj694 Ryzen 7 5825u Ddr4 16Gb 1Tb Ssd 15.6 Fhd",
    description: "💻 Laptop ASUS VivoBook 15\n\n✅ AMD Ryzen 7 5825U\n✅ 16GB DDR4 RAM\n✅ 1TB SSD\n✅ Pantalla 15.6\" FHD\n✅ FreeDOS\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 1819900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2025/09/1-2025-09-12T171221.758.webp"],
    tags: ["laptop", "portatil", "computador", "asus", "nuevo", "garantia", "ryzen7"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-asus-vivobook-15-m1502ya-nj694-ryzen-7-5825u-ddr4-16gb-1tb-ssd-15-6-fhd/"
  },

  {
    name: "Portatil Acer A15-51p-591e Intel 5 (Serie 1) 120u Ram 16gb Lpddr5 512gb Ssd Pantalla 15.6 Fhd Ips",
    description: "💻 Laptop Acer A15\n\n✅ Intel Core 5 120U\n✅ 16GB LPDDR5 RAM\n✅ 512GB SSD\n✅ Pantalla 15.6\" FHD IPS\n✅ Linux\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 1899900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2025/06/1.png"],
    tags: ["laptop", "portatil", "computador", "acer", "nuevo", "garantia"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-acer-a15-51p-591e-intel-5-serie-1-120u-ram-16gb-lpddr5-512gb-ssd-pantalla-15-6-fhd-ips/"
  },

  {
    name: "Portátil Asus Vivobook Go E1504fa-L1745 Amd Ryzen 5-7520u Ram 16gb Ddr5 512 Ssd Pantalla 15.6 Oled Fhd",
    description: "💻 Laptop ASUS VivoBook GO OLED\n\n✅ AMD Ryzen 5 7520U\n✅ 16GB DDR5 RAM\n✅ 512GB SSD\n✅ Pantalla 15.6\" OLED FHD\n✅ FreeDOS\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 1899900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2025/02/Diseno-sin-titulo-36.webp"],
    tags: ["laptop", "portatil", "computador", "asus", "nuevo", "garantia", "oled"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-asus-vivobook-go-e1504fa-l1745-amd-ryzen-5-7520u-ram-16gb-ddr5-512-ssd-pantalla-15-6-oled-fhd/"
  },

  {
    name: "Portatil Acer Al15-41p-R8f7 Amd Ryzen 7 7500u Ram 16gb Ddr4 1tb Ssd Pantalla 15.6 Fhd Ips",
    description: "💻 Laptop Acer AL15\n\n✅ AMD Ryzen 7 7500U\n✅ 16GB DDR4 RAM\n✅ 1TB SSD\n✅ Pantalla 15.6\" FHD IPS\n✅ Windows 11\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 2179900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2025/06/1-2025-06-07T122441.705.webp"],
    tags: ["laptop", "portatil", "computador", "acer", "nuevo", "garantia", "ryzen7"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-acer-al15-41p-r8f7-amd-ryzen-7-7500u-ram-16gb-ddr4-1tb-ssd-pantalla-15-6-fhd-ips/"
  },

  {
    name: "Portatil Asus Vivobook 15 X1502va-Nj929 Intel Ci7-13620h 15,6 Fhd 16gb 512gb Ssd",
    description: "💻 Laptop ASUS VivoBook 15\n\n✅ Intel Core i7-13620H\n✅ 16GB DDR5 RAM\n✅ 512GB SSD\n✅ Pantalla 15.6\" FHD\n✅ FreeDOS\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 2249900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2025/10/1-9.webp"],
    tags: ["laptop", "portatil", "computador", "asus", "nuevo", "garantia", "intel", "i7"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-asus-vivobook-15-x1502va-nj929-intel-ci7-13620h-156-fhd-16gb-512gb-ssd/"
  },

  {
    name: "Portatil Asus Vivobook 16 X1605va-Mb1235 Intel Ci7-13620h Ram 16gb Ddr5 512gb Ssd Pantalla 16.0",
    description: "💻 Laptop ASUS VivoBook 16\n\n✅ Intel Core i7-13620H\n✅ 16GB DDR5 RAM\n✅ 512GB SSD\n✅ Pantalla 16.0\" WUXGA\n✅ FreeDOS\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 2449900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2025/04/1-2025-04-15T143703.707.webp"],
    tags: ["laptop", "portatil", "computador", "asus", "nuevo", "garantia", "intel", "i7"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-asus-vivobook-16-x1605va-mb1235-intel-ci7-13620h-ram-16gb-ddr5-512gb-ssd-pantalla-16-0/"
  },

  {
    name: "Portátil Asus Vivobook 15 X1502va-Nj893 Intel Core I7-13620h Ram 16gb Ddr4 1tb Ssd Pantalla 15.6 Fhd",
    description: "💻 Laptop ASUS VivoBook 15\n\n✅ Intel Core i7-13620H\n✅ 16GB DDR4 RAM\n✅ 1TB SSD\n✅ Pantalla 15.6\" FHD\n✅ FreeDOS\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 2499900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2025/05/1-2025-05-30T142140.539.webp"],
    tags: ["laptop", "portatil", "computador", "asus", "nuevo", "garantia", "intel", "i7"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-asus-vivobook-15-x1502va-nj893-intel-core-i7-13620h-ram-16gb-ddr4-1tb-ssd-pantalla-15-6-fhd/"
  },

  {
    name: "Portatil Asus Vivobook S16 M3607ha-Rp111 Amd Ryzen™ 9 270 Ddr5 16gb + Slot Adic 512gb Ssd 16″ Wuxga",
    description: "💻 Laptop ASUS VivoBook S16\n\n✅ AMD Ryzen 9 270\n✅ 16GB DDR5 RAM\n✅ 512GB SSD\n✅ Pantalla 16\" WUXGA\n✅ FreeDOS\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 3019900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2025/09/1-2025-09-13T092320.829.webp"],
    tags: ["laptop", "portatil", "computador", "asus", "nuevo", "garantia", "ryzen9"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/portatil-asus-vivobook-s16-m3607ha-rp111-amd-ryzen-9-270-ddr5-16gb-slot-adic-512gb-ssd-16-wuxga/"
  },

  // ==================== MÁS IMPRESORAS ====================
  {
    name: "Impresora Canon Multifuncional G3170 Tinta Continua Wifi",
    description: "🖨️ Impresora Canon G3170\n\n✅ Sistema de tanques\n✅ WiFi\n✅ Multifuncional\n✅ Bajo costo por página\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 789900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2024/03/1-15.png"],
    tags: ["impresora", "printer", "oficina", "canon", "nuevo", "garantia"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/impresora-canon-multifuncional-g3170-tinta-continua-wifi/"
  },

  {
    name: "Impresora Epson Multifuncional Wifi Ecotank L3251",
    description: "🖨️ Impresora Epson EcoTank L3251\n\n✅ Sistema de tanques\n✅ WiFi\n✅ Multifuncional\n✅ Bajo costo por página\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 990000,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2024/03/L3251-1.webp"],
    tags: ["impresora", "printer", "oficina", "epson", "nuevo", "garantia"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/impresora-epson-multifuncional-wifi-ecotank-l3251/"
  },

  {
    name: "Impresora Hp Smart Tank 530 Multifuncional Wi-Fi Adf",
    description: "🖨️ Impresora HP Smart Tank 530\n\n✅ Sistema de tanques\n✅ WiFi\n✅ ADF (alimentador automático)\n✅ Multifuncional\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 1059900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2023/11/IMPRESORA-HP-SMART-TANK-530.jpg"],
    tags: ["impresora", "printer", "oficina", "hp", "nuevo", "garantia"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/impresora-hp-smart-tank-530-multifuncional-wi-fi-adf/"
  },

  {
    name: "Impresora Multifuncional Epson L5590 Wifi Ecotank",
    description: "🖨️ Impresora Epson EcoTank L5590\n\n✅ Sistema de tanques\n✅ WiFi\n✅ Multifuncional\n✅ ADF\n✅ Fax\n\n📦 Producto original con garantía\n🚚 Envío a toda Colombia",
    price: 1329900,
    currency: "COP",
    category: "PHYSICAL",
    status: "AVAILABLE",
    images: ["https://megacomputer.com.co/wp-content/uploads/2023/03/IMPRESORA-Ecotank-L5590-1.jpg.webp"],
    tags: ["impresora", "printer", "oficina", "epson", "nuevo", "garantia"],
    stock: 5,
    paymentLinkCustom: "https://megacomputer.com.co/producto/impresora-multifuncional-epson-l5590-wifi-ecotank/"
  },

  // ==================== MÁS MEGAPACKS ====================
  {
    name: "Mega Pack 05: Cursos Hacking Ético",
    description: "🔐 Mega Pack Hacking Ético\n\n✅ Seguridad informática\n✅ Pentesting\n✅ Auditorías de sistemas\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "hacking", "seguridad", "pentesting", "curso"],
    stock: 999
  },

  {
    name: "Mega Pack 11: Cursos Marketing Digital",
    description: "📱 Mega Pack Marketing Digital\n\n✅ SEO, SEM, Google Ads\n✅ Estrategias de redes sociales\n✅ Email marketing\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "marketing", "digital", "seo", "sem", "curso"],
    stock: 999
  },

  {
    name: "Mega Pack 16: Cursos Premium +900 GB",
    description: "💻 Mega Pack Programación\n\n✅ Python, JavaScript, Java, C++\n✅ Desarrollo web y móvil\n✅ +900 GB de contenido\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "programacion", "python", "javascript", "curso"],
    stock: 999
  },

  {
    name: "Mega Pack 18: Reparación de teléfonos y tablets",
    description: "📱 Mega Pack Reparación Móviles\n\n✅ Técnicas de reparación\n✅ Teléfonos y tablets\n✅ Herramientas y diagnóstico\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "reparacion", "moviles", "tablets", "curso"],
    stock: 999
  },

  {
    name: "Mega Pack 19: WordPress",
    description: "🌐 Mega Pack WordPress\n\n✅ Landing Pages\n✅ Plugins y Themes\n✅ Desarrollo completo\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "wordpress", "web", "plugins", "themes"],
    stock: 999
  },

  {
    name: "Mega Pack 34: Plantillas Canva MEGA Pro",
    description: "🎨 Mega Pack Canva Pro\n\n✅ Plantillas profesionales premium\n✅ Para redes sociales\n✅ Diseños editables\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "canva", "plantillas", "diseño"],
    stock: 999
  },

  {
    name: "Mega Pack 37: Marketing & Ventas",
    description: "💼 Mega Pack Marketing & Ventas\n\n✅ Estrategias de marketing\n✅ Técnicas de ventas\n✅ Negociación\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "marketing", "ventas", "estrategias"],
    stock: 999
  },

  {
    name: "Mega Pack 38: Redes Sociales",
    description: "📱 Mega Pack Redes Sociales\n\n✅ Gestión profesional\n✅ Estrategias de contenido\n✅ Community management\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "redes", "sociales", "marketing"],
    stock: 999
  },

  {
    name: "Mega Pack 39: Trading",
    description: "📈 Mega Pack Trading\n\n✅ Trading Forex\n✅ Análisis técnico profesional\n✅ Estrategias de inversión\n\n💾 Entrega inmediata",
    price: 20000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: ["/fotos/megacp unitario.png"],
    tags: ["megapack", "trading", "forex", "inversiones"],
    stock: 999
  }
]

async function agregarProductos() {
  console.log('🔄 ========================================')
  console.log('🔄 AGREGANDO PRODUCTOS ADICIONALES')
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
    console.log(`📦 Productos a agregar: ${productosAdicionales.length}\n`)

    let creados = 0
    let actualizados = 0
    let errores = 0

    for (const producto of productosAdicionales) {
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
              stock: producto.stock,
              paymentLinkCustom: producto.paymentLinkCustom
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
    console.log(`📦 Total procesados: ${productosAdicionales.length}`)
    console.log('\n✅ ¡Productos adicionales agregados!')

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

agregarProductos()
