/**
 * Agente de Búsqueda
 * Busca productos según la consulta del usuario
 * Puede funcionar CON o SIN IA externa
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory, Product } from './shared-memory';
import { db } from '@/lib/db';
import { matchesIntent } from '@/lib/intent-patterns';

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
    
    // 🚨 PRIORIDAD 0: Si es pregunta sobre MÉTODOS DE PAGO, NO buscar productos
    if (this.isPaymentQuestion(cleanMsg)) {
      this.log('⚠️ Pregunta sobre métodos de pago detectada - NO buscar productos');
      return false; // Dejar que el PaymentAgent lo maneje
    }
    
    // 🚨 PRIORIDAD 1: Si hay producto en contexto y el mensaje NO es claramente una búsqueda nueva
    // NO manejar localmente, dejar que la IA interprete el contexto
    if (memory.currentProduct) {
      const isNewSearch = this.isExplicitNewSearch(cleanMsg);
      if (!isNewSearch) {
        this.log('⚠️ Hay producto en contexto y mensaje no es búsqueda nueva - Delegando a IA');
        return false; // Dejar que la IA interprete con contexto
      }
    }
    
    // 1. Palabras clave de productos
    const productKeywords = [
      'portatil', 'laptop', 'computador', 'pc',
      'moto', 'motocicleta',
      'curso', 'megapack', 'digital',
      'servicio', 'reparacion', 'tecnico'
    ];
    
    // 2. Palabras clave de precio/filtros
    const priceKeywords = [
      'economico', 'barato', 'caro', 'precio',
      'presupuesto', 'mas barato', 'mas economico',
      'menor precio', 'mayor precio', 'mas caro'
    ];
    
    // 3. Palabras de propósito (detectadas por razonamiento)
    const purposeKeywords = ['para', 'de', 'con'];
    
    const hasProductKeyword = productKeywords.some(k => cleanMsg.includes(k));
    const hasPriceKeyword = priceKeywords.some(k => cleanMsg.includes(k));
    const hasPurposeKeyword = purposeKeywords.some(k => cleanMsg.includes(k));
    
    // Puede manejar localmente si:
    // 1. Tiene palabra de producto
    // 2. Tiene palabra de precio (ej: "tienes más económico")
    // 3. Tiene palabra de propósito (ej: "para estudio")
    return hasProductKeyword || hasPriceKeyword || hasPurposeKeyword;
  }
  
  /**
   * Detecta si es una pregunta sobre métodos de pago
   */
  private isPaymentQuestion(msg: string): boolean {
    return matchesIntent(msg, 'payment_inquiry');
  }
  
  /**
   * Detecta si es una búsqueda nueva explícita
   */
  private isExplicitNewSearch(msg: string): boolean {
    const newSearchPatterns = [
      'busco', 'necesito', 'quiero ver', 'muestrame',
      'tienes', 'tienen', 'hay', 'venden',
      'otro', 'otra', 'diferente', 'algo mas',
      'que mas', 'que otros', 'que otras'
    ];
    return newSearchPatterns.some(p => msg.includes(p));
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
    
    // Sin resultados - DELEGAR A PREGUNTA GENERAL O IA
    if (products.length === 0) {
      // Verificar si es una pregunta general (no sobre productos)
      if (this.isGeneralQuestion(message)) {
        this.log('⚠️ Pregunta general detectada - Delegando a GeneralQAAgent');
        const { GeneralQAAgent } = await import('./general-qa-agent');
        const qaAgent = new GeneralQAAgent();
        return await qaAgent.execute(message, memory);
      }
      
      // Usar IA para manejar la falta de productos
      return await this.handleNoProducts(message, memory);
    }
    
    // Un solo producto - DELEGAR al ProductAgent para que maneje la presentación
    if (products.length === 1) {
      const product = products[0];
      memoryService.setCurrentProduct(memory.chatId, product, 'viewed');
      memory.currentProduct = product;
      
      this.log(`✅ Producto único encontrado: ${product.name} - Delegando a ProductAgent`);
      
      // DELEGAR al ProductAgent para que presente el producto correctamente
      // (información breve + foto en un solo mensaje)
      const { ProductAgent } = await import('./product-agent');
      const productAgent = new ProductAgent();
      return await productAgent.execute(message, memory);
    }
    
    // Múltiples productos - Guardar en memoria
    const topProducts = products.slice(0, 3);
    memory.interestedProducts = topProducts;
    
    // Establecer el primero como producto actual por defecto
    if (topProducts.length > 0) {
      // Guardar la lista completa para selección numérica
      memoryService.setProductList(memory.chatId, topProducts);

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
      
      // 🔥 CORRECCIÓN CRÍTICA: Si userId está vacío o es de test, buscar en TODOS los productos
      const whereClause: any = {
        status: 'AVAILABLE',
      };
      
      // Solo filtrar por userId si es un userId real (no de test)
      if (userId && !userId.startsWith('test_')) {
        whereClause.userId = userId;
      }
      
      // Obtener todos los productos disponibles y filtrar en memoria
      const allProducts = await db.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });
      
      // Calcular score de relevancia para cada producto
      const productsWithScore = allProducts.map(product => {
        const score = this.calculateProductScore(product, cleanQuery, keywords);
        return { product, score };
      }).filter(p => p.score > 0);
      
      // 🔥 NUEVO: Detectar si el usuario busca por precio O por categoría general (portátiles, motos, etc.)
      const priceKeywords = ['economico', 'barato', 'mas barato', 'menor precio', 'presupuesto'];
      const searchesCheapest = priceKeywords.some(k => cleanQuery.includes(k));
      
      // 🎯 NUEVO: Detectar búsqueda general de categoría (sin especificar modelo)
      const generalCategoryKeywords = ['portatil', 'laptop', 'computador', 'moto', 'motocicleta'];
      const isGeneralCategorySearch = generalCategoryKeywords.some(k => cleanQuery.includes(k)) &&
                                      !cleanQuery.includes('asus') && 
                                      !cleanQuery.includes('acer') &&
                                      !cleanQuery.includes('hp') &&
                                      !cleanQuery.includes('dell') &&
                                      !cleanQuery.includes('lenovo') &&
                                      !cleanQuery.includes('bajaj') &&
                                      !cleanQuery.includes('yamaha');
      
      if (searchesCheapest || isGeneralCategorySearch) {
        // Ordenar por precio ascendente (más barato primero)
        productsWithScore.sort((a, b) => {
          // Primero por score (relevancia) - solo si la diferencia es MUY grande
          if (Math.abs(a.score - b.score) > 20) {
            return b.score - a.score;
          }
          // Si tienen score similar, ordenar por precio (más económico primero)
          return a.product.price - b.product.price;
        });
        
        if (isGeneralCategorySearch) {
          this.log('💰 Búsqueda general de categoría detectada - Mostrando más económicos primero');
        } else {
          this.log('💰 Búsqueda por precio detectada - Mostrando más económicos primero');
        }
      } else {
        // Ordenar solo por score descendente
        productsWithScore.sort((a, b) => b.score - a.score);
      }
      
      // Log de los top 5 para debugging
      this.log('🔍 Top productos encontrados:');
      productsWithScore.slice(0, 5).forEach((p, i) => {
        this.log(`  ${i + 1}. ${p.product.name} (score: ${p.score}, precio: $${p.product.price.toLocaleString('es-CO')})`);
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
    
    // 🎯 REGLA CRÍTICA: Categoría principal tiene PRIORIDAD ABSOLUTA
    const queryCategoryHints = this.detectCategoryFromQuery(normalizedQuery);
    if (queryCategoryHints.length > 0) {
      // Buscar coincidencias en: categoría, subcategoría, nombre, tags
      const searchableFields = [category, subcategory, name, tags].filter(Boolean).join(' ');
      const hasMatchingCategory = queryCategoryHints.some(hint => 
        searchableFields.includes(hint)
      );
      
      if (hasMatchingCategory) {
        // ✅ BONUS MASIVO: Si coincide con la categoría esperada
        // Pero dar MÁS bonus si es el producto principal (no accesorio)
        
        // Detectar si es producto principal o accesorio
        const isAccessory = this.isAccessory(name);
        const isMainProduct = this.isMainProduct(name, queryCategoryHints);
        
        if (isMainProduct && !isAccessory) {
          score += 200; // BONUS MASIVO para producto principal real
          this.log(`🎯 PRODUCTO PRINCIPAL: "${product.name}" es el producto principal buscado`);
        } else if (isAccessory) {
          score += 50; // BONUS pequeño para accesorios
          this.log(`✅ ACCESORIO: "${product.name}" es un accesorio relacionado`);
        } else {
          score += 100; // BONUS normal para productos relacionados
          this.log(`✅ BONUS CATEGORÍA: "${product.name}" coincide con categoría esperada (${queryCategoryHints.join(', ')})`);
        }
      } else {
        // ❌ PENALIZACIÓN SEVERA: Si NO coincide con la categoría esperada
        score -= 100; // Penalización MASIVA
        this.log(`❌ PENALIZACIÓN CATEGORÍA: "${product.name}" no coincide con categoría esperada (${queryCategoryHints.join(', ')})`);
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
    
    // 8. 🔥 NUEVO: PENALIZACIÓN CRÍTICA - Marca específica NO coincide
    const brandKeywords = ['asus', 'hp', 'dell', 'lenovo', 'acer', 'apple', 'macbook', 'msi', 'samsung', 'bajaj', 'yamaha', 'honda', 'suzuki'];
    const brandInQuery = brandKeywords.find(b => fullQuery.includes(b));
    
    if (brandInQuery) {
      // El usuario buscó una marca específica
      const productHasBrand = name.includes(brandInQuery) || description.includes(brandInQuery);
      
      if (!productHasBrand) {
        // El producto NO tiene la marca buscada
        score -= 200; // PENALIZACIÓN MASIVA - Marca incorrecta
        this.log(`❌ MARCA INCORRECTA: Usuario buscó "${brandInQuery}" pero producto es "${product.name}"`);
      } else {
        // El producto SÍ tiene la marca buscada
        score += 80; // BONUS GRANDE - Marca correcta
        this.log(`✅ MARCA CORRECTA: "${brandInQuery}" encontrada en "${product.name}"`);
      }
    }
    
    // 9. PENALIZACIÓN FUERTE: Si es un "mega pack" pero el usuario NO buscó eso
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
   * Detecta si un producto es un accesorio (no el producto principal)
   */
  private isAccessory(name: string): boolean {
    const accessoryKeywords = [
      'base para', 'soporte', 'mouse', 'teclado', 'cable', 'cargador',
      'funda', 'estuche', 'protector', 'adaptador', 'hub', 'dock',
      'cooler', 'ventilador', 'limpiador', 'kit', 'accesorio'
    ];
    
    return accessoryKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Detecta si un producto es el producto principal buscado
   */
  private isMainProduct(name: string, categoryHints: string[]): boolean {
    // Para portátiles/laptops/computadores
    if (categoryHints.some(h => ['portatil', 'laptop', 'computador'].includes(h))) {
      const mainBrands = ['asus', 'acer', 'hp', 'dell', 'lenovo', 'macbook', 'msi', 'samsung'];
      return mainBrands.some(brand => name.includes(brand));
    }
    
    // Para motos
    if (categoryHints.some(h => ['moto', 'motocicleta'].includes(h))) {
      const motoBrands = ['bajaj', 'yamaha', 'honda', 'suzuki', 'kawasaki', 'ktm', 'pulsar'];
      return motoBrands.some(brand => name.includes(brand));
    }
    
    return false;
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
   * Maneja cuando no hay productos - USA IA para respuesta inteligente
   */
  private async handleNoProducts(query: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('⚠️ No se encontraron productos - Usando IA para respuesta inteligente');
    
    try {
      const { AIMultiProvider } = await import('@/lib/ai-multi-provider');
      
      // Obtener productos disponibles para ofrecer alternativas
      const allProducts = await this.getAllProducts(memory.userId);
      const categories = [...new Set(allProducts.map(p => p.category))];
      const brands = [...new Set(allProducts.map(p => {
        const name = p.name.toLowerCase();
        if (name.includes('asus')) return 'Asus';
        if (name.includes('hp')) return 'HP';
        if (name.includes('dell')) return 'Dell';
        if (name.includes('acer')) return 'Acer';
        if (name.includes('lenovo')) return 'Lenovo';
        if (name.includes('bajaj')) return 'Bajaj';
        if (name.includes('yamaha')) return 'Yamaha';
        return null;
      }).filter(Boolean))];
      
      // Prompt para IA
      const systemPrompt = `Eres un asistente de ventas de Tecnovariedades D&S.

El cliente buscó: "${query}"

NO TENEMOS ese producto exacto en stock.

CATEGORÍAS DISPONIBLES: ${categories.join(', ')}
MARCAS DISPONIBLES: ${brands.join(', ')}

Tu trabajo:
1. Ser HONESTO: Decir que NO tenemos ese producto específico
2. OFRECER ALTERNATIVAS: Sugerir productos similares que SÍ tenemos
3. SER ÚTIL: Preguntar qué características necesita

REGLAS:
- NO inventes productos que no tenemos
- NO digas que tenemos algo si no está en las marcas/categorías disponibles
- SÉ breve (máximo 4 líneas)
- Menciona "Tecnovariedades D&S"
- Usa emojis apropiados

Ejemplo:
"No tengo Lenovo en stock actualmente 😕 Pero en Tecnovariedades D&S tenemos excelentes laptops Asus y HP con características similares. ¿Qué uso le darás? (trabajo, estudio, diseño) Así te recomiendo la mejor opción 💻"`;

      const response = await AIMultiProvider.generateResponse(
        systemPrompt,
        `Cliente buscó: "${query}". Responde de forma honesta y útil.`,
        {
          temperature: 0.7,
          maxTokens: 150,
        }
      );
      
      return {
        text: response,
        nextAgent: 'search',
        confidence: 0.8,
      };
      
    } catch (error) {
      this.log('Error usando IA, usando respuesta por defecto:', error);
      
      // Fallback si la IA falla
      return {
        text: `No encontré productos que coincidan exactamente con "${query}" 😕

Pero en Tecnovariedades D&S tenemos muchas opciones similares.

¿Podrías contarme más sobre lo que necesitas?
• ¿Para qué lo usarás?
• ¿Qué características son importantes para ti?
• ¿Tienes un presupuesto en mente?`,
        nextAgent: 'search',
        confidence: 0.7,
      };
    }
  }
  
  /**
   * Maneja con IA (para consultas complejas)
   */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('Buscando con IA (razonamiento profundo)');
    
    try {
      // Importar servicio de IA dinámicamente
      const { AIMultiProvider } = await import('@/lib/ai-multi-provider');
      
      // Obtener lista de productos disponibles para contexto
      const allProducts = await this.getAllProducts(memory.userId);
      const productList = allProducts.slice(0, 20).map(p => 
        `- ${p.name} (${p.category}, $${p.price.toLocaleString('es-CO')})`
      ).join('\n');
      
      // Prompt para que la IA interprete la consulta
      const prompt = `Eres un asistente de ventas experto. El cliente preguntó: "${message}"

Productos disponibles:
${productList}

Tu tarea:
1. Interpretar qué está buscando el cliente
2. Identificar las palabras clave para buscar en la base de datos
3. Responder SOLO con las palabras clave separadas por espacios

Ejemplos:
- Cliente: "ese que sirve para diseñar" → Respuesta: "computador diseño gráfico"
- Cliente: "el que tiene más memoria" → Respuesta: "laptop ram almacenamiento"
- Cliente: "algo barato pero bueno" → Respuesta: "económico calidad precio"


Responde SOLO con las palabras clave, sin explicaciones:`;

      // Llamar a la IA con la firma correcta
      const aiResponse = await AIMultiProvider.generateCompletion([
        { role: 'user', content: prompt }
      ], {
        max_tokens: 50,
        temperature: 0.3, // Baja temperatura para respuestas precisas
      });
      
      const keywords = aiResponse.content.trim();
      this.log(`🤖 IA interpretó: "${message}" → "${keywords}"`);
      
      // Buscar con las keywords interpretadas
      const products = await this.searchProducts(keywords, memory.userId);
      
      if (products.length === 0) {
        return {
          text: `Entiendo que buscas ${keywords}, pero no encontré productos que coincidan. ¿Podrías darme más detalles? 🤔`,
          nextAgent: 'search',
          confidence: 0.6,
        };
      }
      
      // Un solo producto
      if (products.length === 1) {
        const product = products[0];
        const { SharedMemoryService } = await import('./shared-memory');
        const memoryService = SharedMemoryService.getInstance();
        memoryService.setCurrentProduct(memory.chatId, product, 'viewed');
        memory.currentProduct = product;
        memory.productInfoSent = true;
        
        this.log(`✅ Producto encontrado con IA: ${product.name}`);
        
        let response = `🎯 *${product.name}*\n\n`;
        
        if (product.description) {
          const desc = product.description.length > 200 
            ? product.description.substring(0, 200) + '...' 
            : product.description;
          response += `${desc}\n\n`;
        }
        
        response += `💰 *Precio:* ${product.price.toLocaleString('es-CO')} COP\n\n`;
        
        if (product.stock && product.stock > 0) {
          response += `✅ *Disponible:* ${product.stock} unidades\n\n`;
        }
        
        const categoryEmoji = product.category === 'DIGITAL' ? '💾' : product.category === 'PHYSICAL' ? '📦' : '🛠️';
        response += `${categoryEmoji} *Tipo:* ${product.category === 'DIGITAL' ? 'Producto Digital' : product.category === 'PHYSICAL' ? 'Producto Físico' : 'Servicio'}\n\n`;
        
        response += `¿Te gustaría comprarlo? 😊`;
        
        return {
          text: response,
          nextAgent: 'product',
          confidence: 0.9,
          actions: [
            {
              type: 'send_photo',
              product: product
            }
          ]
        };
      }
      
      // Múltiples productos
      const topProducts = products.slice(0, 3);
      memory.interestedProducts = topProducts;
      
      const { SharedMemoryService } = await import('./shared-memory');
      const memoryService = SharedMemoryService.getInstance();
      memoryService.setProductList(memory.chatId, topProducts);
      
      if (topProducts.length > 0) {
        memoryService.setCurrentProduct(memory.chatId, topProducts[0], 'viewed');
        memory.currentProduct = topProducts[0];
      }
      
      return this.showProductList(topProducts);
      
    } catch (error) {
      this.log('❌ Error usando IA, fallback a búsqueda local:', error);
      
      // Fallback a búsqueda local si falla la IA
      return this.handleLocally(message, memory);
    }
  }
  
  /**
   * Obtiene todos los productos disponibles
   */
  private async getAllProducts(userId: string): Promise<any[]> {
    try {
      const { db } = await import('@/lib/db');
      
      const whereClause: any = {
        status: 'AVAILABLE',
      };
      
      if (userId && !userId.startsWith('test_')) {
        whereClause.userId = userId;
      }
      
      return await db.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 50, // Limitar para no sobrecargar el prompt
      });
    } catch (error) {
      this.log('Error obteniendo productos:', error);
      return [];
    }
  }

  /**
   * Detecta si es una pregunta general (no sobre productos específicos)
   */
  private isGeneralQuestion(message: string): boolean {
    return matchesIntent(message, 'general_question');
  }
}
