#!/usr/bin/env tsx
/**
 * Generador de Dataset - SOLO OLLAMA
 * Versión optimizada sin Groq
 */

import fs from 'fs';
import path from 'path';

const OLLAMA_URL = 'http://localhost:11434';
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'training');

// Asegurar que existe el directorio
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

// Escenarios simplificados
const scenarios = [
  {
    category: 'saludo',
    intent: 'greeting',
    prompts: [
      'Hola',
      'Buenos días',
      'Buenas tardes',
      'Qué tal',
      'Hola, cómo estás'
    ]
  },
  {
    category: 'busqueda_laptop',
    intent: 'product_search',
    prompts: [
      'Busco un portátil',
      'Necesito una laptop',
      'Tienes computadores',
      'Quiero un portátil para trabajar',
      'Laptop económica'
    ]
  },
  {
    category: 'busqueda_moto',
    intent: 'product_search',
    prompts: [
      'Tienes motos',
      'Busco una moto',
      'Necesito una motocicleta',
      'Moto económica',
      'Quiero comprar una moto'
    ]
  },
  {
    category: 'precio',
    intent: 'price_inquiry',
    prompts: [
      'Cuánto cuesta',
      'Qué precio tiene',
      'Cuál es el valor',
      'Está muy caro',
      'Tienes algo más económico'
    ]
  },
  {
    category: 'pago',
    intent: 'payment_inquiry',
    prompts: [
      'Cómo puedo pagar',
      'Qué métodos de pago tienen',
      'Aceptan Nequi',
      'Puedo pagar con tarjeta',
      'Tienen contraentrega'
    ]
  }
];

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
          temperature: 0.7,
          num_predict: 150
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Error llamando Ollama:', error);
    return '';
  }
}

async function generarConversacion(
  userMessage: string,
  category: string,
  intent: string
): Promise<Conversation | null> {
  const systemPrompt = `Eres un asistente de ventas de Tecnovariedades D&S en Colombia.
Responde de forma natural, amigable y profesional en español.
Cliente dice: "${userMessage}"
Responde en máximo 2-3 líneas.`;

  const respuesta = await llamarOllama(systemPrompt);
  
  if (!respuesta || respuesta.length < 10) {
    return null;
  }

  return {
    id: `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category,
    messages: [
      { role: 'user', content: userMessage },
      { role: 'assistant', content: respuesta.trim() }
    ],
    metadata: {
      intent,
      timestamp: new Date().toISOString()
    }
  };
}

async function main() {
  console.log('🚀 Generador de Dataset - SOLO OLLAMA\n');
  console.log('Verificando Ollama...');

  // Verificar Ollama
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) throw new Error('Ollama no responde');
    console.log('✅ Ollama conectado\n');
  } catch (error) {
    console.error('❌ Error: Ollama no está corriendo');
    console.error('Ejecuta: ollama serve');
    process.exit(1);
  }

  const allConversations: Conversation[] = [];
  let exitosas = 0;
  let fallidas = 0;

  console.log('📝 Generando conversaciones...\n');

  for (const scenario of scenarios) {
    console.log(`\n🎯 Categoría: ${scenario.category}`);
    
    for (let i = 0; i < scenario.prompts.length; i++) {
      const prompt = scenario.prompts[i];
      process.stdout.write(`  ${i + 1}/${scenario.prompts.length}: "${prompt.substring(0, 30)}..." `);

      const conv = await generarConversacion(
        prompt,
        scenario.category,
        scenario.intent
      );

      if (conv) {
        allConversations.push(conv);
        exitosas++;
        console.log('✅');
      } else {
        fallidas++;
        console.log('❌');
      }

      // Pequeña pausa para no saturar
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Guardar dataset
  const outputFile = path.join(OUTPUT_DIR, `dataset_ollama_${Date.now()}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(allConversations, null, 2));

  console.log('\n\n' + '='.repeat(50));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(50));
  console.log(`✅ Conversaciones exitosas: ${exitosas}`);
  console.log(`❌ Conversaciones fallidas: ${fallidas}`);
  console.log(`📁 Archivo guardado: ${outputFile}`);
  console.log('='.repeat(50));

  // Mostrar ejemplo
  if (allConversations.length > 0) {
    console.log('\n📝 Ejemplo de conversación generada:');
    console.log(JSON.stringify(allConversations[0], null, 2));
  }
}

main().catch(console.error);
