/**
 * 📦 Importar TODOS los productos del JSON
 * Este script lee productos-completos.json e importa todo a la base de datos
 */

import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

async function importarTodos() {
  try {
    console.log('📦 Importando TODOS los productos del JSON...\n')

    const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
    if (!admin) {
      console.error('❌ No se encontró usuario admin')
      return
    }

    // Leer el archivo JSON
    const jsonPath = path.join(process.cwd(), 'scripts', 'productos-completos.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

    let totalProductos = 0

    // Importar laptops ASUS VivoBook
    if (jsonData.productos_tecnologicos?.productos?.laptops?.asus_vivobook?.modelos) {
      console.log('💻 Importando ASUS VivoBook...')
      for (const modelo of jsonData.productos_tecnologicos.productos.laptops.asus_vivobook.modelos) {
        await db.product.create({
          data: {
            name: `ASUS VivoBook ${modelo.procesador} ${modelo.ram}`,
            description: `Procesador: ${modelo.procesador}
RAM: ${modelo.ram}
Almacenamiento: ${modelo.almacenamiento}
Pantalla: ${modelo.pantalla}
SO: ${modelo.so}
Color: ${modelo.color}
${modelo.extras ? `Extras: ${modelo.extras}` : ''}`,
            price: modelo.precio,
            currency: 'COP',
            category: 'PHYSICAL',
            images: JSON.stringify(modelo.imagenes || []),
            tags: JSON.stringify(['asus', 'vivobook', 'laptop', 'portátil', modelo.procesador.toLowerCase()]),
            userId: admin.id
          }
        })
        totalProductos++
      }
    }

    // Importar laptops ASUS TUF Gaming
    if (jsonData.productos_tecnologicos?.productos?.laptops?.asus_tuf_gaming?.modelos) {
      console.log('🎮 Importando ASUS TUF Gaming...')
      for (const modelo of jsonData.productos_tecnologicos.productos.laptops.asus_tuf_gaming.modelos) {
        await db.product.create({
          data: {
            name: `ASUS TUF Gaming ${modelo.procesador} ${modelo.gpu}`,
            description: `Procesador: ${modelo.procesador}
RAM: ${modelo.ram}
Almacenamiento: ${modelo.almacenamiento}
Pantalla: ${modelo.pantalla}
GPU: ${modelo.gpu}
SO: ${modelo.so}
${modelo.extras ? `Extras: ${modelo.extras}` : ''}`,
            price: modelo.precio,
            currency: 'COP',
            category: 'PHYSICAL',
            images: JSON.stringify([]),
            tags: JSON.stringify(['asus', 'tuf', 'gaming', 'laptop', 'gamer']),
            userId: admin.id
          }
        })
        totalProductos++
      }
    }

    // Importar laptops Lenovo
    if (jsonData.productos_tecnologicos?.productos?.laptops?.lenovo?.modelos) {
      console.log('💼 Importando Lenovo...')
      for (const modelo of jsonData.productos_tecnologicos.productos.laptops.lenovo.modelos) {
        await db.product.create({
          data: {
            name: `Lenovo ${modelo.procesador} ${modelo.ram}`,
            description: `Procesador: ${modelo.procesador}
RAM: ${modelo.ram}
Almacenamiento: ${modelo.almacenamiento}
Pantalla: ${modelo.pantalla}
SO: ${modelo.so}
Color: ${modelo.color}`,
            price: modelo.precio,
            currency: 'COP',
            category: 'PHYSICAL',
            images: JSON.stringify(['/fotos/portatil_lenovo_v14_g4_iru_int_1.webp', '/fotos/portatil_lenovo_v14_g4_iru_int_2.webp']),
            tags: JSON.stringify(['lenovo', 'laptop', 'portátil']),
            userId: admin.id
          }
        })
        totalProductos++
      }
    }

    // Importar laptops HP
    if (jsonData.productos_tecnologicos?.productos?.laptops?.hp?.modelos) {
      console.log('🖥️ Importando HP...')
      for (const modelo of jsonData.productos_tecnologicos.productos.laptops.hp.modelos) {
        await db.product.create({
          data: {
            name: `HP ${modelo.procesador} ${modelo.ram}`,
            description: `Procesador: ${modelo.procesador}
RAM: ${modelo.ram}
Almacenamiento: ${modelo.almacenamiento}
Pantalla: ${modelo.pantalla}
${modelo.gpu ? `GPU: ${modelo.gpu}` : ''}
SO: ${modelo.so}
${modelo.tipo ? `Tipo: ${modelo.tipo}` : ''}`,
            price: modelo.precio,
            currency: 'COP',
            category: 'PHYSICAL',
            images: JSON.stringify(['/fotos/portatil_hp_omnibook_5_flp_14f_1.webp', '/fotos/portatil_hp_omnibook_5_flp_14f_2.webp']),
            tags: JSON.stringify(['hp', 'laptop', 'portátil']),
            userId: admin.id
          }
        })
        totalProductos++
      }
    }

    // Importar Megapacks
    if (jsonData.categorias?.cursos_digitales?.productos?.mega_packs?.packs_disponibles) {
      console.log('📚 Importando Megapacks...')
      const categorias = jsonData.categorias.cursos_digitales.productos.mega_packs.packs_disponibles
      
      for (const [catKey, categoria] of Object.entries(categorias)) {
        if (categoria.packs && Array.isArray(categoria.packs)) {
          for (const pack of categoria.packs) {
            await db.product.create({
              data: {
                name: pack.nombre,
                description: `${pack.contenido}

Categoría: ${categoria.categoria}
Precio individual: $20,000 COP
Pack completo (40 productos): $60,000 COP`,
                price: 20000,
                currency: 'COP',
                category: 'DIGITAL',
                images: JSON.stringify(['/fotos/megapack completo.png']),
                tags: JSON.stringify(['megapack', 'curso', 'digital', pack.id.toLowerCase()]),
                userId: admin.id
              }
            })
            totalProductos++
          }
        }
      }
    }

    console.log(`\n🎉 ${totalProductos} productos importados exitosamente!`)
    console.log('\n💡 Nota: Las fotos se asignaron de las disponibles en public/fotos/')
    console.log('   Puedes editarlas desde el dashboard si necesitas cambiarlas')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

importarTodos()
