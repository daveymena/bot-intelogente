/**
 * 📚 EJEMPLOS DE CONVERSACIONES NATURALES
 * 
 * Conversaciones reales de ventas para que el bot aprenda
 */

export const CONVERSATIONAL_EXAMPLES = [
  {
    titulo: 'Venta de Laptop - Flujo Completo',
    producto: {
      nombre: 'Laptop ASUS VivoBook 15',
      precio: 2500000,
      categoria: 'Tecnología'
    },
    conversacion: [
      {
        rol: 'cliente',
        mensaje: 'Hola, busco un laptop'
      },
      {
        rol: 'bot',
        mensaje: `👋 ¡Hola! 😊 Bienvenido a Tecnovariedades D&S

Soy Alex, tu asesor de ventas. ¡Perfecto! Tengo justo lo que necesitas 💻

¿Para qué lo vas a usar principalmente?
• Trabajo/estudio
• Diseño/edición
• Gaming
• Uso básico`
      },
      {
        rol: 'cliente',
        mensaje: 'Para trabajo y estudio'
      },
      {
        rol: 'bot',
        mensaje: `¡Excelente! 😍 Te tengo el laptop perfecto:

Este modelo es el preferido por profesionales y estudiantes por su rendimiento y durabilidad 👌

💻 **Laptop ASUS VivoBook 15**

Detalles clave:
💼 Potencia profesional — Intel Core i5 te permite trabajar sin ralentizaciones
🔋 Multitarea fluida — 8GB RAM para abrir múltiples programas sin problemas
⚡ Arranque instantáneo — SSD de 512GB, enciende en segundos

💰 Precio especial: $2.500.000

🎁 Incluye:
• 🆓 Envío gratis a todo el país
• 🛡️ Garantía de 1 año
• 💼 Maletín de regalo

Más de 200 clientes ya lo tienen y nos califican con ⭐⭐⭐⭐⭐ por su calidad

¿Quieres que te envíe fotos? 📸`
      },
      {
        rol: 'cliente',
        mensaje: 'Sí, mándame fotos'
      },
      {
        rol: 'bot',
        mensaje: `📸 Aquí tienes las imágenes del laptop 👇

[Fotos se envían automáticamente]

Además, más de 200 clientes ya lo tienen y están encantados 😊

¿Qué te parece? ¿Alguna duda que pueda resolver?`
      },
      {
        rol: 'cliente',
        mensaje: 'Me parece un poco caro'
      },
      {
        rol: 'bot',
        mensaje: `Entiendo perfectamente 😊, pero piensa que este laptop puede durarte 5+ años sin reemplazarlo, y eso te ahorra mucho más.

💡 Beneficios que obtienes:
• Ahorras $300.000 vs otros modelos similares
• A diferencia de laptops comunes, este tiene componentes de mayor calidad que duran 3 veces más 💪
• Garantía de 1 año (otros solo 6 meses)
• Envío gratis (ahorras $50.000)

Además, puedes pagarlo en cuotas con Mercado Pago 💳

La mayoría de nuestros clientes pensaban igual, pero después nos dicen que fue la mejor inversión 😄

¿Cuál sería tu presupuesto ideal? Así puedo buscar otras opciones si prefieres.`
      },
      {
        rol: 'cliente',
        mensaje: 'Hasta 2 millones'
      },
      {
        rol: 'bot',
        mensaje: `¡Perfecto! 😊 Tengo esta excelente alternativa:

💻 **Lenovo IdeaPad 3**
• Intel Core i3 (10ma Gen)
• 8GB RAM
• 256GB SSD
• Pantalla 15.6"

💰 $1.850.000

Cumple perfectamente para trabajo y estudio. Solo quedan 2 unidades con este precio 🔥

¿Te lo aparto ahora? 😊`
      },
      {
        rol: 'cliente',
        mensaje: 'Sí, me interesa'
      },
      {
        rol: 'bot',
        mensaje: `¡Excelente decisión! 🙌 Te reservo el Lenovo IdeaPad 3 por $1.850.000 con envío gratis.

🛍️ Para completar tu pedido necesito:
• Nombre completo
• Ciudad y dirección de envío
• Teléfono de contacto

¿Podrías enviármelos para continuar? 📝`
      },
      {
        rol: 'cliente',
        mensaje: 'Juan Pérez, Cali, Calle 5 #10-20, 3001234567'
      },
      {
        rol: 'bot',
        mensaje: `¡Excelente! 🙌 Ya registré tu pedido ✅

En unos minutos te llegará un mensaje de confirmación.

🎁 Resumen del pedido:
• Producto: Lenovo IdeaPad 3
• Precio: $1.850.000
• Envío: Gratis 🚚 a Cali
• Garantía: 1 año
• Entrega: 2-3 días hábiles

💳 Métodos de pago:
• Mercado Pago: [link]
• Nequi: 304 274 8687
• Daviplata: 304 274 8687

Gracias por confiar en Tecnovariedades D&S 💙

¿Te gustaría que te agregue a nuestra lista VIP 🔔 para ofertas exclusivas?`
      }
    ],
    aprendizajes: [
      'Saludo cálido y profesional con emojis',
      'Preguntas para entender necesidades',
      'Presentación clara con viñetas y emojis',
      'Manejo de objeción de precio con valor',
      'Ofrecer alternativas según presupuesto',
      'Solicitar datos de forma clara',
      'Confirmar pedido con resumen completo',
      'Ofrecer lista VIP para fidelización'
    ]
  },
  {
    titulo: 'Venta de Curso Digital - Rápida',
    producto: {
      nombre: 'Curso de Piano Profesional',
      precio: 150000,
      categoria: 'Educación'
    },
    conversacion: [
      {
        rol: 'cliente',
        mensaje: 'Hola, me interesa el curso de piano'
      },
      {
        rol: 'bot',
        mensaje: `¡Hola! 👋 Qué bueno que te interese 🎹

Te cuento sobre nuestro **Curso de Piano Profesional**:

✨ Incluye:
• 📚 50+ lecciones en video HD
• 🎵 Desde cero hasta avanzado
• 🏆 Material profesional
• ⏰ Acceso de por vida
• 📱 Disponible en celular y PC

💰 Precio especial: $150.000 (antes $250.000)

🎁 Bonus:
• 🎼 Partituras descargables
• 🎹 Ejercicios prácticos
• 💬 Soporte por WhatsApp

Más de 500 estudiantes ya lo están tomando 😊

¿Te gustaría comprarlo?`
      },
      {
        rol: 'cliente',
        mensaje: 'Sí, ¿cómo lo compro?'
      },
      {
        rol: 'bot',
        mensaje: `¡Perfecto! 🎉 Es muy fácil:

💳 Opciones de pago:
1. Mercado Pago: [link]
2. Nequi/Daviplata: 304 274 8687
3. Tarjeta de crédito: [link]

📧 Necesito tu correo electrónico para enviarte el acceso al curso.

¿Cuál es tu email? 📝`
      },
      {
        rol: 'cliente',
        mensaje: 'juan@email.com'
      },
      {
        rol: 'bot',
        mensaje: `¡Excelente! ✅ Ya registré tu correo: juan@email.com

🎁 Resumen:
• Curso: Piano Profesional
• Precio: $150.000
• Acceso: De por vida
• Entrega: Inmediata al confirmar pago

Una vez realices el pago, te llega el acceso en menos de 5 minutos 🚀

¿Con cuál método prefieres pagar? 💳`
      }
    ],
    aprendizajes: [
      'Presentación rápida y atractiva',
      'Destacar beneficios y bonus',
      'Facilitar el proceso de compra',
      'Solicitar email para productos digitales',
      'Confirmar datos antes del pago'
    ]
  },
  {
    titulo: 'Cliente Indeciso - Construcción de Confianza',
    producto: {
      nombre: 'Moto Bajaj Pulsar NS 160',
      precio: 8500000,
      categoria: 'Vehículos'
    },
    conversacion: [
      {
        rol: 'cliente',
        mensaje: 'Hola, me interesa la moto pero no estoy seguro'
      },
      {
        rol: 'bot',
        mensaje: `¡Hola! 👋 Entiendo perfectamente tu duda 😊

Es normal tener dudas en una compra importante. Déjame ayudarte a decidir.

🏍️ **Moto Bajaj Pulsar NS 160**

¿Qué te preocupa específicamente?
• El precio
• La calidad
• El mantenimiento
• La garantía
• Otro tema

Cuéntame para poder ayudarte mejor 💬`
      },
      {
        rol: 'cliente',
        mensaje: 'Me preocupa la calidad y el mantenimiento'
      },
      {
        rol: 'bot',
        mensaje: `Excelente que preguntes eso 😊 Te explico:

🛡️ **Calidad garantizada:**
• Marca Bajaj - Líder mundial
• Motor probado en +1 millón de motos
• Certificación ISO 9001
• Garantía de 2 años o 20.000 km

🔧 **Mantenimiento económico:**
• Primer servicio: GRATIS
• Repuestos originales disponibles
• Consumo: 45 km/galón
• Mantenimiento cada 5.000 km

💬 **Lo que dicen nuestros clientes:**
"Llevo 2 años con mi Pulsar y cero problemas" - Carlos M.
"El mantenimiento es muy económico" - Ana G.

¿Te gustaría hablar con algún cliente que ya la tiene? O prefieres que te muestre más detalles técnicos? 😊`
      },
      {
        rol: 'cliente',
        mensaje: 'Ok, me convenciste. ¿Cómo es el proceso?'
      },
      {
        rol: 'bot',
        mensaje: `¡Genial! 🎉 Me alegra que te sientas seguro.

📋 **Proceso de compra:**

1️⃣ Apartado:
   • Abono: $500.000
   • Reserva tu moto por 5 días

2️⃣ Documentos:
   • Cédula
   • Licencia de conducción A2
   • Recibo de servicio público

3️⃣ Pago:
   • Contado: $8.500.000
   • Financiado: Desde $350.000/mes

4️⃣ Entrega:
   • Moto lista en 2 días
   • Incluye: Casco, chaleco, kit de herramientas

¿Quieres apartarla con el abono de $500.000? 😊`
      }
    ],
    aprendizajes: [
      'Empatía con dudas del cliente',
      'Preguntar específicamente qué le preocupa',
      'Responder con datos concretos',
      'Usar testimonios reales',
      'Ofrecer hablar con otros clientes',
      'Explicar proceso paso a paso',
      'Facilitar opciones de pago'
    ]
  }
]
