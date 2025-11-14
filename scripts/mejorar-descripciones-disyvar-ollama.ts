/**
 * Mejorar descripciones de productos Disyvar usando Ollama
 * Lee el JSON de productos y mejora las descripciones con IA local
 */

import fs from 'fs';
import path from 'path';

interface DisyvarProduct {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  url: string;
  sku?: string;
  brand?: string;
  stock?: string;
}

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

async function mejorarDescripcionConOllama(producto: DisyvarProduct): Promise<string> {
  try {
    const prompt = `Eres un experto en redacción de descripciones de productos para e-commerce.

Producto: ${producto.name}
Categoría: ${producto.category}
Precio: $${producto.price.toLocaleString('es-CO')} COP
${producto.brand ? `Marca: ${producto.brand}` : ''}
${producto.sku ? `SKU: ${producto.sku}` : ''}

Descripción actual: ${producto.description}

Crea una descripción mejorada y atractiva para este producto que:
1. Sea persuasiva y profesional
2. Destaque los beneficios principales
3. Use lenguaje claro y directo
4. Tenga entre 80-150 palabras
5. Incluya llamado a la acción sutil
6. Sea optimizada para SEO
7. Esté en español colombiano

Responde SOLO con la descripción mejorada, sin explicaciones adicionales.`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.trim();

  } catch (error: any) {
    console.error(`  ❌ Error con Ollama: ${error.message}`);
    return producto.description; // Mantener descripción original si falla
  }
}

async function main() {
  console.log('🚀 Mejorando descripciones de Disyvar con Ollama\n');
  console.log('='.repeat(60) + '\n');

  // Verificar que Ollama esté disponible
  try {
    console.log('🔍 Verificando conexión con Ollama...');
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) {
      throw new Error('Ollama no está disponible');
    }
    console.log(`✅ Ollama conectado en ${OLLAMA_URL}`);
    console.log(`📦 Usando modelo: ${MODEL}\n`);
  } catch (error) {
    console.error('❌ Error: Ollama no está disponible');
    console.error('💡 Asegúrate de que Ollama esté corriendo:');
    console.error('   ollama serve');
    console.error(`   O configura OLLAMA_URL en .env\n`);
    return;
  }

  // Leer productos
  const jsonPath = path.join(process.cwd(), 'scripts', 'disyvar-productos.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ No se encontró disyvar-productos.json');
    console.error('   Ejecuta primero: npx tsx scripts/scrape-disyvar-completo.ts\n');
    return;
  }

  const productos: DisyvarProduct[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`📦 Productos a mejorar: ${productos.length}\n`);

  // Mejorar descripciones
  let mejorados = 0;
  let errores = 0;

  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    
    console.log(`[${i + 1}/${productos.length}] ${producto.name.slice(0, 50)}...`);
    
    try {
      const descripcionMejorada = await mejorarDescripcionConOllama(producto);
      
      if (descripcionMejorada && descripcionMejorada !== producto.description) {
        producto.description = descripcionMejorada;
        mejorados++;
        console.log(`  ✅ Descripción mejorada`);
      } else {
        console.log(`  ⚠️ Sin cambios`);
      }

      // Delay para no sobrecargar Ollama
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      errores++;
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  // Guardar productos mejorados
  const outputPath = path.join(process.cwd(), 'scripts', 'disyvar-productos-mejorados.json');
  fs.writeFileSync(outputPath, JSON.stringify(productos, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Resumen:');
  console.log(`   ✅ Descripciones mejoradas: ${mejorados}`);
  console.log(`   ⚠️ Sin cambios: ${productos.length - mejorados - errores}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`   📦 Total procesados: ${productos.length}`);

  console.log(`\n💾 Productos guardados en: ${outputPath}`);

  // Mostrar ejemplo de mejora
  if (mejorados > 0) {
    const productoMejorado = productos.find(p => p.description.length > 100);
    if (productoMejorado) {
      console.log('\n📝 Ejemplo de mejora:');
      console.log(`\n   Producto: ${productoMejorado.name}`);
      console.log(`   Descripción: ${productoMejorado.description.slice(0, 200)}...`);
    }
  }

  console.log('\n✨ Proceso completado!');
  console.log('\n📝 Próximo paso:');
  console.log('   Revisar disyvar-productos-mejorados.json');
  console.log('   Luego importar: npx tsx scripts/import-disyvar.ts\n');
}

main().catch(console.error);
