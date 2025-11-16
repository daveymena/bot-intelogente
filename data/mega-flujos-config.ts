/**
 * Configuración completa de los 8 Mega-Flujos
 * Incluye todas las variaciones, objeciones y preguntas posibles
 */

export const MEGA_FLUJOS_CONFIG = {
  // 1. TECNOLOGÍA / CONTRAENTREGA
  tecnologia_contraentrega: {
    nombre: 'Ventas de Tecnología (Contraentrega)',
    descripcion: 'Venta de laptops, celulares, accesorios con contraentrega',
    
    objeciones_comunes: [
      '¿Es nuevo o usado?',
      '¿Me estafas?',
      'Vi uno más barato en Marketplace',
      '¿Tiene garantía?',
      '¿Cuánto demora en llegar?',
      '¿Puedo verlo antes de pagar?',
      '¿Aceptan contraentrega?',
      '¿Me das descuento?',
      '¿Cómo sé que es real?',
      '¿Y si no me gusta?',
      '¿Puedo devolverlo?',
      '¿Viene con factura?',
      '¿Qué incluye?',
      '¿Tiene Windows?',
      '¿Está sellado?',
      '¿De dónde lo traen?',
      '¿Es importado o nacional?',
      '¿Cuánto cuesta el envío?',
      '¿Puedo pagar en cuotas?',
      '¿Aceptan tarjeta?'
    ],

    preguntas_tecnicas: [
      '¿Cuánta RAM tiene?',
      '¿Qué procesador trae?',
      '¿Cuánto almacenamiento?',
      '¿Es SSD o HDD?',
      '¿Qué tamaño de pantalla?',
      '¿Tiene tarjeta gráfica?',
      '¿Cuánto dura la batería?',
      '¿Tiene teclado retroiluminado?',
      '¿Qué puertos tiene?',
      '¿Sirve para juegos?',
      '¿Sirve para diseño?',
      '¿Sirve para programar?',
      '¿Corre AutoCAD?',
      '¿Corre Photoshop?',
      '¿Tiene cámara?',
      '¿Tiene Bluetooth?',
      '¿Tiene WiFi 6?',
      '¿Qué tan pesado es?',
      '¿Se puede actualizar?',
      '¿Le puedo agregar más RAM?'
    ],

    comparaciones: [
      '¿Cuál es mejor, HP o Dell?',
      '¿Cuál me recomiendas?',
      '¿Qué diferencia hay entre estos dos?',
      '¿Vale la pena pagar más?',
      '¿Cuál es más rápido?',
      '¿Cuál dura más?',
      '¿Cuál es más liviano?',
      '¿Cuál tiene mejor pantalla?',
      '¿Cuál es mejor para mi presupuesto?',
      '¿Este o el que vi en otro lado?'
    ],

    flujo_completo: [
      'Saludo inicial',
      'Consulta de necesidad',
      'Presentación de opciones',
      'Manejo de objeciones',
      'Comparación de productos',
      'Explicación de garantía',
      'Explicación de contraentrega',
      'Confirmación de datos',
      'Cierre de venta',
      'Seguimiento postventa'
    ]
  },

  // 2. DROPSHIPPING
  dropshipping: {
    nombre: 'Dropshipping (Tiempos + Garantías)',
    descripcion: 'Productos importados con tiempos de entrega 3-10 días',

    objeciones_comunes: [
      '¿Cuánto demora?',
      '¿Y si no llega?',
      '¿Y si llega roto?',
      '¿Y si llega diferente?',
      '¿Puedo rastrearlo?',
      '¿Tiene garantía?',
      '¿De dónde viene?',
      '¿Es original?',
      '¿Por qué demora tanto?',
      '¿Puedo cancelar?',
      '¿Me devuelven el dinero?',
      '¿Cómo sé que llegará?',
      '¿Han tenido problemas antes?',
      '¿Qué pasa si se pierde?',
      '¿Quién responde?'
    ],

    preguntas_seguimiento: [
      '¿Dónde está mi pedido?',
      '¿Ya salió?',
      '¿Cuándo llega?',
      '¿Por qué no ha llegado?',
      '¿Puedo cambiar la dirección?',
      '¿Puedo acelerar el envío?',
      '¿Me pueden llamar antes?',
      '¿Llega a mi casa?',
      '¿Tengo que estar presente?',
      '¿Qué hago si no estoy?'
    ],

    flujo_completo: [
      'Consulta de producto',
      'Explicación de tiempos (3-5 o 5-10 días)',
      'Explicación de garantías',
      'Confirmación de datos',
      'Generación de pedido',
      'Envío de tracking',
      'Seguimiento proactivo',
      'Confirmación de entrega',
      'Soporte postventa'
    ]
  },

  // 3. SERVICIOS (CITAS)
  servicios_citas: {
    nombre: 'Servicios (Barbería/Estética/Odontología)',
    descripcion: 'Agendamiento de citas para servicios',

    preguntas_comunes: [
      '¿Qué horarios tienen?',
      '¿Cuánto cuesta?',
      '¿Cuánto demora?',
      '¿Dónde quedan?',
      '¿Tienen parqueadero?',
      '¿Aceptan tarjeta?',
      '¿Puedo llevar acompañante?',
      '¿Qué servicios ofrecen?',
      '¿Tienen promociones?',
      '¿Puedo agendar para varias personas?',
      '¿Hacen domicilios?',
      '¿Trabajan fines de semana?',
      '¿Trabajan festivos?',
      '¿Qué pasa si llego tarde?',
      '¿Puedo cancelar?'
    ],

    cambios_cita: [
      'Quiero cambiar mi cita',
      'No puedo ir',
      'Llegué tarde',
      '¿Puedo reprogramar?',
      '¿Me cobran por cancelar?',
      '¿Puedo cambiar de servicio?',
      '¿Puedo cambiar de profesional?',
      'Tengo una emergencia',
      '¿Hay otro horario?',
      '¿Puedo ir más temprano?'
    ],

    flujo_completo: [
      'Consulta de servicio',
      'Presentación de horarios',
      'Selección de horario',
      'Confirmación de datos',
      'Agendamiento',
      'Recordatorio 24h antes',
      'Recordatorio 1h antes',
      'Confirmación de asistencia',
      'Seguimiento postventa'
    ]
  },

  // 4. SOPORTE TÉCNICO
  soporte_tecnico: {
    nombre: 'Soporte Técnico Real',
    descripcion: 'Diagnóstico y reparación de equipos',

    problemas_comunes: [
      'Mi laptop está lenta',
      'No enciende',
      'Se apaga sola',
      'Se calienta mucho',
      'Hace ruidos raros',
      'La pantalla no se ve',
      'El teclado no funciona',
      'No carga',
      'No conecta a WiFi',
      'Tiene virus',
      'Se quedó en logo',
      'Pantalla azul',
      'No reconoce el disco',
      'Se reinicia sola',
      'Batería no dura'
    ],

    preguntas_diagnostico: [
      '¿Qué le pasa exactamente?',
      '¿Desde cuándo?',
      '¿Qué estabas haciendo?',
      '¿Se cayó?',
      '¿Le cayó líquido?',
      '¿Hace cuánto lo tienes?',
      '¿Ya lo revisaron antes?',
      '¿Qué Windows tiene?',
      '¿Tienes respaldo?',
      '¿Es urgente?'
    ],

    soluciones: [
      'Cambio de disco a SSD',
      'Aumento de RAM',
      'Limpieza profunda',
      'Cambio de batería',
      'Cambio de pantalla',
      'Cambio de teclado',
      'Reinstalación de Windows',
      'Eliminación de virus',
      'Cambio de pasta térmica',
      'Reparación de placa'
    ],

    flujo_completo: [
      'Descripción del problema',
      'Preguntas de diagnóstico',
      'Diagnóstico inicial',
      'Cotización',
      'Agendamiento de revisión',
      'Diagnóstico técnico',
      'Aprobación de reparación',
      'Ejecución',
      'Entrega',
      'Garantía'
    ]
  },

  // Continúa en siguiente archivo...
};
