import { PrismaClient } from '@prisma/client';
import { AIMultiProvider } from '../src/lib/ai-multi-provider';

const prisma = new PrismaClient();

async function mejorarDescripcion(producto: any): Promise<string> {
  const prompt = `Eres un experto en copywriting para e-commerce. Crea una descripción atractiva para este producto usando SOLO la información real proporcionada.

PRODUCTO:
- Nombre: ${producto.name}
- Categoría: ${producto.category}
- Precio: ${producto.price.toLocaleString('es-CO')} COP
${producto.description ? `- Info adicional: ${producto.description}` : ''}

REGLAS ESTRICTAS:
1. USA SOLO información real del producto (NO inventes especificaciones)
2. Aplica AIDA sutilmente: Atención (emoji + título), Interés (características), Deseo (beneficios), Acción (llamado suave)
3. Usa emojis relevantes (máximo 4-5)
4. Usa viñetas (•) para organizar información
5. Máximo 150 palabras
6. Tono profesional pero cercano
7. Enfócate en beneficios reales basados en las características del nombre

FORMATO DESEADO:
[Emoji] Título atractivo corto

[2-3 líneas describiendo el producto y su valor]

✨ Características principales:
• [Característica 1 del nombre]
• [Característica 2 del nombre]
• [Característica 3 del nombre]

💡 Ideal para: [Tipo de usuario basado en el producto]

Responde SOLO con la descripción, sin explicaciones adicionales.`;

  try {
    // Usar el sistema multi-provider que respeta el orden: ollama -> openrouter -> groq
    const response = await AIMultiProvider.generateResponse(prompt, {
      maxTokens: 500,
      temperature: 0.7,
    });

    return response || producto.description || '';
  } catch (error: any) {
    console.error(`❌ Error generando descripción:`, error.message);
    return producto.description || '';
  }
}

async function main() {
  console.log('🎨 Mejorando descripciones de productos con IA Multi-Provider...');
  console.log(`📡 Orden de proveedores: ${process.env.AI_FALLBACK_ORDER || 'ollama,openrouter,groq'}\n`);

  // Obtener productos que NO han sido mejorados con IA usando SQL directo
  const productos = await prisma.$queryRaw`
    SELECT * FROM products 
    WHERE aiEnhanced = 0 OR aiEnhanced IS NULL
    ORDER BY createdAt DESC
    LIMIT 20
  ` as any[];

  console.log(`📦 Encontrados ${productos.length} productos para mejorar\n`);

  let mejorados = 0;
  let errores = 0;

  for (const producto of productos) {
    try {
      console.log(`\n📝 Procesando: ${producto.name.substring(0, 60)}...`);
      
      const nuevaDescripcion = await mejorarDescripcion(producto);
      
      if (nuevaDescripcion && nuevaDescripcion !== producto.description) {
        // Actualizar descripción y marcar como mejorado con IA usando SQL directo
        await prisma.$executeRaw`
          UPDATE products 
          SET description = ${nuevaDescripcion}, aiEnhanced = 1, updatedAt = datetime('now')
          WHERE id = ${producto.id}
        `;
        
        console.log('✅ Descripción mejorada');
        console.log(`\n${nuevaDescripcion}\n`);
        console.log('─'.repeat(80));
        mejorados++;
        
        // Esperar 500ms entre llamadas (Ollama local es rápido)
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`❌ Error procesando ${producto.name}:`, error);
      errores++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n✨ Proceso completado:`);
  console.log(`   ✅ Mejorados: ${mejorados}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`   📦 Total procesados: ${productos.length}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
