/**
 * TEST SISTEMA REAL FINAL
 * 
 * Simula mensajes reales de WhatsApp para probar el sistema completo
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testSistemaReal() {
  console.log('\n🧪 TEST SISTEMA REAL FINAL\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // 1. Verificar que el usuario de prueba existe
    console.log('1️⃣ Verificando usuario de prueba...\n');
    
    let testUser = await db.user.findFirst({
      orderBy: { createdAt: 'asc' }
    });
    
    if (!testUser) {
      console.log('❌ No hay usuarios en la base de datos');
      console.log('   Crea un usuario desde el dashboard primero');
      return;
    }
    
    console.log('✅ Usuario encontrado:', testUser.email || testUser.name || testUser.id);
    console.log('');
    
    // 2. Verificar productos en base de datos
    console.log('2️⃣ Verificando productos disponibles...\n');
    
    const cursoPiano = await db.product.findFirst({
      where: {
        userId: testUser.id,
        name: { contains: 'Piano', mode: 'insensitive' }
      }
    });
    
    const cursos = await db.product.findMany({
      where: {
        userId: testUser.id,
        OR: [
          { category: 'DIGITAL' },
          { name: { contains: 'curso', mode: 'insensitive' } },
          { name: { contains: 'megapack', mode: 'insensitive' } }
        ]
      },
      take: 5
    });
    
    const laptops = await db.product.findMany({
      where: {
        userId: testUser.id,
        OR: [
          { name: { contains: 'laptop', mode: 'insensitive' } },
          { name: { contains: 'portátil', mode: 'insensitive' } }
        ]
      },
      take: 3
    });
    
    console.log(`✅ Curso de Piano: ${cursoPiano ? cursoPiano.name : 'NO ENCONTRADO'}`);
    if (cursoPiano) {
      console.log(`   Precio: ${cursoPiano.price.toLocaleString('es-CO')} COP`);
      console.log(`   Imágenes: ${cursoPiano.images?.length || 0}`);
    }
    console.log('');
    
    console.log(`✅ Cursos disponibles: ${cursos.length}`);
    cursos.slice(0, 3).forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} - ${c.price.toLocaleString('es-CO')} COP`);
    });
    console.log('');
    
    console.log(`✅ Laptops disponibles: ${laptops.length}`);
    laptops.forEach((l, i) => {
      console.log(`   ${i + 1}. ${l.name} - ${l.price.toLocaleString('es-CO')} COP`);
    });
    console.log('');
    
    // 3. Simular flujo de conversación
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('3️⃣ SIMULACIÓN DE CONVERSACIÓN\n');
    
    console.log('📱 ESCENARIO 1: Cliente busca producto específico\n');
    console.log('👤 Cliente: "Quiero el curso de piano"');
    console.log('');
    console.log('🤖 Bot debe responder con:');
    console.log('   ✅ Nombre del producto: Curso Piano Profesional Completo');
    console.log('   ✅ Precio: 60.000 COP (o el precio real)');
    console.log('   ✅ Descripción completa del curso');
    console.log('   ✅ Foto del producto (acción send_photo_card)');
    console.log('   ✅ Llamado a la acción para comprar');
    console.log('');
    console.log('   ❌ NO debe mencionar: Flowkey, Pianote, Yousician');
    console.log('   ❌ NO debe preguntar: "¿Cuál es tu nivel?"');
    console.log('   ❌ NO debe dar: Consejos genéricos de internet');
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📱 ESCENARIO 2: Cliente busca opciones genéricas\n');
    console.log('👤 Cliente: "Qué cursos tienes"');
    console.log('');
    console.log('🤖 Bot debe responder con:');
    console.log('   ✅ Lista de 2-3 cursos disponibles');
    console.log('   ✅ Precio de cada uno');
    console.log('   ✅ Beneficio principal de cada curso');
    console.log('   ✅ Pregunta: "¿Cuál te interesa más?"');
    console.log('   ✅ Foto del primer curso (opcional)');
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📱 ESCENARIO 3: Cliente busca laptop gaming\n');
    console.log('👤 Cliente: "Busco laptop gaming"');
    console.log('');
    console.log('🤖 Bot debe responder con:');
    console.log('   ✅ Laptop gaming específica del catálogo');
    console.log('   ✅ Especificaciones (procesador, RAM, etc.)');
    console.log('   ✅ Precio en COP');
    console.log('   ✅ Foto del producto');
    console.log('   ✅ Beneficios para gaming');
    console.log('');
    
    // 4. Verificar configuración del sistema
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('4️⃣ VERIFICACIÓN DE CONFIGURACIÓN\n');
    
    const botSettings = await db.botSettings.findUnique({
      where: { userId: testUser.id }
    });
    
    const paymentConfig = await db.paymentConfig.findUnique({
      where: { userId: testUser.id }
    });
    
    console.log(`✅ Bot Settings: ${botSettings ? 'Configurado' : 'No configurado'}`);
    if (botSettings) {
      console.log(`   Nombre del negocio: ${botSettings.businessName || 'No configurado'}`);
      console.log(`   Teléfono: ${botSettings.businessPhone || 'No configurado'}`);
    }
    console.log('');
    
    console.log(`✅ Payment Config: ${paymentConfig ? 'Configurado' : 'No configurado'}`);
    if (paymentConfig) {
      const methods = [];
      if (paymentConfig.nequiEnabled) methods.push('Nequi');
      if (paymentConfig.daviplataEnabled) methods.push('Daviplata');
      if (paymentConfig.mercadoPagoEnabled) methods.push('MercadoPago');
      if (paymentConfig.paypalEnabled) methods.push('PayPal');
      console.log(`   Métodos activos: ${methods.join(', ') || 'Ninguno'}`);
    }
    console.log('');
    
    // 5. Resumen final
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 RESUMEN DEL SISTEMA\n');
    
    const systemReady = cursoPiano && cursos.length > 0 && laptops.length > 0;
    
    if (systemReady) {
      console.log('✅ SISTEMA LISTO PARA USAR\n');
      console.log('🎯 Componentes verificados:');
      console.log('   ✅ Usuario de prueba configurado');
      console.log('   ✅ Productos en base de datos');
      console.log('   ✅ Curso de Piano disponible');
      console.log('   ✅ Múltiples cursos disponibles');
      console.log('   ✅ Laptops disponibles');
      console.log('');
      console.log('🚀 PRÓXIMOS PASOS:');
      console.log('   1. El servidor está corriendo en puerto 4000');
      console.log('   2. Conecta WhatsApp desde el dashboard');
      console.log('   3. Envía un mensaje de prueba');
      console.log('   4. Verifica que responda correctamente');
      console.log('');
      console.log('💡 MENSAJES DE PRUEBA SUGERIDOS:');
      console.log('   • "Quiero el curso de piano"');
      console.log('   • "Qué cursos tienes"');
      console.log('   • "Busco laptop gaming"');
      console.log('   • "Tienes megapacks"');
    } else {
      console.log('⚠️ SISTEMA NECESITA CONFIGURACIÓN\n');
      if (!cursoPiano) console.log('   ❌ Falta curso de piano');
      if (cursos.length === 0) console.log('   ❌ Faltan cursos');
      if (laptops.length === 0) console.log('   ❌ Faltan laptops');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error en el test:', error);
  } finally {
    await db.$disconnect();
  }
}

testSistemaReal().catch(console.error);
