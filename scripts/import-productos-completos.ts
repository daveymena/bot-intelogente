import { PrismaClient, ProductType, ProductStatus } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importProductos() {
  try {
    console.log('📦 Importando catálogo completo de productos...\n')

    // Buscar el usuario admin
    const admin = await prisma.user.findFirst({
      where: {
        email: 'daveymena16@gmail.com'
      }
    })

    if (!admin) {
      console.error('❌ Usuario admin no encontrado')
      return
    }

    console.log(`✅ Usuario encontrado: ${admin.email}\n`)

    // Leer el archivo JSON
    const jsonPath = path.join(__dirname, 'productos-completos.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const catalogo = JSON.parse(jsonData)

    let count = 0

    // Importar Mega Packs
    console.log('📚 Importando Mega Packs...')
    const megaPacks = catalogo.categorias.cursos_digitales.productos.mega_packs.packs_disponibles

    for (const categoria in megaPacks) {
      const packs = megaPacks[categoria].packs
      for (const pack of packs) {
        await prisma.product.create({
          data: {
            userId: admin.id,
            name: pack.nombre,
            description: pack.contenido,
            price: pack.precio,
            currency: 'COP',
            category: ProductType.DIGITAL,
            status: ProductStatus.AVAILABLE,
            images: JSON.stringify(['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500']),
            tags: JSON.stringify(['curso', 'digital', 'mega pack', categoria]),
            autoResponse: `${pack.nombre} por solo $${pack.precio.toLocaleString()} COP. Incluye: ${pack.contenido}. Acceso inmediato después del pago. ¿Te interesa?`
          }
        })
        count++
      }
    }

    // Importar Laptops ASUS VivoBook
    console.log('💻 Importando Laptops ASUS...')
    const asusVivobook = catalogo.categorias.productos_tecnologicos.productos.laptops.asus_vivobook.modelos
    for (const laptop of asusVivobook) {
      await prisma.product.create({
        data: {
          userId: admin.id,
          name: `ASUS VivoBook ${laptop.procesador}`,
          description: `Laptop ASUS VivoBook con ${laptop.procesador}, ${laptop.ram} RAM, ${laptop.almacenamiento} almacenamiento, pantalla ${laptop.pantalla}. Color: ${laptop.color}. ${laptop.extras || ''}`,
          price: laptop.precio,
          currency: 'COP',
          category: ProductType.PHYSICAL,
          status: ProductStatus.AVAILABLE,
          stock: 5,
          images: JSON.stringify(['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500']),
          tags: JSON.stringify(['laptop', 'asus', 'vivobook', laptop.procesador.toLowerCase()]),
          autoResponse: `ASUS VivoBook con ${laptop.procesador}, ${laptop.ram}, ${laptop.almacenamiento}. Precio: $${laptop.precio.toLocaleString()} COP. ¿Te gustaría más información?`
        }
      })
      count++
    }

    // Importar Laptops HP (primeros 5)
    console.log('💻 Importando Laptops HP...')
    const hpLaptops = catalogo.categorias.productos_tecnologicos.productos.laptops.hp.modelos.slice(0, 5)
    for (const laptop of hpLaptops) {
      await prisma.product.create({
        data: {
          userId: admin.id,
          name: `HP ${laptop.procesador}`,
          description: `Laptop HP con ${laptop.procesador}, ${laptop.ram} RAM, ${laptop.almacenamiento} almacenamiento, pantalla ${laptop.pantalla}. ${laptop.tipo ? `Tipo: ${laptop.tipo}` : ''}`,
          price: laptop.precio,
          currency: 'COP',
          category: ProductType.PHYSICAL,
          status: ProductStatus.AVAILABLE,
          stock: 3,
          images: JSON.stringify(['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500']),
          tags: JSON.stringify(['laptop', 'hp', laptop.procesador.toLowerCase()]),
          autoResponse: `HP ${laptop.procesador} con ${laptop.ram} y ${laptop.almacenamiento}. Precio: $${laptop.precio.toLocaleString()} COP. ¿Quieres saber más?`
        }
      })
      count++
    }

    // Importar Componentes (Memoria RAM)
    console.log('🔧 Importando Componentes...')
    const memoriaRam = catalogo.categorias.productos_tecnologicos.productos.componentes.memoria_ram
    for (const ram of memoriaRam) {
      await prisma.product.create({
        data: {
          userId: admin.id,
          name: `Memoria RAM ${ram.marca} ${ram.capacidad} ${ram.tipo}`,
          description: `Memoria RAM ${ram.marca} ${ram.capacidad} ${ram.tipo} ${ram.velocidad}. Compatible con laptops y computadores.`,
          price: ram.precio,
          currency: 'COP',
          category: ProductType.PHYSICAL,
          status: ProductStatus.AVAILABLE,
          stock: 10,
          images: JSON.stringify(['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500']),
          tags: JSON.stringify(['memoria', 'ram', ram.marca.toLowerCase(), ram.tipo.toLowerCase()]),
          autoResponse: `Memoria RAM ${ram.marca} ${ram.capacidad} ${ram.velocidad}. Precio: $${ram.precio.toLocaleString()} COP. ¿La necesitas?`
        }
      })
      count++
    }

    // Importar Discos SSD
    console.log('💾 Importando Discos SSD...')
    const discosSSD = catalogo.categorias.productos_tecnologicos.productos.componentes.discos_ssd_sata
    for (const disco of discosSSD) {
      await prisma.product.create({
        data: {
          userId: admin.id,
          name: `SSD ${disco.marca} ${disco.capacidad}`,
          description: `Disco SSD ${disco.marca} ${disco.capacidad} ${disco.tipo}. Alta velocidad de lectura y escritura.`,
          price: disco.precio,
          currency: 'COP',
          category: ProductType.PHYSICAL,
          status: ProductStatus.AVAILABLE,
          stock: 8,
          images: JSON.stringify(['https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500']),
          tags: JSON.stringify(['ssd', 'disco', 'almacenamiento', disco.marca.toLowerCase()]),
          autoResponse: `SSD ${disco.marca} ${disco.capacidad}. Mejora la velocidad de tu computador. Precio: $${disco.precio.toLocaleString()} COP. ¿Te interesa?`
        }
      })
      count++
    }

    // Importar Accesorios (Morrales)
    console.log('🎒 Importando Accesorios...')
    const morrales = catalogo.categorias.productos_tecnologicos.productos.accesorios.morrales
    for (const morral of morrales) {
      await prisma.product.create({
        data: {
          userId: admin.id,
          name: `Morral ${morral.marca} ${morral.modelo}`,
          description: `Morral ${morral.marca} ${morral.modelo} para laptop ${morral.tamaño}. Color: ${morral.color}. Protección y comodidad.`,
          price: morral.precio,
          currency: 'COP',
          category: ProductType.PHYSICAL,
          status: ProductStatus.AVAILABLE,
          stock: 15,
          images: JSON.stringify(['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500']),
          tags: JSON.stringify(['morral', 'accesorio', morral.marca.toLowerCase(), 'laptop']),
          autoResponse: `Morral ${morral.marca} ${morral.modelo} para laptop ${morral.tamaño}. Color ${morral.color}. Precio: $${morral.precio.toLocaleString()} COP. ¿Lo quieres?`
        }
      })
      count++
    }

    console.log(`\n🎉 ${count} productos importados exitosamente!`)
    console.log('\n📊 Resumen:')
    console.log(`   - Usuario: ${admin.email}`)
    console.log(`   - Productos importados: ${count}`)
    console.log('\n💡 Los productos ya están disponibles en el dashboard!')
    console.log('🤖 El bot puede recomendar estos productos automáticamente!')

  } catch (error) {
    console.error('❌ Error importando productos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importProductos()
