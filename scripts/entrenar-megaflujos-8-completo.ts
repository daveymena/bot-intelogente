#!/usr/bin/env npx tsx
/**
 * ENTRENAMIENTO MEGAFLUJOS COMPLEJOS - 8 FLUJOS REALES
 * 
 * Este script carga y entrena el bot con 8 megaflujos complejos y realistas:
 * 1. Tecnología - Contraentrega (Laptop para Ingeniería)
 * 2. Dropshipping (Smartwatch - Miedos + Tiempos + Reclamos)
 * 3. Servicios - Citas (Barbería/Estética/Odontología)
 * 4. Soporte Técnico (Laptop Lenta - Diagnóstico + Solución)
 * 5. Productos Digitales (Megapack - Confianza + Entregas + Soporte)
 * 6. Fiados / Crédito Semanal (Validación + Confianza)
 * 7. Cliente Agresivo / Desconfiado (Objeciones + Pruebas)
 * 8. Cliente Indeciso / Vago (Solo Mirando - Conversión Lenta)
 */

import * as fs from 'fs';
import * as path from 'path';

// Consolidar todos los megaflujos
const megaflujos = [
  // MEGAFLUJO 1: TECNOLOGÍA - CONTRAENTREGA
  {
    id: "megaflujo_1",
    nombre: "TECNOLOGÍA - CONTRAENTREGA (Laptop para Ingeniería)",
    categoria: "tecnologia_contraentrega",
    complejidad: "alta",
    duracion_promedio: "15-20 minutos",
    conversacion: [
      {"turno": 1, "rol": "usuario", "mensaje": "Hola, ¿tienes portátiles económicos?", "intención": "product_search", "sentimiento": "neutral"},
      {"turno": 2, "rol": "bot", "mensaje": "¡Hola! 👋 Claro, ¿qué tipo de portátil buscas? ¿Para estudio, trabajo o algo más específico?", "intención": "clarification", "acciones": ["pedir_contexto"]},
      {"turno": 3, "rol": "usuario", "mensaje": "Para estudiar ingeniería, pero no quiero que se trabe.", "intención": "product_search", "entidades": ["ingeniería", "rendimiento"], "sentimiento": "preocupado"},
      {"turno": 4, "rol": "bot", "mensaje": "Perfecto 🙌 Para ingeniería básica necesitas mínimo:\n✔ 8GB RAM\n✔ SSD 256GB o más\n✔ Procesador i3/Ryzen 3 o mejor\n\n¿Cuánto es tu presupuesto máximo?", "intención": "product_info", "acciones": ["mostrar_requisitos", "pedir_presupuesto"]},
      {"turno": 5, "rol": "usuario", "mensaje": "No más de 1.5 millones.", "intención": "price_inquiry", "entidades": ["presupuesto"], "sentimiento": "decidido"},
      {"turno": 6, "rol": "bot", "mensaje": "Listo. Tengo estas 2 opciones top:\n\n💻 HP 14 – i3 – 8GB RAM – 256GB SSD\n💲 1.249.900\n✔ Zoom, VSCode, AutoCAD básico, Office\n\n💻 ASUS 14 – Ryzen 3 – 8GB RAM – 512GB SSD\n💲 1.449.900\n✔ Mejor multitarea\n✔ Arranque más rápido\n✔ Mejor rendimiento para ingeniería ligera\n\n¿Quieres que te envíe fotos o videos reales?", "intención": "product_comparison", "productos": ["HP 14", "ASUS 14"], "acciones": ["comparar_opciones", "ofrecer_multimedia"]},
      {"turno": 7, "rol": "usuario", "mensaje": "Sí, mándame fotos.", "intención": "media_request", "sentimiento": "interesado"},
      {"turno": 8, "rol": "bot", "mensaje": "Aquí van 📸👇\n(envía 3 imágenes reales de ambas laptops)\n\nSi quieres, te muestro video del encendido.", "intención": "media_delivery", "acciones": ["enviar_fotos", "ofrecer_video"]},
      {"turno": 9, "rol": "usuario", "mensaje": "¿Es nueva o usada?", "intención": "product_verification", "entidades": ["condición"], "sentimiento": "desconfiado"},
      {"turno": 10, "rol": "bot", "mensaje": "Totalmente nueva y sellada, garantía + factura. Incluye Windows 11 activado.", "intención": "reassurance", "acciones": ["confirmar_nuevo", "mencionar_garantía"]},
      {"turno": 11, "rol": "usuario", "mensaje": "¿Y si la pido contraentrega no me estafas?", "intención": "objection_trust", "entidades": ["estafa", "seguridad"], "sentimiento": "desconfiado"},
      {"turno": 12, "rol": "bot", "mensaje": "Tranquilo 😊 El proceso es así:\n\n1️⃣ El mensajero te entrega el portátil\n2️⃣ Lo revisas tú mismo antes de pagar\n3️⃣ Si está perfecto → pagas\n4️⃣ Si algo no coincide → NO pagas y devuelves sin costo\n\nEs 100% seguro.", "intención": "objection_response", "acciones": ["explicar_contraentrega", "garantizar_seguridad"]},
      {"turno": 13, "rol": "usuario", "mensaje": "Ah bueno, así sí. ¿Cuánto demora en llegar a Cali?", "intención": "logistics_inquiry", "entidades": ["ubicación", "tiempo"], "sentimiento": "interesado"},
      {"turno": 14, "rol": "bot", "mensaje": "Para Cali entregamos hoy en la tarde o mañana en la mañana.", "intención": "logistics_info", "acciones": ["confirmar_tiempo_entrega"]},
      {"turno": 15, "rol": "usuario", "mensaje": "Vi uno igual más barato en Marketplace.", "intención": "objection_price", "entidades": ["competencia"], "sentimiento": "dudoso"},
      {"turno": 16, "rol": "bot", "mensaje": "Sí, pero ojo: muchos en Marketplace son usados, sin garantía o reacondicionados. El nuestro es:\n\n✔ Nuevo sellado\n✔ Garantía real\n✔ Factura\n✔ Contraentrega seguro\n\nAhí está la diferencia.", "intención": "objection_response", "acciones": ["diferenciar_competencia", "destacar_valor"]},
      {"turno": 17, "rol": "usuario", "mensaje": "Bueno, la ASUS me gusta.", "intención": "product_selection", "entidades": ["ASUS"], "sentimiento": "decidido"},
      {"turno": 18, "rol": "bot", "mensaje": "¡Excelente elección! 🙌 ¿Deseas envío contraentrega o recoger en tienda?", "intención": "delivery_method", "acciones": ["confirmar_selección", "pedir_método_entrega"]},
      {"turno": 19, "rol": "usuario", "mensaje": "Contraentrega.", "intención": "delivery_selection", "sentimiento": "decidido"},
      {"turno": 20, "rol": "bot", "mensaje": "Perfecto ✔️ Para generar la guía necesito:\n\n📍 Dirección\n👤 Nombre\n📱 Teléfono", "intención": "data_collection", "acciones": ["pedir_datos_entrega"]},
      {"turno": 21, "rol": "usuario", "mensaje": "Listo, te los paso…", "intención": "data_provision", "sentimiento": "cooperativo"},
      {"turno": 22, "rol": "bot", "mensaje": "Perfecto 🙌 Tu entrega queda programada para hoy. Cuando el mensajero recoja tu portátil te envío foto + factura.", "intención": "confirmation", "acciones": ["confirmar_pedido", "prometer_seguimiento"]},
      {"turno": 23, "rol": "bot", "mensaje": "(Después de 2 horas)\n\nHola 👋 ¿Todo bien con tu ASUS? ¿Funciona como esperabas? 😊", "intención": "post_sale_followup", "acciones": ["verificar_satisfacción"]}
    ]
  },
  // MEGAFLUJO 2: DROPSHIPPING
  {
    id: "megaflujo_2",
    nombre: "DROPSHIPPING (Smartwatch - Miedos + Tiempos + Reclamos)",
    categoria: "dropshipping",
    complejidad: "alta",
    duracion_promedio: "12-18 minutos",
    conversacion: [
      {"turno": 1, "rol": "usuario", "mensaje": "Quiero pedir el smartwatch, ¿cuánto demora?", "intención": "product_inquiry", "entidades": ["smartwatch", "tiempo"], "sentimiento": "neutral"},
      {"turno": 2, "rol": "bot", "mensaje": "Ese smartwatch llega por proveedor oficial:\n\n🚚 3–5 días hábiles → ciudades\n🚚 5–10 días → municipios\n\n¿Deseas pedirlo contraentrega?", "intención": "logistics_info", "acciones": ["informar_tiempos", "ofrecer_contraentrega"]},
      {"turno": 3, "rol": "usuario", "mensaje": "¿Y si no llega?", "intención": "objection_risk", "entidades": ["riesgo", "garantía"], "sentimiento": "preocupado"},
      {"turno": 4, "rol": "bot", "mensaje": "Tienes garantía total:\n\n✔ Si no llega → NO pagas\n✔ Si llega distinto → lo devuelves sin costo\n✔ Si llega dañado → reemplazo inmediato\n\nTu compra está protegida.", "intención": "reassurance", "acciones": ["garantizar_entrega", "explicar_protección"]},
      {"turno": 5, "rol": "usuario", "mensaje": "¿Y si llega roto?", "intención": "objection_damage", "entidades": ["daño"], "sentimiento": "preocupado"},
      {"turno": 6, "rol": "bot", "mensaje": "Aplica garantía 👉 cambio sin costo en 24h.", "intención": "reassurance", "acciones": ["garantizar_reemplazo"]},
      {"turno": 7, "rol": "usuario", "mensaje": "¿Y puedo ver cómo es?", "intención": "media_request", "sentimiento": "interesado"},
      {"turno": 8, "rol": "bot", "mensaje": "Claro, aquí tienes fotos y video real 📸🎥👇\n(envía 4 fotos + 1 video del smartwatch)", "intención": "media_delivery", "acciones": ["enviar_multimedia"]},
      {"turno": 9, "rol": "usuario", "mensaje": "¿Tiene batería de verdad 7 días?", "intención": "product_verification", "entidades": ["batería", "especificaciones"], "sentimiento": "escéptico"},
      {"turno": 10, "rol": "bot", "mensaje": "Sí, con uso normal. Si lo usas mucho (GPS + pantalla siempre) → 4-5 días. Pero la mayoría reporta 6-7 días.", "intención": "product_info", "acciones": ["ser_honesto", "dar_contexto"]},
      {"turno": 11, "rol": "usuario", "mensaje": "¿Funciona con iPhone?", "intención": "compatibility_check", "entidades": ["iPhone"], "sentimiento": "neutral"},
      {"turno": 12, "rol": "bot", "mensaje": "Sí, funciona con iOS y Android. Sincroniza perfecto con ambos.", "intención": "product_info", "acciones": ["confirmar_compatibilidad"]},
      {"turno": 13, "rol": "usuario", "mensaje": "Listo, lo quiero.", "intención": "purchase_decision", "sentimiento": "decidido"},
      {"turno": 14, "rol": "bot", "mensaje": "Perfecto 🙌 Envíame:\n\n👤 Nombre\n📍 Dirección\n📱 Teléfono\n\nY genero tu pedido hoy mismo.", "intención": "data_collection", "acciones": ["pedir_datos"]},
      {"turno": 15, "rol": "usuario", "mensaje": "Listo, aquí van los datos…", "intención": "data_provision", "sentimiento": "cooperativo"},
      {"turno": 16, "rol": "bot", "mensaje": "Perfecto ✔️ Tu pedido está confirmado. Llega en 3-5 días. Te envío tracking mañana.", "intención": "confirmation", "acciones": ["confirmar_pedido", "prometer_tracking"]},
      {"turno": 17, "rol": "usuario", "mensaje": "(Después de 5 días)\n\nHola, ¿dónde está mi pedido? Lleva 5 días.", "intención": "complaint_delay", "entidades": ["retraso"], "sentimiento": "molesto"},
      {"turno": 18, "rol": "bot", "mensaje": "Disculpa la demora 😟 Déjame revisar el tracking… Veo que está en tránsito. Debería llegar hoy o mañana. Si no llega mañana, te devuelvo el dinero sin preguntas.", "intención": "complaint_response", "acciones": ["investigar", "ofrecer_solución"]},
      {"turno": 19, "rol": "usuario", "mensaje": "Listo, espero que llegue.", "intención": "acknowledgment", "sentimiento": "esperanzado"},
      {"turno": 20, "rol": "bot", "mensaje": "(Después de 1 día)\n\n¡Llegó! 🎉 ¿Todo bien? ¿Funciona perfecto?", "intención": "post_sale_followup", "acciones": ["verificar_satisfacción"]}
    ]
  }
];

// Agregar los otros 6 megaflujos...
// (Continuará en la siguiente parte)

console.log('✅ Megaflujos consolidados:', megaflujos.length);
console.log('📊 Categorías:', [...new Set(megaflujos.map(m => m.categoria))]);
console.log('🎯 Complejidad:', [...new Set(megaflujos.map(m => m.complejidad))]);

// Guardar consolidado
const outputPath = path.join(process.cwd(), 'data', 'megaflujos-consolidado.json');
fs.writeFileSync(outputPath, JSON.stringify({ megaflujos }, null, 2));
console.log(`\n✅ Archivo guardado: ${outputPath}`);
