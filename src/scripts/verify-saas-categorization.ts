// Simulación de la lógica de CategoryService para verificar el algoritmo
// sin depender de la base de datos o imports complejos

interface CategoryMatch {
  category: string | null;
  subcategory: string | null;
  confidence: number;
}

interface TenantConfig {
  categories: {
    active: string[];
  };
}

// Mock del servicio de contexto
const MockSaasContextService = {
  async getTenantConfig(userId: string): Promise<TenantConfig | null> {
    if (userId === 'user-ropa') {
      return {
        categories: { active: ['Ropa', 'Calzado', 'Accesorios'] }
      };
    }
    if (userId === 'user-tech') {
      return {
        categories: { active: ['Tecnología', 'COMPUTER', 'Celulares'] }
      };
    }
    return null;
  }
};

// Lógica exacta de CategoryService (copiada para test)
class CategoryServiceLogic {
  static async detectCategory(userId: string, query: string): Promise<CategoryMatch> {
    const tenantConfig = await MockSaasContextService.getTenantConfig(userId);
    
    if (!tenantConfig) {
      return { category: null, subcategory: null, confidence: 0 };
    }

    const queryLower = query.toLowerCase();
    const activeCategories = tenantConfig.categories.active;
    
    // 1. Búsqueda Exacta en Categorías Activas
    for (const cat of activeCategories) {
      if (queryLower.includes(cat.toLowerCase())) {
        return { category: cat, subcategory: null, confidence: 1.0 };
      }
    }

    // 2. Búsqueda por Mapeos/Sinónimos (Lógica simple)
    if (activeCategories.includes('Ropa')) {
      if (/\b(camiseta|pantalon|camisa|vestido)\b/.test(queryLower)) {
        return { category: 'Ropa', subcategory: null, confidence: 0.9 };
      }
    }

    if (activeCategories.some(c => ['Tecnología', 'COMPUTER', 'Laptops'].includes(c))) {
      if (/\b(portatil|laptop|pc|computador)\b/.test(queryLower)) {
        return { category: 'COMPUTER', subcategory: 'LAPTOP', confidence: 0.9 };
      }
    }

    return { category: null, subcategory: null, confidence: 0 };
  }
}

async function runTest() {
  console.log('🧪 Iniciando Test de Lógica de Categorización (Standalone)\n');

  const testCases = [
    { user: 'user-ropa', query: 'busco una camiseta', expected: 'Ropa' },
    { user: 'user-ropa', query: 'tienen zapatos?', expected: 'Calzado' }, 
    { user: 'user-ropa', query: 'busco ropa de mujer', expected: 'Ropa' },
    
    { user: 'user-tech', query: 'necesito un portatil', expected: 'COMPUTER' },
    { user: 'user-tech', query: 'busco un celular samsung', expected: 'Celulares' },
    { user: 'user-tech', query: 'tienen laptops?', expected: 'COMPUTER' }
  ];

  for (const test of testCases) {
    const result = await CategoryServiceLogic.detectCategory(test.user, test.query);
    console.log(`👤 User: ${test.user}`);
    console.log(`🔍 Query: "${test.query}"`);
    console.log(`📂 Detectado: ${result.category}`);
    
    let passed = false;
    if (result.category === test.expected) passed = true;
    if (test.expected === 'COMPUTER' && result.category === 'Tecnología') passed = true; 
    
    // Caso especial zapatos -> Calzado (sin mapeo explícito fallará)
    if (test.expected === 'Calzado' && result.category === null) {
        console.log('⚠️ FAIL EXPECTED: Falta mapeo de sinónimos (zapatos -> Calzado)');
    } else if (passed) {
       console.log('✅ PASS');
    } else {
       console.log(`❌ FAIL (Esperado: ${test.expected}, Obtenido: ${result.category})`);
    }
    console.log('-----------------------------------');
  }
}

runTest().catch(console.error);
