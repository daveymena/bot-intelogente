# README — Integración del Módulo Conversacional para Kiro

**Propósito**
Este README explica paso a paso cómo integrar el **Módulo Conversacional Smart Sales Bot Pro** (detección de intención, flujos por tipo de producto y wrapper de IA) dentro del repositorio `bot-intelogente`. Está escrito para que **Kiro** lo lea e implemente rápidamente.

---

## Requisitos previos
- Node.js 18+
- npm o yarn
- Base de datos (Postgres recomendado; el proyecto usa Prisma — ajustar según tu stack)
- Acceso a las claves de IA (GROQ / Ollama, OpenAI opcional)
- Acceso a PayPal / MercadoPago si se desea probar pagos

---

## Estructura de archivos que se entrega
Crea la carpeta `src/conversational-module/` y copia dentro los siguientes archivos (ya incluidos en este paquete):

```
src/conversational-module/
├── ai/
│   ├── groqClient.js
│   ├── promptBuilder.js
│   └── conversacionController.js
├── flows/
│   ├── flujoFisico.js
│   ├── flujoDropshipping.js
│   ├── flujoDigital.js
│   ├── flujoServicio.js
│   └── flujoGeneral.js
├── utils/
│   ├── detectarIntencion.js
│   └── obtenerContexto.js
└── db/
    └── prismaClient.js
```

> Nota: si tu proyecto usa TypeScript, renombra `.js` a `.ts` y ajusta imports/exports.

---

## Variables de entorno (.env)
Añade estas variables a tu `.env` (o al entorno de producción):

```
# IA
GROQ_API_KEY=tu_groq_api_key
GROQ_API_URL=https://api.groq.ai
OLLAMA_BASE_URL=http://ollama:11434  # si usas Ollama local
OLLAMA_MODEL=llama-3.1

# DB (ejemplo Postgres)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Pagos
PAYPAL_CLIENT_ID=... 
PAYPAL_CLIENT_SECRET=...
MERCADOPAGO_KEY=...

# Otros
NODE_ENV=development
PORT=3000
```

---

## Cambios recomendados en la base de datos
**Esquema mínimo recomendado (Prisma / SQL):**

_Practica: crear backup antes de ejecutar migraciones._

**Tabla `productos` (ejemplo Prisma):**
```prisma
model Producto {
  id           Int      @id @default(autoincrement())
  nombre       String
  descripcion  String?
  precio       Float
  categoria    String   // 'fisico' | 'digital' | 'servicio'
  tipoVenta    String?  // 'fisico_local' | 'fisico_envio' | 'digital' | 'servicio'
  imagenes     String[] @default([])
  sku          String?  @unique
  stock        Int?
  metodosPago  String[] @default([])
}
```

**Tabla `conversaciones` (estado por usuario):**
```prisma
model Conversacion {
  userId           String  @id
  estado           String?
  ultimoProductoId Int?
  contexto         Json?
  actualizadoEn    DateTime @default(now())
}
```

Si usas Postgres, recomiendo activar `pg_trgm` para búsquedas por similitud.

---

## Pasos de instalación (resumen)
1. Colocar la carpeta `src/conversational-module/` dentro del repo `bot-intelogente`.
2. Instalar dependencias (si faltan):
   ```bash
   npm install prisma @prisma/client pg node-fetch
   # o yarn add prisma @prisma/client pg node-fetch
   ```
3. Configurar `.env` con las claves (ver arriba).
4. Ejecutar migraciones de Prisma:
   ```bash
   npx prisma migrate dev --name add_conversational_module
   npx prisma generate
   ```
5. Reiniciar el servidor del bot.

---

## Cómo integrar en el handler de WhatsApp
En el archivo que procesa mensajes entrantes (ej. `src/handlers/message.js`) sustituir o añadir:

```js
import { procesarMensaje } from './conversational-module/ai/conversacionController.js';

bot.onMessage(async (msg) => {
  const chatId = msg.from;
  const texto = msg.body || '';

  // Lógica: primero recuperar contexto si se desea
  // const contexto = await getConversation(chatId);

  const respuesta = await procesarMensaje(chatId, texto);
  await bot.sendMessage(chatId, respuesta);
});
```

> Asegúrate que `bot.sendMessage` acepta texto y/o adjuntos (imágenes). Si no, adapta la respuesta para enviar imágenes separadas.

---

## Comportamiento esperado y pruebas (ejemplos)
Prueba estos mensajes desde el simulador o WhatsApp real:

1. **Saludo**
   - Usuario: "Hola"
   - Bot: Mensaje de bienvenida y pregunta de interés.

2. **Producto físico**
   - Usuario: "Tienes la NS160 FI 2020?"
   - Bot: Buscar producto por nombre → enviar fotos + disponibilidad + CTA (visitar tienda / envío).

3. **Producto digital**
   - Usuario: "Cuánto cuesta el curso de piano?"
   - Bot: Responde precio + link de muestra + opciones de pago (PayPal/MercadoPago).

4. **Dropshipping / envío**
   - Usuario: "Tienen audífonos TWS?"
   - Bot: Responde promoción y ofrece confirmación de dirección para envío contrareembolso.

5. **Servicio técnico**
   - Usuario: "Mi computador no enciende, pueden ayudar?"
   - Bot: Solicitar detalles, ofrecer cita o recogida.

---

## Logs y debugging
- Registra: `usuario_msg, matched_products, prompt_enviado, respuesta_ia, respuesta_enviada`.
- Habilita logs de nivel `debug` para ver prompts y respuestas de Groq / Ollama.
- Si la IA genera datos inventados (hallucination), el wrapper tiene que validar precios/stock contra la DB antes de enviar.

---

## Fallback y alta disponibilidad
- Si Groq/Ollama falla, configurar fallback a OpenAI GPT-4 (si está disponible).
- Implementar timeout (ej. 3–5s) para llamadas a la IA y devolver respuesta estática amigable si excede.

---

## Depuración rápida (preguntas frecuentes)
- **Q:** El bot confunde producto A con producto B.
  - **A:** Ajustar la función `searchProducts` / `prisma.findFirst` para usar similitud (`pg_trgm`) o incluir `sku` en la búsqueda.

- **Q:** La IA inventa precio o stock.
  - **A:** El wrapper `conversacionController` debe verificar contra DB el precio y reemplazar o devolver fallback.

- **Q:** No llegan imágenes al cliente.
  - **A:** Verificar que los links de `producto.imagenes` sean públicos y que la API de WhatsApp permita enviar URLs o subir el archivo.

---

## Checklist para entrega a Kiro
- [ ] Copiar `src/conversational-module/` al repo
- [ ] Añadir/ajustar esquema Prisma y migraciones
- [ ] Configurar `.env` con claves
- [ ] Instalar dependencias y ejecutar `prisma generate`
- [ ] Integrar el handler en el flujo de mensajes del bot
- [ ] Probar 5 conversaciones reales desde el simulador
- [ ] Ajustar thresholds de búsqueda y prompts según resultados

---

## Contacto y apoyo
Si Kiro necesita ayuda para adaptar TypeScript o migrar el código, puedo generar las versiones `.ts` o preparar un PR con los cambios listos.

---

¡Listo! Si quieres, ahora puedo:

- 1) Generar automáticamente el paquete ZIP con todos los archivos listos para arrastrar al repo.
- 2) Convertir los archivos a TypeScript para integrarlos directamente en el proyecto.
- 3) Crear un PR de ejemplo (si me das acceso al repo).

Dime cuál prefieres y lo hago ahora.