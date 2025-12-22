/**
 * 🔄 Restaurar Todos los Productos con Fotos Reales
 * Solo usa fotos que existen en public/fotos/
 */

import { db } from '../src/lib/db'

async function restaurarProductos() {
  try {
    console.log('🔄 Restaurando productos con fotos reales...\n')

    const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
    if (!admin) {
      console.error('❌ No se encontró usuario admin')
      return
    }

    const productos = [
      // CURSO DE PIANO
      {
        name: 'Curso Piano Profesional Completo',
        description: `Curso 100% en línea con videos descargables para aprender piano desde cero hasta nivel profesional.

📚 INCLUYE:
• +80 lecciones en video HD
• Módulos progresivos
• Acceso de por vida
• Contenido descargable
• Soporte directo del profesor

🎹 GARANTÍA: 7 días incluida
⚡ ACCESO: Inmediato después del pago`,
        price: 60000,
        currency: 'COP',
        category: 'DIGITAL' as const,
        images: ['/fotos/curso de piano completo .jpg'],
        tags: ['piano', 'curso', 'música', 'aprender piano', 'clases', 'profesional'],
        autoResponse: `🎹 ¡Excelente elección! El Curso de Piano Profesional es perfecto para ti.

📚 INCLUYE:
✅ +80 lecciones en video HD
✅ Módulos progresivos
✅ Acceso de por vida
✅ Soporte del profesor

💰 PRECIO: $60,000 COP

🔗 MÁS INFO: https://landein-page-pian2.vercel.app/
🛒 COMPRAR: https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205

¿Te gustaría comprarlo? 🎹`
      },

      // MOTO BAJAJ
      {
        name: 'Bajaj Pulsar NS 160 FI 2020',
        description: `Moto en excelente estado, lista para rodar.

🏍️ ESPECIFICACIONES:
• Marca: Bajaj
• Modelo: Pulsar NS 160 FI
• Año: 2020
• Estado: Excelente
• Papeles al día

📍 UBICACIÓN: Centro Comercial El Diamante 2, San Nicolás
📞 CONTACTO: +57 304 274 8687`,
        price: 6500000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        images: [
          '/fotos/moto 3.jpg',
          '/fotos/moto2.jpg',
          '/fotos/moto4.jpg',
          '/fotos/moto5.png',
          '/fotos/moto6.png'
        ],
        tags: ['moto', 'bajaj', 'pulsar', 'ns 160', 'motocicleta', 'vehículo'],
        autoResponse: `🏍️ ¡Bajaj Pulsar NS 160 FI 2020!

💰 PRECIO: $6,500,000 COP (Negociable: $6,300,000)

📍 UBICACIÓN: Centro Comercial El Diamante 2, San Nicolás
📞 CONTACTO: +57 304 274 8687

¿Te gustaría agendar una cita para verla? 🏍️`
      },

      // LAPTOPS
      {
        name: 'MacBook Pro M4 Pro Max 24GB RAM',
        description: 'MacBook Pro con chip M4 Pro Max, 24GB RAM, rendimiento profesional.',
        price: 8500000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        images: [
          '/fotos/macbook_pro_m4_pro_max_24gb_ra_1.webp',
          '/fotos/macbook_pro_m4_pro_max_24gb_ra_2.webp',
          '/fotos/macbook_pro_m4_pro_max_24gb_ra_3.webp',
          '/fotos/macbook_pro_m4_pro_max_24gb_ra_4.webp',
          '/fotos/macbook_pro_m4_pro_max_24gb_ra_5.webp'
        ],
        tags: ['macbook', 'apple', 'laptop', 'portátil', 'm4', 'profesional'],
        autoResponse: '💻 MacBook Pro M4 Pro Max - Rendimiento profesional extremo. Precio: $8,500,000 COP. Contacto: +57 304 274 8687'
      },

      {
        name: 'Portátil HP Victus 15-fa1029nr Gaming',
        description: 'Laptop gaming HP Victus, ideal para juegos y trabajo pesado.',
        price: 3200000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        images: [
          '/fotos/portatil_hp_victus_15fa1029nr__1.webp',
          '/fotos/portatil_hp_victus_15fa1029nr__2.webp',
          '/fotos/portatil_hp_victus_15fa1029nr__3.webp',
          '/fotos/portatil_hp_victus_15fa1029nr__4.webp',
          '/fotos/portatil_hp_victus_15fa1029nr__5.png'
        ],
        tags: ['hp', 'victus', 'gaming', 'laptop', 'portátil', 'juegos'],
        autoResponse: '🎮 HP Victus Gaming - Perfecto para juegos. Precio: $3,200,000 COP. Contacto: +57 304 274 8687'
      },

      {
        name: 'Portátil ASUS Vivobook 15 X1504',
        description: 'ASUS Vivobook 15, ideal para trabajo y estudio.',
        price: 1800000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        images: [
          '/fotos/portatil_asus_vivobook_15_x150_1.webp',
          '/fotos/portatil_asus_vivobook_15_x150_2.webp',
          '/fotos/portatil_asus_vivobook_15_x150_3.webp',
          '/fotos/portatil_asus_vivobook_15_x150_4.webp',
          '/fotos/portatil_asus_vivobook_15_x150_5.webp'
        ],
        tags: ['asus', 'vivobook', 'laptop', 'portátil', 'estudio', 'trabajo'],
        autoResponse: '💼 ASUS Vivobook 15 - Ideal para trabajo y estudio. Precio: $1,800,000 COP. Contacto: +57 304 274 8687'
      },

      // PERIFÉRICOS LOGITECH
      {
        name: 'Cámara Web Logitech C922 Pro Stream',
        description: 'Cámara web profesional para streaming y videoconferencias.',
        price: 350000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        images: [
          '/fotos/camara_web_logitech_c922_pro_s_1.jpg',
          '/fotos/camara_web_logitech_c922_pro_s_2.jpg',
          '/fotos/camara_web_logitech_c922_pro_s_3.webp',
          '/fotos/camara_web_logitech_c922_pro_s_4.webp',
          '/fotos/camara_web_logitech_c922_pro_s_5.jpg'
        ],
        tags: ['logitech', 'cámara', 'webcam', 'streaming', 'videoconferencia'],
        autoResponse: '📹 Logitech C922 Pro - Calidad profesional para streaming. Precio: $350,000 COP'
      },

      {
        name: 'Mouse Logitech MX Ergo Trackball',
        description: 'Mouse ergonómico trackball, ideal para largas jornadas.',
        price: 280000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        images: [
          '/fotos/mouse_logitech_mx_ergo_trackba_1.webp',
          '/fotos/mouse_logitech_mx_ergo_trackba_2.png',
          '/fotos/mouse_logitech_mx_ergo_trackba_3.webp',
          '/fotos/mouse_logitech_mx_ergo_trackba_4.webp',
          '/fotos/mouse_logitech_mx_ergo_trackba_5.webp'
        ],
        tags: ['logitech', 'mouse', 'trackball', 'ergonómico', 'mx ergo'],
        autoResponse: '🖱️ Logitech MX Ergo - Comodidad ergonómica. Precio: $280,000 COP'
      },

      {
        name: 'Diadema Gamer Logitech G635 7.1',
        description: 'Audífonos gaming con sonido surround 7.1.',
        price: 450000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        images: [
          '/fotos/diadema_gamer_logitech_g635_71_1.webp',
          '/fotos/diadema_gamer_logitech_g635_71_2.webp',
          '/fotos/diadema_gamer_logitech_g635_71_3.webp',
          '/fotos/diadema_gamer_logitech_g635_71_4.png',
          '/fotos/diadema_gamer_logitech_g635_71_5.webp'
        ],
        tags: ['logitech', 'diadema', 'audífonos', 'gaming', 'g635', '7.1'],
        autoResponse: '🎧 Logitech G635 - Sonido surround 7.1 para gaming. Precio: $450,000 COP'
      },

      {
        name: 'Timón Logitech G29 para PS5/PS4/PC',
        description: 'Volante de carreras con pedales, compatible con PS5, PS4 y PC.',
        price: 1200000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        images: [
          '/fotos/timn_logitech_g29_para_ps5_ps4_1.webp',
          '/fotos/timn_logitech_g29_para_ps5_ps4_2.webp',
          '/fotos/timn_logitech_g29_para_ps5_ps4_3.png',
          '/fotos/timn_logitech_g29_para_ps5_ps4_4.png',
          '/fotos/timn_logitech_g29_para_ps5_ps4_5.webp'
        ],
        tags: ['logitech', 'g29', 'timón', 'volante', 'racing', 'ps5', 'ps4', 'pc'],
        autoResponse: '🏎️ Logitech G29 - Experiencia de carreras realista. Precio: $1,200,000 COP'
      },

      // MONITOR
      {
        name: 'Monitor LG 32GN55R-B UltraGear Gaming',
        description: 'Monitor gaming 32" con alta tasa de refresco.',
        price: 950000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        images: [
          '/fotos/monitor_lg_32gn55rb_ultragear__1.webp',
          '/fotos/monitor_lg_32gn55rb_ultragear__2.webp',
          '/fotos/monitor_lg_32gn55rb_ultragear__3.webp',
          '/fotos/monitor_lg_32gn55rb_ultragear__4.webp',
          '/fotos/monitor_lg_32gn55rb_ultragear__5.jpg'
        ],
        tags: ['lg', 'monitor', 'gaming', 'ultragear', '32 pulgadas'],
        autoResponse: '🖥️ LG UltraGear 32" - Monitor gaming de alto rendimiento. Precio: $950,000 COP'
      }
    ]

    console.log(`📦 Creando ${productos.length} productos...\n`)

    for (const prod of productos) {
      const producto = await db.product.create({
        data: {
          ...prod,
          images: JSON.stringify(prod.images),
          tags: JSON.stringify(prod.tags),
          userId: admin.id
        }
      })
      console.log(`✅ ${producto.name}`)
      console.log(`   📸 ${prod.images.length} foto(s)`)
    }

    console.log(`\n🎉 ${productos.length} productos restaurados exitosamente!`)
    console.log('\n💡 Todos los productos tienen fotos reales de public/fotos/')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

restaurarProductos()
