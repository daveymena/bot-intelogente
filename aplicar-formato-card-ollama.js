/**
 * 🎨 Script para aplicar formato CARD con Ollama en los flujos
 * 
 * Este script modifica los flujos para que usen las plantillas CARD
 * profesionales con emojis y estructura ordenada
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 APLICANDO FORMATO CARD CON OLLAMA\n');

// Función para modificar flujoDigital.ts
function modificarFlujoDigital() {
  const archivo = path.join(__dirname, 'src/conversational-module/flows/flujoDigital.ts');
  
  console.log('📝 Modificando flujoDigital.ts...');
  
  let contenido = fs.readFileSync(archivo, 'utf8');
  
  // Buscar la función procesarFlujoDigital
  const inicioFuncion = contenido.indexOf('export async function procesarFlujoDigital(');
  
  if (inicioFuncion === -1) {
    console.log('❌ No se encontró la función procesarFlujoDigital');
    return false;
  }
  
  // Encontrar el final de la función (buscar el siguiente 'export' o final del archivo)
  let finFuncion = contenido.indexOf('\nexport ', inicioFuncion + 1);
  if (finFuncion === -1) {
    finFuncion = contenido.indexOf('\n/**\n * Genera respuesta usando metodología AIDA', inicioFuncion);
  }
  
  if (finFuncion === -1) {
    console.log('❌ No se pudo determinar el final de la función');
    return false;
  }
  
  // Nueva implementación
  const nuevaFuncion = `export async function procesarFlujoDigital(
  mensaje: string,
  producto: ProductoInfo,
  contexto: ContextoConversacion
): Promise<string> {
  console.log('[FlujoDigital] 🎯 PRODUCTO EN FLUJO:');
  console.log('[FlujoDigital]    ID:', producto.id);
  console.log('[FlujoDigital]    Nombre:', producto.nombre);
  console.log('[FlujoDigital]    Precio:', producto.precio);
  
  // 🤖 USAR OLLAMA CON FORMATO CARD PROFESIONAL
  try {
    console.log('[FlujoDigital] 🤖 Usando Ollama con formato CARD...');
    
    const { generateCardResponse } = await import('../ai/ollamaClient');
    
    // Preparar contexto de conversación
    const contextoTexto = contexto.historialMensajes
      ?.slice(-5)
      .map((m: any) => \`\${m.rol}: \${m.contenido}\`)
      .join('\\n') || 'Primera interacción';
    
    // Generar respuesta con formato CARD profesional
    const respuesta = await generateCardResponse(
      {
        nombre: producto.nombre,
        precio: producto.precio,
        categoria: producto.categoria,
        descripcion: producto.descripcion,
        imagenes: producto.imagenes
      },
      contextoTexto,
      mensaje
    );
    
    console.log('[FlujoDigital] ✅ Respuesta CARD generada con Ollama');
    return respuesta;
    
  } catch (error) {
    console.error('[FlujoDigital] ❌ Error con Ollama, usando fallback AIDA:', error);
    return generarRespuestaAIDA(producto);
  }
}

`;
  
  // Reemplazar la función
  const nuevoContenido = contenido.substring(0, inicioFuncion) + nuevaFuncion + contenido.substring(finFuncion);
  
  // Guardar
  fs.writeFileSync(archivo, nuevoContenido, 'utf8');
  
  console.log('✅ flujoDigital.ts modificado correctamente\n');
  return true;
}

// Ejecutar
try {
  const exito = modificarFlujoDigital();
  
  if (exito) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ FORMATO CARD ACTIVADO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Próximos pasos:');
    console.log('1. Reiniciar el servidor: npm run dev');
    console.log('2. Probar con: "curso de piano"');
    console.log('3. Verificar formato CARD en la respuesta\n');
  } else {
    console.log('❌ No se pudo aplicar el cambio');
    console.log('Por favor, aplica manualmente siguiendo ACTIVAR_FORMATO_CARD_OLLAMA.md\n');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\nPor favor, aplica manualmente siguiendo ACTIVAR_FORMATO_CARD_OLLAMA.md\n');
}
