# Probar Corrección Bot Local Simplificado

## ✅ Cambios Aplicados

1. **Error `userId is not defined`** → CORREGIDO
2. **Respuestas muy largas** → SIMPLIFICADAS (150 tokens máximo)
3. **Prompts complejos** → MINIMALISTAS
4. **Generación de pagos** → DIRECTA (sin IA intermedia)

## 🚀 Cómo Probar

### 1. Reiniciar el servidor
```bash
# Detener el servidor actual (Ctrl+C)
npm run dev
```

### 2. Conectar WhatsApp
Escanea el QR desde el dashboard: http://127.0.0.1:4000

### 3. Probar Conversación Simple

**Prueba 1: Búsqueda de producto**
```
Cliente: "Curso de piano"

Esperado (CORTO):
✅ *Curso Completo de Piano Online*

💰 Precio: 150,000 COP
📲 Entrega digital inmediata

¿Quieres comprarlo? Te genero el link de pago 🔗
```

**Prueba 2: Solicitud de pago**
```
Cliente: "Sí quiero comprar"

Esperado:
¡Perfecto! Te genero el link de pago para *Curso Completo de Piano Online*

💰 Total: 150,000 COP

⏳ Un momento...

[Luego el sistema envía los links automáticamente]
```

## 📊 Logs Esperados

### Cuando busca producto:
```
[Conversación] Usuario: 6988129931330@lid, Mensaje: Curso de piano
[Conversación] Intención detectada: busqueda_producto
[Conversación] 🤖 Requiere IA para respuesta compleja
[BuscarProductos] Palabras clave: [ 'curso', 'piano' ]
[BuscarProductos] Encontrados: 10
[BuscarProductos] Mejor match: Curso Completo de Piano Online Score: 8
[BuscarProductos] ✅ Match específico detectado - Devolviendo solo 1 producto
[Conversación] ✅ Producto guardado en contexto para pagos: Curso... (cmhpw941q0000kmp85qvjm0o5:6988129931330@lid)
[Conversación] 🤖 Producto requiere IA
[DirigirFlujo] Producto: Curso Completo de Piano Online, Tipo: digital
[DirigirFlujo] ✅ Usando flujo DIGITAL
[Conversación] Respuesta generada: ✅ *Curso Completo de Piano Online*...
[Baileys] ✅ Respuesta enviada
```

### Cuando solicita pago:
```
[Baileys] 💳 Solicitud de pago detectada
[Context] ✅ Contexto encontrado: Curso Completo de Piano Online
[Baileys] ✅ Producto en contexto: Curso Completo de Piano Online
[BotPaymentLinkGenerator] Generando links...
[Baileys] ✅ Links de pago generados exitosamente
```

## ⚠️ Si Algo Falla

### Problema: Respuestas siguen siendo largas
**Solución**: Verificar que `flujoDigital.ts` esté usando `construirPromptDigitalSimple`

### Problema: Error "No hay contexto para generar pago"
**Logs a revisar**:
```
[Conversación] ✅ Producto guardado en contexto para pagos: ... (CLAVE_1)
[Baileys] 💳 Solicitud de pago detectada
[Context] ❌ No hay contexto para CLAVE_2
```

Si CLAVE_1 ≠ CLAVE_2, hay que ajustar la lógica de guardado.

### Problema: Error `userId is not defined`
**Estado**: ✅ YA CORREGIDO en línea 233 de `conversacionController.ts`

## 📝 Comparación Antes/Después

### ANTES (Respuesta larga - 15 líneas):
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  *Curso Completo de Piano Online* 🎓
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📚 *QUÉ INCLUYE:*
• Módulo 1: Formación Musical Académica
• Módulo 2: Técnica y Práctica
• Módulo 3: Repertorio Clásico
• Bonus: Partituras digitales

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 *PRECIO:*
150,000 COP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ *DISPONIBILIDAD Y ENTREGA:*
💎  Siempre disponible (stock ilimitado)
📲 Entrega AUTOMÁTICA por WhatsApp/Email
⚡ Acceso instantáneo después del pago
🚀 Sin esperas ni trámites adicionales

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 *MÉTODOS DE PAGO:*
• 💳 MercadoPago (link de pago)
• 💰 PayPal (link de pago)
• 📱 Nequi
• 💵 Daviplata
• 🏦 Transferencia bancaria

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ¿Te gustaría proceder con la compra?
Puedo generarte el link de pago ahora mismo 😊
```

### DESPUÉS (Respuesta corta - 4 líneas):
```
✅ *Curso Completo de Piano Online*

💰 Precio: 150,000 COP
📲 Entrega digital inmediata

¿Quieres comprarlo? Te genero el link de pago 🔗
```

## ✅ Checklist de Verificación

- [ ] Servidor reiniciado
- [ ] WhatsApp conectado
- [ ] Respuesta a "curso de piano" es CORTA (4 líneas)
- [ ] Respuesta a "quiero comprar" genera link de pago
- [ ] No hay error `userId is not defined` en consola
- [ ] Contexto se guarda correctamente
- [ ] Links de pago se generan automáticamente

## 🎯 Resultado Final Esperado

El bot debe ser:
- ✅ **Directo**: Responde en 3-4 líneas
- ✅ **Claro**: Información esencial solamente
- ✅ **Rápido**: Genera links de pago inmediatamente
- ✅ **Sin errores**: No más `userId is not defined`
- ✅ **Funcional**: Contexto se guarda y recupera correctamente
