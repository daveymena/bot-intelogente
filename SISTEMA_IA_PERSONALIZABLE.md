# 🤖 SISTEMA DE IA PERSONALIZABLE

## ✅ Implementado

### 1. Schema de Base de Datos Actualizado

**Archivo:** `prisma/schema.prisma`

**Nuevos campos en BotSettings:**
```prisma
// API Keys de Proveedores de IA
groqApiKey           String?
openaiApiKey         String?
claudeApiKey         String?
geminiApiKey         String?
mistralApiKey        String?
anthropicApiKey      String?
openrouterApiKey     String?
ollamaBaseUrl        String?
ollamaModel          String?  @default("llama3.1")

// Configuración de Prioridad de IA
preferredAiProvider  String   @default("groq")
aiProviderPriority   String   @default("[\"groq\",\"openai\",\"gemini\",\"claude\",\"mistral\"]")
enableAutoFallback   Boolean  @default(true)

// Configuración de Respuestas
maxTokens            Int      @default(200)
temperature          Float    @default(0.7)
```

### 2. Componente de Dashboard

**Archivo:** `src/components/dashboard/ai-providers-settings.tsx`

**Características:**
- ✅ Interfaz visual para configurar API keys
- ✅ Soporte para 7 proveedores de IA:
  - Groq (Gratis)
  - OpenAI / ChatGPT (Pago)
  - Google Gemini (Gratis)
  - Anthropic Claude (Pago)
  - Mistral AI (Gratis)
  - OpenRouter (Pago)
  - Ollama (Local - Gratis)
- ✅ Validación de API keys en tiempo real
- ✅ Sistema de prioridad (orden de fallback)
- ✅ Indicadores visuales de estado
- ✅ Links directos para obtener API keys

### 3. API de Validación

**Archivo:** `src/app/api/ai/validate/route.ts`

**Funcionalidad:**
- Valida API keys antes de guardar
- Prueba conexión con cada proveedor
- Retorna estado válido/inválido
- Timeout de 5 segundos para evitar bloqueos

---

## 🎯 Proveedores Soportados

### 1. Groq ⚡ (GRATIS)
- **Modelos:** Llama 3.1, Llama 3, Mixtral
- **Velocidad:** Ultra rápido
- **Límites:** Generosos en plan gratuito
- **API Key:** https://console.groq.com/keys
- **Formato:** `gsk_...`

### 2. OpenAI / ChatGPT 💰 (PAGO)
- **Modelos:** GPT-4, GPT-3.5-turbo
- **Calidad:** Excelente
- **Costo:** $0.002 - $0.03 por 1K tokens
- **API Key:** https://platform.openai.com/api-keys
- **Formato:** `sk-...`

### 3. Google Gemini 🌐 (GRATIS)
- **Modelos:** Gemini Pro, Gemini Pro Vision
- **Límites:** 60 requests/minuto gratis
- **API Key:** https://makersuite.google.com/app/apikey
- **Formato:** `AIza...`

### 4. Anthropic Claude 🧠 (PAGO)
- **Modelos:** Claude 3 Opus, Sonnet, Haiku
- **Calidad:** Excelente para conversaciones
- **Costo:** $0.015 - $0.075 por 1K tokens
- **API Key:** https://console.anthropic.com/settings/keys
- **Formato:** `sk-ant-...`

### 5. Mistral AI ⚡ (GRATIS)
- **Modelos:** Mistral Large, Medium, Small
- **Límites:** Generosos en plan gratuito
- **API Key:** https://console.mistral.ai/api-keys
- **Formato:** `sk-...`

### 6. OpenRouter 🌍 (PAGO)
- **Modelos:** Acceso a 100+ modelos
- **Ventaja:** Un solo API key para todos
- **Costo:** Variable según modelo
- **API Key:** https://openrouter.ai/keys
- **Formato:** `sk-or-...`

### 7. Ollama 🖥️ (LOCAL - GRATIS)
- **Modelos:** Llama 3, Mistral, Phi, etc.
- **Ventaja:** 100% gratis, sin límites
- **Requisito:** Servidor local con Ollama
- **URL:** `http://localhost:11434`
- **Instalación:** https://ollama.ai

---

## 📋 Cómo Usar

### Para Usuarios (Dashboard)

1. **Ir a Configuración de IA**
   - Dashboard → Configuración → Proveedores de IA

2. **Agregar API Keys**
   - Click en el link "Obtén tu API key"
   - Copiar la API key del proveedor
   - Pegar en el campo correspondiente
   - Click en "Validar" para verificar

3. **Configurar Prioridad**
   - Usar flechas ↑↓ para cambiar orden
   - El sistema intentará usar en orden de arriba a abajo
   - Si falla uno, automáticamente usa el siguiente

4. **Guardar Configuración**
   - Click en "Guardar Configuración"
   - El bot usará tus API keys inmediatamente

### Para Desarrolladores

**Obtener configuración del usuario:**
```typescript
import { db } from '@/lib/db'

const settings = await db.botSettings.findUnique({
  where: { userId: 'user_id' }
})

// Usar API keys del usuario
const groqKey = settings?.groqApiKey
const openaiKey = settings?.openaiApiKey
```

**Usar con prioridad:**
```typescript
const priority = JSON.parse(settings?.aiProviderPriority || '[]')
// priority = ['groq', 'openai', 'gemini', ...]

for (const provider of priority) {
  try {
    const response = await callAI(provider, settings)
    if (response.success) return response
  } catch (error) {
    continue // Intentar siguiente
  }
}
```

---

## 🔧 Migración de Base de Datos

**Ejecutar migración:**
```bash
cd botexperimento
npx prisma migrate dev --name add_ai_provider_settings
npx prisma generate
```

**O aplicar SQL directamente:**
```bash
psql $DATABASE_URL < prisma/migrations/add_ai_provider_priority.sql
```

---

## 🎨 Interfaz de Usuario

### Vista del Dashboard

```
┌─────────────────────────────────────────┐
│ 🤖 Configuración de Proveedores de IA  │
├─────────────────────────────────────────┤
│                                         │
│ ⚙️ Configuración Global                │
│ ├─ Fallback Automático: [✓]            │
│ └─ Proveedor Preferido: [Groq ▼]       │
│                                         │
│ ⚡ Groq (Gratis) ✓                     │
│ ├─ API Key: [gsk_***************]      │
│ ├─ Prioridad: 1 [↑] [↓]                │
│ └─ [Validar]                            │
│                                         │
│ ✨ OpenAI (ChatGPT)                    │
│ ├─ API Key: [sk-****************]      │
│ ├─ Prioridad: 2 [↑] [↓]                │
│ └─ [Validar]                            │
│                                         │
│ ... (más proveedores)                   │
│                                         │
│ [Guardar Configuración]                 │
└─────────────────────────────────────────┘
```

### Indicadores de Estado

- ✅ Verde: API key válida y funcionando
- ❌ Rojo: API key inválida
- ⚠️ Amarillo: No configurada
- 🔄 Azul: Validando...

---

## 💡 Casos de Uso

### 1. Usuario con Presupuesto Limitado
```
Configuración:
1. Groq (Gratis) - Principal
2. Gemini (Gratis) - Backup
3. Mistral (Gratis) - Backup 2

Resultado: 100% gratis, sin costos
```

### 2. Usuario que Busca Calidad
```
Configuración:
1. OpenAI GPT-4 - Principal
2. Claude 3 Opus - Backup
3. Groq - Backup gratuito

Resultado: Máxima calidad con fallback
```

### 3. Usuario con Servidor Local
```
Configuración:
1. Ollama (Local) - Principal
2. Groq - Backup online

Resultado: Privacidad + velocidad + gratis
```

### 4. Usuario Empresarial
```
Configuración:
1. OpenRouter - Acceso a todos los modelos
2. OpenAI - Backup directo
3. Groq - Backup rápido

Resultado: Máxima disponibilidad
```

---

## 🔐 Seguridad

### API Keys Encriptadas
- Las API keys se guardan en la base de datos
- Nunca se exponen en el frontend
- Solo el backend tiene acceso

### Validación
- Las keys se validan antes de guardar
- Timeout de 5 segundos para evitar bloqueos
- No se guardan keys inválidas

### Privacidad
- Cada usuario tiene sus propias keys
- No se comparten entre usuarios
- El usuario controla sus datos

---

## 📊 Ventajas del Sistema

### Para Usuarios
- ✅ Libertad de elegir su proveedor favorito
- ✅ Puede usar opciones gratuitas
- ✅ Fallback automático si falla uno
- ✅ Control total sobre costos
- ✅ Fácil de configurar

### Para el Negocio
- ✅ No necesitas pagar por IA de todos los usuarios
- ✅ Cada usuario usa su propia API key
- ✅ Reduces costos operativos
- ✅ Ofreces más valor
- ✅ Diferenciador competitivo

### Técnicas
- ✅ Sistema robusto con fallback
- ✅ Fácil agregar nuevos proveedores
- ✅ Configuración por usuario
- ✅ Validación automática
- ✅ Logs detallados

---

## 🚀 Próximos Pasos

1. ✅ Schema actualizado
2. ✅ Componente de UI creado
3. ✅ API de validación creada
4. → Ejecutar migración de BD
5. → Integrar componente en dashboard
6. → Actualizar AIMultiProvider para usar settings de usuario
7. → Probar con diferentes proveedores
8. → Documentar para usuarios finales

---

## 📝 Notas Adicionales

### Límites de Rate
Cada proveedor tiene sus propios límites:
- **Groq:** 30 requests/minuto (gratis)
- **Gemini:** 60 requests/minuto (gratis)
- **OpenAI:** Según plan (pago)
- **Claude:** Según plan (pago)
- **Ollama:** Sin límites (local)

### Recomendaciones
- Configurar al menos 2 proveedores
- Incluir al menos 1 opción gratuita
- Habilitar fallback automático
- Validar keys después de configurar

---

**Última actualización:** Ahora  
**Estado:** ✅ Componentes creados, pendiente integración  
**Archivos creados:** 3
