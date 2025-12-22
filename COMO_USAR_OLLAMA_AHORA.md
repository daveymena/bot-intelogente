# 🚀 CÓMO USAR OLLAMA AHORA

**Guía rápida para empezar a vender con Ollama**

---

## ⚡ INICIO RÁPIDO (3 pasos)

### 1. Verificar que Ollama funciona
```bash
probar-ollama-completo.bat
```

**Debe mostrar**:
- ✅ Conexión exitosa
- ✅ Modelos disponibles
- ✅ Respuesta generada
- ✅ Formato CARD
- ✅ Velocidad aceptable

### 2. Iniciar el bot
```bash
INICIAR_OLLAMA_AHORA.bat
```

**O manualmente**:
```bash
npm run dev
```

### 3. Conectar WhatsApp
1. Abrir http://localhost:3000
2. Ir a "Conexión WhatsApp"
3. Escanear QR con tu teléfono
4. Esperar "Conectado ✅"

**¡Listo! Ya puedes recibir mensajes** 🎉

---

## 💬 EJEMPLOS DE CONVERSACIÓN

### Ejemplo 1: Búsqueda de laptop

**Cliente**: "Hola, busco una laptop para trabajar"

**Bot responde con CARD**:
```
🎯 💻 Laptop HP 15-fd0033la
💰 Precio: $1.899.000 COP

📘 Incluye:
✅ Intel Core i5 (12va Gen)
✅ 8GB RAM DDR4
✅ 256GB SSD NVMe
✅ Pantalla 15.6" Full HD
✅ Windows 11 Pro

🧠 AIDA:
✨ Atención: ¡Perfecta para trabajo profesional!
🔥 Interés: Procesador potente + SSD rápido = productividad máxima
⭐ Deseo: Nuestros clientes reportan 50% más de velocidad
👉 Acción: ¿Te gustaría ver fotos reales del equipo?

💬 ¿Qué tipo de trabajo realizas? Así confirmo que es ideal para ti 😊
```

**Cliente**: "Sí, muéstrame fotos"

**Bot**: [Envía fotos automáticamente] + "Aquí están las fotos reales..."

**Cliente**: "¿Cómo pago?"

**Bot**: [Genera links de pago] + "Puedes pagar con..."

---

### Ejemplo 2: Curso digital

**Cliente**: "Quiero aprender piano"

**Bot responde con CARD**:
```
🎯 🎹 Curso Completo de Piano
💰 Precio: $49.000 COP

📘 Incluye:
✅ 50+ lecciones en video HD
✅ Partituras descargables
✅ Ejercicios prácticos
✅ Acceso de por vida
✅ Certificado al finalizar

🔗 [Link de compra Hotmart]

🧠 AIDA:
✨ Atención: ¡Aprende piano desde cero en 30 días!
🔥 Interés: Método probado con +5,000 estudiantes exitosos
⭐ Deseo: "Logré tocar mi primera canción en 2 semanas" - María G.
👉 Acción: ¿Quieres empezar hoy mismo?

💬 ¿Tienes experiencia previa o empiezas desde cero? 🎵
```

---

### Ejemplo 3: Saludo inicial

**Cliente**: "Hola"

**Bot** (respuesta local, sin IA):
```
¡Hola! 👋 Bienvenido a Tecnovariedades D&S

Somos expertos en:
💻 Laptops y computadores
🏍️ Motos
🎓 Cursos digitales
📦 Megapacks educativos

¿En qué puedo ayudarte hoy? 😊
```

---

## 🎯 CARACTERÍSTICAS ACTIVAS

### ✅ Formato CARD
Cada producto se presenta con:
- Emoji + nombre
- Precio en COP
- Características con ✅
- Link de compra
- AIDA completo
- Pregunta de cierre

### ✅ AIDA Integrado
Cada respuesta incluye:
- **Atención**: Gancho inicial
- **Interés**: Beneficio principal
- **Deseo**: Prueba social
- **Acción**: Pregunta de cierre

### ✅ Memoria Conversacional
- Recuerda toda la conversación (24h)
- Mantiene contexto de productos
- Sabe qué preguntaste antes
- No repite información

### ✅ Fotos Automáticas
- Detecta cuando piden fotos
- Envía todas las fotos del producto
- Con captions personalizados
- Formato profesional

### ✅ Saludos Dinámicos
- Variaciones naturales
- Sin patrones repetitivos
- Simulación humana
- Anti-ban

### ✅ Links de Pago
- Genera links automáticamente
- MercadoPago, PayPal, Hotmart
- Según el producto
- Con instrucciones claras

---

## 🔧 AJUSTES RÁPIDOS

### Cambiar creatividad de respuestas

**Más creativo** (respuestas variadas):
```env
# En .env, agregar:
OLLAMA_TEMPERATURE=0.9
```

**Más preciso** (respuestas consistentes):
```env
OLLAMA_TEMPERATURE=0.5
```

**Balanceado** (recomendado):
```env
OLLAMA_TEMPERATURE=0.7  # Ya está así
```

---

### Cambiar longitud de respuestas

**Respuestas cortas**:
```env
OLLAMA_MAX_TOKENS=500
```

**Respuestas completas** (recomendado):
```env
OLLAMA_MAX_TOKENS=800  # Ya está así
```

**Respuestas muy detalladas**:
```env
OLLAMA_MAX_TOKENS=1200
```

---

### Cambiar timeout

**Más rápido** (puede fallar si Ollama es lento):
```env
OLLAMA_TIMEOUT=120000  # 2 minutos
```

**Balanceado** (recomendado):
```env
OLLAMA_TIMEOUT=180000  # 3 minutos (ya está así)
```

**Más tolerante**:
```env
OLLAMA_TIMEOUT=300000  # 5 minutos
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "Ollama no responde"

**Verificar**:
```bash
# 1. Verificar que Ollama esté corriendo
curl https://ollama-ollama.ginee6.easypanel.host/api/tags

# 2. Debe responder con lista de modelos
# Si no responde, Ollama está caído
```

**Solución temporal**:
```env
# Desactivar Ollama temporalmente
USE_OLLAMA=false

# El sistema usará Groq automáticamente
```

---

### Problema: "Respuestas muy lentas"

**Solución 1**: Reducir tokens
```env
OLLAMA_MAX_TOKENS=500
```

**Solución 2**: Usar Groq temporalmente
```env
USE_OLLAMA=false
```

**Solución 3**: Verificar carga del servidor
```bash
# Si Ollama está en Easypanel, verificar recursos
# Puede estar sobrecargado
```

---

### Problema: "No usa formato CARD"

**Verificar**:
1. ¿Está usando `ollamaClient.ts`?
2. ¿El prompt del sistema está correcto?
3. ¿Ollama está respondiendo?

**Solución**:
```bash
# Reiniciar servidor
Ctrl+C
npm run dev
```

---

### Problema: "No envía fotos"

**Verificar**:
1. ¿El producto tiene fotos en la BD?
2. ¿Las URLs son válidas?
3. ¿WhatsApp está conectado?

**Solución**:
```bash
# Verificar fotos de un producto
node ver-curso-piano.js

# Debe mostrar URLs de fotos
```

---

## 📊 MONITOREO

### Ver logs en tiempo real

**En la consola donde corre el bot**:
```
[Ollama] 🤖 Enviando a gemma2:2b...
[Ollama] ✅ Respuesta recibida (543 chars)
[Conversación] Cliente: +573001234567
[Conversación] Intención: busqueda_producto
[Fotos] 📸 Enviando 3 fotos del producto...
[Fotos] ✅ Fotos enviadas exitosamente
```

### Verificar estado de Ollama

```bash
# Ejecutar test
probar-ollama-completo.bat

# Debe mostrar:
# ✅ Conexión exitosa
# ✅ Modelos disponibles
# ✅ Respuesta generada
# ⚡ Velocidad: BUENA
```

---

## 🎯 MEJORES PRÁCTICAS

### 1. Mantener conversaciones naturales
- Ollama mantiene el contexto automáticamente
- No necesitas repetir información
- Haz preguntas de seguimiento

### 2. Usar formato CARD siempre
- Ollama lo aplica automáticamente
- Hace las respuestas más profesionales
- Aumenta conversiones

### 3. Aplicar AIDA en cada respuesta
- Ollama lo integra automáticamente
- Guía al cliente hacia la compra
- Maneja objeciones

### 4. Enviar fotos cuando las pidan
- El sistema lo detecta automáticamente
- Envía todas las fotos disponibles
- Con captions profesionales

### 5. Generar links de pago al final
- Cuando el cliente muestra interés
- Con instrucciones claras
- Múltiples opciones de pago

---

## 📈 MÉTRICAS DE ÉXITO

### Indicadores de que funciona bien:

✅ **Respuestas rápidas** (< 10 segundos)  
✅ **Formato CARD consistente**  
✅ **AIDA en cada respuesta**  
✅ **Fotos enviadas automáticamente**  
✅ **Contexto mantenido**  
✅ **Links de pago generados**  
✅ **Conversiones aumentando**

---

## 🚀 PRÓXIMOS PASOS

### Opcional: Personalizar prompts
Si quieres ajustar el estilo:
1. Editar `src/conversational-module/ai/ollamaClient.ts`
2. Modificar `construirPromptVendedorProfesional()`
3. Ajustar tono y ejemplos

### Opcional: Agregar más productos
```bash
# Importar productos desde CSV/JSON
npm run import:products
```

### Opcional: Entrenar con ejemplos
Agregar más ejemplos de conversaciones exitosas en el prompt.

---

## ✅ CHECKLIST DIARIO

Antes de empezar a vender:

- [ ] Verificar Ollama: `probar-ollama-completo.bat`
- [ ] Iniciar bot: `INICIAR_OLLAMA_AHORA.bat`
- [ ] Conectar WhatsApp (escanear QR)
- [ ] Verificar conexión (debe decir "Conectado ✅")
- [ ] Enviar mensaje de prueba a tu número
- [ ] Verificar que responde con formato CARD
- [ ] Verificar que envía fotos
- [ ] Verificar que genera links de pago

**¡Listo para vender! 🎉**

---

## 📞 SOPORTE

Si algo no funciona:

1. **Verificar logs** en la consola
2. **Ejecutar test**: `probar-ollama-completo.bat`
3. **Revisar .env**: `USE_OLLAMA=true`
4. **Reiniciar servidor**: Ctrl+C y `npm run dev`
5. **Usar Groq temporalmente**: `USE_OLLAMA=false`

---

## 🎉 ¡ÉXITO!

Ahora tienes un sistema completo de ventas por WhatsApp con:

- ✅ IA sin costos (Ollama)
- ✅ Formato profesional (CARD)
- ✅ Técnicas de venta (AIDA)
- ✅ Memoria conversacional
- ✅ Fotos automáticas
- ✅ Links de pago
- ✅ Disponibilidad 24/7

**¡A vender! 🚀💰**
