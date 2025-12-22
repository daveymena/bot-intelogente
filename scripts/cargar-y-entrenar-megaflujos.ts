#!/usr/bin/env npx tsx
/**
 * CARGAR Y ENTRENAR CON MEGAFLUJOS COMPLEJOS
 * 
 * Carga los 5 archivos de megaflujos y los consolida para entrenar el bot
 */

import * as fs from 'fs';
import * as path from 'path';

async function cargarMegaflujos() {
  console.log('🚀 Iniciando carga de megaflujos...\n');

  const archivos = [
    'data/megaflujos-parte-1.json',
    'data/megaflujos-parte-2.json',
    'data/megaflujos-parte-3.json',
    'data/megaflujos-parte-4.json',
    'data/megaflujos-parte-5.json'
  ];

  let megaflujosTotales: any[] = [];
  let estadisticas = {
    archivos: 0,
    megaflujos: 0,
    turnos: 0,
    categorias: new Set<string>(),
    complejidades: new Set<string>()
  };

  // Cargar cada archivo
  for (const archivo of archivos) {
    try {
      const rutaCompleta = path.join(process.cwd(), archivo);
      if (!fs.existsSync(rutaCompleta)) {
        console.log(`⚠️  No encontrado: ${archivo}`);
        continue;
      }

      const contenido = fs.readFileSync(rutaCompleta, 'utf-8');
      const datos = JSON.parse(contenido);
      
      if (datos.megaflujos && Array.isArray(datos.megaflujos)) {
        megaflujosTotales = [...megaflujosTotales, ...datos.megaflujos];
        estadisticas.archivos++;
        
        datos.megaflujos.forEach((m: any) => {
          estadisticas.megaflujos++;
          estadisticas.turnos += m.conversacion?.length || 0;
          estadisticas.categorias.add(m.categoria);
          estadisticas.complejidades.add(m.complejidad);
        });

        console.log(`✅ Cargado: ${archivo}`);
        console.log(`   - Megaflujos: ${datos.megaflujos.length}`);
        console.log(`   - Turnos: ${datos.megaflujos.reduce((sum: number, m: any) => sum + (m.conversacion?.length || 0), 0)}`);
      }
    } catch (error) {
      console.error(`❌ Error cargando ${archivo}:`, error);
    }
  }

  console.log('\n📊 ESTADÍSTICAS CONSOLIDADAS:');
  console.log(`   - Archivos cargados: ${estadisticas.archivos}`);
  console.log(`   - Megaflujos totales: ${estadisticas.megaflujos}`);
  console.log(`   - Turnos totales: ${estadisticas.turnos}`);
  console.log(`   - Categorías: ${Array.from(estadisticas.categorias).join(', ')}`);
  console.log(`   - Complejidades: ${Array.from(estadisticas.complejidades).join(', ')}`);

  // Guardar consolidado
  const outputPath = path.join(process.cwd(), 'data', 'megaflujos-consolidado-final.json');
  fs.writeFileSync(outputPath, JSON.stringify({ 
    megaflujos: megaflujosTotales,
    estadisticas: {
      total_megaflujos: estadisticas.megaflujos,
      total_turnos: estadisticas.turnos,
      categorias: Array.from(estadisticas.categorias),
      complejidades: Array.from(estadisticas.complejidades),
      fecha_consolidacion: new Date().toISOString()
    }
  }, null, 2));

  console.log(`\n✅ Consolidado guardado: ${outputPath}`);
  console.log(`\n🎯 Próximo paso: Usar este archivo para entrenar el bot`);

  return megaflujosTotales;
}

// Ejecutar
cargarMegaflujos().catch(console.error);
