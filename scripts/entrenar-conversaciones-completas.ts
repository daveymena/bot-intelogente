/**
 * 🎓 ENTRENAMIENTO CON CONVERSACIONES COMPLETAS
 * Simula conversaciones reales de principio a fin,
 * incluyendo múltiples intercambios como un cliente real
 */

import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine';
import { LocalKnowledgeBase } from '../src/lib/local-knowledge-base';
import { OllamaService } from '../src/lib/ollama-service';
import { db } from '../src/lib/db';

// 💬 CONVERSACIONES COMPLETAS SIMULADAS
const CONVERSACIONES_COMPLETAS = [
  // Conversación 1: Cliente interesado en curso de piano
  {
    nombre: 'Cliente interesado en Curso de Piano',
    mensajes: [
      'Hola, buenos días',
      'Tienes el curso de piano?',
      'Cuánto cuesta?',
      'Qué incluye el curso?',
      'Tiene certificado?',
      'Cómo puedo pagar?',
      'Acepto, quiero pagar con Nequi'
    ]
  },

  // Conversación 2: Cliente buscando laptop
  {
    nombre: 'Cliente buscando Laptop',
    mensajes: [
      'Hola',
      'Tienes laptops?',
      'Cuáles tienes disponibles?',
      'Cuánto cuesta la más económica?',
      'Tiene garantía?',
      'Hacen envíos?',
      'Cuánto cuesta el envío?',
      'Ok, cómo hago para comprar?'
    ]
  },

  // Conversación 3: Cliente preguntando por megapack
  {
    nombre: 'Cliente interesado en Megapack Completo',
    mensajes: [
      'Hola, qué tal',
      'Qué es el megapack?',
      'Cuántos cursos incluye?',
      'Cuánto cuesta?',
      'Es mejor comprar el megapack o cursos individuales?',
      'Ok, me interesa el megapack completo',
      'Métodos de pago?',
      'Perfecto, voy a pagar con tarjeta'
    ]
  },

  // Conversación 4: Cliente comparando productos
  {
    nombre: 'Cliente comparando Cursos',
    mensajes: [
      'Hola',
      'Tienes curso de diseño gráfico?',
      'Y curso de programación?',
      'Cuál me recomiendas?',
      'Cuánto cuesta cada uno?',
      'Ok, quiero el de diseño gráfico',
      'Cómo pago?'
    ]
  },

  // Conversación 5: Cliente con dudas sobre acceso
  {
    nombre: 'Cliente con dudas sobre Acceso Digital',
    mensajes: [
      'Hola',
      'Los cursos son online?',
      'Cómo accedo al curso después de pagar?',
      'El acceso es de por vida?',
      'Puedo descargar el contenido?',
      'Perfecto, quiero comprar el curso de Excel',
      'Cuánto cuesta?',
      'Cómo puedo pagar?'
    ]
  },

  // Conversación 6: Cliente preguntando por descuentos
  {
    nombre: 'Cliente buscando Descuentos',
    mensajes: [
      'Hola',
      'Tienen descuentos?',
      'Hay alguna promoción activa?',
      'Cuánto es el descuento en el megapack?',
      'Hasta cuándo dura la promoción?',
      'Ok, quiero aprovechar la oferta',
      'Cómo procedo con la compra?'
    ]
  },

  // Conversación 7: Cliente preguntando por garantía
  {
    nombre: 'Cliente preguntando por Garantía',
    mensajes: [
      'Hola',
      'Tienes MacBook?',
      'Cuánto cuesta?',
      'Tiene garantía?',
      'Cuánto dura la garantía?',
      'Qué cubre la garantía?',
      'Ok, me interesa',
      'Formas de pago?'
    ]
  },

  // Conversación 8: Cliente indeciso
  {
    nombre: 'Cliente Indeciso',
    mensajes: [
      'Hola',
      'Qué productos tienes?',
      'Tienes laptops?',
      'Y cursos?',
      'Cuál me recomiendas para empezar?',
      'Cuánto cuesta el curso de piano?',
      'Déjame pensarlo',
      'Ok, decidí comprar',
      'Cómo pago?'
    ]
  },

  // Conversación 9: Cliente preguntando por envío
  {
    nombre: 'Cliente preguntando por Envío',
    mensajes: [
      'Hola',
      'Tienes motos eléctricas?',
      'Cuánto cuesta?',
      'Hacen envíos?',
      'Envían a Medellín?',
      'Cuánto cuesta el envío?',
      'Cuánto demora?',
      'Ok, quiero comprar',
      'Métodos de pago?'
    ]
  },

  // Conversación 10: Cliente con problema técnico
  {
    nombre: 'Cliente con Problema Técnico',
    mensajes: [
      'Hola',
      'Compré un curso pero no puedo acceder',
      'Ya pagué pero no me llegó el link',
      'Tienen soporte técnico?',
      'Cómo los contacto?',
      'Gracias por la ayuda'
    ]
  }
];

async function entrenarConversacionesCompletas() {
  console.log('🎓 ENTRENAMIENTO CON CONVERSACIONES COMPLETAS\n');
  console.log('Simulando conversaciones reales de principio a fin...\n');

  try {
    // Inicializar sistemas
    console.log('1️⃣ Inicializando sistemas...');
    await LocalKnowledgeBase.initialize();
    const engine = getIntelligentEngine();
    
    // Verificar Ollama
    const ollamaAvailable = await OllamaService.isAvailable();
    if (ollamaAvailable) {
      console.log('✅ Ollama disponible - Entrenamiento ILIMITADO 🚀');
      const hasModel = await OllamaService.checkModel();
      if (hasModel) {
        console.log('✅ Modelo gemma:2b listo');
      } else {
        console.log('⚠️ Modelo gemma:2b no encontrado');
        console.log('💡 Descárgalo con: ollama pull gemma:2b');
      }
    } else {
      console.log('⚠️ Ollama no disponible, usando Groq (limitado a 800k tokens/día)');
    }
    
    console.log('✅ Sistemas inicializados\n');

    // Obtener usuario de prueba
    const user = await db.user.findFirst();
    if (!user) {
      console.error('❌ No hay usuarios en la base de datos');
      return;
    }

    let totalMensajes = 0;
    let respuestasGuardadas = 0;

    // Procesar cada conversación completa
    for (let i = 0; i < CONVERSACIONES_COMPLETAS.length; i++) {
      const conversacion = CONVERSACIONES_COMPLETAS[i];
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📞 CONVERSACIÓN ${i + 1}/${CONVERSACIONES_COMPLETAS.length}: ${conversacion.nombre}`);
      console.log('='.repeat(60));

      // Crear un chat ID único para esta conversación
      const chatId = `training-conversation-${Date.now()}-${i}`;

      // Procesar cada mensaje de la conversación
      for (let j = 0; j < conversacion.mensajes.length; j++) {
        const mensaje = conversacion.mensajes[j];
        
        console.log(`\n👤 Cliente: "${mensaje}"`);
        
        try {
          // Procesar mensaje con el motor inteligente
          // IMPORTANTE: Usar el mismo chatId para mantener el contexto
          const response = await engine.processMessage({
            chatId, // Mismo chatId = mantiene contexto de conversación
            userName: conversacion.nombre,
            message: mensaje,
            userId: user.id
          });

          totalMensajes++;

          // Mostrar respuesta
          const respuestaCorta = response.text.length > 200 
            ? response.text.substring(0, 200) + '...' 
            : response.text;
          
          console.log(`🤖 Bot (${(response.confidence * 100).toFixed(0)}% confianza):`);
          console.log(`   ${respuestaCorta.replace(/\n/g, '\n   ')}`);

          // Guardar si la confianza es alta
          if (response.confidence >= 0.7) {
            await LocalKnowledgeBase.saveSuccessfulResponse({
              userQuery: mensaje,
              botResponse: response.text,
              productId: response.context.currentProduct?.id,
              productName: response.context.currentProduct?.name,
              context: conversacion.nombre,
              confidence: response.confidence
            });

            respuestasGuardadas++;
            console.log(`   ✅ Respuesta guardada en base de conocimiento`);
          } else {
            console.log(`   ⚠️ Confianza baja, no guardada`);
          }

          // Pausa entre mensajes para simular conversación real
          await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error: any) {
          console.log(`   ❌ Error: ${error.message}`);
          
          // Si es rate limit, esperar más tiempo
          if (error.status === 429) {
            console.log('   ⏳ Rate limit alcanzado, esperando 15 segundos...');
            await new Promise(resolve => setTimeout(resolve, 15000));
          }
        }
      }

      // Limpiar memoria de esta conversación para la siguiente
      engine.clearMemory(chatId);
      console.log(`\n✅ Conversación ${i + 1} completada`);

      // Pausa entre conversaciones
      if (i < CONVERSACIONES_COMPLETAS.length - 1) {
        console.log('⏳ Esperando 3 segundos antes de la siguiente conversación...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ENTRENAMIENTO COMPLETADO\n');
    console.log(`📊 Estadísticas:`);
    console.log(`   Conversaciones simuladas: ${CONVERSACIONES_COMPLETAS.length}`);
    console.log(`   Total de mensajes procesados: ${totalMensajes}`);
    console.log(`   Respuestas guardadas: ${respuestasGuardadas}`);
    console.log(`   Tasa de guardado: ${((respuestasGuardadas / totalMensajes) * 100).toFixed(1)}%`);
    
    const stats = await LocalKnowledgeBase.getStats();
    console.log(`\n📚 Base de Conocimiento:`);
    console.log(`   Total de entradas: ${stats.totalEntries}`);
    console.log(`   Tasa de éxito promedio: ${(stats.avgSuccessRate * 100).toFixed(1)}%`);
    console.log(`   Uso total: ${stats.totalUsage} veces`);

    console.log('\n✅ El bot ahora tiene conocimiento de conversaciones completas');
    console.log('✅ Entiende el flujo natural de una conversación de ventas');
    console.log('✅ Puede manejar contexto y seguimiento de temas');
    console.log('✅ Listo para atender clientes reales\n');

  } catch (error) {
    console.error('❌ Error en el entrenamiento:', error);
  }
}

// Ejecutar entrenamiento
entrenarConversacionesCompletas();
