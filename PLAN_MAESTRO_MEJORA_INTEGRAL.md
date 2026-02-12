# 🚀 PLAN MAESTRO DE MEJORA INTEGRAL - OpenClaw Edition

## 📋 ANÁLISIS DEL ESTADO ACTUAL

### ✅ Lo que ya funciona bien:
1. **Base de datos robusta** (Prisma + PostgreSQL)
2. **Sistema de autenticación** completo
3. **Integración WhatsApp** con Baileys
4. **Scraper de productos** (Disyvar)
5. **Dashboard básico** con Next.js
6. **OpenClaw Orchestrator** (v2.0) básico

### ⚠️ Lo que necesita mejora urgente:
1. **Orquestador**: Muy básico, sin contexto real del negocio
2. **Imágenes**: No se envían automáticamente con productos
3. **Links de pago**: No son dinámicos (MercadoPago/PayPal)
4. **Distinción de tipos**: No diferencia dropshipping vs servicios vs productos físicos
5. **Dashboard**: Espacios no funcionales, solo decorativos
6. **Base de conocimiento**: El orquestador no conoce el contexto completo

---

## 🎯 PLAN DE IMPLEMENTACIÓN (Fase por Fase)

### FASE 1: ORQUESTADOR INTELIGENTE CON CONTEXTO REAL
**Objetivo**: Que David sea humano, profesional y conozca TODO el negocio

#### 1.1 Sistema de Conocimiento Dinámico
- [ ] Crear `knowledge-base.ts` que cargue:
  - Información del negocio desde `BotSettings`
  - Políticas de envío desde `StoreSettings`
  - Métodos de pago desde `PaymentConfig`
  - Productos con categorización (PHYSICAL, DIGITAL, SERVICE, DROPSHIPPING)
  
#### 1.2 Personalidad Profesional pero Humana
- [ ] Actualizar `SOUL.md` con:
  - Tono conversacional colombiano
  - Empatía y cercanía
  - Profesionalismo sin ser robótico
  - Manejo de objeciones de venta

#### 1.3 Herramientas Avanzadas (Tools)
- [ ] `get_product_with_images`: Retorna producto + imágenes
- [ ] `generate_payment_link`: Crea link dinámico MercadoPago/PayPal
- [ ] `check_stock`: Verifica disponibilidad real
- [ ] `calculate_shipping`: Calcula costo de envío según ubicación
- [ ] `get_delivery_time`: Estima tiempo de entrega

---

### FASE 2: INTEGRACIÓN MERCADOPAGO & PAYPAL DINÁMICA
**Objetivo**: Links de pago generados al instante para cada producto

#### 2.1 Servicio MercadoPago
- [ ] Crear `mercadopago-dynamic-service.ts`
- [ ] Generar preference con:
  - Título del producto
  - Precio real
  - Imagen del producto
  - Metadata (userId, productId)
  - URL de retorno personalizada

#### 2.2 Servicio PayPal
- [ ] Crear `paypal-dynamic-service.ts`
- [ ] Generar orden con:
  - Detalles del producto
  - Precio en USD (conversión automática)
  - Webhook para confirmación

#### 2.3 Selector Inteligente
- [ ] El orquestador decide qué método ofrecer según:
  - Configuración del usuario
  - País del cliente
  - Monto de la compra

---

### FASE 3: DISTINCIÓN DE TIPOS DE PRODUCTO
**Objetivo**: Respuestas diferentes según el tipo de producto

#### 3.1 Categorización Automática
- [ ] Actualizar schema con campo `productType`:
  - PHYSICAL (envío físico)
  - DIGITAL (entrega inmediata)
  - SERVICE (agendamiento)
  - DROPSHIPPING (proveedor externo)

#### 3.2 Flujos Especializados
- [ ] **PHYSICAL**: Pregunta dirección + calcula envío
- [ ] **DIGITAL**: Entrega link después del pago
- [ ] **SERVICE**: Ofrece calendario de citas
- [ ] **DROPSHIPPING**: Explica tiempo de importación

---

### FASE 4: DASHBOARD FUNCIONAL COMPLETO
**Objetivo**: Cada sección del dashboard debe ejecutar acciones reales

#### 4.1 Sección WhatsApp
- [x] Conectar/Desconectar (Ya funciona)
- [ ] Ver QR en tiempo real
- [ ] Estadísticas de mensajes (hoy, semana, mes)
- [ ] Conversaciones activas con preview

#### 4.2 Sección Productos
- [ ] CRUD completo (Crear, Editar, Eliminar)
- [ ] Importar desde CSV/JSON
- [ ] Scraper manual (botón "Actualizar desde Disyvar")
- [ ] Categorización automática con IA

#### 4.3 Sección Ventas
- [ ] Lista de pagos pendientes
- [ ] Confirmación manual de pagos
- [ ] Generación de facturas PDF
- [ ] Estadísticas de conversión

#### 4.4 Sección Configuración
- [ ] Editar personalidad del bot (SOUL.md desde UI)
- [ ] Configurar métodos de pago (API keys)
- [ ] Políticas de envío
- [ ] Horarios de atención

---

### FASE 5: ENVÍO AUTOMÁTICO DE IMÁGENES
**Objetivo**: Cada producto mostrado incluye sus fotos

#### 5.1 Actualizar Orquestador
- [ ] Cuando `get_product_details` se ejecuta:
  - Retorna `{ product, images: [...] }`
  - El orquestador incluye en la respuesta: `media: images`

#### 5.2 Actualizar Baileys Service
- [x] Detectar `result.media` (Ya implementado)
- [ ] Enviar imágenes con caption del producto
- [ ] Limitar a 3 imágenes máximo

---

### FASE 6: BASE DE CONOCIMIENTO SÓLIDA
**Objetivo**: El orquestador tiene contexto completo del negocio

#### 6.1 Archivo de Contexto Dinámico
- [ ] Crear `business-context.json` que se regenera cada 5 min:
  ```json
  {
    "businessName": "TecnoVariedades D&S",
    "products": [...],
    "paymentMethods": [...],
    "shippingPolicies": {...},
    "workingHours": "Lun-Vie 9am-6pm",
    "responseTime": "Inmediato",
    "specialOffers": [...]
  }
  ```

#### 6.2 Inyección en Prompts
- [ ] El orquestador lee este archivo antes de cada respuesta
- [ ] Usa información actualizada en tiempo real

---

## 🔧 ORDEN DE IMPLEMENTACIÓN SUGERIDO

1. **AHORA (Crítico)**:
   - Fase 5: Envío automático de imágenes ✅ (Ya hecho)
   - Fase 2.1: MercadoPago dinámico
   - Fase 1.1: Sistema de conocimiento

2. **SIGUIENTE (Importante)**:
   - Fase 3: Distinción de tipos de producto
   - Fase 1.2: Personalidad mejorada
   - Fase 6: Base de conocimiento sólida

3. **DESPUÉS (Mejoras)**:
   - Fase 4: Dashboard funcional
   - Fase 2.2: PayPal dinámico
   - Fase 1.3: Herramientas avanzadas

---

## 📊 MÉTRICAS DE ÉXITO

- ✅ Tasa de conversión > 15%
- ✅ Tiempo de respuesta < 3 segundos
- ✅ Satisfacción del cliente > 4.5/5
- ✅ 0 errores en generación de links de pago
- ✅ 100% de productos con imágenes

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. Implementar MercadoPago dinámico
2. Mejorar personalidad del orquestador
3. Crear sistema de conocimiento dinámico
4. Hacer que el dashboard sea 100% funcional

¿Comenzamos con la implementación?
