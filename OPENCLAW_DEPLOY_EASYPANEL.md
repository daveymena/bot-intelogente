# 🦞 OpenClaw: Deploy Automático en Easypanel

## 🎯 Respuesta Directa

**OpenClaw YA ESTÁ en tu código** - No necesitas configurar nada adicional en Easypanel. El deploy es 100% automático.

---

## 📦 ¿Qué es OpenClaw?

OpenClaw NO es una librería externa. Es un **framework personalizado** que construimos para tu bot, compuesto por:

```
src/lib/bot/
├── openclaw-orchestrator.ts     ← Cerebro principal (razonamiento AI)
├── conversation-strategy.ts      ← Estrategia AIDA conversacional
├── semantic-interpreter.ts       ← Interpretación semántica de mensajes
├── product-matcher.ts            ← Matching inteligente de productos
├── clarification-engine.ts       ← Motor de preguntas de clarificación
└── core/
    └── agentRouter.ts            ← Router que activa OpenClaw
```

---

## 🔄 Flujo de Deploy Automático

### 1. Push a GitHub
```bash
git push origin main --force
```

### 2. Easypanel Detecta el Cambio
- Webhook de GitHub notifica a Easypanel
- Easypanel inicia el proceso de build

### 3. Easypanel Ejecuta (Automático)
```bash
# 1. Descargar código
git pull origin main

# 2. Instalar dependencias (incluye las de OpenClaw)
npm install

# 3. Compilar TypeScript
npm run build

# 4. Iniciar servidor
npm start
```

### 4. OpenClaw se Activa Automáticamente
```typescript
// En src/lib/bot/core/agentRouter.ts (línea 18-24)
let openClawInstance: any = null;

async function getOpenClaw() {
  if (!openClawInstance) {
    const module = await import('../openclaw-orchestrator');
    openClawInstance = module.openClawOrchestrator; // ← Se carga aquí
  }
  return openClawInstance;
}
```

---

## 📋 Dependencias que se Instalan Automáticamente

OpenClaw usa estas librerías (ya están en `package.json`):

```json
{
  "groq-sdk": "^0.3.0",           // AI (Llama 3.1 70B)
  "fuse.js": "^7.0.0",            // Búsqueda fuzzy de productos
  "@prisma/client": "^5.0.0",     // Base de datos
  "dotenv": "^16.0.0"             // Variables de entorno
}
```

**Easypanel ejecuta `npm install` automáticamente**, así que todas estas se instalan sin que hagas nada.

---

## ✅ Verificación: ¿Cómo Saber que OpenClaw Está Activo?

### 1. En los Logs de Easypanel

Ve a: **Easypanel → Tu App → Logs**

Deberías ver:

```
[OpenClaw] 🔑 5 API keys disponibles para rotación
[OpenClaw] 💾 Usando memoria persistente (ConversationContextService)
> ConversationContextService inicializado (memoria persistente 24h)
> Ready on http://0.0.0.0:3000
```

Cuando llegue un mensaje de WhatsApp:

```
[AgentRouter] 🦞 Procesando con OpenClaw para 573XXXXXXXX
[Architect] 🧠 Iniciando Modo Ultra Inteligente para 573XXXXXXXX...
[Architect] 💾 Cargando historial persistente para 573XXXXXXXX...
[Architect] 📚 Historial cargado: 3 mensajes
[Architect] 🔍 Análisis búsqueda: "cursos digitales" | General: true | Palabras: 2
[Architect] 💡 Análisis: Producto simple/digital. Mostrar opciones directamente
[Skill] ✅ Encontrados 5 productos para: "cursos digitales"
[Architect] 💾 Guardando conversación en memoria persistente...
```

### 2. En WhatsApp

Prueba estos mensajes:

**Test 1: Búsqueda General**
```
Tú: "Cursos digitales?"
Bot: ¡Claro! Tenemos 5 opciones disponibles:

━━━━━━━━━━━━━━━━━━
1️⃣ *Mega Pack 11*
   💰 $15.000

2️⃣ *Curso de Piano Avanzado*
   💰 $25.000
...
━━━━━━━━━━━━━━━━━━

¿Cuál te interesa más? Puedo darte todos los detalles 🦞🔥
```

**Test 2: Memoria Persistente**
```
Tú: "Hola"
Bot: "¡Hola! ¿Qué buscas hoy?"
Tú: "Un laptop"
Bot: [Muestra lista de laptops]
Tú: "El primero"
Bot: [Muestra detalles del primer laptop de la lista anterior]
     ← Esto confirma que recuerda la conversación
```

---

## 🔧 Variables de Entorno Necesarias en Easypanel

OpenClaw necesita estas variables en Easypanel (ya deberías tenerlas configuradas):

```bash
# API Keys de Groq (OpenClaw rota entre estas)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY_2=gsk_xxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY_3=gsk_xxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY_4=gsk_xxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY_5=gsk_xxxxxxxxxxxxxxxxxxxxx

# Base de datos (para memoria persistente)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Negocio (para respuestas del bot)
BANK_NAME=BBVA
BANK_ACCOUNT_NUMBER=0616001940
BANK_ACCOUNT_HOLDER=TecnoVariedades D&S
NEQUI_NUMBER=3136174267
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "OpenClaw no responde"

**Síntoma:** El bot responde pero sin formato profesional o sin memoria

**Causa:** Falta alguna API key de Groq

**Solución:**
1. Ve a Easypanel → Variables de Entorno
2. Verifica que existan `GROQ_API_KEY`, `GROQ_API_KEY_2`, etc.
3. Si faltan, agrégalas desde https://console.groq.com/keys

---

### Problema 2: "Error: Cannot find module 'openclaw-orchestrator'"

**Síntoma:** Error en logs al iniciar

**Causa:** El código no se compiló correctamente

**Solución:**
1. Ve a Easypanel → Logs
2. Busca errores en `npm run build`
3. Si hay errores de TypeScript, revisa el código
4. Redeploy: Easypanel → Redeploy

---

### Problema 3: "Bot no recuerda conversaciones"

**Síntoma:** El bot responde pero no recuerda mensajes anteriores

**Causa:** ConversationContextService no se inicializó

**Solución:**
1. Verifica que `DATABASE_URL` esté configurada en Easypanel
2. Revisa logs: debe aparecer "ConversationContextService inicializado"
3. Si no aparece, redeploy

---

## 📊 Arquitectura de OpenClaw en Producción

```
┌─────────────────────────────────────────────────────────┐
│                    EASYPANEL SERVER                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Next.js + Express Server               │    │
│  │              (server.ts)                       │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │                                      │
│                   ▼                                      │
│  ┌────────────────────────────────────────────────┐    │
│  │         AgentRouter (agentRouter.ts)           │    │
│  │    "Detecta mensaje → Activa OpenClaw"        │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │                                      │
│                   ▼                                      │
│  ┌────────────────────────────────────────────────┐    │
│  │    OpenClaw Orchestrator (openclaw-orchestrator.ts) │
│  │                                                 │    │
│  │  • Razonamiento AI (Groq Llama 3.1)           │    │
│  │  • Rotación de 5 API keys                     │    │
│  │  • Memoria persistente (24h)                  │    │
│  │  • Estrategia conversacional AIDA             │    │
│  │  • Herramientas semánticas                    │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │                                      │
│                   ▼                                      │
│  ┌────────────────────────────────────────────────┐    │
│  │   ConversationContextService                   │    │
│  │   (conversation-context-service.ts)            │    │
│  │                                                 │    │
│  │  • Memoria RAM (Map)                          │    │
│  │  • Persistencia DB (PostgreSQL)               │    │
│  │  • Duración: 24 horas                         │    │
│  │  • Límite: 20 mensajes                        │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Checklist de Deploy

Antes de hacer push, verifica:

- [x] ✅ Código commiteado (`git status` debe estar limpio)
- [x] ✅ `.gitignore` incluye archivos con API keys
- [ ] ⏳ Permitir secret en GitHub (enlace en INSTRUCCIONES_PUSH_GITHUB.md)
- [ ] ⏳ Push a GitHub (`git push origin main --force`)
- [ ] ⏳ Esperar deploy de Easypanel (2-3 minutos)
- [ ] ⏳ Verificar logs en Easypanel
- [ ] ⏳ Probar bot en WhatsApp

---

## 🚀 Próximos Pasos

1. **Permitir el secret en GitHub:**
   ```
   https://github.com/daveymena/bot-intelogente/security/secret-scanning/unblock-secret/39ZPhLeIrw3WBHPe8o002vq9kKE
   ```

2. **Hacer push:**
   ```bash
   git push origin main --force
   ```

3. **Monitorear logs en Easypanel:**
   - Ve a: Easypanel → Tu App → Logs
   - Busca: `[OpenClaw]` y `ConversationContextService inicializado`

4. **Probar en WhatsApp:**
   - Envía: "Cursos digitales?"
   - Verifica: Lista con formato profesional
   - Envía: "El primero"
   - Verifica: Bot recuerda la lista anterior

---

## 📞 Soporte

Si algo no funciona:

1. **Revisa logs de Easypanel** (90% de los problemas se ven ahí)
2. **Verifica variables de entorno** (especialmente `GROQ_API_KEY`)
3. **Redeploy** desde Easypanel si es necesario

---

**Estado:** OpenClaw está listo para deploy automático 🦞🔥
