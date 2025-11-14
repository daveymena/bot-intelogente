# 📍 DÓNDE ESTÁ LA CONFIGURACIÓN DE IA

## ✅ Estado Actual

### Componente Creado
**Archivo:** `src/components/dashboard/ai-providers-settings.tsx`

**Características:**
- ✅ Interfaz completa para configurar API keys
- ✅ Soporte para 7 proveedores de IA
- ✅ Validación de API keys
- ✅ Sistema de prioridad
- ✅ Indicadores visuales

### API de Validación
**Archivo:** `src/app/api/ai/validate/route.ts`

**Funcionalidad:**
- ✅ Valida API keys antes de guardar
- ✅ Prueba conexión con cada proveedor
- ✅ Timeout de 5 segundos

### Schema de Base de Datos
**Archivo:** `prisma/schema.prisma`

**Campos en BotSettings:**
```prisma
groqApiKey           String?
openaiApiKey         String?
claudeApiKey         String?
geminiApiKey         String?
mistralApiKey        String?
anthropicApiKey      String?
openrouterApiKey     String?
ollamaBaseUrl        String?
ollamaModel          String?
preferredAiProvider  String
aiProviderPriority   String
enableAutoFallback   Boolean
```

## ⚠️ Pendiente: Integración en Dashboard

El componente existe pero **NO está integrado** en el dashboard principal.

### Cómo Integrarlo

#### Opción 1: Agregar como Tab en Settings

**Archivo a modificar:** `src/components/dashboard/main-dashboard.tsx`

**Paso 1:** Importar el componente
```typescript
import { AIProvidersSettings } from '@/components/dashboard/ai-providers-settings'
```

**Paso 2:** Crear el componente SettingsTab (si no existe)
```typescript
function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración
        </h2>
        <p className="text-gray-600">
          Configura los proveedores de IA y otras opciones
        </p>
      </div>
      
      {/* Configuración de IA */}
      <AIProvidersSettings />
      
      {/* Otras configuraciones aquí */}
    </div>
  )
}
```

**Paso 3:** Asegurarse de que se renderiza
```typescript
{activeTab === 'settings' && <SettingsTab />}
```

#### Opción 2: Agregar como Tab Independiente

**Paso 1:** Agregar al menú
```typescript
const menuItems = [
  // ... otros items
  { id: 'ai-config', label: 'Configuración IA', icon: Brain },
  { id: 'settings', label: 'Configuración', icon: Settings },
]
```

**Paso 2:** Renderizar
```typescript
{activeTab === 'ai-config' && <AIProvidersSettings />}
```

## 🚀 Acceso Rápido (Temporal)

Mientras se integra en el dashboard, puedes acceder directamente creando una ruta:

**Crear:** `src/app/dashboard/ai-config/page.tsx`

```typescript
'use client'

import { AIProvidersSettings } from '@/components/dashboard/ai-providers-settings'

export default function AIConfigPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <AIProvidersSettings />
      </div>
    </div>
  )
}
```

**Acceder:** `http://localhost:3000/dashboard/ai-config`

## 📋 Proveedores Disponibles

1. **Groq** ⚡ (Gratis)
   - Llama 3.1, Mixtral
   - Ultra rápido
   - API Key: https://console.groq.com/keys

2. **OpenAI** ✨ (Pago)
   - GPT-4, GPT-3.5
   - Máxima calidad
   - API Key: https://platform.openai.com/api-keys

3. **Google Gemini** 🌐 (Gratis)
   - Gemini Pro
   - 60 req/min gratis
   - API Key: https://makersuite.google.com/app/apikey

4. **Anthropic Claude** 🧠 (Pago)
   - Claude 3 Opus/Sonnet
   - Excelente para conversaciones
   - API Key: https://console.anthropic.com/settings/keys

5. **Mistral AI** ⚡ (Gratis)
   - Mistral Large/Medium
   - Generosos límites
   - API Key: https://console.mistral.ai/api-keys

6. **OpenRouter** 🌍 (Pago)
   - 100+ modelos
   - Un solo API key
   - API Key: https://openrouter.ai/keys

7. **Ollama** 🖥️ (Local - Gratis)
   - Llama 3, Mistral, Phi
   - 100% gratis, sin límites
   - URL: http://localhost:11434

## 💡 Cómo Usar (Una vez integrado)

1. **Ir al Dashboard**
   - Login → Dashboard

2. **Ir a Configuración de IA**
   - Click en "Configuración IA" o "Settings"

3. **Agregar API Keys**
   - Click en "Obtén tu API key" para cada proveedor
   - Copiar y pegar la API key
   - Click en "Validar"

4. **Configurar Prioridad**
   - Usar flechas ↑↓ para ordenar
   - El bot intentará usar en orden

5. **Guardar**
   - Click en "Guardar Configuración"
   - El bot usará tus API keys inmediatamente

## 🔧 Para Desarrolladores

### Obtener Configuración del Usuario

```typescript
import { db } from '@/lib/db'

const settings = await db.botSettings.findUnique({
  where: { userId: user.id }
})

const groqKey = settings?.groqApiKey
const openaiKey = settings?.openaiApiKey
const priority = JSON.parse(settings?.aiProviderPriority || '[]')
```

### Usar con Fallback Automático

```typescript
for (const provider of priority) {
  try {
    const response = await callAI(provider, settings)
    if (response.success) return response
  } catch (error) {
    continue // Intentar siguiente
  }
}
```

## 📝 Próximos Pasos

1. [ ] Integrar AIProvidersSettings en el dashboard
2. [ ] Crear SettingsTab si no existe
3. [ ] Agregar al menú de navegación
4. [ ] Probar con diferentes proveedores
5. [ ] Actualizar AIMultiProvider para usar settings de usuario
6. [ ] Documentar para usuarios finales

## 📊 Archivos Relacionados

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/components/dashboard/ai-providers-settings.tsx` | Componente UI | ✅ Creado |
| `src/app/api/ai/validate/route.ts` | API de validación | ✅ Creado |
| `prisma/schema.prisma` | Schema de BD | ✅ Actualizado |
| `src/components/dashboard/main-dashboard.tsx` | Dashboard principal | ⚠️ Pendiente integración |
| `src/lib/ai-multi-provider.ts` | Sistema multi-proveedor | ✅ Existe |

---

**Resumen:** El sistema de configuración de IA está completamente desarrollado, solo falta integrarlo visualmente en el dashboard para que los usuarios puedan acceder a él fácilmente.
