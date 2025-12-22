/**
 * Script para arreglar el sistema de fallback local
 * Genera respuestas con mejor formato cuando falla la IA
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'intelligent-conversation-engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Buscar y reemplazar la función de fallback local
const oldCode = `      // Generar respuesta con la información del producto
      const product = foundProducts[0]; // Tomar el más relevante
      
      let response = \`¡Claro! 😊 Tengo información sobre *\${product.name}*\\n\\n\`;
      
      if (product.description) {
        response += \`📝 *Descripción:*\\n\${product.description}\\n\\n\`;
      }
      
      response += \`💰 *Precio:* \${product.price.toLocaleString('es-CO')} COP\\n\`;
      response += \`📦 *Categoría:* \${product.category}\\n\\n\`;
      
      if (foundProducts.length > 1) {
        response += \`También tengo \${foundProducts.length - 1} producto(s) similar(es). ¿Te gustaría ver más opciones?\\n\\n\`;
      }
      
      response += \`¿Te interesa este producto? Puedo darte más información o los métodos de pago 😊\`;
      
      return {
        text: response,
        confidence: 0.7,
        context: {
          currentProduct: {
            id: product.id,
            name: product.name,
            price: product.price
          }
        }
      };`;

const newCode = `      // CRITICO: Si el usuario dice mas informacion, usar el producto en contexto
      const memory = this.getOrCreateMemory(chatId, userName);
      const isAskingForMoreInfo = userQuery?.toLowerCase().includes('mas') || 
                                   userQuery?.toLowerCase().includes('saber') ||
                                   userQuery?.toLowerCase().includes('info') ||
                                   userQuery?.toLowerCase().includes('cuent');
      
      let product = foundProducts[0]; // Por defecto, el mas relevante
      
      // Si esta pidiendo mas info Y hay producto en contexto, usar ese
      if (isAskingForMoreInfo && memory.context.currentProduct) {
        console.log('[IntelligentEngine] Cliente pide mas informacion del producto actual');
        product = memory.context.currentProduct;
      }
      
      // Generar respuesta con FORMATO MEJORADO
      let response = \`Claro! Te cuento todo sobre el \${product.name}:\\n\\n\`;
      response += \`CONTENIDO COMPLETO:\\n\\n\`;
      
      if (product.description) {
        response += \`\${product.description}\\n\\n\`;
      }
      
      response += \`PRECIO Y ACCESO:\\n\\n\`;
      response += \`Precio: $\${product.price.toLocaleString('es-CO')} COP\\n\`;
      response += \`Acceso: De por vida\\n\`;
      response += \`Certificado incluido\\n\\n\`;
      response += \`Te gustaria proceder con la compra?\`;
      
      return {
        text: response,
        confidence: 0.7,
        context: {
          currentProduct: {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            images: product.images
          }
        }
      };`;

if (content.includes('Generar respuesta con la información del producto')) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Archivo arreglado correctamente');
} else {
  console.log('❌ No se encontró el código a reemplazar');
  console.log('Buscando alternativa...');
  
  // Buscar la línea específica
  const lines = content.split('\n');
  const targetIndex = lines.findIndex(line => line.includes('Generar respuesta con la información del producto'));
  
  if (targetIndex !== -1) {
    console.log(`✅ Encontrado en línea ${targetIndex + 1}`);
  } else {
    console.log('❌ No se encontró la línea objetivo');
  }
}
