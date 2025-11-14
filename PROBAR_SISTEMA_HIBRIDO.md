# 🧪 Probar Sistema Híbrido Inteligente

## 🚀 Inicio Rápido

### 1. Ejecutar Pruebas

```bash
npx tsx scripts/test-sistema-hibrido.ts
```

Esto probará:
- ✅ Respuestas directas (sin IA)
- ✅ Casos que deben usar Groq
- ✅ Mantenimiento de historial
- ✅ Limpieza automática

---

## 📱 Probar con WhatsApp Real

### 1. Iniciar el Bot

```bash
npm run dev
```

### 2. Conectar WhatsApp

1. Ir a: http://localhost:4000
2. Hacer login
3. Conectar WhatsApp (escanear QR)

### 3. Enviar Mensajes de Prueba

#### Respuestas Directas (Sin IA) ⚡

Estos deben responder **instantáneamente**:

```
Tú: "Hola"
Bot: 👋 ¡Hola! Bienvenido a Tecnovariedades D&S...

Tú: "Gracias"
Bot: 😊 ¡Con gusto! Estoy aquí para ayudarte

Tú: "Cuál es el horario"
Bot: 🕐 Horario de Atención...

Tú: "Dónde están ubicados"
Bot: 📍 Ubicación...

Tú: "Hacen envíos"
Bot: 🚚 Información de Envíos...

Tú: "Tienen garantía"
Bot: 🛡️ Garantía y Devoluciones...
```

#### Respuestas con Groq (IA) 🤖

Estos deben usar IA (toman 1-2 segundos):

```
Tú: "Busco una laptop para diseño gráfico"
Bot: [Respuesta inteligente con recomendaciones]

Tú: "Qué motos tienes disponibles"
Bot: [Lista de motos con detalles]

Tú: "Más información sobre este producto"
Bot: [Información detallada del producto en contexto]

Tú: "Cómo puedo pagar"
Bot: [Métodos de pago disponibles]
```

#### Solicitudes de Fotos/Links 📸

```
Tú: "Me envías fotos"
Bot: [Envía fotos del producto del contexto]

Tú: "Dame el link de pago"
Bot: [Genera y envía links de pago dinámicos]
```

---

## 🔍 Verificar Historial

### En los Logs

Busca estas líneas en la consola:

```
[Baileys] 📚 Historial cargado: X mensajes
[Baileys] 📚 Historial actualizado: X pares de mensajes
```

### Probar Contexto

Envía esta secuencia:

```
1. Tú: "Busco una laptop"
   Bot: [Muestra laptops]

2. Tú: "Cuál es mejor"
   Bot: [Recomienda una específica - USA CONTEXTO]

3. Tú: "Me envías fotos"
   Bot: [Envía fotos de la laptop recomendada - USA CONTEXTO]

4. Tú: "Cuánto cuesta"
   Bot: [Dice el precio - USA CONTEXTO]

5. Tú: "Dame el link de pago"
   Bot: [Genera link - USA CONTEXTO]
```

El bot debe **recordar** de qué producto estás hablando sin que lo repitas.

---

## 📊 Verificar Rendimiento

### Tiempos Esperados

| Tipo de Respuesta | Tiempo Esperado |
|-------------------|-----------------|
| Respuesta Directa | < 100ms |
| Fotos/Links | 500-1000ms |
| Groq (IA) | 1000-2000ms |

### En los Logs

Busca:

```
[Baileys] ⚡ Respuesta directa sin IA (saludo, gracias, horario, etc.)
[Baileys] ✅ Respuesta directa enviada

[Baileys] 🤖 Usando Groq para respuesta compleja
[Baileys] ✅ Respuesta conversacional generada con Groq
```

---

## 🐛 Debugging

### Si las Respuestas Directas No Funcionan

1. Verificar que `DirectResponseHandler` esté importado:
   ```typescript
   const { DirectResponseHandler } = await import('./direct-response-handler')
   ```

2. Verificar logs:
   ```
   [Baileys] ⚡ Respuesta directa sin IA
   ```

3. Si no aparece, el mensaje no está siendo detectado como simple

### Si el Historial No Se Mantiene

1. Verificar que se actualiza después de cada mensaje:
   ```
   [Baileys] 📚 Historial actualizado: X pares de mensajes
   ```

2. Verificar que no excede 20 entradas (10 pares)

3. Verificar que se carga desde BD:
   ```
   [Baileys] 📚 Historial cargado: X mensajes
   ```

### Si Groq No Responde

1. Verificar API key en `.env`:
   ```env
   GROQ_API_KEY=tu_api_key
   GROQ_MODEL=llama-3.1-8b-instant
   ```

2. Verificar logs de error:
   ```
   [Baileys] ❌ Error en respuesta conversacional
   ```

---

## 📈 Métricas a Monitorear

### Durante las Pruebas

1. **Distribución de respuestas**:
   - ¿Cuántas son directas?
   - ¿Cuántas usan Groq?
   - ¿Cuántas son fotos/links?

2. **Tiempos de respuesta**:
   - ¿Las directas son instantáneas?
   - ¿Groq responde en < 2 segundos?

3. **Contexto**:
   - ¿El bot recuerda el producto?
   - ¿No pregunta lo mismo dos veces?

4. **Errores**:
   - ¿Hay fallbacks?
   - ¿Se recupera de errores?

---

## ✅ Checklist de Pruebas

### Respuestas Directas

- [ ] Saludo funciona
- [ ] Agradecimiento funciona
- [ ] Confirmación funciona
- [ ] Despedida funciona
- [ ] Horario funciona
- [ ] Ubicación funciona
- [ ] Envíos funciona
- [ ] Garantía funciona

### Respuestas con Groq

- [ ] Consulta de productos funciona
- [ ] Recomendaciones funcionan
- [ ] Información detallada funciona
- [ ] Métodos de pago funcionan

### Historial

- [ ] Se carga desde BD (10 mensajes)
- [ ] Se actualiza después de cada mensaje
- [ ] Se limpia automáticamente (máx 20 entradas)
- [ ] El bot recuerda el contexto

### Fotos y Links

- [ ] Detecta solicitud de fotos
- [ ] Envía fotos del producto en contexto
- [ ] Detecta solicitud de links
- [ ] Genera links de pago dinámicos

---

## 🎯 Casos de Prueba Completos

### Caso 1: Cliente Nuevo

```
Cliente: "Hola"
Bot: [Respuesta directa - saludo]

Cliente: "Busco una laptop para diseño"
Bot: [Groq - recomendaciones]

Cliente: "Me envías fotos de la primera"
Bot: [Fotos automáticas]

Cliente: "Cuánto cuesta"
Bot: [Groq - precio con contexto]

Cliente: "Dame el link de pago"
Bot: [Link dinámico]

Cliente: "Gracias"
Bot: [Respuesta directa - agradecimiento]
```

### Caso 2: Consulta Rápida

```
Cliente: "Tienen motos"
Bot: [Groq - lista de motos]

Cliente: "Cuál es el horario"
Bot: [Respuesta directa - horario]

Cliente: "Chao"
Bot: [Respuesta directa - despedida]
```

### Caso 3: Información General

```
Cliente: "Dónde están ubicados"
Bot: [Respuesta directa - ubicación]

Cliente: "Hacen envíos"
Bot: [Respuesta directa - envíos]

Cliente: "Tienen garantía"
Bot: [Respuesta directa - garantía]
```

---

## 🚀 Resultado Esperado

Después de las pruebas, deberías ver:

✅ **Respuestas instantáneas** para preguntas simples  
✅ **Respuestas inteligentes** para consultas complejas  
✅ **Contexto mantenido** durante toda la conversación  
✅ **Fotos y links** enviados automáticamente cuando se solicitan  
✅ **Sin errores** ni timeouts  

---

## 📝 Notas

- Las respuestas directas **no consumen** tokens de Groq
- El historial se mantiene **en memoria** durante la sesión
- El historial se guarda **en BD** para análisis posterior
- El sistema es **escalable** y puede manejar múltiples conversaciones

---

## 🎉 ¡Listo!

El sistema híbrido está funcionando correctamente si:

1. ✅ Respuestas directas son instantáneas
2. ✅ Groq responde inteligentemente
3. ✅ El historial se mantiene
4. ✅ El bot recuerda el contexto
5. ✅ Fotos y links se envían automáticamente

**¡Tu bot ahora es más rápido, más inteligente y más económico!** 🚀
