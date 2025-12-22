/**
 * 🎯 Detector de Tipo de Producto
 * Distingue entre productos físicos y digitales para evitar confusiones
 */

export interface ProductTypeIntent {
  isPhysicalProduct: boolean
  isDigitalProduct: boolean
  category: 'PHYSICAL' | 'DIGITAL' | 'UNKNOWN'
  confidence: number
  reasoning: string
}

export class ProductTypeDetector {
  /**
   * Detecta si el usuario busca un producto físico o digital
   */
  static detectProductType(query: string): ProductTypeIntent {
    const queryLower = query.toLowerCase()

    // 🖥️ Indicadores de PRODUCTO FÍSICO
    const physicalIndicators = [
      // Dispositivos
      'portátil', 'portatil', 'laptop', 'computador', 'computadora', 'pc',
      'moto', 'motocicleta', 'bicicleta', 'carro', 'auto',
      'celular', 'teléfono', 'telefono', 'smartphone',
      'tablet', 'ipad',
      
      // Accesorios
      'mouse', 'teclado', 'monitor', 'pantalla',
      'audífono', 'audifono', 'auricular',
      'cargador', 'cable', 'funda',
      
      // Contexto físico
      'nuevo', 'usado', 'segunda mano',
      'garantía', 'garantia', 'envío', 'envio',
      'entrega', 'domicilio',
      
      // Especificaciones físicas
      'ram', 'gb', 'ssd', 'disco duro',
      'procesador', 'intel', 'amd', 'ryzen',
      'pantalla', 'pulgadas', '"',
      
      // Verbos de compra física
      'comprar uno', 'busco uno', 'necesito uno',
      'quiero uno', 'uno para'
    ]

    // 📚 Indicadores de PRODUCTO DIGITAL
    const digitalIndicators = [
      // Cursos
      'curso', 'cursos', 'capacitación', 'capacitacion',
      'aprender', 'aprende', 'enseñar',
      'clases', 'lecciones', 'tutorial',
      
      // Megapacks
      'megapack', 'mega pack', 'pack', 'paquete',
      'colección', 'coleccion', 'recopilación', 'recopilacion',
      
      // Contenido digital
      'ebook', 'libro digital', 'pdf',
      'video', 'videos', 'grabación', 'grabacion',
      'descarga', 'descargar', 'download',
      
      // Entrega digital
      'google drive', 'drive', 'link', 'enlace',
      'acceso inmediato', 'online', 'virtual'
    ]

    // Contar coincidencias
    let physicalScore = 0
    let digitalScore = 0

    physicalIndicators.forEach(indicator => {
      if (queryLower.includes(indicator)) {
        physicalScore++
      }
    })

    digitalIndicators.forEach(indicator => {
      if (queryLower.includes(indicator)) {
        digitalScore++
      }
    })

    // 🎯 REGLAS ESPECIALES

    // Si menciona "uno para [uso]" → Producto físico
    if (queryLower.match(/uno para (diseñar|diseño|trabajar|estudiar|jugar|gaming)/i)) {
      physicalScore += 5
      console.log(`🎯 [Type Detector] "uno para..." detectado → Producto FÍSICO`)
    }

    // Si menciona "curso de [tema]" → Producto digital
    if (queryLower.match(/curso de|cursos de|aprender|capacitación/i)) {
      digitalScore += 5
      console.log(`🎯 [Type Detector] "curso de..." detectado → Producto DIGITAL`)
    }

    // Si menciona especificaciones técnicas → Producto físico
    if (queryLower.match(/\d+gb|\d+ram|intel|amd|ryzen|i\d|core/i)) {
      physicalScore += 3
      console.log(`🎯 [Type Detector] Especificaciones técnicas → Producto FÍSICO`)
    }

    // Determinar tipo
    let category: 'PHYSICAL' | 'DIGITAL' | 'UNKNOWN' = 'UNKNOWN'
    let confidence = 0
    let reasoning = ''

    if (physicalScore > digitalScore) {
      category = 'PHYSICAL'
      confidence = Math.min(physicalScore / (physicalScore + digitalScore), 1)
      reasoning = `Detectado como físico (score: ${physicalScore} vs ${digitalScore})`
    } else if (digitalScore > physicalScore) {
      category = 'DIGITAL'
      confidence = Math.min(digitalScore / (physicalScore + digitalScore), 1)
      reasoning = `Detectado como digital (score: ${digitalScore} vs ${physicalScore})`
    } else {
      category = 'UNKNOWN'
      confidence = 0.5
      reasoning = 'No se pudo determinar el tipo'
    }

    console.log(`🎯 [Type Detector] Resultado: ${category} (confianza: ${(confidence * 100).toFixed(0)}%)`)
    console.log(`   Reasoning: ${reasoning}`)

    return {
      isPhysicalProduct: category === 'PHYSICAL',
      isDigitalProduct: category === 'DIGITAL',
      category,
      confidence,
      reasoning
    }
  }

  /**
   * Filtra productos por tipo
   */
  static filterByType(products: any[], typeIntent: ProductTypeIntent): any[] {
    if (typeIntent.category === 'UNKNOWN') {
      return products // No filtrar si no estamos seguros
    }

    const filtered = products.filter(p => {
      if (typeIntent.isPhysicalProduct) {
        return p.category === 'PHYSICAL'
      }
      if (typeIntent.isDigitalProduct) {
        return p.category === 'DIGITAL'
      }
      return true
    })

    console.log(`🎯 [Type Detector] Filtrados ${filtered.length}/${products.length} productos (tipo: ${typeIntent.category})`)

    return filtered
  }
}
