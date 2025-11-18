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
    if (memory.interestedProducts.length > 0) {
      const selectedProduct = this.findProductInList(message, memory.interestedProducts);
      if (selectedProduct) {
        this.log(`Usuario seleccionó producto específico: ${selectedProduct.name}`);
        memory.currentProduct = selectedProduct;
        memory.photoSent = false;
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
    
    // Un solo producto
    if (products.length === 1) {
      memory.currentProduct = products[0];
      memory.photoSent = false; // Resetear flag de foto
      
      // Generar descripción completa del producto
      const product = products[0];
      const price = this.formatPrice(product.price);
      
      let text = `¡Perfecto! 😊 Encontré el *${product.name}*\n\n`;
      
      // Descripción
      if (product.description) {
        const shortDesc = product.description.substring(0, 150);
        text += `📝 ${shortDesc}${product.description.length > 150 ? '...' : ''}\n\n`;
      }
      
      // Precio
      text += `💰 *Precio:* ${price}\n\n`;
      
      // Disponibilidad
      if (product.stock !== undefined && product.stock > 0) {
        text += `✅ *Disponible* (${product.stock} unidades)\n\n`;
      } else if (product.stock === undefined) {
        text += `✅ *Disponible para entrega inmediata*\n\n`;
      }
      
      // Call to action
      text += `¿Te gustaría comprarlo? 🛒`;
      
      return {
        text,
        nextAgent: 'payment',
        confidence: 0.9,
        sendPhotos: !memory.photoSent && product.images && product.images.length > 0,
        photos: product.images && product.images.length > 0 ? product.images : undefined,
      };
    }
    
    // Múltiples productos
    memory.interestedProducts = products.slice(0, 3);
    
    return this.showProductList(products.slice(0, 3));
  }
  
  /**
   * Busca un producto específico en la lista de productos vistos
   */
  private findProductInList(message: string, products: Product[]): Product | null {
    const cleanMsg = this.cleanMessage(message);
    
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
   * Busca productos en la base de datos
   */
  private async searchProducts(query: string, userId: string): Promise<Product[]> {
    try {
      const cleanQuery = this.cleanMessage(query);
      const keywords = cleanQuery.split(' ').filter(w => w.length > 2);
      
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
    const tags = this.normalizeText(product.tags || '');
    const normalizedQuery = this.normalizeText(fullQuery);
    
    let score = 0;
    
    // 1. Match exacto en el nombre (muy alto)
    if (name === normalizedQuery) {
      score += 50;
    }
    
    // 2. Nombre contiene la query completa
    if (name.includes(normalizedQuery)) {
      score += 30;
    }
    
    // 3. NUEVO: Detectar palabras clave específicas importantes (idiomas, temas específicos)
    const specificKeywords = this.extractSpecificKeywords(normalizedQuery).map(k => this.normalizeText(k));
    
    // 3a. BONUS EXTRA: Si TODAS las keywords específicas están en el NOMBRE, bonus grande
    if (specificKeywords.length >= 2) {
      const allSpecificInName = specificKeywords.every(k => name.includes(k));
      if (allSpecificInName) {
        score += 40; // BONUS MUY GRANDE cuando todas las palabras específicas están en el nombre
        this.log(`🎯 MATCH PERFECTO: Todas las keywords específicas en nombre: ${product.name}`);
      }
    }
    
    specificKeywords.forEach(keyword => {
      if (name.includes(keyword)) {
        score += 25; // Peso MUY alto para palabras específicas
        this.log(`✅ Keyword específica encontrada en nombre: "${keyword}" en "${product.name}"`);
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
      score += 15;
    }
    
    // 5. Keywords individuales en el nombre (peso alto)
    keywords.forEach(keyword => {
      if (name.includes(keyword)) {
        score += 5;
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
    
    // 8. PENALIZACIÓN FUERTE: Si es un "mega pack" o "pack completo" pero el usuario NO buscó eso
    const isPackProduct = name.includes('mega pack') || name.includes('pack completo') || name.includes('pack ');
    const userSearchedPack = fullQuery.includes('pack') || fullQuery.includes('megapack');
    
    if (isPackProduct && !userSearchedPack) {
      // El usuario NO buscó un pack, pero este producto es un pack
      score -= 15; // Penalización MUY fuerte
      this.log(`❌ Penalizando pack: ${product.name} (usuario no buscó pack)`);
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
    if (!isPackProduct && nameWords.length <= 5) {
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
    const design = ['diseño', 'diseno', 'grafico', 'gráfico', 'logo', 'branding', 'ui', 'ux',
                   'web design', 'graphic design', '3d', 'animacion', 'animación', 'ilustracion', 'ilustración',
                   'dibujo', 'pintura', 'arte', 'creativo'];
    design.forEach(d => {
      if (query.includes(d)) {
        specificWords.push(d);
      }
    });
    
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
    return {
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      price: p.price,
      category: p.category,
      images: p.images ? JSON.parse(p.images) : [],
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
