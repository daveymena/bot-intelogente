// ========================================
// DATOS DE ENTRENAMIENTO DE VENTAS
// ========================================

export interface TrainingScenario {
  id: number;
  titulo: string;
  contexto: string;
  producto: {
    nombre: string;
    precio: number;
    categoria: string;
    subcategoria: string;
    tienda: string;
  };
  conversacion: Array<{
    rol: 'cliente' | 'bot';
    mensaje: string;
  }>;
  aprendizajes: string[];
}

export const salesTrainingData: TrainingScenario[] = [
  // ========================================
  // ESCENARIO 7: CLIENTE NO COMPRA - OBJECIÓN DE PRECIO
  // ========================================
  {
    id: 7,
    titulo: "Cliente no compra por objeción de precio",
    contexto: "Cliente considera que el producto es muy caro y el bot maneja la objeción sin éxito, cerrando la conversación amablemente.",
    producto: {
      nombre: "Impresora HP Smart Tank 530",
      precio: 1059900,
      categoria: 'PHYSICAL',
      subcategoria: 'Impresoras y Escáneres',
      tienda: 'MegaComputer'
    },
    conversacion: [
      {
        rol: 'cliente',
        mensaje: 'Hola, busco una impresora multifuncional buena.'
      },
      {
        rol: 'bot',
        mensaje: '¡Hola! Claro que sí. ¿Buscas algo para tu casa o para una oficina? Para poder recomendarte la mejor opción. 😊'
      },
      {
        rol: 'cliente',
        mensaje: 'Para una oficina pequeña, pero que aguante bastante trabajo.'
      },
      {
        rol: 'bot',
        mensaje: `Entendido. En ese caso, te recomiendo la **HP Smart Tank 530**. Es una máquina de trabajo pesado, perfecta para una oficina.

🔹 **Alta Capacidad:** Imprime hasta 12,000 páginas en negro o 8,000 a color con la tinta incluida.
🔹 **Alimentador Automático:** Escanea y copia hasta 35 páginas de una sola vez.
🔹 **Conectividad Total:** Imprime desde cualquier dispositivo con WiFi.

El precio es de *$1.059.900*. ¿Qué te parece?`
      },
      {
        rol: 'cliente',
        mensaje: 'Uhm, está muy cara. Pensaba en algo de máximo 800.000.'
      },
      {
        rol: 'bot',
        mensaje: `Comprendo perfectamente tu punto sobre el presupuesto. La HP Smart Tank es una inversión inicial más alta, pero a largo plazo es mucho más económica por el rendimiento de la tinta.

Sin embargo, si buscas algo que no supere los $800.000, te puedo ofrecer la **Canon G3170** por *$789.900*. También es multifuncional con WiFi y sistema de tinta continua, aunque con un poco menos de capacidad que la HP.

¿Te gustaría que te dé más detalles de la Canon?`
      },
      {
        rol: 'cliente',
        mensaje: 'No, déjame pensarlo. Gracias.'
      },
      {
        rol: 'bot',
        mensaje: `¡Por supuesto! No hay problema. Tómate tu tiempo para decidir.

Si cambias de opinión o tienes alguna otra pregunta, no dudes en escribirme. ¡Estoy para ayudarte!

Que tengas un excelente día. 😊`
      }
    ],
    aprendizajes: [
      'Cuando un cliente tiene una objeción de precio, validar su punto.',
      'Ofrecer una alternativa que se ajuste al presupuesto del cliente.',
      'Si el cliente no está interesado, no insistir.',
      'Cerrar la conversación de forma amable y dejar la puerta abierta para futuras consultas.'
    ]
  }
];
