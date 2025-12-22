/**
 * 🏷️ Sistema de Categorías y Subcategorías de Productos
 * Estructura organizada para facilitar la búsqueda en el bot
 */

export interface SubCategory {
  id: string
  name: string
  keywords: string[] // Palabras clave para búsqueda
  emoji: string
}

export interface Category {
  id: string
  name: string
  emoji: string
  subcategories: SubCategory[]
  keywords: string[] // Palabras clave generales de la categoría
}

export const PRODUCT_CATEGORIES: Category[] = [
  {
    id: 'computadores',
    name: 'Computadores',
    emoji: '💻',
    keywords: ['computador', 'pc', 'ordenador', 'equipo'],
    subcategories: [
      {
        id: 'portatiles',
        name: 'Portátiles',
        emoji: '💻',
        keywords: ['portatil', 'laptop', 'notebook', 'ultrabook']
      },
      {
        id: 'escritorio',
        name: 'Computadores de Escritorio',
        emoji: '🖥️',
        keywords: ['escritorio', 'desktop', 'torre', 'all in one']
      },
      {
        id: 'gaming',
        name: 'Gaming',
        emoji: '🎮',
        keywords: ['gaming', 'gamer', 'juegos', 'rog', 'legion']
      },
      {
        id: 'workstation',
        name: 'Workstation',
        emoji: '⚡',
        keywords: ['workstation', 'profesional', 'diseño', 'edicion']
      }
    ]
  },
  {
    id: 'monitores',
    name: 'Monitores',
    emoji: '🖥️',
    keywords: ['monitor', 'pantalla', 'display'],
    subcategories: [
      {
        id: 'monitores-gaming',
        name: 'Monitores Gaming',
        emoji: '🎮',
        keywords: ['gaming', 'gamer', '144hz', '165hz', 'curvo']
      },
      {
        id: 'monitores-oficina',
        name: 'Monitores Oficina',
        emoji: '💼',
        keywords: ['oficina', 'trabajo', 'productividad']
      },
      {
        id: 'monitores-diseño',
        name: 'Monitores Diseño',
        emoji: '🎨',
        keywords: ['diseño', '4k', 'color', 'profesional']
      }
    ]
  },
  {
    id: 'camaras',
    name: 'Cámaras',
    emoji: '📷',
    keywords: ['camara', 'fotografia', 'video'],
    subcategories: [
      {
        id: 'camaras-web',
        name: 'Cámaras Web',
        emoji: '📹',
        keywords: ['webcam', 'web', 'streaming', 'videollamada']
      },
      {
        id: 'camaras-seguridad',
        name: 'Cámaras de Seguridad',
        emoji: '🔒',
        keywords: ['seguridad', 'vigilancia', 'cctv', 'ip']
      }
    ]
  },
  {
    id: 'impresoras',
    name: 'Impresoras y Scanners',
    emoji: '🖨️',
    keywords: ['impresora', 'printer', 'scanner', 'escaner'],
    subcategories: [
      {
        id: 'impresoras-laser',
        name: 'Impresoras Láser',
        emoji: '⚡',
        keywords: ['laser', 'monocromatica', 'blanco negro']
      },
      {
        id: 'impresoras-tinta',
        name: 'Impresoras de Tinta',
        emoji: '🎨',
        keywords: ['tinta', 'color', 'multifuncional']
      },
      {
        id: 'scanners',
        name: 'Scanners',
        emoji: '📄',
        keywords: ['scanner', 'escaner', 'digitalizador']
      }
    ]
  },
  {
    id: 'audio-video',
    name: 'Audio y Video',
    emoji: '🎧',
    keywords: ['audio', 'sonido', 'video'],
    subcategories: [
      {
        id: 'audifonos',
        name: 'Audífonos',
        emoji: '🎧',
        keywords: ['audifono', 'headphone', 'auricular', 'diadema']
      },
      {
        id: 'parlantes',
        name: 'Parlantes',
        emoji: '🔊',
        keywords: ['parlante', 'altavoz', 'speaker', 'bocina']
      },
      {
        id: 'microfonos',
        name: 'Micrófonos',
        emoji: '🎤',
        keywords: ['microfono', 'mic', 'streaming', 'podcast']
      }
    ]
  },
  {
    id: 'zona-gaming',
    name: 'Zona Gaming',
    emoji: '🎮',
    keywords: ['gaming', 'gamer', 'juegos'],
    subcategories: [
      {
        id: 'teclados-gaming',
        name: 'Teclados Gaming',
        emoji: '⌨️',
        keywords: ['teclado', 'keyboard', 'mecanico', 'rgb']
      },
      {
        id: 'mouse-gaming',
        name: 'Mouse Gaming',
        emoji: '🖱️',
        keywords: ['mouse', 'raton', 'gaming', 'rgb']
      },
      {
        id: 'sillas-gaming',
        name: 'Sillas Gaming',
        emoji: '🪑',
        keywords: ['silla', 'chair', 'gaming', 'ergonomica']
      },
      {
        id: 'controles',
        name: 'Controles',
        emoji: '🎮',
        keywords: ['control', 'joystick', 'gamepad', 'mando']
      }
    ]
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    emoji: '🔌',
    keywords: ['accesorio', 'complemento'],
    subcategories: [
      {
        id: 'teclados',
        name: 'Teclados',
        emoji: '⌨️',
        keywords: ['teclado', 'keyboard']
      },
      {
        id: 'mouse',
        name: 'Mouse',
        emoji: '🖱️',
        keywords: ['mouse', 'raton']
      },
      {
        id: 'cables',
        name: 'Cables y Adaptadores',
        emoji: '🔌',
        keywords: ['cable', 'adaptador', 'usb', 'hdmi']
      },
      {
        id: 'mochilas',
        name: 'Mochilas y Maletines',
        emoji: '🎒',
        keywords: ['mochila', 'maletin', 'bolso', 'funda']
      }
    ]
  },
  {
    id: 'linea-hogar',
    name: 'Línea Hogar',
    emoji: '🏠',
    keywords: ['hogar', 'casa', 'domestico'],
    subcategories: [
      {
        id: 'electrodomesticos',
        name: 'Electrodomésticos',
        emoji: '🔌',
        keywords: ['electrodomestico', 'nevera', 'lavadora', 'estufa']
      },
      {
        id: 'iluminacion',
        name: 'Iluminación',
        emoji: '💡',
        keywords: ['luz', 'lampara', 'bombillo', 'led']
      }
    ]
  },
  {
    id: 'celulares',
    name: 'Celulares',
    emoji: '📱',
    keywords: ['celular', 'telefono', 'movil', 'smartphone'],
    subcategories: [
      {
        id: 'smartphones',
        name: 'Smartphones',
        emoji: '📱',
        keywords: ['smartphone', 'celular', 'telefono']
      },
      {
        id: 'accesorios-celular',
        name: 'Accesorios para Celular',
        emoji: '🔋',
        keywords: ['funda', 'protector', 'cargador', 'auricular']
      }
    ]
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    emoji: '🏍️',
    keywords: ['vehiculo', 'transporte'],
    subcategories: [
      {
        id: 'motos',
        name: 'Motos',
        emoji: '🏍️',
        keywords: ['moto', 'motocicleta', 'scooter']
      },
      {
        id: 'bicicletas',
        name: 'Bicicletas',
        emoji: '🚴',
        keywords: ['bicicleta', 'bici', 'cicla']
      }
    ]
  },
  {
    id: 'cursos-digitales',
    name: 'Cursos Digitales',
    emoji: '📚',
    keywords: ['curso', 'capacitacion', 'aprender', 'estudiar'],
    subcategories: [
      {
        id: 'cursos-musica',
        name: 'Cursos de Música',
        emoji: '🎵',
        keywords: ['musica', 'piano', 'guitarra', 'canto']
      },
      {
        id: 'cursos-diseño',
        name: 'Cursos de Diseño',
        emoji: '🎨',
        keywords: ['diseño', 'photoshop', 'illustrator', 'grafico']
      },
      {
        id: 'cursos-programacion',
        name: 'Cursos de Programación',
        emoji: '💻',
        keywords: ['programacion', 'codigo', 'desarrollo', 'web']
      },
      {
        id: 'cursos-idiomas',
        name: 'Cursos de Idiomas',
        emoji: '🌍',
        keywords: ['idioma', 'ingles', 'frances', 'aleman']
      }
    ]
  },
  {
    id: 'megapacks',
    name: 'Megapacks',
    emoji: '📦',
    keywords: ['megapack', 'mega pack', 'paquete', 'bundle'],
    subcategories: [
      {
        id: 'megapack-musica',
        name: 'Megapack Música',
        emoji: '🎵',
        keywords: ['musica', 'produccion', 'beats']
      },
      {
        id: 'megapack-diseño',
        name: 'Megapack Diseño',
        emoji: '🎨',
        keywords: ['diseño', 'plantillas', 'recursos']
      },
      {
        id: 'megapack-desarrollo',
        name: 'Megapack Desarrollo',
        emoji: '💻',
        keywords: ['desarrollo', 'codigo', 'scripts']
      }
    ]
  }
]

/**
 * Buscar categoría y subcategoría basado en palabras clave
 */
export function findCategoryByKeywords(query: string): {
  category: Category | null
  subcategory: SubCategory | null
} {
  const queryLower = query.toLowerCase()
  
  for (const category of PRODUCT_CATEGORIES) {
    // Buscar en subcategorías primero (más específico)
    for (const subcategory of category.subcategories) {
      if (subcategory.keywords.some(keyword => queryLower.includes(keyword))) {
        return { category, subcategory }
      }
    }
    
    // Buscar en categoría general
    if (category.keywords.some(keyword => queryLower.includes(keyword))) {
      return { category, subcategory: null }
    }
  }
  
  return { category: null, subcategory: null }
}

/**
 * Obtener todas las categorías principales
 */
export function getAllCategories(): Category[] {
  return PRODUCT_CATEGORIES
}

/**
 * Obtener subcategorías de una categoría
 */
export function getSubcategories(categoryId: string): SubCategory[] {
  const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId)
  return category?.subcategories || []
}

/**
 * Generar mensaje de categorías disponibles
 */
export function generateCategoriesMessage(): string {
  let message = '📋 *CATEGORÍAS DISPONIBLES*\n\n'
  
  PRODUCT_CATEGORIES.forEach((category, index) => {
    message += `${category.emoji} *${category.name}*\n`
    
    // Mostrar subcategorías
    category.subcategories.forEach(sub => {
      message += `   ${sub.emoji} ${sub.name}\n`
    })
    
    if (index < PRODUCT_CATEGORIES.length - 1) {
      message += '\n'
    }
  })
  
  message += '\n💬 Escribe el nombre de la categoría o producto que buscas'
  
  return message
}

/**
 * Generar mensaje de subcategorías de una categoría específica
 */
export function generateSubcategoriesMessage(categoryId: string): string {
  const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId)
  
  if (!category) {
    return '❌ Categoría no encontrada'
  }
  
  let message = `${category.emoji} *${category.name.toUpperCase()}*\n\n`
  message += '📋 Subcategorías disponibles:\n\n'
  
  category.subcategories.forEach(sub => {
    message += `${sub.emoji} ${sub.name}\n`
  })
  
  message += '\n💬 ¿Qué subcategoría te interesa?'
  
  return message
}
