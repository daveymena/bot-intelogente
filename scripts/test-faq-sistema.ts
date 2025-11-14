/**
 * Test: Sistema de FAQ de Productos
 */

import { ProductFAQService } from '../src/lib/product-faq-service';

async function main() {
  console.log('🧪 TEST: Sistema de FAQ de Productos\n');

  // Inicializar
  await ProductFAQService.initialize();

  const productId = 'cmhpw941q0000kmp85qvjm0o5-curso-completo-de-piano-online';

  // Preguntas de prueba
  const preguntas = [
    "¿Cuánto cuesta el curso?",
    "¿Necesito tener un piano?",
    "¿Puedo aprender desde cero?",
    "¿Cuánto dura el curso?",
    "¿Tiene certificado?",
    "¿Cómo pago?",
    "¿Tiene garantía?",
    "¿Puedo verlo en mi celular?",
    "¿Quién enseña el curso?",
    "¿Por qué elegir este curso?"
  ];

  console.log('📋 Probando preguntas frecuentes:\n');

  for (const pregunta of preguntas) {
    console.log(`❓ Pregunta: "${pregunta}"`);
    
    const resultado = await ProductFAQService.findAnswer(productId, pregunta);
    
    if (resultado.found) {
      console.log(`✅ Respuesta encontrada (confianza: ${(resultado.confidence * 100).toFixed(0)}%)`);
      console.log(`📝 ${resultado.answer}\n`);
    } else {
      console.log(`❌ No se encontró respuesta\n`);
    }
  }

  // Obtener información del producto
  console.log('\n📊 Información del producto:\n');
  const info = await ProductFAQService.getProductInfo(productId);
  
  if (info) {
    console.log(`Producto: ${info.producto}`);
    console.log(`Precio: ${info.precio.toLocaleString('es-CO')} COP`);
    console.log(`Categoría: ${info.categoria}`);
    console.log(`Total FAQs: ${info.faqs.length}`);
    
    if (info.informacionAdicional) {
      console.log('\nInformación adicional:');
      for (const [key, value] of Object.entries(info.informacionAdicional)) {
        console.log(`  - ${key}: ${value}`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
