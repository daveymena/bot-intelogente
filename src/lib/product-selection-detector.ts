/**
 * 🎯 DETECTOR DE SELECCIÓN DE PRODUCTOS
 * Detecta cuando el cliente elige un producto específico de una lista
 */

export interface ProductSelection {
  isSelection: boolean;
  position?: number; // 1, 2, 3, etc.
  confidence: number;
  method: 'position' | 'name' | 'reference' | 'none';
}

export class ProductSelectionDetector {
  /**
   * Detectar si el mensaje es una selección de producto
   */
  static detectSelection(message: string, previousBotMessage?: string): ProductSelection {
    const lowerMsg = message.toLowerCase().trim();
    
    // Patrones de selección por posición
    const positionPatterns = [
      // Números directos
      { pattern: /^(\d+)$/, method: 'position' as const },
      { pattern: /^el (\d+)/, method: 'position' as const },
      { pattern: /^la (\d+)/, method: 'position' as const },
      { pattern: /opci[oó]n (\d+)/, method: 'position' as const },
      { pattern: /n[uú]mero (\d+)/, method: 'position' as const },
      
      // Ordinales
      { pattern: /primer[oa]/, position: 1, method: 'position' as const },
      { pattern: /segund[oa]/, position: 2, method: 'position' as const },
      { pattern: /tercer[oa]/, position: 3, method: 'position' as const },
      { pattern: /cuart[oa]/, position: 4, method: 'position' as const },
      { pattern: /quint[oa]/, position: 5, method: 'position' as const },
      
      // Referencias
      { pattern: /^este$/, method: 'reference' as const },
      { pattern: /^ese$/, method: 'reference' as const },
      { pattern: /^esta$/, method: 'reference' as const },
      { pattern: /^esa$/, method: 'reference' as const },
      { pattern: /este port[aá]til/, method: 'reference' as const },
      { pattern: /esta laptop/, method: 'reference' as const },
      { pattern: /ese computador/, method: 'reference' as const },
      { pattern: /este curso/, method: 'reference' as const },
      { pattern: /este producto/, method: 'reference' as const },
      
      // Confirmaciones
      { pattern: /^s[ií]$/, method: 'reference' as const },
      { pattern: /^ok$/, method: 'reference' as const },
      { pattern: /^dale$/, method: 'reference' as const },
      { pattern: /^perfecto$/, method: 'reference' as const },
      { pattern: /me gusta/, method: 'reference' as const },
      { pattern: /me interesa/, method: 'reference' as const },
      { pattern: /lo quiero/, method: 'reference' as const },
      { pattern: /la quiero/, method: 'reference' as const },
    ];
    
    // Verificar cada patrón
    for (const { pattern, position, method } of positionPatterns) {
      const match = lowerMsg.match(pattern);
      
      if (match) {
        // Si tiene posición fija (ordinales)
        if (position) {
          return {
            isSelection: true,
            position,
            confidence: 0.95,
            method
          };
        }
        
        // Si capturó un número
        if (match[1]) {
          const num = parseInt(match[1]);
          if (num >= 1 && num <= 10) {
            return {
              isSelection: true,
              position: num,
              confidence: 0.98,
              method
            };
          }
        }
        
        // Si es referencia (este, ese, etc.)
        if (method === 'reference') {
          // Intentar extraer posición del mensaje anterior del bot
          const lastPosition = this.extractLastProductPosition(previousBotMessage);
          
          return {
            isSelection: true,
            position: lastPosition || 1, // Por defecto el primero
            confidence: lastPosition ? 0.90 : 0.75,
            method
          };
        }
      }
    }
    
    // No es una selección
    return {
      isSelection: false,
      confidence: 0,
      method: 'none'
    };
  }
  
  /**
   * Extraer la posición del último producto mencionado en el mensaje del bot
   */
  private static extractLastProductPosition(botMessage?: string): number | null {
    if (!botMessage) return null;
    
    // Buscar patrones como "1️⃣", "2️⃣", "📦 *Producto 1*", etc.
    const patterns = [
      /(\d+)️⃣/g,
      /\*Producto (\d+)\*/g,
      /^(\d+)\./gm,
      /🔹 \*.*?\* \((\d+)\)/g
    ];
    
    let lastPosition: number | null = null;
    
    for (const pattern of patterns) {
      const matches = [...botMessage.matchAll(pattern)];
      if (matches.length > 0) {
        // Tomar el último match
        const lastMatch = matches[matches.length - 1];
        lastPosition = parseInt(lastMatch[1]);
      }
    }
    
    return lastPosition;
  }
  
  /**
   * Extraer productos de un mensaje del bot
   */
  static extractProductsFromBotMessage(botMessage: string): Array<{ position: number; name: string }> {
    const products: Array<{ position: number; name: string }> = [];
    
    // Patrones para extraer productos
    const patterns = [
      // "📦 *Nombre del Producto*"
      /📦\s*\*([^*]+)\*/g,
      // "1️⃣ *Nombre del Producto*"
      /(\d+)️⃣\s*\*([^*]+)\*/g,
      // "🔹 *Nombre del Producto*"
      /🔹\s*\*([^*]+)\*/g,
    ];
    
    let position = 1;
    
    for (const pattern of patterns) {
      const matches = [...botMessage.matchAll(pattern)];
      
      for (const match of matches) {
        const name = match[2] || match[1]; // Dependiendo del patrón
        if (name && name.trim()) {
          products.push({
            position: position++,
            name: name.trim()
          });
        }
      }
    }
    
    return products;
  }
  
  /**
   * Obtener el producto seleccionado de una lista
   */
  static getSelectedProduct(
    selection: ProductSelection,
    productList: any[],
    previousBotMessage?: string
  ): any | null {
    if (!selection.isSelection || !selection.position) {
      return null;
    }
    
    // Ajustar índice (posición 1 = índice 0)
    const index = selection.position - 1;
    
    if (index >= 0 && index < productList.length) {
      return productList[index];
    }
    
    // Si no hay lista, intentar extraer del mensaje del bot
    if (previousBotMessage) {
      const extractedProducts = this.extractProductsFromBotMessage(previousBotMessage);
      const found = extractedProducts.find(p => p.position === selection.position);
      
      if (found) {
        console.log(`[Selection] Producto extraído del mensaje: ${found.name}`);
        return { name: found.name };
      }
    }
    
    return null;
  }
}
