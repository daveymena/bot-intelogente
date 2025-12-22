# 📋 Plan de Implementación - Sistema de Configuración de Tienda

## ✅ COMPLETADO

### 1. Modelo de Base de Datos
- ✅ Agregado modelo `StoreSettings` a Prisma
- ✅ Agregada relación en modelo `User`
- ⏳ PENDIENTE: Ejecutar migración (`npx prisma migrate dev`)

## 🔄 EN PROGRESO

### 2. API Endpoints (30 min)

Crear archivos:

#### `src/app/api/store/settings/route.ts`
```typescript
// GET - Obtener configuración
// PUT - Actualizar configuración
```

#### `src/app/api/store/settings/logo/route.ts`
```typescript
// POST - Subir logo
```

### 3. Hook Personalizado (20 min)

#### `src/hooks/use-store-settings.ts`
```typescript
export function useStoreSettings() {
  // Cargar configuración
  // Actualizar configuración
  // Subir logo
  return { settings, loading, updateSettings, uploadLogo }
}
```

### 4. Componente de Dashboard (1 hora)

#### `src/components/dashboard/store-settings.tsx`
```tsx
// Pestañas:
// - Información Básica
// - Branding
// - Contacto
// - Redes Sociales
// - SEO
// - Políticas
```

### 5. Integración en Tienda (30 min)

Actualizar archivos:
- `src/app/tienda/page.tsx`
- `src/app/tienda/checkout/page.tsx`
- `src/app/tienda/producto/[id]/page.tsx`

Reemplazar valores hardcodeados con `settings.storeName`, etc.

### 6. Sistema de Temas (20 min)

Aplicar colores dinámicamente:
```typescript
document.documentElement.style.setProperty('--primary', settings.primaryColor)
```

## 📝 Archivos a Crear

1. `src/app/api/store/settings/route.ts` - API principal
2. `src/app/api/store/settings/logo/route.ts` - Subir logo
3. `src/hooks/use-store-settings.ts` - Hook personalizado
4. `src/components/dashboard/store-settings.tsx` - UI de configuración
5. `src/lib/store-settings-service.ts` - Lógica de negocio

## 📝 Archivos a Modificar

1. `src/app/tienda/page.tsx` - Usar configuración dinámica
2. `src/app/tienda/checkout/page.tsx` - Usar configuración dinámica
3. `src/components/dashboard/main-dashboard.tsx` - Agregar pestaña de configuración

## ⏱️ Tiempo Estimado Total

- Base de datos: ✅ 10 min (HECHO)
- API: 30 min
- Hook: 20 min
- Componente UI: 1 hora
- Integración: 30 min
- Temas: 20 min

**Total: ~3 horas**

## 🎯 Próximos Pasos

1. Ejecutar migración de Prisma
2. Crear API endpoints
3. Crear hook personalizado
4. Crear componente de UI
5. Integrar en la tienda
6. Probar todo el flujo

## 💡 Nota

El modelo de base de datos ya está listo. Solo falta:
1. Ejecutar la migración
2. Implementar la lógica y UI

¿Quieres que continúe con la implementación completa ahora o prefieres hacerlo después?

---

**Estado:** Base de datos lista, falta implementación de lógica y UI
**Prioridad:** Alta
**Tiempo restante:** ~3 horas
