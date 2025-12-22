import { TenantConfig } from '../services/saasContextService';

// Emojis variados para saludos
const GREETING_EMOJIS = ['👋', '😊', '🙌', '✨', '🎉', '💫', '🌟', '😄'];

// Saludos PROFESIONALES Base (Plantillas)
const GREETING_TEMPLATES = [
  {
    greeting: 'Hola 👋, gracias por comunicarte con *{{BUSINESS_NAME}}*.',
    intro: '🌐 {{DESCRIPTION}}',
    offer: '¿En qué podemos ayudarte hoy? {{OFFER_TEXT}}'
  },
  {
    greeting: '¡Buenas! 😊 Te saluda *{{BUSINESS_NAME}}*.',
    intro: 'Especialistas en {{SPECIALTY}} con experiencia y calidad.',
    offer: '¿Qué estás buscando? Estamos para asesorarte.'
  },
  {
    greeting: '¡Hola! ✨ Gracias por contactar a *{{BUSINESS_NAME}}*.',
    intro: 'Tu tienda de confianza en {{CATEGORY}}.',
    offer: '¿Buscas algún producto en particular? Cuéntame y te ayudo.'
  },
  {
    greeting: '¡Qué bueno que escribes! 🙌 Soy de *{{BUSINESS_NAME}}*.',
    intro: 'Ofrecemos {{CATEGORY}} de calidad con garantía.',
    offer: '¿En qué te puedo colaborar? Tenemos excelentes opciones.'
  },
  {
    greeting: '¡Hola! 💫 Bienvenido a *{{BUSINESS_NAME}}*.',
    intro: 'Líderes en venta de {{CATEGORY}}.',
    offer: '¿Qué necesitas hoy? Estoy aquí para asesorarte.'
  },
  {
    greeting: '¡Buenas! 🌟 Te atiende *{{BUSINESS_NAME}}*.',
    intro: '{{CATEGORY}} con la mejor relación calidad-precio.',
    offer: '¿Qué producto te interesa? Con gusto te brindo información.'
  },
  {
    greeting: '¡Hola! 😄 Gracias por comunicarte con *{{BUSINESS_NAME}}*.',
    intro: 'Clientes satisfechos nos respaldan.',
    offer: '¿En qué puedo ayudarte? Cuéntame qué estás buscando.'
  },
  {
    greeting: '¡Hey! 👋 Aquí *{{BUSINESS_NAME}}* para servirte.',
    intro: 'Expertos en soluciones de {{CATEGORY}}.',
    offer: '¿Qué necesitas hoy? Tenemos lo mejor para ti.'
  },
  {
    greeting: '¡Bienvenido! ✨ Soy tu asesor de *{{BUSINESS_NAME}}*.',
    intro: 'Garantía real y atención personalizada.',
    offer: '¿Qué producto o servicio te interesa? Estoy para ayudarte.'
  },
  {
    greeting: '¡Hola! 🎉 Te saluda *{{BUSINESS_NAME}}*.',
    intro: 'Tu partner en {{CATEGORY}}.',
    offer: '¿Buscas algo específico? Déjame asesorarte.'
  }
];

/**
 * Genera un saludo PREMIUM PROFESIONAL completamente dinámico y adaptado al Tenant
 */
export function generateDynamicGreeting(context?: {
  isFirstMessage?: boolean;
  customerName?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  previousInteraction?: boolean;
  tenantConfig?: TenantConfig | null; // Configuración del cliente SaaS
}): string {
  
  // Datos por defecto (Fallback)
  const defaultData = {
    BUSINESS_NAME: 'Tecnovariedades D&S',
    DESCRIPTION: 'Líderes en tecnología, innovación digital y formación profesional online.',
    SPECIALTY: 'tecnología y productos digitales',
    CATEGORY: 'tecnología',
    OFFER_TEXT: 'Tenemos portátiles, cursos digitales, accesorios y más.'
  };

  // Datos del Tenant (si existe)
  const tenantData = context?.tenantConfig ? {
    BUSINESS_NAME: context.tenantConfig.businessName,
    DESCRIPTION: context.tenantConfig.description || defaultData.DESCRIPTION,
    SPECIALTY: context.tenantConfig.categories.active[0] || defaultData.SPECIALTY,
    CATEGORY: context.tenantConfig.categories.active.join(', ') || defaultData.CATEGORY,
    OFFER_TEXT: 'Estamos listos para atenderte.'
  } : defaultData;

  // Seleccionar plantilla aleatoria
  const template = GREETING_TEMPLATES[Math.floor(Math.random() * GREETING_TEMPLATES.length)];
  
  // Reemplazar variables
  const greeting = template.greeting.replace('{{BUSINESS_NAME}}', tenantData.BUSINESS_NAME);
  const intro = template.intro
    .replace('{{DESCRIPTION}}', tenantData.DESCRIPTION)
    .replace('{{SPECIALTY}}', tenantData.SPECIALTY)
    .replace('{{CATEGORY}}', tenantData.CATEGORY);
  const offer = template.offer.replace('{{OFFER_TEXT}}', tenantData.OFFER_TEXT);
  
  // Construir saludo
  const parts: string[] = [];
  
  parts.push(greeting);
  
  if (Math.random() > 0.1) {
    parts.push(intro);
  }
  
  // Agregar catálogo dinámico si hay categorías
  if (context?.tenantConfig?.categories.active.length && Math.random() > 0.3) {
    const categoriesList = context.tenantConfig.categories.active
      .slice(0, 4)
      .map(cat => `🔹 ${cat}`)
      .join('\n');
    parts.push(categoriesList);
  } else if (!context?.tenantConfig && Math.random() > 0.3) {
    // Fallback catálogo
    parts.push('📚 Megacursos certificados\n💻 Laptops y accesorios\n📥 Entrega digital inmediata');
  }
  
  parts.push(offer);
  
  return parts.join('\n\n');
}

/**
 * Genera despedida dinámica
 */
export function generateDynamicFarewell(): string {
  const farewells = [
    '¡Hasta pronto! 👋',
    '¡Nos vemos! 😊',
    '¡Que tengas un excelente día! ✨',
    '¡Chao! Cualquier cosa me escribes 🙌',
    '¡Hasta luego! Estoy aquí cuando me necesites 😊',
    '¡Cuídate! 👋',
    '¡Éxitos! Aquí estamos para lo que necesites 💫',
    '¡Listo! Hablamos pronto 😄'
  ];
  
  return farewells[Math.floor(Math.random() * farewells.length)];
}

/**
 * Genera confirmación dinámica
 */
export function generateDynamicConfirmation(): string {
  const confirmations = [
    '¡Perfecto! 👍',
    '¡Claro que sí! ✅',
    '¡Dale! 🙌',
    '¡Excelente! ⭐',
    '¡Súper! 💫',
    '¡Genial! 😊',
    'Entendido ✓',
    'Ok, perfecto 👌',
    '¡Listo! ✨',
    '¡Bacano! 🎉'
  ];
  
  return confirmations[Math.floor(Math.random() * confirmations.length)];
}

/**
 * Genera transición dinámica
 */
export function generateDynamicTransition(): string {
  const transitions = [
    'Déjame contarte',
    'Mira',
    'Te cuento',
    'Fíjate que',
    'Ojo con esto',
    'Escucha',
    'Te explico',
    'Déjame mostrarte',
    'Ojo',
    'Fíjate'
  ];
  
  return transitions[Math.floor(Math.random() * transitions.length)];
}

/**
 * Añade variedad a cualquier respuesta
 */
export function addVarietyToResponse(response: string, type: 'greeting' | 'confirmation' | 'transition' | 'farewell'): string {
  const randomEmoji = GREETING_EMOJIS[Math.floor(Math.random() * GREETING_EMOJIS.length)];
  
  switch (type) {
    case 'greeting':
      return `${generateDynamicGreeting()}\n\n${response}`;
    
    case 'confirmation':
      return `${generateDynamicConfirmation()} ${response}`;
    
    case 'transition':
      return `${generateDynamicTransition()}, ${response.toLowerCase()}`;
    
    case 'farewell':
      return `${response}\n\n${generateDynamicFarewell()}`;
    
    default:
      return response;
  }
}

/**
 * Sistema anti-detección de Meta
 * Añade micro-variaciones para evitar patrones
 */
export function applyAntiDetectionVariations(response: string): string {
  // Variaciones sutiles en puntuación
  const variations = [
    (text: string) => text.replace(/\!/g, () => Math.random() > 0.5 ? '!' : '!!'),
    (text: string) => text.replace(/\?/g, () => Math.random() > 0.7 ? '?' : '??'),
    (text: string) => text.replace(/\.\.\./g, () => Math.random() > 0.5 ? '...' : '…'),
  ];
  
  // Aplicar 1-2 variaciones aleatorias
  let varied = response;
  const numVariations = Math.floor(Math.random() * 2) + 1;
  
  for (let i = 0; i < numVariations; i++) {
    const variation = variations[Math.floor(Math.random() * variations.length)];
    varied = variation(varied);
  }
  
  return varied;
}
