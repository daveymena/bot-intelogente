/**
 * 🎓 ENTRENAMIENTO AUTOMÁTICO DEL BOT
 * Simula conversaciones reales, obtiene respuestas de la IA,
 * y las guarda en la base de conocimiento local para entrenar el LLM
 */

import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine';
import { LocalKnowledgeBase } from '../src/lib/local-knowledge-base';
import { OllamaService } from '../src/lib/ollama-service';
import { db } from '../src/lib/db';

// 📚 PREGUNTAS COMUNES DE CLIENTES REALES
const CONVERSACIONES_ENTRENAMIENTO = [
  // ===== SALUDOS Y CONSULTAS GENERALES =====
  {
    categoria: 'Saludos',
    conversaciones: [
      ['Hola', 'Buenos días', 'Buenas tardes', 'Hola, cómo estás?', 'Hola, me puedes ayudar?'],
      ['Qué vendes?', 'Qué productos tienes?', 'Qué ofreces?', 'En qué me puedes ayudar?']
    ]
  },

  // ===== CURSOS DIGITALES =====
  {
    categoria: 'Cursos Digitales',
    conversaciones: [
      ['Tienes cursos?', 'Qué cursos tienes?', 'Vendes cursos online?', 'Tienes cursos digitales?'],
      ['Tienes el curso de piano?', 'Curso de piano', 'Quiero el curso de piano', 'Me interesa el curso de piano'],
      ['Cuánto cuesta el curso de piano?', 'Precio del curso de piano', 'Cuánto vale el curso de piano?'],
      ['Tienes curso de diseño gráfico?', 'Curso de diseño', 'Photoshop', 'Illustrator'],
      ['Cuánto cuesta el curso de diseño?', 'Precio diseño gráfico', 'Cuánto vale el megapack de diseño?'],
      ['Tienes curso de programación?', 'Curso de Python', 'Curso de JavaScript', 'Aprender a programar'],
      ['Tienes curso de Excel?', 'Curso de Excel avanzado', 'Aprender Excel', 'Excel profesional'],
      ['Qué incluye el curso?', 'Qué trae el curso?', 'Qué aprendo en el curso?', 'Contenido del curso'],
      ['El curso tiene certificado?', 'Dan certificado?', 'Incluye certificado?', 'Certificación'],
      ['Cuánto dura el curso?', 'Cuántas horas tiene?', 'Cuánto tiempo dura?', 'Duración del curso']
    ]
  },

  // ===== MEGAPACKS =====
  {
    categoria: 'Megapacks',
    conversaciones: [
      ['Qué es un megapack?', 'Qué son los megapacks?', 'Megapack completo', 'Pack de cursos'],
      ['Tienes el megapack completo?', 'Megapack de 40 cursos', 'Super megapack', 'Pack completo'],
      ['Cuánto cuesta el megapack completo?', 'Precio del megapack', 'Cuánto vale el pack completo?'],
      ['Qué incluye el megapack?', 'Qué trae el megapack?', 'Cuántos cursos tiene?', 'Lista de cursos'],
      ['Cuál es la diferencia entre megapack y curso individual?', 'Megapack vs curso', 'Qué conviene más?']
    ]
  },

  // ===== LAPTOPS Y COMPUTADORES =====
  {
    categoria: 'Laptops',
    conversaciones: [
      ['Tienes laptops?', 'Vendes computadores?', 'Tienes portátiles?', 'Computadores disponibles'],
      ['Tienes MacBook?', 'MacBook Air', 'MacBook Pro', 'Apple MacBook'],
      ['Cuánto cuesta una laptop?', 'Precio de laptops', 'Cuánto valen los computadores?'],
      ['Tienes laptops gaming?', 'Laptop para juegos', 'Computador gamer', 'PC gaming'],
      ['Tienes laptops para diseño?', 'Laptop para diseño gráfico', 'Computador para edición'],
      ['Qué laptops recomiendas?', 'Cuál laptop es mejor?', 'Qué computador me conviene?'],
      ['Las laptops tienen garantía?', 'Garantía de computadores', 'Cuánto dura la garantía?']
    ]
  },

  // ===== MOTOS =====
  {
    categoria: 'Motos',
    conversaciones: [
      ['Tienes motos?', 'Vendes motos?', 'Motos disponibles', 'Qué motos tienes?'],
      ['Cuánto cuesta una moto?', 'Precio de motos', 'Cuánto valen las motos?'],
      ['Tienes motos eléctricas?', 'Moto eléctrica', 'Scooter eléctrico'],
      ['Las motos tienen garantía?', 'Garantía de motos', 'Servicio técnico para motos']
    ]
  },

  // ===== MÉTODOS DE PAGO =====
  {
    categoria: 'Métodos de Pago',
    conversaciones: [
      ['Cómo puedo pagar?', 'Métodos de pago', 'Formas de pago', 'Cómo pago?'],
      ['Aceptan Nequi?', 'Puedo pagar con Nequi?', 'Pago por Nequi', 'Nequi'],
      ['Aceptan Daviplata?', 'Puedo pagar con Daviplata?', 'Pago por Daviplata', 'Daviplata'],
      ['Aceptan tarjeta de crédito?', 'Puedo pagar con tarjeta?', 'Tarjeta de crédito', 'Tarjeta débito'],
      ['Aceptan PayPal?', 'Puedo pagar con PayPal?', 'Pago internacional', 'PayPal'],
      ['Aceptan transferencia bancaria?', 'Transferencia', 'Pago por banco', 'Bancolombia'],
      ['Cuál es el número de Nequi?', 'Número para Nequi', 'A qué número envío?'],
      ['Cómo hago el pago?', 'Pasos para pagar', 'Proceso de pago', 'Cómo procedo?']
    ]
  },

  // ===== ENVÍOS Y ENTREGAS =====
  {
    categoria: 'Envíos',
    conversaciones: [
      ['Hacen envíos?', 'Envío a domicilio', 'Envían a mi ciudad?', 'Delivery'],
      ['Cuánto cuesta el envío?', 'Precio del envío', 'Envío gratis?', 'Costo de envío'],
      ['Cuánto demora el envío?', 'Tiempo de entrega', 'Cuándo llega?', 'Días de envío'],
      ['Envían a todo Colombia?', 'Envío nacional', 'Envían a mi ciudad?', 'Cobertura de envío']
    ]
  },

  // ===== GARANTÍAS Y SOPORTE =====
  {
    categoria: 'Garantías',
    conversaciones: [
      ['Tienen garantía?', 'Cuánto dura la garantía?', 'Garantía de productos', 'Qué cubre la garantía?'],
      ['Tienen servicio técnico?', 'Soporte técnico', 'Ayuda técnica', 'Asistencia'],
      ['Qué pasa si el producto llega dañado?', 'Producto defectuoso', 'Devoluciones', 'Cambios']
    ]
  },

  // ===== DISPONIBILIDAD Y STOCK =====
  {
    categoria: 'Disponibilidad',
    conversaciones: [
      ['Tienen stock?', 'Hay disponibilidad?', 'Está disponible?', 'Tienen en stock?'],
      ['Cuándo vuelve a estar disponible?', 'Cuándo llega más stock?', 'Reposición de stock'],
      ['Puedo reservar?', 'Cómo reservo?', 'Apartado', 'Separar producto']
    ]
  },

  // ===== COMPARACIONES Y RECOMENDACIONES =====
  {
    categoria: 'Recomendaciones',
    conversaciones: [
      ['Qué me recomiendas?', 'Cuál es mejor?', 'Qué me conviene?', 'Qué producto me sirve?'],
      ['Cuál es la diferencia entre X y Y?', 'Comparar productos', 'Diferencias'],
      ['Qué es lo más vendido?', 'Producto más popular', 'Qué compra la gente?', 'Best seller']
    ]
  },

  // ===== DESCUENTOS Y PROMOCIONES =====
  {
    categoria: 'Descuentos',
    conversaciones: [
      ['Tienen descuentos?', 'Hay promociones?', 'Ofertas', 'Descuento disponible?'],
      ['Cuánto es el descuento?', 'Porcentaje de descuento', 'Cuánto me ahorró?'],
      ['Hasta cuándo dura la promoción?', 'Cuándo termina la oferta?', 'Validez de la promoción']
    ]
  },

  // ===== PROCESO DE COMPRA =====
  {
    categoria: 'Proceso de Compra',
    conversaciones: [
      ['Cómo compro?', 'Proceso de compra', 'Pasos para comprar', 'Cómo hago el pedido?'],
      ['Necesito crear cuenta?', 'Registro obligatorio?', 'Debo registrarme?'],
      ['Qué datos necesitan?', 'Información requerida', 'Qué debo proporcionar?'],
      ['Cuándo recibo el producto?', 'Cuándo me llega?', 'Tiempo de entrega', 'Cuándo lo tengo?'],
      ['Cómo sé que mi pago fue exitoso?', 'Confirmación de pago', 'Comprobante de pago']
    ]
  },

  // ===== ACCESO A PRODUCTOS DIGITALES =====
  {
    categoria: 'Acceso Digital',
    conversaciones: [
      ['Cómo accedo al curso?', 'Dónde veo el curso?', 'Link del curso', 'Acceso al contenido'],
      ['Cuándo recibo el acceso?', 'Cuándo puedo empezar?', 'Acceso inmediato?'],
      ['El acceso es de por vida?', 'Cuánto dura el acceso?', 'Acceso vitalicio?', 'Expira el curso?'],
      ['Puedo descargar el contenido?', 'Descarga de cursos', 'Contenido descargable?']
    ]
  }
];

async function entrenarBot() {
  console.log('🎓 ENTRENAMIENTO AUTOMÁTICO DEL BOT\n');
  console.log('Este proceso simulará conversaciones reales y guardará las mejores respuestas\n');

  try {
    // Inicializar sistemas
    console.log('1️⃣ Inicializando sistemas...');
    await LocalKnowledgeBase.initialize();
    const engine = getIntelligentEngine();
    
    // Verificar Ollama
    const ollamaAvailable = await OllamaService.isAvailable();
    if (ollamaAvailable) {
      console.log('✅ Ollama disponible (local, ilimitado)');
      const hasModel = await OllamaService.checkModel();
      if (hasModel) {
        console.log('✅ Modelo gemma:2b listo');
      } else {
        console.log('⚠️ Modelo gemma:2b no encontrado');
        console.log('💡 Descárgalo con: ollama pull gemma:2b');
      }
    } else {
      console.log('⚠️ Ollama no disponible, usando Groq (limitado)');
    }
    
    console.log('✅ Sistemas inicializados\n');

    // Obtener usuario de prueba
    const user = await db.user.findFirst();
    if (!user) {
      console.error('❌ No hay usuarios en la base de datos');
      return;
    }

    let totalConversaciones = 0;
    let respuestasGuardadas = 0;

    // Procesar cada categoría
    for (const categoria of CONVERSACIONES_ENTRENAMIENTO) {
      console.log(`\n📚 CATEGORÍA: ${categoria.categoria}`);
      console.log('='.repeat(50));

      for (const grupoPreguntas of categoria.conversaciones) {
        // Tomar la primera pregunta del grupo como representativa
        const preguntaPrincipal = grupoPreguntas[0];
        
        console.log(`\n💬 Pregunta: "${preguntaPrincipal}"`);
        
        try {
          // Simular conversación con el motor inteligente
          const chatId = `training-${Date.now()}-${Math.random()}`;
          
          const response = await engine.processMessage({
            chatId,
            userName: 'Cliente de Prueba',
            message: preguntaPrincipal,
            userId: user.id
          });

          totalConversaciones++;

          // Mostrar respuesta
          console.log(`🤖 Respuesta (${(response.confidence * 100).toFixed(0)}% confianza):`);
          console.log(`   ${response.text.substring(0, 150)}...`);

          // Guardar si la confianza es alta
          if (response.confidence >= 0.7) {
            await LocalKnowledgeBase.saveSuccessfulResponse({
              userQuery: preguntaPrincipal,
              botResponse: response.text,
              productId: response.context.currentProduct?.id,
              productName: response.context.currentProduct?.name,
              confidence: response.confidence
            });

            // Guardar también las variaciones de la pregunta
            for (const variacion of grupoPreguntas.slice(1)) {
              await LocalKnowledgeBase.saveSuccessfulResponse({
                userQuery: variacion,
                botResponse: response.text,
                productId: response.context.currentProduct?.id,
                productName: response.context.currentProduct?.name,
                confidence: response.confidence * 0.95 // Ligeramente menor para variaciones
              });
            }

            respuestasGuardadas += grupoPreguntas.length;
            console.log(`   ✅ Guardada (+ ${grupoPreguntas.length - 1} variaciones)`);
          } else {
            console.log(`   ⚠️ Confianza baja, no guardada`);
          }

          // Pequeña pausa para no saturar la API
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error: any) {
          console.log(`   ❌ Error: ${error.message}`);
          
          // Si es rate limit, esperar más tiempo
          if (error.status === 429) {
            console.log('   ⏳ Rate limit alcanzado, esperando 10 segundos...');
            await new Promise(resolve => setTimeout(resolve, 10000));
          }
        }
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ENTRENAMIENTO COMPLETADO\n');
    console.log(`📊 Estadísticas:`);
    console.log(`   Total de conversaciones: ${totalConversaciones}`);
    console.log(`   Respuestas guardadas: ${respuestasGuardadas}`);
    
    const stats = await LocalKnowledgeBase.getStats();
    console.log(`   Entradas en base de conocimiento: ${stats.totalEntries}`);
    console.log(`   Tasa de éxito promedio: ${(stats.avgSuccessRate * 100).toFixed(1)}%`);
    console.log(`   Uso total: ${stats.totalUsage} veces`);

    console.log('\n✅ El bot ahora tiene conocimiento de conversaciones comunes');
    console.log('✅ Puede responder incluso sin APIs externas');
    console.log('✅ Se volverá más inteligente con cada conversación real\n');

  } catch (error) {
    console.error('❌ Error en el entrenamiento:', error);
  }
}

// Ejecutar entrenamiento
entrenarBot();
