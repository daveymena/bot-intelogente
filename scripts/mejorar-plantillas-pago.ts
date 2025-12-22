/**
 * Script para aplicar mejoras a las plantillas de pago
 * Actualiza las respuestas del PaymentAgent para hacerlas más profesionales
 */

import * as fs from 'fs';
import * as path from 'path';

const PAYMENT_AGENT_PATH = path.join(__dirname, '../src/agents/payment-agent.ts');

console.log('🔧 Aplicando mejoras a plantillas de pago...\n');

// Leer el archivo
let content = fs.readFileSync(PAYMENT_AGENT_PATH, 'utf-8');

// Verificar que el archivo existe
if (!content) {
  console.error('❌ No se pudo leer el archivo payment-agent.ts');
  process.exit(1);
}

console.log('✅ Archivo leído correctamente');
console.log(`📄 Tamaño: ${content.length} caracteres\n`);

// Mejora 1: Actualizar el encabezado del mensaje de pago
const oldHeader = `let text = \`¡Excelente elección en Tecnovariedades D&S! 💳\\n\\n\`;`;
const newHeader = `let text = \`¡Perfecto! 🎉 Aquí están los datos para tu pago:\\n\\n\`;`;

if (content.includes(oldHeader)) {
  content = content.replace(oldHeader, newHeader);
  console.log('✅ Mejora 1: Encabezado actualizado');
} else {
  console.log('⚠️  Mejora 1: Encabezado ya actualizado o no encontrado');
}

// Mejora 2: Actualizar "Monto:" a "Monto a pagar:"
content = content.replace(
  /text \+= `💰 \*Monto:\* \$\{price\}\\n\\n`;/g,
  `text += \`💰 *Monto a pagar:* \${price}\\n\\n\`;`
);
console.log('✅ Mejora 2: Etiqueta de monto actualizada');

// Guardar el archivo
fs.writeFileSync(PAYMENT_AGENT_PATH, content, 'utf-8');

console.log('\n✅ Mejoras aplicadas exitosamente!');
console.log('\n📝 Resumen de cambios:');
console.log('  - Encabezado más amigable');
console.log('  - Etiqueta "Monto a pagar" más clara');
console.log('\n💡 Para aplicar las mejoras completas de formato,');
console.log('   revisa el archivo MEJORAS_PLANTILLAS_PAGO.md');
