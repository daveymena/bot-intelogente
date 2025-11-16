#!/usr/bin/env tsx
/**
 * Generador de Dataset con PRODUCTOS REALES
 * Usa la base de datos para generar conversaciones realistas
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const OLLAMA_URL = 'http://localhost:11434';
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'training');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface Conversation {
  id: string;
  category: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  metadata: {
    intent: string;
    products?: string[];
    timestamp: string;
  };
}

async function llamarOllama(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma2:2b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 200
        }
      })
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Error Ollama:', error);
    return '';
  }
}

async function generarConversacionProducto(
  producto: any,
  tipo: 'busqueda' | 'precio' | 'caracteristicas'
): Promise<Conversation | null> {
  let userMessage = '';
  let systemPrompt = '';

  if (tipo === 'busqueda') {
    userMessage = `Busco ${producto.name.toLowerCase()}`;
    systemPrompt = `Eres vendedor de Tecnovariedades D&S en Colombia.
Cliente busca: ${producto.name}
Precio: $${producto.price.toLocaleString('es-CO')}
Responde en 2-3 líneas, amigable y profesional.`;
  } else if (tipo === 'precio') {
    userMessage = `Cuánto cuesta ${producto.name.toLowerCase()}`;
    systemPrompt = `Eres vendedor de Tecnovariedades D&S.
Producto: ${producto.name}
Precio: $${producto.price.toLocaleString('es-CO')}
Responde el precio de forma amigable en 2 líneas.`;
  } else {
    userMessage = `Qué características tiene ${producto.name.toLowerCase()}`;
    systemPrompt = `Eres vendedor de Tecnovariedades D&S.
Producto: ${producto.name}
Descripción: ${producto.description || 'Producto de calidad'}
Responde características en 2-3 líneas.`;
  }

  const respuesta = await llamarOllama(systemPrompt);
  
  if (!respuesta || respuesta.length < 10) return null;

  return {
    id: `${tipo}_${producto.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category: `producto_${tipo}`,
    messages: [
      { role: 'user', content: userMessage },
      { role: 'assistant', content: respuesta.trim() }
    ],
    metadata: {
      intent: tipo === 'busqueda' ? 'product_search' : tipo === 'precio' ? 'price_inquiry' : 'product_info',
      products: [producto.id],
      timestamp: new Date().toISOString()
    }
  };
}

async function main() {
  console.log('🚀 Generador de Dataset - PRODUCTOS REALES\n');

  // Verificar Ollama
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) throw new Error('Ollama no responde');
    console.log('✅ Ollama conectado');
  } catch (error) {
    console.error('❌ Ollama no está corriendo');
    process.exit(1);
  }

  // Obtener productos
  console.log('📦 Cargando productos...');
  const productos = await prisma.product.findMany({
    where: { status: 'AVAILABLE' },
    take: 20, // Solo 20 productos para empezar
    orderBy: { createdAt: 'desc' }
  });

  console.log(`✅ ${productos.length} productos cargados\n`);

  const allConversations: Conversation[] = [];
  let exitosas = 0;
  let fallidas = 0;

  console.log('📝 Generando conversaciones...\n');

  for (const producto of productos) {
    console.log(`\n🎯 Producto: ${producto.name.substring(0, 40)}...`);
    
    // 3 tipos de conversación por producto
    const tipos: Array<'busqueda' | 'precio' | 'caracteristicas'> = ['busqueda', 'precio', 'caracteristicas'];
    
    for (const tipo of tipos) {
      process.stdout.write(`  ${tipo}: `);

      const conv = await generarConversacionProducto(producto, tipo);

      if (conv) {
        allConversations.push(conv);
        exitosas++;
        console.log('✅');
      } else {
        fallidas++;
        console.log('❌');
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Guardar dataset
  const outputFile = path.join(OUTPUT_DIR, `dataset_productos_${Date.now()}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(allConversations, null, 2));

  console.log('\n\n' + '='.repeat(50));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(50));
  console.log(`✅ Conversaciones exitosas: ${exitosas}`);
  console.log(`❌ Conversaciones fallidas: ${fallidas}`);
  console.log(`📁 Archivo: ${outputFile}`);
  console.log('='.repeat(50));

  if (allConversations.length > 0) {
    console.log('\n📝 Ejemplo:');
    console.log(JSON.stringify(allConversations[0], null, 2));
  }

  await prisma.$disconnect();
}

main().catch(console.error);
