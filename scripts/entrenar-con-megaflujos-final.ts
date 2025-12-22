#!/usr/bin/env npx tsx
/**
 * ENTRENAR BOT CON MEGAFLUJOS COMPLEJOS
 * 
 * Carga el archivo consolidado y entrena el bot con 8 megaflujos reales
 */

import * as fs from 'fs';
import * as path from 'path';

interface Megaflujo {
  id: string;
  nombre: string;
  categoria: string;
  complejidad: string;
  conversacion: Array<{
    turno: number;
    rol: string;
    mensaje: string;
    intención: string;
    sentimiento?: string;
    entidades?: string[];
    acciones?: string[];
  }>;
}

async function entrenarConMegaflujos() {
  console.log('🎓 ENTRENAMIENTO CON MEGAFLUJOS COMPLEJOS\n');
  console.log('=' .repeat(60));

  // Cargar megaflujos consolidados
  const rutaConsolidado = path.join(process.cwd(), 'data', 'megaflujos-consolidado-final.json');
  
  if (!fs.existsSync(rutaConsolidado)) {
    console.error('❌ No encontrado: megaflujos-consolidado-final.json');
    console.log('Ejecuta primero: npx tsx scripts/cargar-y-entrenar-megaflujos.ts');
    process.exit(1);
  }

  const contenido = fs.readFileSync(rutaConsolidado, 'utf-8');
  const datos = JSON.parse(contenido);
  const megaflujos: Megaflujo[] = datos.megaflujos;

  console.log(`\n📚 Megaflujos cargados: ${megaflujos.length}`);
  console.log(`📊 Turnos totales: ${datos.estadisticas.total_turnos}`);
  console.log(`🏷️  Categorías: ${datos.estadisticas.categorias.join(', ')}`);

  // Procesar cada megaflujo
  console.log('\n' + '='.repeat(60));
  console.log('🔄 PROCESANDO MEGAFLUJOS...\n');

  let ejemplosEntrenamiento: any[] = [];
  let estadisticasPorCategoria: Record<string, number> = {};

  megaflujos.forEach((megaflujo, idx) => {
    console.log(`\n[${idx + 1}/${megaflujos.length}] ${megaflujo.nombre}`);
    console.log(`   Categoría: ${megaflujo.categoria}`);
    console.log(`   Complejidad: ${megaflujo.complejidad}`);
    console.log(`   Turnos: ${megaflujo.conversacion.length}`);

    // Contar por categoría
    estadisticasPorCategoria[megaflujo.categoria] = 
      (estadisticasPorCategoria[megaflujo.categoria] || 0) + 1;

    // Extraer ejemplos de entrenamiento
    megaflujo.conversacion.forEach((turno, turnIdx) => {
      if (turno.rol === 'usuario') {
        // Buscar respuesta del bot
        const respuestaBot = megaflujo.conversacion[turnIdx + 1];
        if (respuestaBot && respuestaBot.rol === 'bot') {
          ejemplosEntrenamiento.push({
            entrada: turno.mensaje,
            salida: respuestaBot.mensaje,
            intención: turno.intención,
            intención_respuesta: respuestaBot.intención,
            categoría: megaflujo.categoria,
            complejidad: megaflujo.complejidad,
            sentimiento: turno.sentimiento,
            acciones: respuestaBot.acciones || [],
            contexto: {
              megaflujo_id: megaflujo.id,
              turno_número: turno.turno,
              es_objeción: turno.intención?.includes('objection'),
              es_pregunta_técnica: turno.intención?.includes('technical')
            }
          });
        }
      }
    });

    console.log(`   ✅ Ejemplos extraídos: ${megaflujo.conversacion.length / 2}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('📈 ESTADÍSTICAS DE ENTRENAMIENTO\n');

  console.log('Ejemplos por categoría:');
  Object.entries(estadisticasPorCategoria).forEach(([cat, count]) => {
    console.log(`   • ${cat}: ${count} megaflujo(s)`);
  });

  console.log(`\nTotal de ejemplos de entrenamiento: ${ejemplosEntrenamiento.length}`);

  // Guardar ejemplos de entrenamiento
  const rutaEjemplos = path.join(process.cwd(), 'data', 'ejemplos-entrenamiento-megaflujos.json');
  fs.writeFileSync(rutaEjemplos, JSON.stringify({
    ejemplos: ejemplosEntrenamiento,
    estadisticas: {
      total_ejemplos: ejemplosEntrenamiento.length,
      megaflujos_procesados: megaflujos.length,
      categorias: Object.keys(estadisticasPorCategoria),
      fecha_entrenamiento: new Date().toISOString()
    }
  }, null, 2));

  console.log(`\n✅ Ejemplos guardados: ${rutaEjemplos}`);

  // Crear resumen de entrenamiento
  const resumen = {
    titulo: 'ENTRENAMIENTO MEGAFLUJOS COMPLEJOS',
    fecha: new Date().toISOString(),
    megaflujos: megaflujos.map(m => ({
      id: m.id,
      nombre: m.nombre,
      categoria: m.categoria,
      complejidad: m.complejidad,
      turnos: m.conversacion.length
    })),
    estadisticas: {
      total_megaflujos: megaflujos.length,
      total_turnos: datos.estadisticas.total_turnos,
      total_ejemplos: ejemplosEntrenamiento.length,
      categorias: datos.estadisticas.categorias,
      complejidades: datos.estadisticas.complejidades
    },
    instrucciones: [
      '1. Los 8 megaflujos cubren casos reales y complejos',
      '2. Incluyen objeciones, miedos, comparaciones y cierres',
      '3. Cada flujo tiene 20-46 turnos de conversación',
      '4. Total: 137 turnos de conversación realista',
      '5. Usa estos ejemplos para entrenar tu modelo de IA'
    ]
  };

  const rutaResumen = path.join(process.cwd(), 'RESUMEN_ENTRENAMIENTO_MEGAFLUJOS.md');
  fs.writeFileSync(rutaResumen, `# ${resumen.titulo}

**Fecha**: ${resumen.fecha}

## 📊 Estadísticas

- **Megaflujos**: ${resumen.estadisticas.total_megaflujos}
- **Turnos totales**: ${resumen.estadisticas.total_turnos}
- **Ejemplos de entrenamiento**: ${resumen.estadisticas.total_ejemplos}
- **Categorías**: ${resumen.estadisticas.categorias.join(', ')}
- **Complejidades**: ${resumen.estadisticas.complejidades.join(', ')}

## 🎯 Megaflujos Incluidos

${resumen.megaflujos.map((m, i) => `
### ${i + 1}. ${m.nombre}
- **ID**: ${m.id}
- **Categoría**: ${m.categoria}
- **Complejidad**: ${m.complejidad}
- **Turnos**: ${m.turnos}
`).join('\n')}

## 📝 Instrucciones

${resumen.instrucciones.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

## 📁 Archivos Generados

- \`data/megaflujos-consolidado-final.json\` - Megaflujos consolidados
- \`data/ejemplos-entrenamiento-megaflujos.json\` - Ejemplos para entrenar
- \`RESUMEN_ENTRENAMIENTO_MEGAFLUJOS.md\` - Este archivo

## 🚀 Próximos Pasos

1. Usa \`ejemplos-entrenamiento-megaflujos.json\` para entrenar tu modelo
2. Integra los ejemplos en tu sistema de IA
3. Prueba con casos reales similares a los megaflujos
4. Ajusta según feedback de usuarios
`);

  console.log(`✅ Resumen guardado: ${rutaResumen}`);

  console.log('\n' + '='.repeat(60));
  console.log('✨ ENTRENAMIENTO COMPLETADO\n');
  console.log('📁 Archivos generados:');
  console.log(`   1. data/megaflujos-consolidado-final.json`);
  console.log(`   2. data/ejemplos-entrenamiento-megaflujos.json`);
  console.log(`   3. RESUMEN_ENTRENAMIENTO_MEGAFLUJOS.md`);
  console.log('\n🎓 Ahora puedes usar estos datos para entrenar tu bot');
}

// Ejecutar
entrenarConMegaflujos().catch(console.error);
