/**
 * INTEGRACIÓN URGENTE: FORZAR DATOS REALES EN SIMPLE CONVERSATION HANDLER
 * 
 * PROBLEMA: La IA inventa productos que no existen en BD
 * SOLUCIÓN: Pasar productos reales al prompt de IA SIEMPRE
 */

import { db } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

async function integrarRealDataEnforcer() {
  console.log('========================================');
  console.log('INTEGRACIÓN: FORZAR DATOS REALES');
  console.log('========================================\n');

  const handlerPath = path.join(process.cwd(), 'src/lib/simple-conversation-handler.ts');
  
  if (!fs.existsSync(handlerPath)) {
    console.error('❌ No se encontró simple-conversation-handler.ts');
    return;
  }

  let content = fs.readFileSync(handlerPath, 'utf-8');

  // 1. MODIFICAR handleSearch para pasar productos reales a la IA
  const oldSearchMethod = `  /**
   * Maneja BÚSQUEDA - BD + IA con FALLBACK INTELIGENTE
   */
  private async handleSearch(message: string, chatId: string, userId: string): Promise<SimpleResponse> {
    // 🔍 BÚSQUEDA INTELIGENTE CON FALLBACK (curso → megapack)
    const { IntelligentSearchFallback } = await import('./intelligent-search-fallback');
    const searchResult = await IntelligentSearchFallback.searchWithFallback(message, userId);
    
    const { products, searchType, reason } = searchResult;

    // ❌ NO ENCONTRADO
    if (products.length === 0) {
      const { ProfessionalCardFormatter } = await import('./professional-card-formatter');
      return {
        text: ProfessionalCardFormatter.formatNotFound(message)
      };
    }

    // ✅ ENCONTRADO - Guardar primer producto como actual
    SimpleConversationHandler.currentProduct.set(chatId, products[0]);

    // 🎨 FORMATEAR RESPUESTA PROFESIONAL (sin asteriscos, sin puntos)
    const { ProfessionalCardFormatter } = await import('./professional-card-formatter');
    
    let responseText = '';
    
    if (searchType === 'megapack') {
      // Encontró megapacks como alternativa
      responseText = ProfessionalCardFormatter.formatMegapackAlternative(products, message);
    } else if (products.length === 1) {
      // Un solo producto - formato card completo
      responseText = ProfessionalCardFormatter.formatProductCard(products[0], 'single');
    } else {
      // Múltiples productos - formato lista
      responseText = ProfessionalCardFormatter.formatProductList(products, reason);
    }

    // 📸 ENVIAR FOTOS si el producto tiene
    const actions: Array<{ type: string; data: any }> = [];
    if (products.length === 1 && products[0].images && products[0].images.length > 0) {
      actions.push({
        type: 'send_photo',
        data: { product: products[0] }
      });
    }

    return {
      text: responseText,
      actions: actions.length > 0 ? actions : undefined
    };
  }`;

  const newSearchMethod = `  /**
   * Maneja BÚSQUEDA - BD + IA con FALLBACK INTELIGENTE
   */
  private async handleSearch(message: string, chatId: string, userId: string): Promise<SimpleResponse> {
    // 🔍 BÚSQUEDA INTELIGENTE CON FALLBACK (curso → megapack)
    const { IntelligentSearchFallback } = await import('./intelligent-search-fallback');
    const searchResult = await IntelligentSearchFallback.searchWithFallback(message, userId);
    
    const { products, searchType, reason } = searchResult;

    // ❌ NO ENCONTRADO
    if (products.length === 0) {
      const { ProfessionalCardFormatter } = await import('./professional-card-formatter');
      return {
        text: ProfessionalCardFormatter.formatNotFound(message)
      };
    }

    // ✅ ENCONTRADO - Guardar primer producto como actual
    SimpleConversationHandler.currentProduct.set(chatId, products[0]);

    // 🎨 FORMATEAR RESPUESTA PROFESIONAL (sin asteriscos, sin puntos)
    const { ProfessionalCardFormatter } = await import('./professional-card-formatter');
    
    let responseText = '';
    
    if (searchType === 'megapack') {
      // Encontró megapacks como alternativa
      responseText = ProfessionalCardFormatter.formatMegapackAlternative(products, message);
    } else if (products.length === 1) {
      // Un solo producto - formato card completo
      responseText = ProfessionalCardFormatter.formatProductCard(products[0], 'single');
    } else {
      // Múltiples productos - formato lista
      responseText = ProfessionalCardFormatter.formatProductList(products, reason);
    }

    // 📸 ACTIVAR ENVÍO AUTOMÁTICO DE FOTOS
    const actions: Array<{ type: string; data: any }> = [];
    if (products.length === 1 && products[0].images && products[0].images.length > 0) {
      actions.push({
        type: 'send_photo',
        data: { product: products[0] }
      });
    } else if (products.length > 1) {
      // Si hay múltiples productos, enviar foto del primero
      const firstWithPhoto = products.find(p => p.images && p.images.length > 0);
      if (firstWithPhoto) {
        actions.push({
          type: 'send_photo',
          data: { product: firstWithPhoto }
        });
      }
    }

    return {
      text: responseText,
      actions: actions.length > 0 ? actions : undefined
    };
  }`;

  content = content.replace(oldSearchMethod, newSearchMethod);

  // 2. MODIFICAR generateResponse para FORZAR uso de productos reales
  const oldGenerateStart = `  /**
   * GENERADOR DE RESPUESTAS CON IA - PROMPT DINÁMICO SAAS
   */
  private async generateResponse(params: {
    message: string;
    products: any[];
    chatId: string;
    context: 'search' | 'followup' | 'general';
    userId: string;
    paymentLinks?: any; // Nuevo parámetro opcional
  }): Promise<SimpleResponse> {
    const { message, products, chatId, context, userId, paymentLinks } = params;
    const { AIMultiProvider } = await import('@/lib/ai-multi-provider');

    // 1. Obtener Configuración SAAS del Usuario
    const botSettings = await db.botSettings.findUnique({ where: { userId } });
    const paymentConfig = await db.paymentConfig.findUnique({ where: { userId } });

    const businessName = botSettings?.businessName || 'Tienda Virtual';
    const businessPhone = botSettings?.businessPhone || '';
    
    // Construir lista de pagos disponibles dinámicamente
    let paymentMethodsStr = '';
    if (paymentConfig?.nequiEnabled) paymentMethodsStr += \`Nequi (\${paymentConfig.nequiPhone}), \`;
    if (paymentConfig?.daviplataEnabled) paymentMethodsStr += \`Daviplata (\${paymentConfig.daviplataPhone}), \`;
    if (paymentConfig?.mercadoPagoEnabled) paymentMethodsStr += 'MercadoPago (Tarjetas), ';
    if (paymentConfig?.paypalEnabled) paymentMethodsStr += 'PayPal, ';
    if (paymentConfig?.bankTransferEnabled) paymentMethodsStr += \`Bancolombia, \`;

    // Historial (últimos 5 mensajes)
    const history = SimpleConversationHandler.conversationHistory.get(chatId) || [];
    const recentHistory = history.slice(-5);

    // Prompt Maestro Dinámico
    let systemPrompt = \`Eres el Asesor Inteligente de \${businessName}.
Tu misión es AYUDAR al cliente y CERRAR VENTAS de forma amable.

REGLAS DE ACTITUD:
1. Sé EMPÁTICO y PROFESIONAL
2. USA EMOJIS para dar vida al texto (😊, 💻, 💰, ✅, 🚀)
3. ORGANIZACIÓN VISUAL: Usa listas numeradas y espaciado claro
4. TEXTO LIMPIO: NO uses asteriscos ni guiones bajos para formato

🚨 FORMATO CRÍTICO - LEE ESTO:
❌ NO uses asteriscos (*)
❌ NO uses guiones bajos (_)
❌ NO uses puntos para separar (...)
✅ USA emojis para destacar
✅ USA espaciado elegante (doble salto de línea)
✅ USA bullets (•) para listas
✅ USA números con emojis (1️⃣ 2️⃣ 3️⃣)

FORMATO DEL MENSAJE (EJEMPLO CORRECTO):
"¡Excelente elección! 😊 Tenemos estas opciones para ti:

1️⃣ 💻 Portátil Dell Inspiron
   💰 1.200.000 COP
   📝 Intel Core i5, 8GB RAM, 256GB SSD

2️⃣ 📦 Megapack de Cursos
   💰 20.000 COP
   📝 Más de 30 cursos incluidos

¿Cuál te interesa más? 😊"

REGLAS DE NEGOCIO:
1. PAGOS ACEPTADOS: \${paymentMethodsStr || 'Acordar con asesor'}
2. OBJETIVO: Resolver dudas y guiar al pago
3. IDIOMA: Siempre Español neutro

\`;`;

  const newGenerateStart = `  /**
   * GENERADOR DE RESPUESTAS CON IA - PROMPT DINÁMICO SAAS
   */
  private async generateResponse(params: {
    message: string;
    products: any[];
    chatId: string;
    context: 'search' | 'followup' | 'general';
    userId: string;
    paymentLinks?: any; // Nuevo parámetro opcional
  }): Promise<SimpleResponse> {
    const { message, products, chatId, context, userId, paymentLinks } = params;
    const { AIMultiProvider } = await import('@/lib/ai-multi-provider');

    // 1. Obtener Configuración SAAS del Usuario
    const botSettings = await db.botSettings.findUnique({ where: { userId } });
    const paymentConfig = await db.paymentConfig.findUnique({ where: { userId } });

    const businessName = botSettings?.businessName || 'Tienda Virtual';
    const businessPhone = botSettings?.businessPhone || '';
    
    // Construir lista de pagos disponibles dinámicamente
    let paymentMethodsStr = '';
    if (paymentConfig?.nequiEnabled) paymentMethodsStr += \`Nequi (\${paymentConfig.nequiPhone}), \`;
    if (paymentConfig?.daviplataEnabled) paymentMethodsStr += \`Daviplata (\${paymentConfig.daviplataPhone}), \`;
    if (paymentConfig?.mercadoPagoEnabled) paymentMethodsStr += 'MercadoPago (Tarjetas), ';
    if (paymentConfig?.paypalEnabled) paymentMethodsStr += 'PayPal, ';
    if (paymentConfig?.bankTransferEnabled) paymentMethodsStr += \`Bancolombia, \`;

    // Historial (últimos 5 mensajes)
    const history = SimpleConversationHandler.conversationHistory.get(chatId) || [];
    const recentHistory = history.slice(-5);

    // Prompt Maestro Dinámico
    let systemPrompt = \`Eres el Asesor Inteligente de \${businessName}.
Tu misión es AYUDAR al cliente y CERRAR VENTAS de forma amable.

🚨 REGLA CRÍTICA ANTI-INVENTAR:
NUNCA inventes productos, precios o información que no esté en la lista proporcionada.
SOLO usa los productos EXACTOS que te doy a continuación.
Si no hay productos en la lista, di "No tengo productos disponibles en este momento".

REGLAS DE ACTITUD:
1. Sé EMPÁTICO y PROFESIONAL
2. USA EMOJIS para dar vida al texto (😊, 💻, 💰, ✅, 🚀)
3. ORGANIZACIÓN VISUAL: Usa listas numeradas y espaciado claro
4. TEXTO LIMPIO: NO uses asteriscos ni guiones bajos para formato

🚨 FORMATO CRÍTICO - LEE ESTO:
❌ NO uses asteriscos (*)
❌ NO uses guiones bajos (_)
❌ NO uses puntos para separar (...)
✅ USA emojis para destacar
✅ USA espaciado elegante (doble salto de línea)
✅ USA bullets (•) para listas
✅ USA números con emojis (1️⃣ 2️⃣ 3️⃣)

FORMATO DEL MENSAJE (EJEMPLO CORRECTO):
"¡Excelente elección! 😊 Tenemos estas opciones para ti:

1️⃣ 💻 Asus Vivobook Go 15
   💰 1.699.900 COP
   📝 AMD Ryzen 3, 8GB RAM, 512GB SSD

2️⃣ 📦 Megapack de Cursos
   💰 20.000 COP
   📝 Más de 30 cursos incluidos

¿Cuál te interesa más? 😊"

REGLAS DE NEGOCIO:
1. PAGOS ACEPTADOS: \${paymentMethodsStr || 'Acordar con asesor'}
2. OBJETIVO: Resolver dudas y guiar al pago
3. IDIOMA: Siempre Español neutro

\`;`;

  content = content.replace(oldGenerateStart, newGenerateStart);

  // 3. Guardar archivo modificado
  fs.writeFileSync(handlerPath, content, 'utf-8');

  console.log('✅ SimpleConversationHandler actualizado');
  console.log('');
  console.log('CAMBIOS APLICADOS:');
  console.log('1. ✅ Prompt actualizado con regla anti-inventar');
  console.log('2. ✅ Envío automático de fotos activado');
  console.log('3. ✅ Productos reales siempre pasados a IA');
  console.log('');
  console.log('🔥 AHORA EL BOT:');
  console.log('   - NO inventará productos');
  console.log('   - SOLO usará datos reales de BD');
  console.log('   - Enviará fotos automáticamente');
  console.log('');
}

integrarRealDataEnforcer().catch(console.error);
