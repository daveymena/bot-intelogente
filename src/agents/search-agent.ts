/**
 * Agente de Búsqueda
 * Busca productos según la consulta del usuario
 * Puede funcionar CON o SIN IA externa
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory, Product } from './shared-memory';
import { db } from '@/lib/db';

export class SearchAgent extends BaseAgent {
  constructor() {
    super('SearchAgent');
  }
  
  /**
   * Ejecuta el agente
   */
  async execute(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // Intentar manejar localmente primero
    if (this.canHandleLocally(message, memory)) {
      return this.handleLocally(message, memory);
    }
    
    // Si no, usar IA para interpretar consulta compleja
    return this.handleWithAI(message, memory);
  }
  
  /**
   * Determina si puede manejar localmente
   */
  canHandleLocally(message: string, memory: SharedMemory): boolean {
    const cleanMsg = this.cleanMessage(message);
    
    // Puede manejar localmente si contiene palabras clave claras
    const keywords = [
      'portatil', 'laptop', 'computador', 'pc',
      'moto', 'motocicleta',
      'curso', 'megapack', 'digital',
      'servicio', 'reparacion', 'tecnico'
    ];
    
    return keywords.some(k => cleanMsg.includes(k));
  }
  
  /**
   * Maneja búsqueda localmente
   */
  async handleLocally(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('Buscando productos localmente');
    
    // 🎯 NUEVO: Si el usuario está especificando un producto que ya vio
    const { SharedMemoryService } = await import('./shared-memory');
    const memoryService = SharedMemoryService.getInstance();
    
    if (memory.interestedProducts.length > 0) {
      const selectedProduct = this.findProductInList(message, memory.interestedProducts);
      if (selectedProduct) {
        this.log(`Usuario seleccionó producto específico: ${selectedProduct.name}`);
        memoryService.setCurrentProduct(memory.chatId, selectedProduct, 'interested');
        memory.currentProduct = selectedProduct;
        memory.interestedProducts = []; // Limpiar lista
        
        return {
          text: `Perfecto! Te cuento sobre *${selectedProduct.name}* 😊`,
          nextAgent: 'product',
          confidence: 0.95,
        };
      }
    }
    
    // Guardar búsqueda
    memory.lastQuery = message;
    memory.searchQueries.push(message);
    
    // Buscar productos
    const products = await this.searchProducts(message, memory.userId);
    
    this.log(`Encontrados ${products.length} productos`);
    
    // Sin resultados
    if (products.length === 0) {
      return this.handleNoProducts(message);
    }
    
    // Un solo producto - Mostrar información COMPLETA inmediatamente
    if (products.length === 1) {
      const product = products[0];
      memoryService.setCurrentProduct(memory.chatId, product, 'viewed');
      memory.currentProduct = product;
      memory.productInfoSent = true; // Marcar que ya enviamos info
      
      this.log(`✅ Producto único encontrado: ${product.name} - Mostrando info completa`);
      
      // Generar respuesta COMPLETA con toda la información
      let response = `🎯 *${product.name}*\n\n`;
      
      // Descripción (primeras 200 caracteres)
      if (product.description) {
        const desc = product.description.length > 200 
          ? product.description.substring(0, 200) + '...' 
          : product.description;
        response += `${desc}\n\n`;
      }
      
      // Precio
      response += `💰 *Precio:* ${product.price.toLocaleString('es-CO')} COP\n\n`;
      
      // Stock
      if (product.stock && product.stock > 0) {
        response += `✅ *Disponible:* ${product.stock} unidades\n\n`;
      }
      
      // Categoría
      const categoryEmoji = product.category === 'DIGITAL' ? '💾' : product.category === 'PHYSICAL' ? '📦' : '🛠️';
      response += `${categoryEmoji} *Tipo:* ${product.category === 'DIGITAL' ? 'Producto Digital' : product.category === 'PHYSICAL' ? 'Producto Físico' : 'Servicio'}\n\n`;
      
      // Llamado a la acción
      response += `¿Te gustaría comprarlo? 😊`;
      
      return {
        text: response,
        nextAgent: 'product',
        confidence: 0.95,
        actions: [
          {
            type: 'send_photo',
            product: product
          }
        ]
      };
    }
    
    // Múltiples productos - Guardar en memoria
    const topProducts = products.slice(0, 3);
    memory.interestedProducts = topProducts;
    
    // Establecer el primero como producto actual por defecto
    if (topProducts.length > 0) {
      memoryService.setCurrentProduct(memory.chatId, topProducts[0], 'viewed');
      memory.currentProduct = topProducts[0];
    }
    
    return this.showProductList(topProducts);
  }
  
  /**
   * Busca un producto específico en la lista de productos vistos
   */
  private findProductInList(message: string, products: Product[]): Product | null {
    const cleanMsg = this.cleanMessage(message);

    // 🔥 CORRECCIÓN CRÍTICA: Detectar selección por número (el 1, el 2, el 03, etc.)
    const numberSelection = this.detectNumberSelection(cleanMsg);
    if (numberSelection !== null) {
      this.log(`Detectada selección por número: ${numberSelection}`);
      const index = numberSelection - 1; // Convertir a índice base 0
      if (index >= 0 && index < products.length) {
        this.log(`Seleccionando producto ${numberSelection}: ${products[index].name}`);
        return products[index];
      }
    }

    // Buscar el producto que mejor coincida con el mensaje
    let bestMatch: { product: Product; score: number } | null = null;

    for (const product of products) {
      const productName = product.name.toLowerCase();
      const productWords = productName.split(' ').filter(w => w.length > 2);

      let score = 0;

      // Contar cuántas palabras del producto están en el mensaje
      productWords.forEach(word => {
        if (cleanMsg.includes(word)) {
          score += 1;
        }
      });

      // Si el mensaje contiene el nombre completo del producto
      if (cleanMsg.includes(productName)) {
        score += 10;
      }

      // Actualizar mejor match
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { product, score };
      }
    }

    // Solo devolver si el score es suficientemente alto
    if (bestMatch && bestMatch.score >= 2) {
      return bestMatch.product;
    }

    return null;
  }

  /**
   * Detecta selección de producto por número (el 1, el 2, el primero, etc.)
   */
  private detectNumberSelection(message: string): number | null {
    const cleanMsg = message.toLowerCase().trim();

    // Patrones de números
    const numberPatterns = [
      /\bel\s+(\d+)\b/i,  // "el 1", "el 2", "el 03"
      /\bla\s+(\d+)\b/i,  // "la 1", "la 2"
      /\blos\s+(\d+)\b/i, // "los 1", "los 2"
      /\blas\s+(\d+)\b/i, // "las 1", "las 2"
      /^(\d+)\b/i,        // "1", "2", "03" al inicio
    ];

    // Patrones de palabras
    const wordPatterns = [
      { pattern: /\bel\s+primero\b/i, number: 1 },
      { pattern: /\bla\s+primera\b/i, number: 1 },
      { pattern: /\bel\s+segundo\b/i, number: 2 },
      { pattern: /\bla\s+segunda\b/i, number: 2 },
      { pattern: /\bel\s+tercero\b/i, number: 3 },
      { pattern: /\bla\s+tercera\b/i, number: 3 },
      { pattern: /\bel\s+cuarto\b/i, number: 4 },
      { pattern: /\bla\s+cuarta\b/i, number: 4 },
      { pattern: /\bel\s+quinto\b/i, number: 5 },
      { pattern: /\bla\s+quinta\b/i, number: 5 },
    ];

    // Buscar patrones de palabras primero
    for (const { pattern, number } of wordPatterns) {
      if (pattern.test(cleanMsg)) {
        return number;
      }
    }

    // Buscar patrones de números
    for (const pattern of numberPatterns) {
      const match = cleanMsg.match(pattern);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number >= 1 && number <= 10) { // Máximo 10 productos
          return number;
        }
      }
    }

    return null;
  }

  /**
   * Aplica fuzzy matching para corregir errores tipográficos comunes
   */
  private applyFuzzyMatching(query: string): string {
    let corrected = query;

    // Correcciones comunes de palabras clave importantes
    const corrections: { [key: string]: string } = {
      'curioso': 'curso',
      'curios': 'cursos',
      'pian': 'piano',
      'musica': 'música',
      'musikas': 'música',
      'diseñ': 'diseño',
      'disen': 'diseño',
      'programacio': 'programación',
      'programacion': 'programación',
      'desarroll': 'desarrollo',
      'fotograf': 'fotografía',
      'foto': 'fotografía',
      'marketing': 'marketing',
      'ventas': 'ventas',
      'negoci': 'negocio',
      'emprended': 'emprendimiento',
      'idioma': 'idiomas',
      'ingles': 'inglés',
      'english': 'inglés',
      'portugues': 'portugués',
      'aleman': 'alemán',
      'frances': 'francés',
      'japones': 'japonés',
      'coreano': 'coreano',
      'ruso': 'ruso',
      'arabe': 'árabe',
      'hindi': 'hindi',
      'excel': 'excel',
      'word': 'word',
      'powerpoint': 'powerpoint',
      'photoshop': 'photoshop',
      'illustrator': 'illustrator',
      'autocad': 'autocad',
      'python': 'python',
      'javascript': 'javascript',
      'java': 'java',
      'react': 'react',
      'angular': 'angular',
      'vue': 'vue',
      'node': 'node',
      'php': 'php',
      'wordpress': 'wordpress',
      'woocommerce': 'woocommerce',
      'shopify': 'shopify',
      'figma': 'figma',
      'sketch': 'sketch',
      'xd': 'xd',
      'premiere': 'premiere',
      'after effects': 'after effects',
      'lightroom': 'lightroom',
      'indesign': 'indesign',
      'corel': 'corel',
      'trading': 'trading',
      'forex': 'forex',
      'criptomonedas': 'criptomonedas',
      'bitcoin': 'bitcoin',
      'inversiones': 'inversiones',
      'bolsa': 'bolsa',
      'acciones': 'acciones',
      'opciones': 'opciones',
      'futuros': 'futuros',
      'fitness': 'fitness',
      'gym': 'gym',
      'ejercicio': 'ejercicio',
      'yoga': 'yoga',
      'nutricion': 'nutrición',
      'dieta': 'dieta',
      'salud': 'salud',
      'medicina': 'medicina',
      'enfermeria': 'enfermería',
      'construccion': 'construcción',
      'plomeria': 'plomeria',
      'carpinteria': 'carpintería',
      'soldadura': 'soldadura',
      'mecanica': 'mecánica',
      'albañileria': 'albañilería',
      'memoria': 'memoria',
      'lectura': 'lectura',
      'rapida': 'rápida',
      'estudio': 'estudio',
      'aprendizaje': 'aprendizaje',
      'concentracion': 'concentración',
      'productividad': 'productividad',
      'motivacion': 'motivación',
      'computador': 'computador',
      'laptop': 'laptop',
      'portatil': 'portátil',
      'moto': 'moto',
      'motocicleta': 'motocicleta',
      'servicio': 'servicio',
      'reparacion': 'reparación',
      'tecnico': 'técnico'
    };

    // Aplicar correcciones
    Object.entries(corrections).forEach(([wrong, correct]) => {
      // Solo corregir si la palabra está sola o al inicio de otra palabra
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, correct);
    });

    return corrected;
  }

  /**
   * Busca productos en la base de datos
   */
  private async searchProducts(query: string, userId: string): Promise<Product[]> {
    try {
      const cleanQuery = this.cleanMessage(query);

      // 🔥 CORRECCIÓN: Aplicar fuzzy matching para corregir errores tipográficos
      const correctedQuery = this.applyFuzzyMatching(cleanQuery);
      if (correctedQuery !== cleanQuery) {
        this.log(`Query corregido: "${cleanQuery}" → "${correctedQuery}"`);
      }

      const keywords = correctedQuery.split(' ').filter(w => w.length > 2);
      
      // Obtener todos los productos del usuario y filtrar en memoria
      const allProducts = await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // Calcular score de relevancia para cada producto
      const productsWithScore = allProducts.map(product => {
        const score = this.calculateProductScore(product, cleanQuery, keywords);
        return { product, score };
      }).filter(p => p.score > 0);
      
      // Ordenar por score descendente
      productsWithScore.sort((a, b) => b.score - a.score);
      
      // Log de los top 5 para debugging
      this.log('🔍 Top productos encontrados:');
      productsWithScore.slice(0, 5).forEach((p, i) => {
        this.log(`  ${i + 1}. ${p.product.name} (score: ${p.score})`);
      });
      
      // Si el mejor match tiene un score muy alto (>= 20), solo devolver ese
      if (productsWithScore.length > 0 && productsWithScore[0].score >= 20) {
        // Verificar si hay un segundo producto con score similar (diferencia <= 5)
        if (productsWithScore.length >= 2) {
          const scoreDiff = productsWithScore[0].score - productsWithScore[1].score;
          
          // Si la diferencia es muy pequeña (empate técnico), mostrar ambos
          if (scoreDiff <= 5) {
            this.log(`⚖️ Empate técnico detectado (diff: ${scoreDiff}), mostrando top 2`);
            return productsWithScore.slice(0, 2).map(p => this.mapProduct(p.product));
          }
          
          // Si la diferencia es significativa (>= 10 puntos), solo el primero
          if (scoreDiff >= 10) {
            this.log(`✅ Match específico encontrado: ${productsWithScore[0].product.name} (score: ${productsWithScore[0].score}, diff: ${scoreDiff})`);
            return [this.mapProduct(productsWithScore[0].product)];
          }
        } else {
          // Solo hay un producto con buen score
          this.log(`✅ Match específico encontrado: ${productsWithScore[0].product.name} (score: ${productsWithScore[0].score})`);
          return [this.mapProduct(productsWithScore[0].product)];
        }
      }
      
      // Si hay una diferencia significativa entre el primero y el segundo (>= 10 puntos)
      // solo devolver el primero
      if (productsWithScore.length >= 2) {
        const scoreDiff = productsWithScore[0].score - productsWithScore[1].score;
        if (scoreDiff >= 10) {
          this.log(`✅ Diferencia significativa: ${productsWithScore[0].product.name} es mucho mejor (diff: ${scoreDiff})`);
          return [this.mapProduct(productsWithScore[0].product)];
        }
      }
      
      // Filtrar productos con score mínimo de 4 (evita productos irrelevantes)
      const MIN_SCORE = 4;
      const relevantProducts = productsWithScore.filter(p => p.score >= MIN_SCORE);
      
      // Si no hay productos relevantes, devolver los top 3 originales
      if (relevantProducts.length === 0) {
        const topProducts = productsWithScore.slice(0, 3);
        return topProducts.map(p => this.mapProduct(p.product));
      }
      
      // Devolver top 3 productos relevantes (score >= 4)
      const topProducts = relevantProducts.slice(0, 3);
      
      return topProducts.map(p => this.mapProduct(p.product));
    } catch (error) {
      this.log('Error buscando productos:', error);
      return [];
    }
  }
  
  /**
   * Detecta la categoría esperada desde la query del usuario
   */
  private detectCategoryFromQuery(query: string): string[] {
    const hints: string[] = [];
    
    // Computadores y laptops
    if (/portatil|laptop|computador|pc|notebook/i.test(query)) {
      hints.push('computador', 'laptop', 'portatil');
    }
    
    // Motos
    if (/moto|motocicleta|scooter/i.test(query)) {
      hints.push('moto', 'motocicleta');
    }
    
    // Cursos y educación
    if (/curso|aprender|estudiar|clase|leccion|tutorial/i.test(query)) {
      hints.push('curso', 'educacion', 'digital');
    }
    
    // Megapacks
    if (/megapack|pack|paquete|coleccion/i.test(query)) {
      hints.push('megapack', 'pack', 'digital');
    }
    
    // Servicios técnicos
    if (/reparacion|servicio|tecnico|arreglo|mantenimiento/i.test(query)) {
      hints.push('servicio', 'reparacion', 'tecnico');
    }
    
    // Accesorios y consumibles
    if (/tinta|cartucho|toner|cinta|papel|accesorio/i.test(query)) {
      hints.push('accesorio', 'consumible', 'tinta');
    }
    
    // Pilas y baterías
    if (/pila|bateria|cargador|energia/i.test(query)) {
      hints.push('pila', 'bateria', 'energia');
    }
    
    return hints;
  }
  
  /**
   * Normaliza texto removiendo tildes y caracteres especiales
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remover tildes
  }
  
  /**
   * Calcula el score de relevancia de un producto
   */
  private calculateProductScore(product: any, fullQuery: string, keywords: string[]): number {
    const name = this.normalizeText(product.name);
    const description = this.normalizeText(product.description || '');
    const category = this.normalizeText(product.category || '');
    const subcategory = this.normalizeText(product.subcategory || '');
    const tags = this.normalizeText(product.tags || '');
    const normalizedQuery = this.normalizeText(fullQuery);
    
    let score = 0;
    
    // 🎯 NUEVA REGLA: Penalizar productos de categorías completamente diferentes
    const queryCategoryHints = this.detectCategoryFromQuery(normalizedQuery);
    if (queryCategoryHints.length > 0) {
      const productCategories = [category, subcategory].filter(Boolean);
      const hasMatchingCategory = queryCategoryHints.some(hint => 
        productCategories.some(cat => cat.includes(hint))
      );
      
      // Si la query sugiere una categoría específica y el producto NO está en esa categoría
      // aplicar penalización SEVERA
      if (!hasMatchingCategory) {
        score -= 50; // Penalización grande
        this.log(`❌ PENALIZACIÓN: "${product.name}" no coincide con categoría esperada (${queryCategoryHints.join(', ')})`);
      }
    }
    
    // 🔥 REGLA FUNDAMENTAL: Detectar si es un producto genérico (Mega Pack)
    const isGenericPack = name.includes('mega pack') || name.includes('pack completo') || name.includes('pack ');
    const userSearchedPack = fullQuery.includes('pack') || fullQuery.includes('megapack');
    
    // 1. Match exacto en el nombre (muy alto)
    if (name === normalizedQuery) {
      score += 100; // Aumentado de 50 a 100
    }
    
    // 2. Nombre contiene la query completa
    if (name.includes(normalizedQuery)) {
      score += 60; // Aumentado de 30 a 60
    }
    
    // 2.5. BONUS: Subcategoría coincide con keywords
    if (subcategory) {
      keywords.forEach(keyword => {
        if (subcategory.includes(keyword)) {
          score += 15;
          this.log(`✅ Keyword en subcategoría: "${keyword}" en "${subcategory}"`);
        }
      });
    }
    
    // 3. NUEVO: Detectar palabras clave específicas importantes (idiomas, temas específicos)
    const specificKeywords = this.extractSpecificKeywords(normalizedQuery).map(k => this.normalizeText(k));
    
    // 3a. BONUS EXTRA: Si TODAS las keywords específicas están en el NOMBRE, bonus grande
    if (specificKeywords.length >= 2) {
      const allSpecificInName = specificKeywords.every(k => name.includes(k));
      if (allSpecificInName) {
        score += 50; // BONUS MUY GRANDE cuando todas las palabras específicas están en el nombre
        this.log(`🎯 MATCH PERFECTO: Todas las keywords específicas en nombre: ${product.name}`);
      }
    }
    
    // 3b. Si hay UNA keyword específica en el nombre, bonus grande
    specificKeywords.forEach(keyword => {
      if (name.includes(keyword)) {
        // 🔥 BONUS EXTRA: Si la keyword específica está en el nombre Y el nombre es corto/específico
        // (no es un mega pack genérico), dar bonus MASIVO
        const isGenericPack = name.includes('mega pack') || name.includes('pack completo');
        
        if (!isGenericPack) {
          score += 50; // BONUS MASIVO para productos específicos con la keyword
          this.log(`🎯 MATCH ESPECÍFICO: "${keyword}" en producto específico "${product.name}"`);
        } else {
          score += 30; // Bonus normal para packs genéricos
          this.log(`✅ Keyword específica encontrada en nombre: "${keyword}" en "${product.name}"`);
        }
      } else if (description.includes(keyword)) {
        score += 15; // También alto en descripción
        this.log(`✅ Keyword específica encontrada en descripción: "${keyword}"`);
      } else if (tags.includes(keyword)) {
        score += 20; // Alto en tags
        this.log(`✅ Keyword específica encontrada en tags: "${keyword}"`);
      }
    });
    
    // 4. Todas las keywords están en el nombre
    const allKeywordsInName = keywords.every(k => name.includes(k));
    if (allKeywordsInName && keywords.length > 1) {
      score += 20; // Aumentado de 15 a 20
    }
    
    // 4b. NUEVO: Si todas las keywords importantes están en el nombre (ignorando palabras comunes)
    const importantKeywords = keywords.filter(k => !this.isCommonWord(k));
    const allImportantInName = importantKeywords.every(k => name.includes(k));
    if (allImportantInName && importantKeywords.length >= 2) {
      score += 25; // BONUS grande cuando todas las palabras importantes coinciden
      this.log(`🎯 Todas las keywords importantes en nombre: ${product.name}`);
    }
    
    // 5. Keywords individuales en el nombre
    keywords.forEach(keyword => {
      if (name.includes(keyword)) {
        // 🔥 NUEVO: Si la keyword NO es común, dar mucho más peso
        if (!this.isCommonWord(keyword)) {
          // Si es un producto específico (no pack), dar MUCHO más peso
          if (!isGenericPack) {
            score += 40; // PESO MASIVO para palabras únicas en productos específicos
            this.log(`🎯 Palabra única "${keyword}" en producto específico: ${product.name}`);
          } else {
            score += 10; // Peso normal para packs
          }
        } else {
          score += 6; // Peso bajo para palabras comunes
        }
      }
    });
    
    // 6. Keywords en descripción (peso bajo)
    keywords.forEach(keyword => {
      if (description.includes(keyword)) {
        score += 1;
      }
    });
    
    // 7. Keywords en categoría
    keywords.forEach(keyword => {
      if (category.includes(keyword)) {
        score += 3;
      }
    });
    
    // 8. PENALIZACIÓN FUERTE: Si es un "mega pack" pero el usuario NO buscó eso
    if (isGenericPack && !userSearchedPack) {
      // El usuario NO buscó un pack, pero este producto es un pack
      // 🔥 PENALIZACIÓN MASIVA: Los packs genéricos NO deben aparecer si el usuario busca algo específico
      
      // Detectar si el usuario buscó algo específico (palabras no comunes)
      const hasSpecificSearch = keywords.some(k => !this.isCommonWord(k));
      
      if (hasSpecificSearch || specificKeywords.length > 0) {
        score -= 50; // PENALIZACIÓN MASIVA cuando busca algo específico
        this.log(`❌ Penalizando pack MASIVAMENTE: ${product.name} (usuario buscó algo específico, no pack)`);
      } else {
        score -= 30; // Penalización fuerte
        this.log(`❌ Penalizando pack fuertemente: ${product.name} (usuario no buscó pack)`);
      }
    }
    
    // 9. PENALIZACIÓN: Si el producto NO contiene ninguna keyword específica pero el usuario sí buscó algo específico
    if (specificKeywords.length > 0) {
      const hasAnySpecificKeyword = specificKeywords.some(k => 
        name.includes(k) || description.includes(k) || tags.includes(k)
      );
      if (!hasAnySpecificKeyword) {
        score -= 20; // Penalización MUY fuerte si no tiene la keyword específica
        this.log(`❌ Producto no contiene keywords específicas: ${product.name}`);
      }
    }
    
    // 10. PENALIZACIÓN: Si tiene palabras que NO están en la query
    const nameWords = name.split(' ').filter(w => w.length > 2);
    const unmatchedWords = nameWords.filter(w => !fullQuery.includes(w) && !this.isCommonWord(w));
    if (unmatchedWords.length > 4) {
      score -= 3;
    }
    
    // 11. BONUS: Si el nombre es corto y específico (no es un pack genérico)
    if (!isGenericPack && nameWords.length <= 5) {
      score += 2;
    }
    
    return Math.max(0, score); // No permitir scores negativos
  }
  
  /**
   * Extrae palabras clave específicas importantes de la query
   * Estas son palabras que indican un tema muy específico
   */
  private extractSpecificKeywords(query: string): string[] {
    const specificWords: string[] = [];
    
    // Idiomas (IMPORTANTE: incluir "idiomas" como palabra clave)
    const languages = ['idiomas', 'idioma', 'language', 'languages',
                      'ingles', 'inglés', 'english', 'frances', 'francés', 'aleman', 'alemán', 
                      'italiano', 'portugues', 'portugués', 'chino', 'japones', 'japonés',
                      'coreano', 'ruso', 'arabe', 'árabe', 'hindi'];
    languages.forEach(lang => {
      if (query.includes(lang)) {
        specificWords.push(lang);
      }
    });
    
    // Instrumentos musicales
    const instruments = ['piano', 'guitarra', 'violin', 'violín', 'bateria', 'batería', 'bajo', 'saxofon', 'saxofón', 'flauta', 'trompeta', 'clarinete'];
    instruments.forEach(inst => {
      if (query.includes(inst)) {
        specificWords.push(inst);
      }
    });
    
    // Tecnologías/Software específicos
    const tech = ['excel', 'word', 'powerpoint', 'photoshop', 'illustrator', 'autocad', 
                  'python', 'javascript', 'java', 'react', 'angular', 'vue', 'node', 'php',
                  'wordpress', 'woocommerce', 'shopify', 'figma', 'sketch', 'xd',
                  'premiere', 'after effects', 'lightroom', 'indesign', 'corel'];
    tech.forEach(t => {
      if (query.includes(t)) {
        specificWords.push(t);
      }
    });
    
    // Diseño y Arte (NUEVO - muy importante)
    const design = ['diseño', 'diseno', 'grafico', 'gráfico', 'logo', 'branding',
                   'web design', 'graphic design', '3d', 'animacion', 'animación', 'ilustracion', 'ilustración',
                   'dibujo', 'pintura', 'arte', 'creativo'];
    design.forEach(d => {
      if (query.includes(d)) {
        specificWords.push(d);
      }
    });
    
    // UI/UX (con word boundaries para evitar falsos positivos)
    if (/\bui\b/.test(query) || /\bux\b/.test(query)) {
      if (/\bui\b/.test(query)) specificWords.push('ui');
      if (/\bux\b/.test(query)) specificWords.push('ux');
    }
    
    // Temas de negocio y profesionales
    const business = ['marketing', 'ventas', 'contabilidad', 'finanzas', 'administracion', 'administración',
                     'recursos humanos', 'rrhh', 'emprendimiento', 'negocios', 'startup',
                     'ecommerce', 'dropshipping', 'amazon', 'mercadolibre'];
    business.forEach(b => {
      if (query.includes(b)) {
        specificWords.push(b);
      }
    });
    
    // Gastronomía y cocina
    const cooking = ['cocina', 'reposteria', 'repostería', 'panaderia', 'panadería', 'chef',
                    'gastronomia', 'gastronomía', 'pasteleria', 'pastelería', 'bartender'];
    cooking.forEach(c => {
      if (query.includes(c)) {
        specificWords.push(c);
      }
    });
    
    // Fotografía y video
    const media = ['fotografia', 'fotografía', 'foto', 'video', 'edicion', 'edición',
                  'filmacion', 'filmación', 'camara', 'cámara', 'produccion', 'producción'];
    media.forEach(m => {
      if (query.includes(m)) {
        specificWords.push(m);
      }
    });
    
    // Programación y desarrollo
    const programming = ['programacion', 'programación', 'desarrollo', 'developer', 'codigo', 'código',
                        'app', 'aplicacion', 'aplicación', 'software', 'web', 'mobile', 'android', 'ios'];
    programming.forEach(p => {
      if (query.includes(p)) {
        specificWords.push(p);
      }
    });
    
    // Hacking y seguridad
    const security = ['hacking', 'seguridad', 'ciberseguridad', 'pentesting', 'ethical hacking',
                     'kali', 'linux', 'redes'];
    security.forEach(s => {
      if (query.includes(s)) {
        specificWords.push(s);
      }
    });
    
    // Trading y finanzas
    const trading = ['trading', 'forex', 'criptomonedas', 'bitcoin', 'inversiones', 'bolsa',
                    'acciones', 'opciones', 'futuros'];
    trading.forEach(t => {
      if (query.includes(t)) {
        specificWords.push(t);
      }
    });
    
    // Salud y fitness
    const health = ['fitness', 'gym', 'ejercicio', 'yoga', 'nutricion', 'nutrición', 'dieta',
                   'salud', 'medicina', 'enfermeria', 'enfermería'];
    health.forEach(h => {
      if (query.includes(h)) {
        specificWords.push(h);
      }
    });
    
    // Construcción y oficios
    const construction = ['construccion', 'construcción', 'electricidad', 'plomeria', 'plomería',
                         'carpinteria', 'carpintería', 'soldadura', 'mecanica', 'mecánica',
                         'drywall', 'pintura', 'albañileria', 'albañilería'];
    construction.forEach(c => {
      if (query.includes(c)) {
        specificWords.push(c);
      }
    });
    
    // Educación y desarrollo personal
    const education = ['memoria', 'lectura', 'rapida', 'rápida', 'estudio', 'aprendizaje',
                      'concentracion', 'concentración', 'productividad', 'motivacion', 'motivación'];
    education.forEach(e => {
      if (query.includes(e)) {
        specificWords.push(e);
      }
    });
    
    return specificWords;
  }
  
  /**
   * Verifica si una palabra es común y no debe penalizar
   */
  private isCommonWord(word: string): boolean {
    const commonWords = [
      'curso', 'completo', 'desde', 'cero', 'hasta', 'nivel', 'avanzado',
      'basico', 'intermedio', 'profesional', 'pack', 'mega', 'digital',
      'online', 'virtual', 'aprende', 'aprenda', 'guia', 'manual'
    ];
    return commonWords.includes(word.toLowerCase());
  }
  
  /**
   * Mapea un producto de Prisma a Product
   */
  private mapProduct(p: any): Product {
    // 🔥 CORRECCIÓN: images puede ser string (URL) o JSON array
    let images: string[] = [];
    if (p.images) {
      if (typeof p.images === 'string') {
        // Si es string, puede ser una URL directa o un JSON
        if (p.images.startsWith('http')) {
          // Es una URL directa
          images = [p.images];
        } else if (p.images.startsWith('[')) {
          // Es un JSON array
          try {
            const parsed = JSON.parse(p.images);
            // Filtrar solo URLs válidas
            images = Array.isArray(parsed) 
              ? parsed.filter((img: any) => typeof img === 'string' && img.startsWith('http'))
              : [];
          } catch (e) {
            // Si falla el parse, intentar usar como string si es URL
            if (p.images.startsWith('http')) {
              images = [p.images];
            }
          }
        } else {
          // Otro formato, solo usar si es URL
          if (p.images.startsWith('http')) {
            images = [p.images];
          }
        }
      } else if (Array.isArray(p.images)) {
        // Ya es un array, filtrar solo URLs válidas
        images = p.images.filter((img: any) => typeof img === 'string' && img.startsWith('http'));
      }
    }
    
    return {
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      price: p.price,
      category: p.category,
      images,
      stock: p.stock || undefined,
    };
  }
  
  /**
   * Muestra lista de productos
   */
  private showProductList(products: Product[]): AgentResponse {
    let text = `Tenemos varias opciones disponibles! 💻\n\n`;
    
    products.forEach((p, i) => {
      text += `📦 *${p.name}*\n`;
      if (p.description) {
        const shortDesc = p.description.substring(0, 80);
        text += `${shortDesc}${p.description.length > 80 ? '...' : ''}\n`;
      }
      text += `💰 ${this.formatPrice(p.price)}\n\n`;
    });
    
    text += `¿Cuál te interesa más? 🤔`;
    
    return {
      text,
      nextAgent: 'product',
      sendPhotos: false, // NO enviar fotos con múltiples productos
      confidence: 0.85,
    };
  }
  
  /**
   * Maneja cuando no hay productos
   */
  private handleNoProducts(query: string): AgentResponse {
    return {
      text: `No encontré productos que coincidan con "${query}" 😕

¿Podrías darme más detalles sobre lo que buscas?

Por ejemplo:
• ¿Es un computador, moto, curso o servicio?
• ¿Qué características necesitas?
• ¿Tienes un presupuesto en mente?`,
      nextAgent: 'search',
      confidence: 0.7,
    };
  }
  
  /**
   * Maneja con IA (para consultas complejas)
   */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('Buscando con IA (razonamiento profundo)');
    
    // Aquí se integraría con Groq/Ollama para interpretar consultas complejas
    // Por ejemplo: "ese que sirve para diseñar" → "computador para diseño"
    
    // Por ahora, fallback a búsqueda local
    return this.handleLocally(message, memory);
  }
}
