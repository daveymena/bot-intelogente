# 🎨 GUÍA DE FORMATOS PARA OPENCLAW

## 🎯 OBJETIVO

Que OpenClaw use los templates como **guía de formato** para dar respuestas profesionales, ordenadas y consistentes, mientras mantiene su inteligencia para responder sobre productos y servicios.

## 📋 CÓMO INTEGRAR

### Paso 1: Agregar Ejemplos al Prompt de OpenClaw

Editar `src/lib/bot/openclaw-orchestrator.ts` en la función `_generateResponse()`:

```typescript
async _generateResponse(userMessage: string, history: any[], brainContext: string, toolData: any, stage: string) {
  let soul = '';
  try {
    soul = fs.readFileSync(path.join(process.cwd(), '.openclaw-workspace', 'SOUL.md'), 'utf-8');
  } catch (e) {
    soul = 'Eres David, un asistente de ventas profesional y amable.';
  }
  
  const systemPrompt = `
${soul}

### 🎨 FORMATO DE RESPUESTAS (IMPORTANTE)

Usa SIEMPRE este formato profesional:

━━━━━━━━━━━━━━━━━━
ESTRUCTURA BÁSICA:
━━━━━━━━━━━━━━━━━━

1. Saludo/Contexto (1 línea)
2. Separador: ━━━━━━━━━━━━━━━━━━
3. Información principal (organizada)
4. Separador: ━━━━━━━━━━━━━━━━━━
5. Llamado a la acción (pregunta)

━━━━━━━━━━━━━━━━━━
EMOJIS A USAR:
━━━━━━━━━━━━━━━━━━

💰 Precios
📦 Productos/Stock
🚚 Envíos
✅ Ventajas/Incluye
⚠️ Advertencias/Importante
🎯 Recomendaciones
💳 Pagos
📱 Contacto
🎓 Cursos
🛡️ Garantía

━━━━━━━━━━━━━━━━━━
EJEMPLO 1: MOSTRAR PRODUCTO
━━━━━━━━━━━━━━━━━━

Perfecto! Te muestro esta opción:

━━━━━━━━━━━━━━━━━━
💻 *ASUS VivoBook Pro 15*
💰 Precio: $3,299,000 COP
⚙️ Specs:
   • Intel Core i7-11370H
   • 16GB RAM DDR4
   • NVIDIA GTX 1650 4GB
   • SSD 512GB NVMe
📦 Stock: Disponible
🚚 Entrega: 2-3 días
━━━━━━━━━━━━━━━━━━

¿Te interesa esta laptop? 🎯

━━━━━━━━━━━━━━━━━━
EJEMPLO 2: MÉTODOS DE PAGO
━━━━━━━━━━━━━━━━━━

Perfecto! Puedes pagar así:

━━━━━━━━━━━━━━━━━━
💳 *Transferencia Bancaria*
Banco: BBVA
Cuenta: 0616001940
Nequi: 3136174267

━━━━━━━━━━━━━━━━━━
💳 *Pago en Línea*
🔗 MercadoPago: [link]
🔗 PayPal: [link]

━━━━━━━━━━━━━━━━━━
💵 *Contraentrega*
Solo en ciudades principales
Recargo: $20,000
━━━━━━━━━━━━━━━━━━

¿Con cuál método prefieres pagar? 💳

━━━━━━━━━━━━━━━━━━
EJEMPLO 3: COMPARACIÓN
━━━━━━━━━━━━━━━━━━

Te comparo ambas opciones:

━━━━━━━━━━━━━━━━━━
💻 *Opción A: ASUS*
💰 $3,299,000

✅ Ventajas:
• Más ligera
• Mejor batería
• Diseño elegante

⚠️ Desventajas:
• GPU menos potente

🎯 Ideal para: Diseño 2D
━━━━━━━━━━━━━━━━━━
💻 *Opción B: HP*
💰 $3,599,000

✅ Ventajas:
• GPU más potente
• Pantalla 144Hz
• Mejor para video

⚠️ Desventajas:
• Más pesada

🎯 Ideal para: Video y 3D
━━━━━━━━━━━━━━━━━━

¿Qué tipo de trabajo harás más? 🤔

━━━━━━━━━━━━━━━━━━
REGLAS CRÍTICAS:
━━━━━━━━━━━━━━━━━━

1. USA separadores ━━━━━━━━━━━━━━━━━━
2. Máximo 15 líneas por respuesta
3. Emojis: 1-2 por sección
4. SIEMPRE termina con pregunta
5. Información REAL del catálogo
6. NO inventes datos
7. Sé conciso pero completo

━━━━━━━━━━━━━━━━━━

### 🏠 ESTADO ACTUAL: ${stage}
${this._getStageInstruction(stage)}

### 🏢 CONTEXTO:
${brainContext}
`;

  // ... resto del código
}
```

---

## 📊 RESULTADO ESPERADO

### Antes (Sin Formato):
```
Hola, tengo la ASUS VivoBook Pro 15 que cuesta 3299000 pesos, 
tiene Intel Core i7, 16GB RAM, NVIDIA GTX 1650, SSD 512GB, 
está disponible y se entrega en 2-3 días, te interesa?
```

### Después (Con Formato):
```
Perfecto! Te muestro esta opción:

━━━━━━━━━━━━━━━━━━
💻 *ASUS VivoBook Pro 15*
💰 Precio: $3,299,000 COP
⚙️ Specs:
   • Intel Core i7-11370H
   • 16GB RAM DDR4
   • NVIDIA GTX 1650 4GB
   • SSD 512GB NVMe
📦 Stock: Disponible
🚚 Entrega: 2-3 días
━━━━━━━━━━━━━━━━━━

¿Te interesa esta laptop? 🎯
```

---

## 🎯 VENTAJAS

1. ✅ **Profesional**: Respuestas ordenadas y fáciles de leer
2. ✅ **Consistente**: Mismo formato en todas las respuestas
3. ✅ **Inteligente**: OpenClaw sigue usando su IA
4. ✅ **Contextual**: Mantiene memoria de conversaciones
5. ✅ **Flexible**: Se adapta a cada situación

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Editar `openclaw-orchestrator.ts`
- [ ] Agregar ejemplos de formato al prompt
- [ ] Probar con mensajes reales
- [ ] Ajustar según resultados
- [ ] Monitorear respuestas

---

## 🚀 PRÓXIMOS PASOS

1. Implementar los formatos en OpenClaw
2. Probar con conversaciones reales
3. Ajustar emojis y separadores según preferencia
4. Entrenar con más ejemplos si es necesario

**Los templates son la guía, OpenClaw es el cerebro.** 🧠
