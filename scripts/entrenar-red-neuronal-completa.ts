/**
 * Entrenamiento Completo de Red Neuronal
 * Entrena todos los componentes del sistema con el dataset generado
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const execAsync = promisify(exec);

const CORE_AI_URL = process.env.CORE_AI_URL || 'http://localhost:8000';
const TRAINING_DIR = path.join(process.cwd(), 'data', 'training');

/**
 * 1. Entrenar Intent Classifier (fastText)
 */
async function entrenarIntentClassifier(): Promise<void> {
  console.log('\n🎯 1. Entrenando Intent Classifier...');

  try {
    // Verificar que existe el archivo de entrenamiento
    const trainingFile = path.join(TRAINING_DIR, 'intent_training.txt');
    const exists = await fs.access(trainingFile).then(() => true).catch(() => false);

    if (!exists) {
      throw new Error(`Archivo de entrenamiento no encontrado: ${trainingFile}`);
    }

    // Contar ejemplos
    const content = await fs.readFile(trainingFile, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    console.log(`   📊 ${lines.length} ejemplos de entrenamiento`);

    // Entrenar con Docker
    console.log('   🔄 Entrenando modelo fastText...');
    const { stdout } = await execAsync(
      `docker exec core-ai python scripts/train_intent.py`
    );

    console.log(stdout);
    console.log('   ✅ Intent Classifier entrenado');

  } catch (error) {
    console.error('   ❌ Error:', error.message);
    throw error;
  }
}

/**
 * 2. Generar y cargar embeddings en Qdrant
 */
async function cargarEmbeddings(): Promise<void> {
  console.log('\n🔤 2. Generando y cargando embeddings...');

  try {
    // Cargar documentos
    const docsFile = path.join(TRAINING_DIR, 'qdrant_documents.json');
    const docs = JSON.parse(await fs.readFile(docsFile, 'utf-8'));

    console.log(`   📊 ${docs.length} documentos para indexar`);

    // Enviar a Core AI para indexar
    console.log('   🔄 Indexando en Qdrant...');
    
    const batchSize = 100;
    let indexed = 0;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      
      await axios.post(`${CORE_AI_URL}/index/conversations`, {
        documents: batch
      });

      indexed += batch.length;
      console.log(`   📈 Indexados: ${indexed}/${docs.length}`);
    }

    console.log('   ✅ Embeddings cargados en Qdrant');

  } catch (error) {
    console.error('   ❌ Error:', error.message);
    throw error;
  }
}

/**
 * 3. Entrenar con conversaciones completas
 */
async function entrenarConversaciones(): Promise<void> {
  console.log('\n💬 3. Entrenando con conversaciones completas...');

  try {
    // Cargar dataset completo
    const files = await fs.readdir(TRAINING_DIR);
    const datasetFile = files.find(f => f.startsWith('dataset_completo_'));

    if (!datasetFile) {
      throw new Error('Dataset completo no encontrado');
    }

    const dataset = JSON.parse(
      await fs.readFile(path.join(TRAINING_DIR, datasetFile), 'utf-8')
    );

    console.log(`   📊 ${dataset.metadata.total_conversaciones} conversaciones`);

    let trained = 0;

    // Enviar cada conversación para entrenamiento
    for (const [flujoKey, flujoData] of Object.entries(dataset.flujos) as any[]) {
      console.log(`   🔄 Entrenando flujo: ${flujoData.nombre}`);

      for (const conv of flujoData.conversaciones) {
        try {
          await axios.post(`${CORE_AI_URL}/train`, {
            conversation_id: conv.conversation_id,
            messages: conv.messages,
            outcome: conv.outcome || 'success',
            feedback: null
          });

          trained++;

          if (trained % 10 === 0) {
            console.log(`   📈 Entrenadas: ${trained}/${dataset.metadata.total_conversaciones}`);
          }

        } catch (error) {
          console.warn(`   ⚠️ Error en conversación ${conv.conversation_id}`);
        }
      }
    }

    console.log(`   ✅ ${trained} conversaciones entrenadas`);

  } catch (error) {
    console.error('   ❌ Error:', error.message);
    throw error;
  }
}

/**
 * 4. Fine-tuning del Mini-LLM (opcional)
 */
async function fineTuneLLM(): Promise<void> {
  console.log('\n🧠 4. Fine-tuning Mini-LLM...');

  try {
    // Preparar datos para fine-tuning
    const conversationsFile = path.join(TRAINING_DIR, 'conversations.jsonl');
    const conversations = (await fs.readFile(conversationsFile, 'utf-8'))
      .split('\n')
      .filter(l => l.trim())
      .map(l => JSON.parse(l));

    console.log(`   📊 ${conversations.length} conversaciones para fine-tuning`);

    // Crear formato para LoRA fine-tuning
    const loraData = conversations.map(conv => ({
      instruction: 'Eres un asistente de ventas para Tecnovariedades D&S. Responde de manera natural y profesional.',
      input: conv.messages.filter(m => m.role === 'user').map(m => m.content).join('\n'),
      output: conv.messages.filter(m => m.role === 'assistant').map(m => m.content).join('\n')
    }));

    // Guardar formato LoRA
    await fs.writeFile(
      path.join(TRAINING_DIR, 'lora_training.json'),
      JSON.stringify(loraData, null, 2)
    );

    console.log('   ✅ Datos preparados para LoRA fine-tuning');
    console.log('   ℹ️ Para entrenar LoRA, ejecutar manualmente:');
    console.log('      python scripts/train_lora.py');

  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
}

/**
 * 5. Validar entrenamiento
 */
async function validarEntrenamiento(): Promise<void> {
  console.log('\n✅ 5. Validando entrenamiento...');

  try {
    // Test queries
    const testQueries = [
      '¿Cuánto cuesta el Macbook?',
      'Quiero agendar una cita',
      '¿Tienen garantía?',
      'Me estafas?',
      'Necesito un portátil para diseño'
    ];

    console.log('   🧪 Probando queries...\n');

    for (const query of testQueries) {
      const response = await axios.post(`${CORE_AI_URL}/query`, {
        user_id: 'test_validation',
        text: query
      });

      console.log(`   Q: "${query}"`);
      console.log(`   Intent: ${response.data.intent} (${response.data.confidence.toFixed(2)})`);
      console.log(`   A: ${response.data.reply.substring(0, 100)}...`);
      console.log('');
    }

    // Obtener stats
    const stats = await axios.get(`${CORE_AI_URL}/stats`);
    console.log('   📊 Estadísticas del sistema:');
    console.log(JSON.stringify(stats.data, null, 2));

    console.log('\n   ✅ Validación completada');

  } catch (error) {
    console.error('   ❌ Error en validación:', error.message);
  }
}

/**
 * 6. Generar reporte de entrenamiento
 */
async function generarReporte(): Promise<void> {
  console.log('\n📊 6. Generando reporte...');

  try {
    const files = await fs.readdir(TRAINING_DIR);
    const datasetFile = files.find(f => f.startsWith('dataset_completo_'));
    
    if (!datasetFile) {
      console.log('   ⚠️ Dataset no encontrado');
      return;
    }

    const dataset = JSON.parse(
      await fs.readFile(path.join(TRAINING_DIR, datasetFile), 'utf-8')
    );

    const reporte = {
      fecha: new Date().toISOString(),
      dataset: {
        archivo: datasetFile,
        total_flujos: dataset.metadata.total_flujos,
        total_conversaciones: dataset.metadata.total_conversaciones,
        flujos: Object.entries(dataset.flujos).map(([key, data]: any) => ({
          nombre: data.nombre,
          conversaciones: data.total
        }))
      },
      entrenamiento: {
        intent_classifier: 'completado',
        embeddings: 'completado',
        conversaciones: 'completado',
        llm_finetuning: 'pendiente (manual)'
      },
      proximos_pasos: [
        'Monitorear accuracy en producción',
        'Recopilar feedback de usuarios',
        'Re-entrenar con nuevos datos cada semana',
        'Ajustar confidence threshold según métricas'
      ]
    };

    const reportePath = path.join(TRAINING_DIR, `reporte_entrenamiento_${Date.now()}.json`);
    await fs.writeFile(reportePath, JSON.stringify(reporte, null, 2));

    console.log('   ✅ Reporte generado:', reportePath);
    console.log('\n📋 Resumen:');
    console.log(`   - Total conversaciones: ${reporte.dataset.total_conversaciones}`);
    console.log(`   - Total flujos: ${reporte.dataset.total_flujos}`);
    console.log(`   - Intent classifier: ${reporte.entrenamiento.intent_classifier}`);
    console.log(`   - Embeddings: ${reporte.entrenamiento.embeddings}`);

  } catch (error) {
    console.error('   ❌ Error generando reporte:', error.message);
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Iniciando entrenamiento completo de red neuronal...\n');

  try {
    // Verificar que Core AI está disponible
    console.log('🔍 Verificando Core AI...');
    const health = await axios.get(`${CORE_AI_URL}/health`);
    
    if (health.data.status !== 'healthy') {
      throw new Error('Core AI no está saludable');
    }
    console.log('✅ Core AI disponible\n');

    // Ejecutar pipeline de entrenamiento
    await entrenarIntentClassifier();
    await cargarEmbeddings();
    await entrenarConversaciones();
    await fineTuneLLM();
    await validarEntrenamiento();
    await generarReporte();

    console.log('\n🎉 ¡Entrenamiento completo finalizado!');
    console.log('\n📚 Próximos pasos:');
    console.log('   1. Revisar reporte en data/training/');
    console.log('   2. Probar bot con mensajes reales');
    console.log('   3. Monitorear métricas de accuracy');
    console.log('   4. Re-entrenar semanalmente con nuevos datos');

  } catch (error) {
    console.error('\n❌ Error en entrenamiento:', error);
    process.exit(1);
  }
}

main();
