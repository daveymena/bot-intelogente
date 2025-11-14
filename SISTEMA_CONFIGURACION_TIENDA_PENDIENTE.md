# ⚙️ Sistema de Configuración de Tienda - PENDIENTE

## ❌ Estado Actual

**NO ESTÁ IMPLEMENTADO**

Actualmente el nombre de la tienda y toda la información está **hardcodeada** en el código:

```tsx
// En src/app/tienda/page.tsx línea 303
<h1 className="font-bold text-lg text-gray-900 leading-tight">Tecnovariedades</h1>
<p className="text-xs text-gray-600 leading-none">D&S</p>
```

## 🎯 Lo Que Se Necesita Implementar

### 1. **Modelo de Base de Datos**
Crear tabla `StoreSettings` en Prisma:

```prisma
model StoreSettings {
  id          String   @id @default(cuid())
  userId      String   @unique
  
  // Información básica
  storeName   String   @default("Mi Tienda")
  storeSlogan String?
  description String?
  
  // Branding
  logo        String?
  favicon     String?
  primaryColor String  @default("#10b981") // Verde
  secondaryColor String @default("#3b82f6") // Azul
  
  // Contacto
  email       String?
  phone       String?
  whatsapp    String?
  address     String?
  
  // Redes sociales
  facebook    String?
  instagram   String?
  twitter     String?
  tiktok      String?
  
  // SEO
  metaTitle   String?
  metaDescription String?
  keywords    String?
  
  // Configuración
  currency    String   @default("COP")
  language    String   @default("es")
  timezone    String   @default("America/Bogota")
  
  // Políticas
  termsUrl    String?
  privacyUrl  String?
  returnPolicy String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

### 2. **API Endpoints**

#### GET `/api/store/settings`
Obtener configuración de la tienda

#### PUT `/api/store/settings`
Actualizar configuración de la tienda

#### POST `/api/store/settings/logo`
Subir logo de la tienda

### 3. **Componente de Configuración en Dashboard**

Crear `src/components/dashboard/store-settings.tsx`:

```tsx
- Pestaña "Información Básica"
  - Nombre de la tienda
  - Slogan
  - Descripción
  
- Pestaña "Branding"
  - Subir logo
  - Subir favicon
  - Selector de colores primario/secundario
  - Vista previa en tiempo real
  
- Pestaña "Contacto"
  - Email
  - Teléfono
  - WhatsApp
  - Dirección
  
- Pestaña "Redes Sociales"
  - Facebook, Instagram, Twitter, TikTok
  
- Pestaña "SEO"
  - Meta título
  - Meta descripción
  - Keywords
  
- Pestaña "Políticas"
  - Términos y condiciones
  - Política de privacidad
  - Política de devoluciones
```

### 4. **Hook para Usar Configuración**

Crear `src/hooks/use-store-settings.ts`:

```typescript
export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Cargar configuración
  // Actualizar configuración
  // Subir logo
  
  return { settings, loading, updateSettings, uploadLogo }
}
```

### 5. **Actualizar Componentes de Tienda**

Modificar todos los lugares donde está hardcodeado:

- `src/app/tienda/page.tsx` - Nombre y logo
- `src/app/tienda/checkout/page.tsx` - Nombre en header
- `src/app/tienda/producto/[id]/page.tsx` - Nombre en header
- Cualquier otro lugar con "Tecnovariedades" o "D&S"

### 6. **Sistema de Temas**

Permitir cambiar colores dinámicamente:

```typescript
// Aplicar colores personalizados
document.documentElement.style.setProperty('--primary-color', settings.primaryColor)
document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor)
```

## 📋 Pasos para Implementar

### Fase 1: Base de Datos (30 min)
1. Agregar modelo a `prisma/schema.prisma`
2. Ejecutar `npx prisma migrate dev`
3. Crear seed con configuración por defecto

### Fase 2: API (1 hora)
1. Crear `src/app/api/store/settings/route.ts`
2. Implementar GET y PUT
3. Crear endpoint para subir logo

### Fase 3: Dashboard (2 horas)
1. Crear componente de configuración
2. Agregar pestañas
3. Implementar formularios
4. Vista previa en tiempo real

### Fase 4: Integración (1 hora)
1. Crear hook `useStoreSettings`
2. Reemplazar valores hardcodeados
3. Aplicar colores dinámicos
4. Probar todo el flujo

## 🎨 Ejemplo de Uso

```tsx
// En cualquier componente
import { useStoreSettings } from '@/hooks/use-store-settings'

export function Header() {
  const { settings } = useStoreSettings()
  
  return (
    <header>
      <img src={settings?.logo || '/default-logo.png'} />
      <h1>{settings?.storeName || 'Mi Tienda'}</h1>
      <p>{settings?.storeSlogan}</p>
    </header>
  )
}
```

## 🚀 Beneficios

1. ✅ **Personalización Total** - Cada cliente puede tener su propia marca
2. ✅ **Multi-tenant** - Múltiples tiendas en la misma plataforma
3. ✅ **Fácil de Usar** - Interfaz intuitiva en el dashboard
4. ✅ **SEO Optimizado** - Meta tags personalizables
5. ✅ **Branding Consistente** - Logo y colores en toda la tienda

## 📊 Prioridad

**ALTA** - Es fundamental para un sistema multi-cliente

## ⏱️ Tiempo Estimado

**4-5 horas** de desarrollo completo

## 💡 Recomendación

Implementar esto **ANTES** de lanzar a producción, ya que es esencial para que cada cliente pueda personalizar su tienda.

---

**Fecha:** 5 de noviembre, 2025
**Estado:** ❌ NO IMPLEMENTADO
**Prioridad:** 🔴 ALTA
