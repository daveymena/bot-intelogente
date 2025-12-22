import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditResult {
  categoria: string;
  problema: string;
  severidad: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
  ubicacion: string;
  solucion: string;
}

async function auditoriaBotCompleta() {
  console.log('🔍 INICIANDO AUDITORÍA COMPLETA DEL BOT...\n');
  
  const problemas: AuditResult[] = [];

  // 1. AUDITORÍA DE CONTEXTO
  console.log('📋 1. Auditando sistema de contexto...');
  problemas.push({
    categoria: 'CONTEXTO',
    problema: 'Bot pierde contexto entre mensajes - Usuario pregunta por "idiomas" y bot olvida el producto',
    severidad: 'CRITICO',
    ubicacion: 'src/lib/conversation-context-service.ts',
    solucion: 'Implementar memoria persistente de producto seleccionado en contexto'
  });

  problemas.push({
    categoria: 'CONTEXTO',
    problema: 'No se mantiene el producto en memoria cuando usuario pregunta por método de pago',
    severidad: 'CRITICO',
    ubicacion: 'src/agents/payment-agent.ts',
    solucion: 'Guardar productId en contexto y recuperarlo antes de generar link de pago'
  });

  // 2. AUDITORÍA DE PAYPAL
  console.log('💳 2. Auditando sistema PayPal...');
  problemas.push({
    categoria: 'PAYPAL',
    problema: 'Enviando email de PayPal en vez de link dinámico',
    severidad: 'CRITICO',
    ubicacion: 'src/lib/payment-link-generator.ts',
    solucion: 'Usar PAYPAL_LINK_TEMPLATE con variables dinámicas, NO enviar email'
  });

  problemas.push({
    categoria: 'PAYPAL',
    problema: 'Variable PAYPAL_EMAIL siendo usada en respuestas cuando debería usar link',
    severidad: 'ALTO',
    ubicacion: 'src/agents/payment-agent.ts',
    solucion: 'Eliminar referencias a PAYPAL_EMAIL y usar solo generatePaymentLink()'
  });

  // 3. AUDITORÍA DE BÚSQUEDA
  console.log('🔎 3. Auditando sistema de búsqueda...');
  problemas.push({
    categoria: 'BUSQUEDA',
    problema: 'Muestra productos irrelevantes - Usuario pregunta "idiomas" y aparece "Curso de Piano"',
    severidad: 'CRITICO',
    ubicacion: 'src/lib/product-intelligence-service.ts',
    solucion: 'Mejorar scoring semántico y filtrar productos con score < 0.6'
  });

  problemas.push({
    categoria: 'BUSQUEDA',
    problema: 'No diferencia entre "MegaPack de idiomas" y "Curso de Piano"',
    severidad: 'ALTO',
    ubicacion: 'src/agents/search-agent.ts',
    solucion: 'Agregar validación de categoría y tags antes de mostrar productos'
  });

  // 4. AUDITORÍA DE PRODUCTOS
  console.log('📦 4. Auditando base de datos de productos...');
  
  const productos = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      tags: true,
      images: true,
      paymentLinkMercadoPago: true,
      paymentLinkPayPal: true,
      paymentLinkCustom: true
    }
  });

  const productosSinMetodosPago = productos.filter(p => 
    !p.paymentLinkMercadoPago && !p.paymentLinkPayPal && !p.paymentLinkCustom
  );
  
  if (productosSinMetodosPago.length > 0) {
    problemas.push({
      categoria: 'PRODUCTOS',
      problema: `${productosSinMetodosPago.length} productos sin links de pago configurados`,
      severidad: 'ALTO',
      ubicacion: 'Base de datos - tabla products',
      solucion: 'Configurar paymentLinkPayPal, paymentLinkMercadoPago o paymentLinkCustom'
    });
  }

  const productosSinImagenes = productos.filter(p => !p.images || p.images === '[]');
  if (productosSinImagenes.length > 0) {
    problemas.push({
      categoria: 'PRODUCTOS',
      problema: `${productosSinImagenes.length} productos sin imágenes`,
      severidad: 'MEDIO',
      ubicacion: 'Base de datos - campo images',
      solucion: 'Agregar imágenes placeholder o scraper automático'
    });
  }

  // 5. AUDITORÍA DE AGENTES
  console.log('🤖 5. Auditando agentes especializados...');
  
  problemas.push({
    categoria: 'AGENTES',
    problema: 'Payment Agent no valida que el producto en contexto coincida con el solicitado',
    severidad: 'CRITICO',
    ubicacion: 'src/agents/payment-agent.ts - método handlePaymentRequest',
    solucion: 'Agregar validación: if (context.lastProductId !== requestedProductId) { clarify }'
  });

  problemas.push({
    categoria: 'AGENTES',
    problema: 'Search Agent devuelve múltiples productos cuando usuario ya seleccionó uno',
    severidad: 'ALTO',
    ubicacion: 'src/agents/search-agent.ts',
    solucion: 'Verificar contexto antes de buscar: si hay producto seleccionado, no buscar de nuevo'
  });

  problemas.push({
    categoria: 'AGENTES',
    problema: 'Photo Agent envía fotos sin verificar si el producto es el correcto',
    severidad: 'ALTO',
    ubicacion: 'src/agents/photo-agent.ts',
    solucion: 'Validar productId del contexto antes de enviar fotos'
  });

  // 6. AUDITORÍA DE MEMORIA COMPARTIDA
  console.log('🧠 6. Auditando memoria compartida...');
  
  problemas.push({
    categoria: 'MEMORIA',
    problema: 'SharedMemory no persiste el producto seleccionado entre diferentes agentes',
    severidad: 'CRITICO',
    ubicacion: 'src/agents/shared-memory.ts',
    solucion: 'Agregar campo selectedProduct: { id, name, price } que persista en toda la conversación'
  });

  problemas.push({
    categoria: 'MEMORIA',
    problema: 'Contexto se limpia cuando usuario pregunta por método de pago',
    severidad: 'CRITICO',
    ubicacion: 'src/agents/orchestrator.ts',
    solucion: 'No limpiar contexto hasta que se complete la venta o usuario cambie de tema'
  });

  // 7. AUDITORÍA DE ENTRENAMIENTO
  console.log('📚 7. Auditando datos de entrenamiento...');
  
  problemas.push({
    categoria: 'ENTRENAMIENTO',
    problema: 'Datos de entrenamiento tienen ejemplos contradictorios sobre PayPal',
    severidad: 'ALTO',
    ubicacion: 'data/entrenamiento-*.json',
    solucion: 'Revisar y unificar todos los ejemplos de PayPal para usar solo links dinámicos'
  });

  // 8. AUDITORÍA DE VARIABLES DE ENTORNO
  console.log('⚙️ 8. Auditando variables de entorno...');
  
  const variablesRequeridas = [
    'PAYPAL_LINK_TEMPLATE',
    'PAYPAL_BUSINESS_ID',
    'GROQ_API_KEY',
    'DATABASE_URL'
  ];

  for (const variable of variablesRequeridas) {
    if (!process.env[variable]) {
      problemas.push({
        categoria: 'CONFIGURACION',
        problema: `Variable de entorno ${variable} no configurada`,
        severidad: 'CRITICO',
        ubicacion: '.env',
        solucion: `Agregar ${variable} al archivo .env`
      });
    }
  }

  // 9. AUDITORÍA DE FLUJO DE CONVERSACIÓN
  console.log('💬 9. Auditando flujo conversacional...');
  
  problemas.push({
    categoria: 'FLUJO',
    problema: 'Bot no confirma el producto antes de pedir método de pago',
    severidad: 'ALTO',
    ubicacion: 'src/agents/orchestrator.ts',
    solucion: 'Agregar paso de confirmación: "Perfecto, entonces el MegaPack de Idiomas. ¿Cómo deseas pagar?"'
  });

  problemas.push({
    categoria: 'FLUJO',
    problema: 'Cuando usuario pregunta por método de pago, bot no recuerda qué producto estaba viendo',
    severidad: 'CRITICO',
    ubicacion: 'src/agents/payment-agent.ts',
    solucion: 'Recuperar producto del contexto: const product = context.selectedProduct || await findLastMentionedProduct()'
  });

  // 10. AUDITORÍA DE RESPUESTAS
  console.log('💭 10. Auditando generación de respuestas...');
  
  problemas.push({
    categoria: 'RESPUESTAS',
    problema: 'Bot genera respuestas genéricas sin mencionar el producto específico',
    severidad: 'ALTO',
    ubicacion: 'src/lib/intelligent-response-service.ts',
    solucion: 'Siempre incluir nombre del producto en respuestas: "Para el {productName}, puedes pagar con..."'
  });

  // GENERAR REPORTE
  console.log('\n' + '='.repeat(80));
  console.log('📊 REPORTE DE AUDITORÍA COMPLETA');
  console.log('='.repeat(80) + '\n');

  const problemasOrdenados = problemas.sort((a, b) => {
    const orden = { CRITICO: 0, ALTO: 1, MEDIO: 2, BAJO: 3 };
    return orden[a.severidad] - orden[b.severidad];
  });

  const porSeveridad = {
    CRITICO: problemasOrdenados.filter(p => p.severidad === 'CRITICO'),
    ALTO: problemasOrdenados.filter(p => p.severidad === 'ALTO'),
    MEDIO: problemasOrdenados.filter(p => p.severidad === 'MEDIO'),
    BAJO: problemasOrdenados.filter(p => p.severidad === 'BAJO')
  };

  console.log(`🔴 PROBLEMAS CRÍTICOS: ${porSeveridad.CRITICO.length}`);
  console.log(`🟠 PROBLEMAS ALTOS: ${porSeveridad.ALTO.length}`);
  console.log(`🟡 PROBLEMAS MEDIOS: ${porSeveridad.MEDIO.length}`);
  console.log(`🟢 PROBLEMAS BAJOS: ${porSeveridad.BAJO.length}`);
  console.log(`\n📈 TOTAL: ${problemas.length} problemas encontrados\n`);

  // MOSTRAR PROBLEMAS CRÍTICOS
  if (porSeveridad.CRITICO.length > 0) {
    console.log('\n🔴 PROBLEMAS CRÍTICOS (REQUIEREN ATENCIÓN INMEDIATA):\n');
    porSeveridad.CRITICO.forEach((p, i) => {
      console.log(`${i + 1}. [${p.categoria}] ${p.problema}`);
      console.log(`   📍 Ubicación: ${p.ubicacion}`);
      console.log(`   ✅ Solución: ${p.solucion}\n`);
    });
  }

  // MOSTRAR PROBLEMAS ALTOS
  if (porSeveridad.ALTO.length > 0) {
    console.log('\n🟠 PROBLEMAS ALTOS:\n');
    porSeveridad.ALTO.forEach((p, i) => {
      console.log(`${i + 1}. [${p.categoria}] ${p.problema}`);
      console.log(`   📍 Ubicación: ${p.ubicacion}`);
      console.log(`   ✅ Solución: ${p.solucion}\n`);
    });
  }

  // PLAN DE ACCIÓN
  console.log('\n' + '='.repeat(80));
  console.log('📋 PLAN DE ACCIÓN RECOMENDADO');
  console.log('='.repeat(80) + '\n');

  console.log('1️⃣ PRIORIDAD MÁXIMA (Hacer AHORA):');
  console.log('   - Arreglar pérdida de contexto en conversaciones');
  console.log('   - Cambiar PayPal de email a link dinámico');
  console.log('   - Mejorar búsqueda para evitar productos irrelevantes');
  console.log('   - Validar producto en contexto antes de generar link de pago\n');

  console.log('2️⃣ PRIORIDAD ALTA (Hacer HOY):');
  console.log('   - Agregar confirmación de producto antes de pago');
  console.log('   - Revisar y limpiar datos de entrenamiento');
  console.log('   - Asignar métodos de pago a productos faltantes');
  console.log('   - Mejorar validaciones en agentes\n');

  console.log('3️⃣ PRIORIDAD MEDIA (Esta semana):');
  console.log('   - Agregar imágenes a productos sin fotos');
  console.log('   - Optimizar scoring de búsqueda');
  console.log('   - Mejorar mensajes de respuesta\n');

  // GUARDAR REPORTE
  const reporte = {
    fecha: new Date().toISOString(),
    totalProblemas: problemas.length,
    porSeveridad: {
      criticos: porSeveridad.CRITICO.length,
      altos: porSeveridad.ALTO.length,
      medios: porSeveridad.MEDIO.length,
      bajos: porSeveridad.BAJO.length
    },
    problemas: problemasOrdenados
  };

  const fs = require('fs');
  fs.writeFileSync(
    'auditoria-reporte.json',
    JSON.stringify(reporte, null, 2)
  );

  console.log('💾 Reporte guardado en: auditoria-reporte.json\n');

  await prisma.$disconnect();
}

auditoriaBotCompleta().catch(console.error);
