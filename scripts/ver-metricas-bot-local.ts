/**
 * Script para ver métricas del Bot Local en tiempo real
 */

import { db } from '../src/lib/db';

async function verMetricas() {
  console.log('📊 MÉTRICAS DEL BOT LOCAL\n');
  console.log('='.repeat(60));

  try {
    // Obtener mensajes de las últimas 24 horas
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const mensajes = await db.message.findMany({
      where: {
        createdAt: {
          gte: hace24h
        }
      },
      include: {
        conversation: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📈 RESUMEN ÚLTIMAS 24 HORAS\n`);
    console.log(`Total de mensajes: ${mensajes.length}`);
    
    const incoming = mensajes.filter(m => m.direction === 'INCOMING').length;
    const outgoing = mensajes.filter(m => m.direction === 'OUTGOING').length;
    
    console.log(`Mensajes entrantes: ${incoming}`);
    console.log(`Mensajes salientes: ${outgoing}`);

    // Análisis de patrones comunes (simulado)
    console.log(`\n🎯 PATRONES DETECTADOS (Estimado)\n`);
    
    const patterns = {
      saludos: 0,
      despedidas: 0,
      pagos: 0,
      envio: 0,
      garantia: 0,
      horarios: 0,
      gracias: 0,
      confirmaciones: 0,
      otros: 0
    };

    mensajes.filter(m => m.direction === 'INCOMING').forEach(msg => {
      const text = msg.content.toLowerCase();
      
      if (/hola|buenos|buenas|hey|saludos/.test(text)) {
        patterns.saludos++;
      } else if (/adios|chao|hasta/.test(text)) {
        patterns.despedidas++;
      } else if (/pago|pagar|metodo|forma|tarjeta|nequi|paypal/.test(text)) {
        patterns.pagos++;
      } else if (/envio|entrega|domicilio|llega|demora/.test(text)) {
        patterns.envio++;
      } else if (/garantia|devolucion|cambio|defecto/.test(text)) {
        patterns.garantia++;
      } else if (/horario|hora|atienden|abren/.test(text)) {
        patterns.horarios++;
      } else if (/gracias|mil gracias|agradezco/.test(text)) {
        patterns.gracias++;
      } else if (/^(si|ok|vale|perfecto|listo|dale)$/i.test(text.trim())) {
        patterns.confirmaciones++;
      } else {
        patterns.otros++;
      }
    });

    const totalPatterns = Object.values(patterns).reduce((a, b) => a + b, 0);
    
    Object.entries(patterns).forEach(([pattern, count]) => {
      const percentage = totalPatterns > 0 ? ((count / totalPatterns) * 100).toFixed(1) : '0.0';
      const bar = '█'.repeat(Math.floor(count / 2));
      console.log(`${pattern.padEnd(15)} ${count.toString().padStart(4)} (${percentage}%) ${bar}`);
    });

    // Estimación de respuestas locales vs IA
    const localEstimado = patterns.saludos + patterns.despedidas + patterns.pagos + 
                          patterns.envio + patterns.garantia + patterns.horarios + 
                          patterns.gracias + patterns.confirmaciones;
    
    const iaEstimado = patterns.otros;
    const total = localEstimado + iaEstimado;

    console.log(`\n⚡ DISTRIBUCIÓN ESTIMADA\n`);
    
    if (total > 0) {
      const localPct = ((localEstimado / total) * 100).toFixed(1);
      const iaPct = ((iaEstimado / total) * 100).toFixed(1);
      
      console.log(`Bot Local:  ${localEstimado.toString().padStart(4)} mensajes (${localPct}%)`);
      console.log(`IA (Groq):  ${iaEstimado.toString().padStart(4)} mensajes (${iaPct}%)`);
      
      // Objetivo: 70% local, 30% IA
      console.log(`\n🎯 OBJETIVO: 70% Local / 30% IA`);
      
      const localNum = parseFloat(localPct);
      if (localNum >= 70) {
        console.log(`✅ ¡Objetivo alcanzado! (${localPct}% local)`);
      } else if (localNum >= 60) {
        console.log(`⚠️  Cerca del objetivo (${localPct}% local)`);
      } else {
        console.log(`❌ Por debajo del objetivo (${localPct}% local)`);
      }
    } else {
      console.log('No hay suficientes datos para calcular');
    }

    // Conversaciones activas
    console.log(`\n💬 CONVERSACIONES\n`);
    
    const conversaciones = await db.conversation.findMany({
      where: {
        lastMessageAt: {
          gte: hace24h
        }
      },
      include: {
        _count: {
          select: { messages: true }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      },
      take: 10
    });

    console.log(`Conversaciones activas (24h): ${conversaciones.length}`);
    
    if (conversaciones.length > 0) {
      console.log(`\nÚltimas 10 conversaciones:`);
      conversaciones.forEach((conv, i) => {
        const phone = conv.customerPhone.substring(0, 15) + '...';
        const msgs = conv._count.messages;
        const time = conv.lastMessageAt.toLocaleString('es-CO');
        console.log(`${(i + 1).toString().padStart(2)}. ${phone.padEnd(20)} ${msgs.toString().padStart(3)} msgs - ${time}`);
      });
    }

    // Tiempo de respuesta estimado
    console.log(`\n⏱️  RENDIMIENTO ESTIMADO\n`);
    console.log(`Bot Local:  < 100ms  ⚡`);
    console.log(`IA (Groq):  1-2s     🤖`);
    console.log(`Promedio:   ~500ms   📊`);

    // Ahorro de costos estimado
    if (total > 0) {
      const costPerMessage = 0.0001; // $0.0001 por mensaje con IA
      const costoTotal = total * costPerMessage;
      const costoConLocal = iaEstimado * costPerMessage;
      const ahorro = costoTotal - costoConLocal;
      const ahorroPct = ((ahorro / costoTotal) * 100).toFixed(1);

      console.log(`\n💰 AHORRO DE COSTOS (Estimado)\n`);
      console.log(`Sin Bot Local:  $${costoTotal.toFixed(4)}`);
      console.log(`Con Bot Local:  $${costoConLocal.toFixed(4)}`);
      console.log(`Ahorro:         $${ahorro.toFixed(4)} (${ahorroPct}%)`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Métricas calculadas exitosamente\n');

  } catch (error) {
    console.error('❌ Error obteniendo métricas:', error);
  }
}

// Ejecutar
verMetricas()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
