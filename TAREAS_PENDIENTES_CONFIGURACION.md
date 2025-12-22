# 📋 Tareas Pendientes - Configuración y Restauración

## ✅ Completado

1. **Componente de Configuración de APIs** creado
   - `src/components/APIConfiguration.tsx`
   - Incluye: Groq, OpenAI, Claude, MercadoPago, PayPal, MercadoLibre
   - Con máscaras de seguridad para las claves

## ⏳ Pendiente

### 1. API Route para Configuración

Crear: `src/app/api/settings/api-config/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  // Obtener configuración del usuario actual
  // Retornar config (con claves enmascaradas)
}

export async function POST(request: NextRequest) {
  // Guardar configuración del usuario
  // Encriptar claves sensibles
  // Retornar success
}
```

### 2. Agregar al Dashboard

Editar: `src/components/dashboard/main-dashboard.tsx`

Agregar pestaña "Configuración" o "Integraciones" con el componente `APIConfiguration`

### 3. Script de Restauración Completa

Crear: `restaurar-todos-productos.js`

Debe incluir:
- Curso de Piano (con fotos)
- Productos de dropshipping (Dropi, SmartJoys, etc.)
- Laptops y computadores
- Megapacks
- Motos
- Todos con sus fotos originales

### 4. Modelo de Base de Datos

Verificar que existe tabla para guardar configuración:
- `APIConfig` o similar en `prisma/schema.prisma`
- Si no existe, crear migración

## 📝 Archivos Creados

- ✅ `src/components/APIConfiguration.tsx`
- ⏳ `src/app/api/settings/api-config/route.ts`
- ⏳ `restaurar-todos-productos.js`

## 🚀 Próximos Pasos

1. Crear API route
2. Agregar al dashboard
3. Crear script de restauración completo
4. Probar todo el flujo

---

**Nota**: Por límite de tokens, continuar en próxima sesión
