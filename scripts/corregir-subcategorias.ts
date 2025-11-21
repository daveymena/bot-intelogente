/**
 * Script para corregir subcategorías incorrectas
 */

import { db } from '../src/lib/db'

async function corregirSubcategorias() {
  console.log('🔧 Corrigiendo subcategorías incorrectas...\n')
  
  try {
    let correcciones = 0
    
    // 1. Corregir MOTOS (que están como "Cables y Adaptadores")
    const motos = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'moto', mode: 'insensitive' } },
          { name: { contains: 'bajaj', mode: 'insensitive' } },
          { name: { contains: 'pulsar', mode: 'insensitive' } },
          { name: { contains: 'yamaha', mode: 'insensitive' } },
          { name: { contains: 'honda', mode: 'insensitive' } }
        ]
      },
      data: {
        subcategory: 'Motocicletas'
      }
    })
    console.log(`✅ Motos corregidas: ${motos.count}`)
    correcciones += motos.count
    
    // 2. Corregir productos que NO son PC pero están en "PC Escritorio"
    // Pilas
    const pilas = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'pila', mode: 'insensitive' } },
          { name: { contains: 'bateria', mode: 'insensitive' } }
        ],
        subcategory: 'PC Escritorio'
      },
      data: {
        subcategory: 'Pilas y Baterías'
      }
    })
    console.log(`✅ Pilas corregidas: ${pilas.count}`)
    correcciones += pilas.count
    
    // Tintas y cartuchos
    const tintas = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'tinta', mode: 'insensitive' } },
          { name: { contains: 'cartucho', mode: 'insensitive' } },
          { name: { contains: 'toner', mode: 'insensitive' } }
        ],
        subcategory: 'PC Escritorio'
      },
      data: {
        subcategory: 'Tintas y Cartuchos'
      }
    })
    console.log(`✅ Tintas corregidas: ${tintas.count}`)
    correcciones += tintas.count
    
    // Cintas
    const cintas = await db.product.updateMany({
      where: {
        name: { contains: 'cinta', mode: 'insensitive' },
        subcategory: 'PC Escritorio'
      },
      data: {
        subcategory: 'Cintas y Etiquetas'
      }
    })
    console.log(`✅ Cintas corregidas: ${cintas.count}`)
    correcciones += cintas.count
    
    // Papel y consumibles
    const papel = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'papel', mode: 'insensitive' } },
          { name: { contains: 'toalla', mode: 'insensitive' } },
          { name: { contains: 'higienico', mode: 'insensitive' } }
        ],
        subcategory: 'PC Escritorio'
      },
      data: {
        subcategory: 'Papel y Consumibles'
      }
    })
    console.log(`✅ Papel corregido: ${papel.count}`)
    correcciones += papel.count
    
    // Útiles escolares/oficina
    const utiles = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'lapiz', mode: 'insensitive' } },
          { name: { contains: 'borrador', mode: 'insensitive' } },
          { name: { contains: 'cepillo', mode: 'insensitive' } }
        ],
        subcategory: 'PC Escritorio'
      },
      data: {
        subcategory: 'Útiles y Papelería'
      }
    })
    console.log(`✅ Útiles corregidos: ${utiles.count}`)
    correcciones += utiles.count
    
    // Muebles y sillas
    const muebles = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'silla', mode: 'insensitive' } },
          { name: { contains: 'butaca', mode: 'insensitive' } }
        ],
        subcategory: 'PC Escritorio'
      },
      data: {
        subcategory: 'Muebles y Sillas'
      }
    })
    console.log(`✅ Muebles corregidos: ${muebles.count}`)
    correcciones += muebles.count
    
    // Productos de hogar/cocina
    const hogar = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'cocina', mode: 'insensitive' } },
          { name: { contains: 'maleta', mode: 'insensitive' } },
          { name: { contains: 'bolso', mode: 'insensitive' } },
          { name: { contains: 'aspiradora', mode: 'insensitive' } },
          { name: { contains: 'desengrasante', mode: 'insensitive' } },
          { name: { contains: 'copa', mode: 'insensitive' } },
          { name: { contains: 'envase', mode: 'insensitive' } }
        ],
        subcategory: 'PC Escritorio'
      },
      data: {
        subcategory: 'Hogar y Cocina'
      }
    })
    console.log(`✅ Hogar corregido: ${hogar.count}`)
    correcciones += hogar.count
    
    // 3. Corregir impresoras (que no tienen subcategoría)
    const impresoras = await db.product.updateMany({
      where: {
        name: { contains: 'impresora', mode: 'insensitive' },
        subcategory: null
      },
      data: {
        subcategory: 'Impresoras'
      }
    })
    console.log(`✅ Impresoras corregidas: ${impresoras.count}`)
    correcciones += impresoras.count
    
    // 4. Corregir productos que son "Portátiles" pero NO son laptops
    // Parlantes portátiles
    const parlantes = await db.product.updateMany({
      where: {
        name: { contains: 'parlante', mode: 'insensitive' },
        subcategory: 'Portátiles'
      },
      data: {
        subcategory: 'Audio y Parlantes'
      }
    })
    console.log(`✅ Parlantes corregidos: ${parlantes.count}`)
    correcciones += parlantes.count
    
    // Proyectores
    const proyectores = await db.product.updateMany({
      where: {
        name: { contains: 'proyector', mode: 'insensitive' },
        subcategory: 'Portátiles'
      },
      data: {
        subcategory: 'Proyectores'
      }
    })
    console.log(`✅ Proyectores corregidos: ${proyectores.count}`)
    correcciones += proyectores.count
    
    // Cargadores
    const cargadores = await db.product.updateMany({
      where: {
        name: { contains: 'cargador', mode: 'insensitive' },
        subcategory: 'Portátiles'
      },
      data: {
        subcategory: 'Cargadores y Cables'
      }
    })
    console.log(`✅ Cargadores corregidos: ${cargadores.count}`)
    correcciones += cargadores.count
    
    // Aspiradoras, máquinas de coser
    const electrodomesticos = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'aspiradora', mode: 'insensitive' } },
          { name: { contains: 'maquina de coser', mode: 'insensitive' } }
        ],
        subcategory: 'Portátiles'
      },
      data: {
        subcategory: 'Electrodomésticos'
      }
    })
    console.log(`✅ Electrodomésticos corregidos: ${electrodomesticos.count}`)
    correcciones += electrodomesticos.count
    
    // 5. Corregir productos en "Monitores" que NO son monitores
    // Smartwatch, tablets
    const wearables = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'smartwatch', mode: 'insensitive' } },
          { name: { contains: 'reloj', mode: 'insensitive' } }
        ],
        subcategory: 'Monitores'
      },
      data: {
        subcategory: 'Smartwatch y Wearables'
      }
    })
    console.log(`✅ Wearables corregidos: ${wearables.count}`)
    correcciones += wearables.count
    
    // Tablets
    const tablets = await db.product.updateMany({
      where: {
        name: { contains: 'tablet', mode: 'insensitive' },
        subcategory: 'Monitores'
      },
      data: {
        subcategory: 'Tablets'
      }
    })
    console.log(`✅ Tablets corregidas: ${tablets.count}`)
    correcciones += tablets.count
    
    // Power Banks
    const powerbanks = await db.product.updateMany({
      where: {
        name: { contains: 'power bank', mode: 'insensitive' },
        subcategory: { in: ['Monitores', 'Cables y Adaptadores'] }
      },
      data: {
        subcategory: 'Cargadores y Power Banks'
      }
    })
    console.log(`✅ Power Banks corregidos: ${powerbanks.count}`)
    correcciones += powerbanks.count
    
    // 6. Corregir AirPods y audífonos sin subcategoría
    const airpods = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'airpod', mode: 'insensitive' } },
          { name: { contains: 'audifonos', mode: 'insensitive' } }
        ],
        subcategory: null
      },
      data: {
        subcategory: 'Audífonos'
      }
    })
    console.log(`✅ AirPods corregidos: ${airpods.count}`)
    correcciones += airpods.count
    
    // 7. Corregir anillos de luz y cámaras
    const camaras = await db.product.updateMany({
      where: {
        OR: [
          { name: { contains: 'anillo de luz', mode: 'insensitive' } },
          { name: { contains: 'camara', mode: 'insensitive' } }
        ],
        subcategory: null
      },
      data: {
        subcategory: 'Cámaras y Fotografía'
      }
    })
    console.log(`✅ Cámaras corregidas: ${camaras.count}`)
    correcciones += camaras.count
    
    console.log(`\n✅ Total de correcciones: ${correcciones}`)
    console.log('🎉 Proceso completado\n')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

corregirSubcategorias()
