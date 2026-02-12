# 🚀 Guía Completa de Migración - Bot Multi-Agente

## 📋 Resumen Ejecutivo

Has migrado exitosamente tu bot de WhatsApp a una **arquitectura modular multi-agente empresarial** con las siguientes capacidades:

### ✅ Características Implementadas

1. **Sistema Multi-Agente Especializado**
   - 🤝 Agente de Ventas (SalesAgent)
   - 🛠️ Agente de Soporte (SupportAgent)
   - 🔧 Agente Técnico (TechnicalAgent)
   - 📊 Agente Administrativo (AdminAgent)

2. **Memoria Estructurada**
   - Historial de conversaciones
   - Contexto del cliente
   - Nivel técnico detectado
   - Probabilidad de compra

3. **Base de Datos Profesional**
   - PostgreSQL en EasyPanel
   - Esquema multi-tenant
   - Tablas: `tenants`, `clients`, `products_static`, `products_dynamic`, `conversations`

4. **Integración de IA Flexible**
   - Soporte para Groq (rápido y económico)
   - Soporte para OpenClaw (avanzado)
   - Cambio dinámico vía variable de entorno

5. **Listo para Producción**
   - Dockerizado
   - Compatible con EasyPanel
   - Arquitectura SaaS multi-tenant

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      WhatsApp (Baileys)                      │
│                    Genera QR, Recibe/Envía                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Router (router.js)                        │
│              Orquesta el flujo de mensajes                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            IntentClassifier (intentClassifier.js)            │
│    Detecta: saludo, consulta_precio, compra, soporte...     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│             AgentSelector (agentSelector.js)                 │
│         Selecciona el agente apropiado según intent         │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ SalesAgent   │  │SupportAgent  │  │TechnicalAgent│
│              │  │              │  │              │
│ - Consulta   │  │ - Soporte    │  │ - Specs      │
│   productos  │  │ - Reclamos   │  │ - Nivel      │
│ - Calcula    │  │              │  │   técnico    │
│   score      │  │              │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  AI Service          │
              │  (Groq/OpenClaw)     │
              └──────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Memory Service      │
              │  (PostgreSQL)        │
              └──────────────────────┘
```

---

## 📁 Estructura de Archivos Creados

```
src/
├── app.js                          # Punto de entrada principal
├── config/
│   ├── env.js                      # Configuración de entorno
│   └── aiProvider.js               # Selector de proveedor de IA
├── core/
│   ├── router.js                   # Orquestador principal
│   ├── intentClassifier.js         # Clasificador de intenciones
│   └── agentSelector.js            # Selector de agentes
├── agents/
│   ├── salesAgent.js               # Agente de ventas
│   ├── supportAgent.js             # Agente de soporte
│   ├── technicalAgent.js           # Agente técnico
│   └── adminAgent.js               # Agente administrativo
├── services/
│   ├── aiService.js                # Servicio de IA (Groq/OpenClaw)
│   ├── productService.js           # Servicio de productos
│   ├── clientService.js            # Servicio de clientes
│   ├── metricsService.js           # Servicio de métricas
│   └── memoryService.js            # Servicio de memoria
├── database/
│   ├── connection.js               # Conexión a PostgreSQL
│   └── schema.sql                  # Esquema de base de datos
├── integrations/
│   ├── whatsapp.js                 # Integración con Baileys
│   ├── groq.js                     # Integración con Groq
│   └── openclaw.js                 # Integración con OpenClaw
├── prompts/
│   └── salesPrompt.js              # Prompts del agente de ventas
└── utils/
    ├── logger.js                   # Logger estructurado (Pino)
    └── sanitizer.js                # Sanitizador de entradas
```

---

## 🔧 Configuración Paso a Paso

### 1. Variables de Entorno

El archivo `.env` ya está configurado con la base de datos de EasyPanel:

```env
NODE_ENV=development
PORT=3000

# PostgreSQL EasyPanel
DB_HOST=157.173.97.41
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=9feb7a0e7110d6a42e93
DB_NAME=botwhatsapp

# Proveedor de IA (groq o openclaw)
AI_PROVIDER=groq
GROQ_API_KEY=xxxxx
OPENCLAW_API_KEY=xxxxx

TENANT_MODE=true
LOG_LEVEL=info
```

**⚠️ IMPORTANTE**: Reemplaza `xxxxx` con tus claves API reales.

### 2. Verificar Conexión a Base de Datos

```bash
node scripts/test-db-connection.js
```

**Si falla la conexión:**
- Verifica que tu IP esté permitida en EasyPanel
- O ejecuta el bot desde dentro de EasyPanel (Docker)

### 3. Aplicar Esquema de Base de Datos

Si la base de datos no tiene las tablas necesarias:

```bash
# Opción 1: Aplicar manualmente el esquema
psql -h 157.173.97.41 -U postgres -d botwhatsapp -f src/database/schema.sql

# Opción 2: Usar un cliente GUI como pgAdmin o DBeaver
```

### 4. Instalar Dependencias

```bash
npm install
```

---

## 🚀 Ejecutar el Bot

### Modo Desarrollo (Local)

```bash
npm run bot:dev
```

Esto ejecutará el bot con **nodemon** para recarga automática.

### Modo Producción

```bash
npm run bot:start
```

### Con Docker

```bash
docker-compose up --build
```

---

## 📊 Flujo de Funcionamiento

### Ejemplo: Cliente pregunta por un producto

1. **WhatsApp recibe**: "Hola, ¿cuánto cuesta una laptop HP?"

2. **Router** (`router.js`):
   - Sanitiza el mensaje
   - Obtiene o crea el cliente en la BD
   - Pasa el mensaje al clasificador

3. **IntentClassifier** (`intentClassifier.js`):
   - Usa Groq/OpenClaw para analizar
   - Detecta: `intent: "consulta_precio"`, `confidence: 0.9`, `entities: { categoria: "laptop" }`

4. **AgentSelector** (`agentSelector.js`):
   - Mapea `consulta_precio` → `SalesAgent`

5. **SalesAgent** (`salesAgent.js`):
   - Consulta productos vía `productService`
   - Obtiene contexto del cliente vía `memoryService`
   - Construye prompt con `salesPrompt`
   - Llama a `aiService` (Groq/OpenClaw)
   - Calcula score de probabilidad de compra
   - Guarda interacción en BD

6. **Respuesta**: "¡Hola! Tenemos laptops HP desde $X. ¿Te interesa conocer las especificaciones?"

---

## 🎯 Intenciones Detectadas

El sistema detecta las siguientes intenciones:

| Intención | Agente | Descripción |
|-----------|--------|-------------|
| `saludo` | Sales | Saludo inicial |
| `consulta_precio` | Sales | Pregunta por precios |
| `comparacion` | Technical | Compara productos |
| `compra` | Sales | Intención de compra |
| `soporte` | Support | Solicita ayuda |
| `reclamo` | Support | Presenta queja |
| `objecion_precio` | Sales | Precio muy alto |
| `despedida` | Sales | Cierre de conversación |

---

## 🧠 Sistema de Memoria

### Datos Guardados por Cliente

```javascript
{
  id: "uuid",
  phone: "+573001234567",
  name: "Juan Pérez",
  lead_status: "new", // new, warm, hot, won, lost
  purchase_probability: 45, // 0-100
  technical_level: "intermediate", // basic, intermediate, advanced
  last_interaction: "2026-02-10T19:00:00Z"
}
```

### Historial de Conversaciones

```javascript
{
  client_id: "uuid",
  intent: "consulta_precio",
  confidence: 0.9,
  message: "¿Cuánto cuesta?",
  response: "Tenemos desde $500",
  created_at: "2026-02-10T19:00:00Z"
}
```

---

## 🔄 Cambiar Proveedor de IA

### Usar Groq (Recomendado para producción)

```env
AI_PROVIDER=groq
GROQ_API_KEY=tu_clave_real_aqui
```

**Ventajas:**
- ⚡ Ultra rápido (< 1 segundo)
- 💰 Económico
- 🎯 Preciso

### Usar OpenClaw

```env
AI_PROVIDER=openclaw
OPENCLAW_API_KEY=tu_clave_real_aqui
```

**Ventajas:**
- 🧠 Más avanzado
- 🔍 Mejor comprensión contextual

---

## 🐳 Despliegue en EasyPanel

### 1. Preparar el Repositorio

```bash
git add .
git commit -m "feat: arquitectura multi-agente implementada"
git push origin main
```

### 2. Configurar en EasyPanel

1. Crear nueva aplicación desde GitHub
2. Seleccionar el repositorio
3. Configurar variables de entorno:
   - `NODE_ENV=production`
   - `DB_HOST=provedor-ia_bot-whatsapp-db` (red interna)
   - `GROQ_API_KEY=...`
   - etc.

### 3. Desplegar

EasyPanel construirá automáticamente usando el `Dockerfile`.

---

## 📈 Métricas y Monitoreo

### Consultar Métricas

```javascript
const metricsService = require('./src/services/metricsService');

// Tasa de conversión
const conversionRate = await metricsService.getConversionRate();
console.log(`Conversión: ${conversionRate}%`);

// Clientes activos último mes
const activeClients = await metricsService.getActiveClientsLastMonth();
console.log(`Clientes activos: ${activeClients}`);
```

---

## 🛡️ Seguridad Implementada

✅ **Sanitización de entradas** (`sanitizer.js`)
✅ **Consultas parametrizadas** (previene SQL injection)
✅ **Validación de stock** antes de vender
✅ **Logging estructurado** (Pino)
✅ **Manejo centralizado de errores**

---

## 🔍 Troubleshooting

### Error: "ECONNREFUSED" al conectar a la BD

**Solución:**
- Verifica que tu IP esté permitida en EasyPanel
- O ejecuta desde Docker/EasyPanel

### Error: "Cannot find module 'groq-sdk'"

**Solución:**
```bash
npm install
```

### El bot no responde en WhatsApp

**Solución:**
1. Verifica que Baileys esté conectado (escanea QR)
2. Revisa los logs: `LOG_LEVEL=debug npm run bot:dev`

---

## 📚 Próximos Pasos

1. **Personalizar Prompts**: Edita `src/prompts/salesPrompt.js`
2. **Agregar Productos**: Inserta en `products_static` o `products_dynamic`
3. **Configurar Webhooks**: Para notificaciones en tiempo real
4. **Implementar Dashboard**: Para visualizar métricas

---

## 🎉 ¡Listo!

Tu bot ahora tiene una arquitectura profesional, escalable y lista para producción. 

**Comandos rápidos:**

```bash
# Desarrollo
npm run bot:dev

# Producción
npm run bot:start

# Docker
docker-compose up --build

# Test de BD
node scripts/test-db-connection.js
```

---

## 📞 Soporte

Si tienes dudas sobre la implementación, revisa:
- `README_MIGRATION.md` - Guía técnica
- `src/database/schema.sql` - Esquema de BD
- Logs del sistema con `LOG_LEVEL=debug`
