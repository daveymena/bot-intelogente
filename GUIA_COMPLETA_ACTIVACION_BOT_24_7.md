# 🚀 GUÍA COMPLETA - ACTIVACIÓN BOT 24/7 CON IA

## ✅ SISTEMA INTEGRADO

El bot 24/7 ya está **completamente integrado** en el sistema de WhatsApp. Ahora el bot:

- ✅ Usa el orquestador 24/7 para todas las respuestas
- ✅ Tiene memoria de conversación (últimos 10 mensajes)
- ✅ Razona con Groq o respuestas entrenadas
- ✅ Envía fotos automáticamente cuando es relevante
- ✅ Mantiene contexto desde saludo hasta cierre de venta
- ✅ Fallback automático si algo falla

## 🔧 PASO 1: CONFIGURAR GROQ (OPCIONAL)

### Opción A: Con Groq (Recomendado - Respuestas Dinámicas)

1. **Obtén tu API Key:**
   - Ve a: https://console.groq.com/keys
   - Crea una cuenta (gratis)
   - Genera una API key
   - Copia la key (empieza con `gsk_...`)

2. **Configura en .env:**
   ```env
   GROQ_API_KEY=gsk_tu_api_key_aqui
   ```

### Opción B: Sin Groq (Solo Respuestas Entrenadas)

El bot ya funciona con 1,127 respuestas entrenadas. No necesitas hacer nada.

## 🎯 PASO 2: VERIFICAR SISTEMA

```bash
npx tsx scripts/verificar-sistema-24-7.ts
```

Esto verificará:
- ✅ Variables de entorno
- ✅ Base de datos
- ✅ Archivos de entrenamiento
- ✅ Servicios de IA

## 🚀 PASO 3: INICIAR EL BOT

```bash
# Si el servidor no está corriendo
npm run dev

# El servidor iniciará en http://127.0.0.1:4000
```

## 📱 PASO 4: CONECTAR WHATSAPP

1. Ve a: http://127.0.0.1:4000
2. Haz clic en "Conectar WhatsApp"
3. Escanea el código QR con tu WhatsApp
4. Espera a que diga "Conectado"

## 🧪 PASO 5: PROBAR EL BOT

### Prueba 1: Saludo Inicial

**Envía desde tu WhatsApp:**
```
Hola
```

**El bot debería responder:**
```
¡Hola! 👋 Bienvenido a Tecnovariedades D&S 😊

¿En qué puedo ayudarte hoy?

Tenemos:
💻 Laptops y computadores
🎹 Cursos digitales
🏍️ Motos
📦 Megapacks

¿Qué te interesa?
```

### Prueba 2: Búsqueda de Producto

**Envía:**
```
¿Tienes laptops?
```

**El bot debería:**
1. Detectar la intención de búsqueda
2. Buscar productos de laptops
3. Mostrar opciones disponibles
4. Preguntar cuál te interesa

### Prueba 3: Solicitud de Información

**Envía:**
```
Cuéntame más sobre la primera
```

**El bot debería:**
1. Recordar el contexto (laptops)
2. Mostrar detalles del primer producto
3. Enviar foto automáticamente
4. Preguntar si quieres comprar

### Prueba 4: Proceso de Compra

**Envía:**
```
Sí, quiero comprarla
```

**El bot debería:**
1. Confirmar el producto
2. Mostrar métodos de pago
3. Guiar el proceso de compra

### Prueba 5: Solicitud de Pago

**Envía:**
```
¿Cómo pago?
```

**El bot debería:**
1. Recordar el producto en contexto
2. Mostrar métodos de pago específicos
3. Dar instrucciones claras

## 📊 MONITOREAR EL BOT

### Ver Logs en Tiempo Real

Los logs aparecen automáticamente en la terminal donde corre `npm run dev`:

```
[Baileys] 📨 Mensaje procesado de +573001234567: Hola
[Baileys] 🎯 Usando SISTEMA 24/7 ENTRENADO
[Bot24/7] 🎯 Procesando mensaje: Hola
[Training24/7] ✅ Servicio inicializado
[Bot24/7] ✅ Respuesta generada con trained (confianza: 90%)
[Baileys] ✅ Respuesta enviada
```

### Verificar Memoria

El bot mantiene memoria de los últimos 10 mensajes. Puedes verificar que recuerda el contexto:

```
Usuario: "¿Tienes laptops?"
Bot: [Muestra laptops]

Usuario: "La primera"
Bot: [Recuerda que hablaban de laptops, muestra la primera]

Usuario: "¿Cuánto cuesta?"
Bot: [Recuerda el producto específico, da el precio]
```

## 🎭 FLUJO COMPLETO DE CONVERSACIÓN

### Ejemplo Real:

```
👤 Usuario: Hola
🤖 Bot: ¡Hola! 👋 Bienvenido a Tecnovariedades D&S 😊
      ¿En qué puedo ayudarte hoy?

👤 Usuario: ¿Tienes laptops?
🤖 Bot: ¡Claro! 😊 Tengo varias opciones de laptops.
      ¿Qué tipo buscas? ¿Para trabajo, estudio o gaming?

👤 Usuario: Para trabajo
🤖 Bot: Perfecto, te recomiendo estas opciones:
      
      1️⃣ Laptop HP 15-dy2795wm
         💰 $2.500.000 COP
         ⚡ Intel Core i5
      
      2️⃣ Laptop Dell Inspiron 15
         💰 $2.200.000 COP
         ⚡ AMD Ryzen 5
      
      ¿Cuál te interesa?

👤 Usuario: La HP
🤖 Bot: [Envía foto automáticamente]
      
      ¡Excelente elección! 🚀
      
      La Laptop HP 15-dy2795wm tiene:
      ⚡ Intel Core i5 (11ª Gen)
      💾 8GB RAM + 256GB SSD
      🖥️ Pantalla 15.6" Full HD
      
      💰 Precio: $2.500.000 COP
      
      ¿Te gustaría comprarla?

👤 Usuario: Sí
🤖 Bot: ¡Excelente! 🎉
      
      📦 Laptop HP 15-dy2795wm
      💰 Precio: $2.500.000 COP
      
      💳 Métodos de pago:
      💚 Nequi
      💙 Daviplata
      💳 Tarjeta de crédito
      
      ¿Cuál prefieres?

👤 Usuario: Nequi
🤖 Bot: ¡Perfecto! 📱
      
      💚 NEQUI
      Número: 3042748687
      Valor: $2.500.000 COP
      
      📋 Pasos:
      1️⃣ Abre tu app de Nequi
      2️⃣ Envía el dinero al número
      3️⃣ Envíame el comprobante
      
      ¿Necesitas ayuda?
```

## 🔍 VERIFICAR QUE TODO FUNCIONA

### Checklist de Funcionalidades:

- [ ] **Saludo**: Bot responde al "Hola"
- [ ] **Búsqueda**: Bot encuentra productos cuando preguntas
- [ ] **Memoria**: Bot recuerda el contexto de la conversación
- [ ] **Fotos**: Bot envía fotos automáticamente
- [ ] **Detalles**: Bot da información específica de productos
- [ ] **Compra**: Bot guía el proceso de compra
- [ ] **Pago**: Bot muestra métodos de pago
- [ ] **Razonamiento**: Bot entiende preguntas variadas
- [ ] **Coherencia**: Bot mantiene conversación lógica
- [ ] **Cierre**: Bot cierra la venta correctamente

## 📈 MÉTRICAS A OBSERVAR

### En los Logs:

```
[Bot24/7] 🎯 Procesando mensaje: [mensaje del usuario]
[Bot24/7] ✅ Respuesta generada con [provider] (confianza: [%])
```

- **Provider**: `trained` (respuestas entrenadas) o `groq` (IA dinámica)
- **Confianza**: 50-100% (mientras más alto, mejor)

### Comportamiento Esperado:

- ✅ Respuestas en < 3 segundos
- ✅ Confianza > 70%
- ✅ Memoria funcional (recuerda contexto)
- ✅ Fotos enviadas cuando relevante
- ✅ Flujo coherente de conversación

## 🐛 SOLUCIÓN DE PROBLEMAS

### Bot no responde

```bash
# 1. Verificar que WhatsApp esté conectado
# En el dashboard debe decir "Conectado"

# 2. Revisar logs
# Busca errores en la terminal donde corre npm run dev

# 3. Verificar entrenamiento
npx tsx scripts/verificar-sistema-24-7.ts
```

### Bot responde pero sin coherencia

```bash
# Reentrenar el bot
npx tsx scripts/entrenar-bot-24-7-completo.ts

# Reiniciar servidor
Ctrl+C
npm run dev
```

### Bot no envía fotos

```bash
# Verificar que los productos tengan imágenes
# En el dashboard: Products → Ver que tengan fotos

# Verificar configuración
# En .env debe estar:
ENABLE_PHOTO_SENDING=true
```

### Bot no recuerda contexto

```bash
# Verificar que la base de datos esté funcionando
# Los mensajes deben guardarse en la tabla "messages"

# Reiniciar servidor
Ctrl+C
npm run dev
```

## 🎯 CONFIGURACIÓN AVANZADA

### Ajustar Memoria (Cantidad de Mensajes)

En `src/lib/baileys-stable-service.ts` línea ~425:

```typescript
const historyMessages = await db.message.findMany({
  where: { conversationId: conversation.id },
  orderBy: { createdAt: 'desc' },
  take: 10  // Cambiar este número (5-20 recomendado)
})
```

### Ajustar Confianza Mínima

En `src/lib/bot-24-7-orchestrator.ts` línea ~35:

```typescript
if (trainedResponse && trainedResponse.confidence > 0.85) {
  // Cambiar 0.85 a 0.7 para usar más respuestas entrenadas
  // o a 0.95 para ser más selectivo
}
```

### Forzar Uso de Groq

En `src/lib/bot-24-7-orchestrator.ts` línea ~60:

```typescript
const useOllama = false  // Siempre usar Groq
```

## 📊 ESTADÍSTICAS DEL SISTEMA

```
✅ Entrenamiento: 1,127 ejemplos
✅ Intenciones: 13 tipos detectados
✅ Tonos: 2 (friendly, professional)
✅ Fotos: 732 ejemplos (65%)
✅ Memoria: Últimos 10 mensajes
✅ Fallback: Automático
✅ Providers: Groq + Entrenado
```

## 🎉 ¡LISTO!

El bot está completamente integrado y funcionando. Ahora:

1. ✅ Mantiene memoria de conversación
2. ✅ Razona con IA o respuestas entrenadas
3. ✅ Envía fotos automáticamente
4. ✅ Guía desde saludo hasta cierre de venta
5. ✅ Se adapta al contexto
6. ✅ Tiene fallback automático

**Para empezar a probar:**

```bash
# 1. Asegúrate de que el servidor esté corriendo
npm run dev

# 2. Conecta WhatsApp en http://127.0.0.1:4000

# 3. Envía un mensaje de prueba desde tu WhatsApp

# 4. Observa los logs y la respuesta del bot
```

**¡El bot está listo para atender clientes 24/7! 🚀**
