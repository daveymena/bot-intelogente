/**
 * Script para asignar subcategorías automáticamente a productos
 */

import { db } from '../src/lib/db'

// Definir subcategorías por palabras clave
const subcategoryRules = {
  // COMPUTADORES
  'Portátiles': ['portátil', 'laptop', 'notebook', 'ultrabook', 'macbook'],
  'PC Escritorio': ['pc', 'computador de mesa', 'desktop', 'torre', 'all in one'],
  'Monitores': ['monitor', 'pantalla', 'display'],
  'Componentes PC': ['procesador', 'ram', 'disco duro', 'ssd', 'tarjeta gráfica', 'motherboard', 'fuente'],
  
  // ACCESORIOS
  'Teclados y Mouse': ['teclado', 'mouse', 'ratón'],
  'Audífonos': ['audífono', 'auricular', 'headset', 'headphone'],
  'Cámaras Web': ['cámara web', 'webcam'],
  'Cables y Adaptadores': ['cable', 'adaptador', 'hub', 'usb'],
  'Almacenamiento': ['usb', 'pendrive', 'memoria', 'disco externo'],
  
  // MOTOS
  'Motos Nuevas': ['moto nueva', 'motocicleta nueva'],
  'Motos Usadas': ['moto usada', 'motocicleta usada', 'segunda mano'],
  'Repuestos Moto': ['repuesto', 'pieza', 'accesorio moto'],
  
  // CURSOS DIGITALES
  'Cursos de Música': ['piano', 'guitarra', 'música', 'canto', 'batería'],
  'Cursos de Idiomas': ['inglés', 'francés', 'alemán', 'idioma', 'language'],
  'Cursos de Diseño': ['diseño gráfico', 'photoshop', 'illustrator', 'diseño web'],
  'Cursos de Programación': ['programación', 'python', 'javascript', 'desarrollo web'],
  'Cursos de Marketing': ['marketing', 'ventas', 'publicidad', 'redes sociales'],
  
  // MEGAPACKS
  'Megapacks Educativos': ['megapack', 'mega pack', 'curso completo', 'colección'],
  'Megapacks Profesionales': ['profesional', 'avanzado', 'experto'],
  
  // SERVICIOS
  'Reparación': ['reparación', 'arreglo', 'mantenimiento'],
  'Instalación': ['instalación', 'configuración', 'setup'],
  'Consultoría': ['consultoría', 'asesoría', 'consulta']
}

async function asignarSubcategorias() {
  console.log('🏷️ Iniciando asignación de subcategorías...\n')
  
  try {
    // Obtener todos los productos
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        subcategory: true,
        tags: true
      }
    })
    
    console.log(`📦 Productos encontrados: ${products.length}\n`)
    
    let updated = 0
    let skipped = 0
    
    for (const product of products) {
      // Si ya tiene subcategoría, saltar
      if (product.subcategory) {
        skipped++
        continue
      }
      
      // Combinar nombre, descripción y tags para análisis
      const searchText = [
        product.name,
        product.description || '',
        product.tags || ''
      ].join(' ').toLowerCase()
      
      // Buscar subcategoría que coincida
      let assignedSubcategory: string | null = null
      
      for (const [subcategory, keywords] of Object.entries(subcategoryRules)) {
        for (const keyword of keywords) {
          if (searchText.includes(keyword.toLowerCase())) {
            assignedSubcategory = subcategory
            break
          }
        }
        if (assignedSubcategory) break
      }
      
      // Si encontró subcategoría, actualizar
      if (assignedSubcategory) {
        await db.product.update({
          where: { id: product.id },
          data: { subcategory: assignedSubcategory }
        })
        
        console.log(`✅ ${product.name}`)
        console.log(`   → Subcategoría: ${assignedSubcategory}`)
        console.log(`   → Categoría: ${product.category}\n`)
        
        updated++
      } else {
        console.log(`⚠️  ${product.name}`)
        console.log(`   → No se encontró subcategoría automática`)
        console.log(`   → Categoría: ${product.category}\n`)
      }
    }
    
    console.log('\n========================================')
    console.log('📊 RESUMEN')
    console.log('========================================')
    console.log(`Total productos: ${products.length}`)
    console.log(`Actualizados: ${updated}`)
    console.log(`Ya tenían subcategoría: ${skipped}`)
    console.log(`Sin subcategoría: ${products.length - updated - skipped}`)
    console.log('========================================\n')
    
    // Mostrar resumen por subcategoría
    const productsBySubcategory = await db.product.groupBy({
      by: ['subcategory'],
      _count: true
    })
    
    console.log('📋 Productos por subcategoría:')
    for (const group of productsBySubcategory) {
      console.log(`   ${group.subcategory || '(Sin subcategoría)'}: ${group._count} productos`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Ejecutar
asignarSubcategorias()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
