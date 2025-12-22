#!/usr/bin/env npx tsx
/**
 * INTEGRAR MEGAFLUJOS EN EL BOT
 * 
 * Carga los ejemplos de entrenamiento y los integra en el sistema de IA
 */

import * as fs from 'fs';
import * as path from 'path';

async function integrarMegaflujos() {
  console.log('🔗 INTEGRANDO MEGAFLUJOS EN EL BOT\n');
  console.log('='.repeat(60));

  // Cargar ejemplos de entrenamiento
  const rutaEjemplos = path.join(process.cwd(), 'data', 'ejemplos-entrenamiento-megaflujos.json');
  
  if (!fs.existsSync(rutaEjemplos)) {
    console.error('❌ No encontrado: ejemplos-entrenamiento-megaflujos.json');
    process.exit(1);
  }

  const contenido = fs.readFileSync(rutaEjemplos, 'utf-8');
  const datos = JSON.parse(contenido);
  const ejemplos = datos.ejemplos;

  console.log(`\n📚 Ejemplos cargados: ${ejemplos.length}`);
  console.log(`📊 Estadísticas:`);
  console.log(`   - Total ejemplos: ${datos.estadisticas.total_ejemplos}`);
  console.log(`   - Megaflujos: ${datos.estadisticas.megaflujos_procesados}`);
  console.log(`   - Categorías: ${datos.estadisticas.categorias.length}`);

  // Crear archivo de integración para el bot
  const integracion = {
    nombre: 'Megaflujos Entrenamiento',
    version: '1.0.0',
    fecha_creacion: new Date().toISOString(),
    total_ejemplos: ejemplos.length,
    ejemplos: ejemplos.map((e: any) => ({
      entrada: e.entrada,
      salida: e.salida,
      intención: e.intención,
      categoría: e.categoría,
      complejidad: e.complejidad,
      sentimiento: e.sentimiento,
      acciones: e.acciones,
      contexto: e.contexto
    })),
    estadisticas: datos.estadisticas
  };

  const rutaIntegracion = path.join(process.cwd(), 'data', 'megaflujos-integracion-bot.json');
  fs.writeFileSync(rutaIntegracion, JSON.stringify(integracion, null, 2));

  console.log(`\n✅ Archivo de integración creado: ${rutaIntegracion}`);

  // Crear instrucciones de integración
  const instrucciones = `# INTEGRACIÓN DE MEGAFLUJOS EN EL BOT

## 📋 Resumen

Se han integrado **${ejemplos.length} ejemplos de entrenamiento** basados en 8 megaflujos complejos.

## 🎯 Cómo usar en tu bot

### Opción 1: Groq API (Recomendado)

\`\`\`typescript
import { Groq } from 'groq-sdk';
import megaflujos from '@/data/megaflujos-integracion-bot.json';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Usar ejemplos como contexto
const ejemplosFormato = megaflujos.ejemplos
  .map(e => \`Usuario: \${e.entrada}\\nBot: \${e.salida}\`)
  .join('\\n\\n');

const response = await groq.chat.completions.create({
  model: 'mixtral-8x7b-32768',
  messages: [
    {
      role: 'system',
      content: \`Eres un asistente de ventas. Aquí hay ejemplos de conversaciones exitosas:\\n\\n\${ejemplosFormato}\`
    },
    {
      role: 'user',
      content: userMessage
    }
  ]
});
\`\`\`

### Opción 2: Búsqueda Semántica

\`\`\`typescript
// Buscar ejemplos similares a la entrada del usuario
function buscarEjemplosSimilares(entrada: string, topK = 3) {
  return megaflujos.ejemplos
    .filter(e => 
      e.entrada.toLowerCase().includes(entrada.toLowerCase()) ||
      e.intención === detectarIntención(entrada)
    )
    .slice(0, topK);
}

// Usar ejemplos como contexto en la respuesta
const ejemplosSimilares = buscarEjemplosSimilares(userMessage);
const contexto = ejemplosSimilares
  .map(e => \`Ejemplo: \${e.entrada} → \${e.salida}\`)
  .join('\\n');
\`\`\`

### Opción 3: Fine-tuning Local

\`\`\`bash
# Si usas Ollama o modelo local
npx tsx scripts/entrenar-modelo-local.ts --data data/megaflujos-integracion-bot.json
\`\`\`

## 📊 Categorías de Entrenamiento

${datos.estadisticas.categorias.map((cat: string) => `- **${cat}**`).join('\n')}

## 🎓 Ejemplos por Complejidad

- **alta**: ${ejemplos.filter((e: any) => e.complejidad === 'alta').length} ejemplos
- **media**: ${ejemplos.filter((e: any) => e.complejidad === 'media').length} ejemplos
- **muy_alta**: ${ejemplos.filter((e: any) => e.complejidad === 'muy_alta').length} ejemplos

## 🚀 Próximos Pasos

1. ✅ Megaflujos consolidados
2. ✅ Ejemplos extraídos (68 ejemplos)
3. ⏳ Integrar en tu sistema de IA
4. ⏳ Probar con casos reales
5. ⏳ Ajustar según feedback

## 📁 Archivos Generados

- \`data/megaflujos-consolidado-final.json\` - Megaflujos completos
- \`data/ejemplos-entrenamiento-megaflujos.json\` - Ejemplos para entrenar
- \`data/megaflujos-integracion-bot.json\` - Formato para integración
- \`RESUMEN_ENTRENAMIENTO_MEGAFLUJOS.md\` - Documentación

## 💡 Tips

- Los ejemplos cubren casos reales: objeciones, miedos, comparaciones
- Cada ejemplo incluye intención, sentimiento y acciones recomendadas
- Usa la categoría para filtrar por tipo de conversación
- El contexto incluye información sobre el megaflujo original

## ❓ Preguntas Frecuentes

**¿Cómo agrego más ejemplos?**
Crea nuevos megaflujos en \`data/megaflujos-parte-X.json\` y ejecuta:
\`\`\`bash
npx tsx scripts/cargar-y-entrenar-megaflujos.ts
npx tsx scripts/entrenar-con-megaflujos-final.ts
\`\`\`

**¿Cómo personalizo las respuestas?**
Edita los ejemplos en \`data/megaflujos-integracion-bot.json\` o crea nuevos megaflujos.

**¿Funciona con WhatsApp?**
Sí, integra estos ejemplos en tu \`ai-service.ts\` o \`intelligent-response-service.ts\`.
`;

  const rutaInstrucciones = path.join(process.cwd(), 'INTEGRACION_MEGAFLUJOS_BOT.md');
  fs.writeFileSync(rutaInstrucciones, instrucciones);

  console.log(`✅ Instrucciones guardadas: ${rutaInstrucciones}`);

  // Crear resumen visual
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE INTEGRACIÓN\n');

  const categoriasCuenta = datos.estadisticas.categorias.reduce((acc: any, cat: string) => {
    acc[cat] = ejemplos.filter((e: any) => e.categoría === cat).length;
    return acc;
  }, {});

  console.log('Ejemplos por categoría:');
  Object.entries(categoriasCuenta).forEach(([cat, count]) => {
    console.log(`   • ${cat}: ${count} ejemplos`);
  });

  console.log('\nEjemplos por complejidad:');
  if (datos.estadisticas.complejidades && Array.isArray(datos.estadisticas.complejidades)) {
    datos.estadisticas.complejidades.forEach((comp: string) => {
      const count = ejemplos.filter((e: any) => e.complejidad === comp).length;
      console.log(`   • ${comp}: ${count} ejemplos`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ INTEGRACIÓN COMPLETADA\n');
  console.log('📁 Archivos listos:');
  console.log(`   1. data/megaflujos-integracion-bot.json`);
  console.log(`   2. INTEGRACION_MEGAFLUJOS_BOT.md`);
  console.log('\n🚀 El bot está listo para usar estos ejemplos de entrenamiento');
}

// Ejecutar
integrarMegaflujos().catch(console.error);
