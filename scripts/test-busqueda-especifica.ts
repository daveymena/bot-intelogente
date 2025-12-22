/**
 * Script para probar la búsqueda específica vs general
 */

console.log('🧪 PRUEBA: Búsqueda Específica vs General\n');
console.log('='.repeat(70));

// Simular la lógica de scoring
interface ProductoConScore {
  nombre: string;
  score: number;
}

function analizarBusqueda(productos: ProductoConScore[]): {
  tipo: 'específica' | 'general' | 'exploratoria';
  cantidad: number;
  razon: string;
} {
  if (productos.length === 0) {
    return { tipo: 'exploratoria', cantidad: 0, razon: 'No hay productos' };
  }

  const mejorScore = productos[0].score;
  const segundoScore = productos[1]?.score || 0;
  
  // Lógica de match específico
  const esMatchEspecifico = mejorScore >= 6 && (mejorScore - segundoScore) >= 3;
  
  if (esMatchEspecifico) {
    return {
      tipo: 'específica',
      cantidad: 1,
      razon: `Score ${mejorScore}, diferencia ${mejorScore - segundoScore} con el siguiente`
    };
  } else if (mejorScore >= 3) {
    const similares = productos.filter(p => p.score >= mejorScore - 1).length;
    return {
      tipo: 'general',
      cantidad: Math.min(similares, 3),
      razon: `Score ${mejorScore}, ${similares} productos similares`
    };
  } else {
    return {
      tipo: 'exploratoria',
      cantidad: Math.min(productos.length, 5),
      razon: `Score bajo ${mejorScore}, mostrar variedad`
    };
  }
}

// Casos de prueba
const casos = [
  {
    nombre: 'Búsqueda específica: "curso de piano"',
    productos: [
      { nombre: 'Curso Completo de Piano Online', score: 6 },
      { nombre: 'Mega Pack 24: Recursos Arquitectura', score: 1 },
      { nombre: 'Curso de Guitarra', score: 3 }
    ],
    esperado: { tipo: 'específica', cantidad: 1 }
  },
  {
    nombre: 'Búsqueda general: "cursos digitales"',
    productos: [
      { nombre: 'Curso Completo de Piano Online', score: 4 },
      { nombre: 'Curso de Guitarra', score: 4 },
      { nombre: 'Curso de Fotografía', score: 3 }
    ],
    esperado: { tipo: 'general', cantidad: 3 }
  },
  {
    nombre: 'Búsqueda exploratoria: "qué tienes?"',
    productos: [
      { nombre: 'Curso de Piano', score: 1 },
      { nombre: 'Mega Pack 35', score: 1 },
      { nombre: 'Laptop HP', score: 1 },
      { nombre: 'Servicio Técnico', score: 1 },
      { nombre: 'Smartwatch', score: 1 }
    ],
    esperado: { tipo: 'exploratoria', cantidad: 5 }
  },
  {
    nombre: 'Búsqueda específica: "mega pack 35"',
    productos: [
      { nombre: 'Mega Pack 35: Álbumes digitales', score: 9 },
      { nombre: 'Mega Pack 24: Recursos Arquitectura', score: 3 },
      { nombre: 'Curso de Piano', score: 0 }
    ],
    esperado: { tipo: 'específica', cantidad: 1 }
  },
  {
    nombre: 'Búsqueda general: "megapacks"',
    productos: [
      { nombre: 'Mega Pack 35: Álbumes digitales', score: 3 },
      { nombre: 'Mega Pack 24: Recursos Arquitectura', score: 3 },
      { nombre: 'Mega Pack 10: Plantillas', score: 3 }
    ],
    esperado: { tipo: 'general', cantidad: 3 }
  }
];

console.log('\n🧪 EJECUTANDO CASOS DE PRUEBA...\n');

let pasados = 0;
let fallados = 0;

casos.forEach((caso, index) => {
  console.log(`\n${index + 1}. ${caso.nombre}`);
  console.log('-'.repeat(70));
  
  // Mostrar productos
  console.log('   Productos encontrados:');
  caso.productos.forEach(p => {
    console.log(`   - ${p.nombre} (Score: ${p.score})`);
  });
  
  // Analizar
  const resultado = analizarBusqueda(caso.productos);
  
  console.log(`\n   📊 Análisis:`);
  console.log(`   - Tipo: ${resultado.tipo}`);
  console.log(`   - Cantidad a devolver: ${resultado.cantidad}`);
  console.log(`   - Razón: ${resultado.razon}`);
  
  // Verificar
  const tipoCorrecto = resultado.tipo === caso.esperado.tipo;
  const cantidadCorrecta = resultado.cantidad === caso.esperado.cantidad;
  const exito = tipoCorrecto && cantidadCorrecta;
  
  console.log(`\n   ${exito ? '✅' : '❌'} Resultado:`);
  console.log(`   - Tipo esperado: ${caso.esperado.tipo} ${tipoCorrecto ? '✅' : '❌'}`);
  console.log(`   - Cantidad esperada: ${caso.esperado.cantidad} ${cantidadCorrecta ? '✅' : '❌'}`);
  
  if (exito) {
    pasados++;
  } else {
    fallados++;
  }
});

// Resumen
console.log('\n\n' + '='.repeat(70));
console.log('📊 RESUMEN DE PRUEBAS');
console.log('='.repeat(70));
console.log(`\n✅ Pasadas: ${pasados}/${casos.length}`);
console.log(`❌ Falladas: ${fallados}/${casos.length}`);

if (fallados === 0) {
  console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!');
  console.log('La lógica de búsqueda específica funciona correctamente.');
} else {
  console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON');
  console.log('Revisa la lógica de scoring y umbrales.');
  process.exit(1);
}

// Explicación de umbrales
console.log('\n\n' + '='.repeat(70));
console.log('📚 EXPLICACIÓN DE UMBRALES');
console.log('='.repeat(70));
console.log(`
MATCH ESPECÍFICO:
- Score >= 6 (coincidencia fuerte)
- Diferencia >= 3 con el segundo (claramente superior)
- Resultado: Devuelve SOLO 1 producto

MATCH GENERAL:
- Score >= 3 (coincidencia buena)
- Varios productos con scores similares
- Resultado: Devuelve top 3 productos

MATCH EXPLORATORIO:
- Score < 3 (coincidencia débil)
- Usuario explorando opciones
- Resultado: Devuelve top 5 productos

SISTEMA DE PUNTUACIÓN:
- +3 puntos: Palabra clave en nombre
- +1 punto: Palabra clave en descripción
`);

console.log('\n💡 RECOMENDACIÓN:');
console.log('   Prueba con consultas reales en el bot para verificar');
console.log('   que la búsqueda devuelve la cantidad correcta de productos.');
