/**
 * APLICAR FORMATO PROFESIONAL MODERNO
 * - Sin asteriscos
 * - Con emojis profesionales
 * - Espaciado elegante
 * - Envío automático de fotos
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('APLICANDO FORMATO PROFESIONAL MODERNO');
console.log('========================================\n');

// ============================================
// 1. ACTUALIZAR PROMPT BUILDER
// ============================================
console.log('[1/4] Actualizando promptBuilder.ts...');

const promptBuilderPath = path.join(process.cwd(), 'src/conversational-module/ai/promptBuilder.ts');
let promptBuilder = fs.readFileSync(promptBuilderPath, 'utf-8');

// Agregar instrucciones de formato moderno
const formatoModerno = `
🎨 FORMATO DE RESPUESTAS (CRÍTICO):
❌ NO uses asteriscos (*) para negrilla
❌ NO uses guiones bajos (_) para cursiva
❌ NO uses formato markdown antiguo
✅ USA emojis profesionales para destacar
✅ USA espaciado elegante (doble salto de línea entre secciones)
✅ USA bullets (•) para listas
✅ USA números con emojis (1️⃣ 2️⃣ 3️⃣) para opciones

EJEMPLO DE FORMATO CORRECTO:
👋 ¡Hola! Bienvenido(a) a Tecnovariedades D&S ✨

Gracias por escribirnos.

Soy Dani, tu asesor virtual 🤖💬
Estoy aquí para ayudarte a elegir el producto ideal.

📌 ¿Qué estás buscando hoy?

1️⃣ Computadores y productos físicos
2️⃣ Cursos digitales individuales
3️⃣ Megapacks de cursos

EJEMPLO DE PRODUCTO:
🎓 Curso de Photoshop Profesional

💰 Precio: $20.000 COP

📋 Aprende desde cero hasta nivel profesional
Incluye ejercicios prácticos y certificado

✨ Incluye:
• 50 lecciones en video
• Archivos de práctica
• Soporte por WhatsApp
• Acceso de por vida

🛒 ¿Te gustaría asegurar tu compra ahora?
`;

// Insertar después de REGLA CRÍTICA
promptBuilder = promptBuilder.replace(
  '⚠️ IMPORTANTE: Inventar información puede comprometer la venta y generar desconfianza.',
  `⚠️ IMPORTANTE: Inventar información puede comprometer la venta y generar desconfianza.

${formatoModerno}`
);

// Actualizar ejemplos de productos para usar formato moderno
promptBuilder = promptBuilder.replace(
  /📦 \*([^*]+)\*/g,
  '📦 $1'
);

promptBuilder = promptBuilder.replace(
  /💰 Precio: \*([^*]+)\*/g,
  '💰 Precio: $1'
);

fs.writeFileSync(promptBuilderPath, promptBuilder);
console.log('✅ promptBuilder.ts actualizado\n');

// ============================================
// 2. ACTUALIZAR BAILEYS SERVICE PARA ENVIAR FOTOS
// ============================================
console.log('[2/4] Actualizando baileys-stable-service.ts...');

const baileysPath = path.join(process.cwd(), 'src/lib/baileys-stable-service.ts');
let baileys = fs.readFileSync(baileysPath, 'utf-8');

// Verificar si ya tiene AutoPhotoSender
if (!baileys.includes('AutoPhotoSender')) {
  // Agregar import
  const importLine = `import { AutoPhotoSender } from './auto-photo-sender';`;
  
  if (!baileys.includes(importLine)) {
    // Buscar la línea de imports y agregar
    baileys = baileys.replace(
      "import { CardPhotoSender } from './card-photo-sender';",
      `import { CardPhotoSender } from './card-photo-sender';\n${importLine}`
    );
  }

  // Agregar envío automático de fotos en handleHybridResponse
  const autoPhotoCode = `
      // 📸 ENVÍO AUTOMÁTICO DE FOTOS
      if (await AutoPhotoSender.shouldSendPhotos(message, context)) {
        console.log('[Baileys] 📸 Detectado: Cliente quiere ver fotos');
        
        // Buscar producto en contexto o mensaje
        const productId = context?.lastProductId || 
                         await AutoPhotoSender.findProductByMessage(message, userId);
        
        if (productId) {
          console.log('[Baileys] 📸 Enviando fotos del producto:', productId);
          const result = await AutoPhotoSender.sendProductPhotos(
            socket,
            from,
            productId,
            async (to: string, text: string) => {
              await socket.sendMessage(to, { text });
            }
          );
          
          if (result.success && result.photosSent > 0) {
            console.log(\`[Baileys] ✅ Enviadas \${result.photosSent} fotos\`);
            return; // Ya se envió todo, no continuar
          }
        }
      }
`;

  // Insertar antes de enviar la respuesta de texto
  baileys = baileys.replace(
    '// Enviar respuesta',
    `${autoPhotoCode}\n      // Enviar respuesta`
  );

  fs.writeFileSync(baileysPath, baileys);
  console.log('✅ baileys-stable-service.ts actualizado\n');
} else {
  console.log('ℹ️  baileys-stable-service.ts ya tiene AutoPhotoSender\n');
}

// ============================================
// 3. ACTUALIZAR CONVERSACION CONTROLLER
// ============================================
console.log('[3/4] Actualizando conversacionController.ts...');

const controllerPath = path.join(process.cwd(), 'src/conversational-module/ai/conversacionController.ts');
let controller = fs.readFileSync(controllerPath, 'utf-8');

// Agregar import de ProfessionalResponseFormatter
if (!controller.includes('ProfessionalResponseFormatter')) {
  controller = controller.replace(
    "import { RealDataEnforcer } from '@/lib/real-data-enforcer';",
    `import { RealDataEnforcer } from '@/lib/real-data-enforcer';\nimport { ProfessionalResponseFormatter } from '@/lib/professional-response-formatter';`
  );

  // Usar formatter en respuestas
  const formatterUsage = `
      // 🎨 APLICAR FORMATO PROFESIONAL MODERNO
      if (respuestaIA) {
        respuestaIA = ProfessionalResponseFormatter.cleanOldFormat(respuestaIA);
        respuestaIA = ProfessionalResponseFormatter.addProfessionalSpacing(respuestaIA);
      }
`;

  // Insertar antes de retornar respuesta
  controller = controller.replace(
    'return respuestaIA;',
    `${formatterUsage}\n      return respuestaIA;`
  );

  fs.writeFileSync(controllerPath, controller);
  console.log('✅ conversacionController.ts actualizado\n');
} else {
  console.log('ℹ️  conversacionController.ts ya tiene ProfessionalResponseFormatter\n');
}

// ============================================
// 4. CREAR ARCHIVO DE CONFIGURACIÓN
// ============================================
console.log('[4/4] Creando configuración de formato...');

const configContent = `/**
 * CONFIGURACIÓN DE FORMATO PROFESIONAL MODERNO
 * Tecnovariedades D&S
 */

export const FORMATO_PROFESIONAL = {
  // Nombre del asistente
  NOMBRE_ASISTENTE: 'Dani',
  
  // Nombre del negocio
  NOMBRE_NEGOCIO: 'Tecnovariedades D&S',
  
  // Emojis por categoría
  EMOJIS: {
    SALUDO: '👋',
    BIENVENIDA: '✨',
    ASISTENTE: '🤖💬',
    PRODUCTO_FISICO: '🖥️',
    PRODUCTO_DIGITAL: '📚',
    MEGAPACK: '💥',
    CURSO: '🎓',
    PRECIO: '💰',
    DESCRIPCION: '📋',
    INCLUYE: '✨',
    COMPRA: '🛒',
    PAGO: '💳',
    ENVIO: '📦',
    SOPORTE: '🛠️',
    EXITO: '🎉',
    PREGUNTA: '🤔',
    ATENCION: '⚠️',
    CORRECTO: '✅',
    INCORRECTO: '❌'
  },
  
  // Opciones numeradas
  OPCIONES: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
  
  // Bullets
  BULLET: '•',
  
  // Separadores
  SEPARADOR_SECCION: '\\n\\n',
  SEPARADOR_LINEA: '\\n',
  
  // Reglas de formato
  REGLAS: {
    NO_ASTERISCOS: true,
    NO_GUIONES_BAJOS: true,
    NO_MARKDOWN: true,
    USA_EMOJIS: true,
    USA_ESPACIADO: true,
    USA_BULLETS: true
  }
};

export default FORMATO_PROFESIONAL;
`;

const configPath = path.join(process.cwd(), 'src/lib/formato-profesional-config.ts');
fs.writeFileSync(configPath, configContent);
console.log('✅ formato-profesional-config.ts creado\n');

// ============================================
// RESUMEN
// ============================================
console.log('========================================');
console.log('✅ FORMATO PROFESIONAL APLICADO');
console.log('========================================\n');

console.log('Cambios realizados:');
console.log('1. ✅ promptBuilder.ts - Instrucciones de formato moderno');
console.log('2. ✅ baileys-stable-service.ts - Envío automático de fotos');
console.log('3. ✅ conversacionController.ts - Limpieza de formato antiguo');
console.log('4. ✅ formato-profesional-config.ts - Configuración centralizada\n');

console.log('Archivos nuevos creados:');
console.log('• src/lib/professional-response-formatter.ts');
console.log('• src/lib/auto-photo-sender.ts');
console.log('• src/lib/formato-profesional-config.ts\n');

console.log('========================================');
console.log('PRÓXIMO PASO: REINICIAR SERVIDOR');
console.log('========================================\n');

console.log('Ejecuta:');
console.log('  Ctrl+C (detener servidor)');
console.log('  npm run dev (iniciar de nuevo)\n');

console.log('Luego prueba con:');
console.log('  "busco curso de reparacion de celulares"\n');

console.log('Debe responder:');
console.log('  ✅ Sin asteriscos');
console.log('  ✅ Con emojis profesionales');
console.log('  ✅ Con espaciado elegante');
console.log('  ✅ Enviando fotos automáticamente\n');
