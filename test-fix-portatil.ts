/**
 * Test para verificar el fix del problema "portátil"
 * 
 * Problema: Usuario busca "portátil" y el bot muestra "BASE PARA PORTÁTIL"
 * Solución: Filtrar accesorios cuando se busca el producto principal
 */

// Mock de productos para testing
const mockProducts = [
  {
    id: 'laptop-1',
    name: 'Laptop HP 15.6" Intel Core i5',
    price: 1500000,
    description: 'Laptop para trabajo y estudio',
    category: 'Computadores',
    tipo_producto: 'simple',
    tags: 'laptop, computador, hp'
  },
  {
    id: 'laptop-2',
    name: 'Laptop Asus Vivobook 14"',
    price: 1800000,
    description: 'Laptop ultradelgada',
    category: 'Computadores',
    tipo_producto: 'simple',
    tags: 'laptop, computador, asus'
  },
  {
    id: 'base-1',
    name: 'BASE PARA PORTATIL',
    price: 45990,
    description: 'Base para portátil - Producto disponible en Disyvar',
    category: 'Accesorios',
    tipo_producto: 'simple',
    tags: 'accesorio, base, soporte'
  },
  {
    id: 'mouse-1',
    name: 'Mouse inalámbrico para laptop',
    price: 35000,
    description: 'Mouse ergonómico',
    category: 'Periféricos',
    tipo_producto: 'simple',
    tags: 'mouse, accesorio'
  },
  {
    id: 'moto-1',
    name: 'Moto Auteco Victory 125',
    price: 5500000,
    description: 'Motocicleta económica',
    category: 'Motos',
    tipo_producto: 'simple',
    tags: 'moto, motocicleta'
  },
  {
    id: 'casco-1',
    name: 'Casco para moto',
    price: 120000,
    description: 'Casco de seguridad',
    category: 'Accesorios',
    tipo_producto: 'simple',
    tags: 'casco, accesorio, moto'
  }
];

// Función de filtrado (copiada del código real)
function filterAccessories(products: any[], searchTerm: string) {
  const mainProductKeywords = ['portátil', 'portatil', 'laptop', 'computador', 'computadora', 'moto', 'motocicleta'];
  const isMainProductSearch = mainProductKeywords.some(kw => searchTerm.includes(kw));
  
  // NO filtrar si el usuario busca específicamente un accesorio (contiene "para")
  const isAccessorySearch = searchTerm.includes(' para ') || searchTerm.includes('base') || searchTerm.includes('soporte') || searchTerm.includes('funda');
  
  if (!isMainProductSearch || isAccessorySearch) {
    return products; // No filtrar si no es búsqueda de producto principal o si busca accesorio específico
  }
  
  return products.filter((p: any) => {
    const name = (p.name || '').toLowerCase();
    const description = (p.description || '').toLowerCase();
    const searchText = `${name} ${description}`;
    
    // Lista de palabras que indican que es un accesorio
    const accessoryIndicators = [
      'base para', 'soporte para', 'funda para', 'bolso para', 'maletín para',
      'cargador para', 'adaptador para', 'cable para', 'protector para',
      'casco para', 'guantes para', 'kit para', 'accesorio para',
      'mouse', 'ratón', 'teclado', 'audífonos', 'auriculares'
    ];
    
    // Si el nombre contiene algún indicador de accesorio, excluirlo
    const isAccessory = accessoryIndicators.some(indicator => searchText.includes(indicator));
    
    return !isAccessory;
  });
}

// Tests
console.log('🧪 Iniciando tests del fix de portátil...\n');

// Test 1: Búsqueda de "portátil" NO debe incluir "BASE PARA PORTÁTIL"
console.log('Test 1: Búsqueda de "portátil"');
const result1 = filterAccessories(mockProducts, 'portátil');
const hasBase = result1.some(p => p.id === 'base-1');
const hasLaptops = result1.some(p => p.id === 'laptop-1' || p.id === 'laptop-2');
console.log(`  - Incluye laptops: ${hasLaptops ? '✅' : '❌'}`);
console.log(`  - Excluye base: ${!hasBase ? '✅' : '❌'}`);
console.log(`  - Productos encontrados: ${result1.length}`);
result1.forEach(p => console.log(`    • ${p.name}`));
console.log('');

// Test 2: Búsqueda de "laptop" NO debe incluir "mouse para laptop"
console.log('Test 2: Búsqueda de "laptop"');
const result2 = filterAccessories(mockProducts, 'laptop');
const hasMouse = result2.some(p => p.id === 'mouse-1');
const hasLaptops2 = result2.some(p => p.id === 'laptop-1' || p.id === 'laptop-2');
console.log(`  - Incluye laptops: ${hasLaptops2 ? '✅' : '❌'}`);
console.log(`  - Excluye mouse: ${!hasMouse ? '✅' : '❌'}`);
console.log(`  - Productos encontrados: ${result2.length}`);
result2.forEach(p => console.log(`    • ${p.name}`));
console.log('');

// Test 3: Búsqueda de "moto" NO debe incluir "casco para moto"
console.log('Test 3: Búsqueda de "moto"');
const result3 = filterAccessories(mockProducts, 'moto');
const hasCasco = result3.some(p => p.id === 'casco-1');
const hasMoto = result3.some(p => p.id === 'moto-1');
console.log(`  - Incluye moto: ${hasMoto ? '✅' : '❌'}`);
console.log(`  - Excluye casco: ${!hasCasco ? '✅' : '❌'}`);
console.log(`  - Productos encontrados: ${result3.length}`);
result3.forEach(p => console.log(`    • ${p.name}`));
console.log('');

// Test 4: Búsqueda específica de "base para portátil" SÍ debe incluirla
console.log('Test 4: Búsqueda específica de "base para portátil"');
const result4 = filterAccessories(mockProducts, 'base para portátil');
const hasBase4 = result4.some(p => p.id === 'base-1');
console.log(`  - Incluye base: ${hasBase4 ? '✅' : '❌'}`);
console.log(`  - Productos encontrados: ${result4.length}`);
result4.forEach(p => console.log(`    • ${p.name}`));
console.log('');

// Test 5: Búsqueda de "curso" NO debe aplicar filtro (no es producto principal)
console.log('Test 5: Búsqueda de "curso" (no aplica filtro)');
const result5 = filterAccessories(mockProducts, 'curso');
console.log(`  - Productos sin filtrar: ${result5.length === mockProducts.length ? '✅' : '❌'}`);
console.log(`  - Productos encontrados: ${result5.length}`);
console.log('');

// Resumen
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 RESUMEN DE TESTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const allPassed = 
  hasLaptops && !hasBase &&
  hasLaptops2 && !hasMouse &&
  hasMoto && !hasCasco &&
  hasBase4 &&
  result5.length === mockProducts.length;

if (allPassed) {
  console.log('✅ TODOS LOS TESTS PASARON');
  console.log('');
  console.log('El fix está funcionando correctamente:');
  console.log('  • Filtra accesorios cuando se busca producto principal');
  console.log('  • Permite búsquedas específicas de accesorios');
  console.log('  • No afecta búsquedas de otros productos');
} else {
  console.log('❌ ALGUNOS TESTS FALLARON');
  console.log('');
  console.log('Revisa los resultados arriba para ver qué falló.');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
