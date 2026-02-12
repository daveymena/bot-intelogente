# Documento de Requisitos - Sistema de Recordatorios

## Introducción

El Sistema de Recordatorios es una funcionalidad integral para Smart Sales Bot Pro que permite a los usuarios configurar, gestionar y recibir recordatorios automatizados relacionados con seguimientos de clientes, pagos pendientes, disponibilidad de productos y otras actividades comerciales. Esta funcionalidad se integra completamente con el sistema existente de WhatsApp, conversaciones y gestión de productos.

## Glosario

- **Sistema_Recordatorios**: El módulo completo de gestión de recordatorios
- **Recordatorio**: Una notificación programada con fecha, hora y contenido específico
- **Usuario_Admin**: Administrador del sistema que gestiona recordatorios
- **Cliente**: Persona que interactúa con el bot de WhatsApp
- **Conversacion**: Hilo de mensajes existente entre el bot y un cliente
- **Notificacion**: Mensaje enviado como resultado de un recordatorio activado
- **Dashboard**: Interfaz administrativa web del sistema
- **Servicio_WhatsApp**: Servicio existente de integración con WhatsApp via Baileys
- **Servicio_Email**: Servicio existente de notificaciones por correo electrónico
- **Contexto_Conversacion**: Servicio existente que mantiene historial de conversaciones

## Requisitos

### Requisito 1: Creación y Configuración de Recordatorios

**Historia de Usuario:** Como administrador del sistema, quiero crear recordatorios personalizados para seguimientos de clientes, para que pueda mantener un flujo de ventas organizado y no perder oportunidades comerciales.

#### Criterios de Aceptación

1. CUANDO un administrador accede al dashboard ENTONCES el Sistema_Recordatorios DEBERÁ mostrar una interfaz para crear nuevos recordatorios
2. CUANDO un administrador crea un recordatorio ENTONCES el Sistema_Recordatorios DEBERÁ permitir especificar fecha, hora, tipo, mensaje personalizado y destinatario
3. CUANDO un administrador selecciona un tipo de recordatorio ENTONCES el Sistema_Recordatorios DEBERÁ ofrecer plantillas predefinidas para seguimiento, pago pendiente, disponibilidad de producto y personalizado
4. CUANDO un administrador vincula un recordatorio a una conversación existente ENTONCES el Sistema_Recordatorios DEBERÁ asociar el recordatorio con el Contexto_Conversacion correspondiente
5. CUANDO un administrador configura un recordatorio recurrente ENTONCES el Sistema_Recordatorios DEBERÁ permitir especificar frecuencia (diaria, semanal, mensual) y fecha de finalización

### Requisito 2: Gestión y Visualización de Recordatorios

**Historia de Usuario:** Como administrador del sistema, quiero visualizar y gestionar todos mis recordatorios activos, para que pueda mantener control sobre mis actividades de seguimiento programadas.

#### Criterios de Aceptación

1. CUANDO un administrador accede a la sección de recordatorios ENTONCES el Sistema_Recordatorios DEBERÁ mostrar una lista completa de recordatorios activos, completados y cancelados
2. CUANDO un administrador filtra recordatorios ENTONCES el Sistema_Recordatorios DEBERÁ permitir filtrar por fecha, tipo, estado y cliente asociado
3. CUANDO un administrador edita un recordatorio existente ENTONCES el Sistema_Recordatorios DEBERÁ permitir modificar todos los campos excepto el ID único
4. CUANDO un administrador cancela un recordatorio ENTONCES el Sistema_Recordatorios DEBERÁ marcar el recordatorio como cancelado y detener futuras notificaciones
5. CUANDO un administrador visualiza detalles de un recordatorio ENTONCES el Sistema_Recordatorios DEBERÁ mostrar historial de notificaciones enviadas y respuestas recibidas

### Requisito 3: Ejecución Automática de Recordatorios

**Historia de Usuario:** Como administrador del sistema, quiero que los recordatorios se ejecuten automáticamente en las fechas programadas, para que no tenga que recordar manualmente cada seguimiento.

#### Criterios de Aceptación

1. CUANDO llega la fecha y hora programada de un recordatorio ENTONCES el Sistema_Recordatorios DEBERÁ ejecutar automáticamente la notificación correspondiente
2. CUANDO se ejecuta un recordatorio de WhatsApp ENTONCES el Sistema_Recordatorios DEBERÁ enviar el mensaje a través del Servicio_WhatsApp al número del cliente
3. CUANDO se ejecuta un recordatorio de email ENTONCES el Sistema_Recordatorios DEBERÁ enviar la notificación a través del Servicio_Email
4. CUANDO un recordatorio falla en su ejecución ENTONCES el Sistema_Recordatorios DEBERÁ reintentar el envío hasta 3 veces con intervalos de 5 minutos
5. CUANDO un recordatorio recurrente se ejecuta exitosamente ENTONCES el Sistema_Recordatorios DEBERÁ programar automáticamente la siguiente ocurrencia según la frecuencia configurada

### Requisito 4: Integración con Conversaciones Existentes

**Historia de Usuario:** Como administrador del sistema, quiero que los recordatorios se integren con el historial de conversaciones, para que mantenga contexto completo de la interacción con cada cliente.

#### Criterios de Aceptación

1. CUANDO se crea un recordatorio desde una conversación activa ENTONCES el Sistema_Recordatorios DEBERÁ heredar automáticamente el número de WhatsApp y contexto del cliente
2. CUANDO se ejecuta un recordatorio vinculado a una conversación ENTONCES el Sistema_Recordatorios DEBERÁ actualizar el Contexto_Conversacion con la nueva interacción
3. CUANDO un cliente responde a un recordatorio ENTONCES el Sistema_Recordatorios DEBERÁ marcar el recordatorio como respondido y registrar la respuesta
4. CUANDO se visualiza una conversación ENTONCES el Sistema_Recordatorios DEBERÁ mostrar recordatorios asociados y su estado actual
5. CUANDO se crea un recordatorio para seguimiento de producto ENTONCES el Sistema_Recordatorios DEBERÁ incluir información del producto desde el contexto de la conversación

### Requisito 5: Notificaciones y Preferencias

**Historia de Usuario:** Como administrador del sistema, quiero configurar mis preferencias de notificación para recordatorios, para que reciba alertas de la manera más conveniente para mi flujo de trabajo.

#### Criterios de Aceptación

1. CUANDO un administrador configura preferencias ENTONCES el Sistema_Recordatorios DEBERÁ permitir seleccionar canales de notificación (WhatsApp, email, dashboard)
2. CUANDO se acerca la fecha de un recordatorio ENTONCES el Sistema_Recordatorios DEBERÁ enviar notificaciones previas según las preferencias configuradas (1 hora, 1 día antes)
3. CUANDO un recordatorio se ejecuta exitosamente ENTONCES el Sistema_Recordatorios DEBERÁ notificar al administrador sobre el estado de entrega
4. CUANDO un recordatorio falla repetidamente ENTONCES el Sistema_Recordatorios DEBERÁ enviar una alerta de error al administrador
5. CUANDO hay recordatorios pendientes al iniciar sesión ENTONCES el Sistema_Recordatorios DEBERÁ mostrar un resumen en el dashboard principal

### Requisito 6: Análisis y Seguimiento de Efectividad

**Historia de Usuario:** Como administrador del sistema, quiero ver estadísticas sobre la efectividad de mis recordatorios, para que pueda optimizar mi estrategia de seguimiento de clientes.

#### Criterios de Aceptación

1. CUANDO un administrador accede a estadísticas ENTONCES el Sistema_Recordatorios DEBERÁ mostrar métricas de recordatorios enviados, respondidos y convertidos en ventas
2. CUANDO se genera un reporte de efectividad ENTONCES el Sistema_Recordatorios DEBERÁ calcular tasas de respuesta por tipo de recordatorio y período de tiempo
3. CUANDO se visualizan tendencias ENTONCES el Sistema_Recordatorios DEBERÁ mostrar gráficos de actividad de recordatorios por día, semana y mes
4. CUANDO se analiza rendimiento por cliente ENTONCES el Sistema_Recordatorios DEBERÁ identificar clientes más responsivos y patrones de comportamiento
5. CUANDO se exportan estadísticas ENTONCES el Sistema_Recordatorios DEBERÁ generar reportes en formato CSV con datos detallados de recordatorios

### Requisito 7: Persistencia y Sincronización de Datos

**Historia de Usuario:** Como desarrollador del sistema, quiero que todos los datos de recordatorios se almacenen de forma segura y consistente, para que la información persista correctamente y se mantenga sincronizada entre servicios.

#### Criterios de Aceptación

1. CUANDO se crea un recordatorio ENTONCES el Sistema_Recordatorios DEBERÁ almacenar todos los datos en la base de datos PostgreSQL/SQLite usando Prisma ORM
2. CUANDO se actualiza un recordatorio ENTONCES el Sistema_Recordatorios DEBERÁ mantener un historial de cambios con timestamps y usuario responsable
3. CUANDO el sistema se reinicia ENTONCES el Sistema_Recordatorios DEBERÁ cargar automáticamente todos los recordatorios activos y reanudar la programación
4. CUANDO se ejecuta un recordatorio ENTONCES el Sistema_Recordatorios DEBERÁ registrar el evento de ejecución con timestamp, estado y detalles de entrega
5. CUANDO hay conflictos de concurrencia ENTONCES el Sistema_Recordatorios DEBERÁ manejar múltiples accesos simultáneos sin corrupción de datos

### Requisito 8: Integración con Servicios Existentes

**Historia de Usuario:** Como arquitecto del sistema, quiero que el módulo de recordatorios se integre perfectamente con los servicios existentes, para que mantenga la coherencia arquitectónica y reutilice funcionalidades disponibles.

#### Criterios de Aceptación

1. CUANDO se envía una notificación por WhatsApp ENTONCES el Sistema_Recordatorios DEBERÁ utilizar el Servicio_WhatsApp existente sin duplicar funcionalidad
2. CUANDO se envía una notificación por email ENTONCES el Sistema_Recordatorios DEBERÁ utilizar el Servicio_Email existente con las mismas plantillas y configuraciones
3. CUANDO se actualiza información de productos ENTONCES el Sistema_Recordatorios DEBERÁ sincronizar automáticamente con el sistema de gestión de productos
4. CUANDO se modifica una conversación ENTONCES el Sistema_Recordatorios DEBERÁ recibir notificaciones del Contexto_Conversacion para mantener coherencia
5. CUANDO se implementan actualizaciones en caliente ENTONCES el Sistema_Recordatorios DEBERÁ soportar hot-reload sin perder recordatorios programados