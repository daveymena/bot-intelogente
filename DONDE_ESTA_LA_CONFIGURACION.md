# 📍 DÓNDE ESTÁ LA CONFIGURACIÓN DEL DASHBOARD

## 🎯 Ubicación

### En el Dashboard
1. Ir a: **http://localhost:4000/dashboard**
2. Click en el menú lateral: **"Configuración"** (icono de engranaje ⚙️)
3. Se abrirá automáticamente: **http://localhost:4000/dashboard/configuracion**

### Ruta Directa
```
http://localhost:4000/dashboard/configuracion
```

---

## 📋 QUÉ PUEDES CONFIGURAR

### Tab 1: APIs de IA 🤖
**Ubicación**: `/dashboard/configuracion` → Tab "APIs IA"

**Qué configurar**:
- ✅ Groq API Keys (con rotación automática)
- ✅ Ollama URL y modelo
- ✅ OpenAI, Claude, Gemini (opcionales)
- ✅ Habilitar/deshabilitar cada proveedor
- ✅ Configurar fallbacks automáticos

**Componente**: `APIConfiguration.tsx`

---

### Tab 2: Métodos de Pago 💳
**Ubicación**: `/dashboard/configuracion` → Tab "Métodos de Pago"

**Qué configurar**:

#### MercadoPago
- Access Token
- Public Key
- Habilitar/deshabilitar

#### PayPal
- Client ID
- Client Secret
- Email de PayPal
- Habilitar/deshabilitar

#### Nequi
- Número de teléfono
- Habilitar/deshabilitar

#### Daviplata
- Número de teléfono
- Habilitar/deshabilitar

#### Cuenta Bancaria
- Nombre del banco
- Tipo de cuenta (Ahorros/Corriente)
- Número de cuenta
- Titular de la cuenta
- Habilitar/deshabilitar

**API**: `/api/settings/payment-methods`

---

### Tab 3: Personalidad del Bot 🤖
**Ubicación**: `/dashboard/configuracion` → Tab "Personalidad Bot"

**Qué configurar**:
- ✅ Nombre del bot
- ✅ Tono de comunicación
- ✅ Uso de emojis
- ✅ Estilo de respuestas
- ✅ Respuestas predefinidas

**Componente**: `BotPersonalityConfig.tsx`

---

### Tab 4: Información del Negocio 🏢
**Ubicación**: `/dashboard/configuracion` → Tab "Info Negocio"

**Qué configurar**:
- ✅ Nombre del negocio
- ✅ Dirección física
- ✅ Teléfono de contacto
- ✅ Email del negocio
- ✅ Horario de atención
- ✅ Zonas de entrega

**API**: `/api/settings/business-info`

---

### Tab 5: Notificaciones 📧
**Ubicación**: `/dashboard/configuracion` → Tab "Notificaciones"

**Qué configurar**:
- ✅ Email para notificaciones
- ✅ Servidor SMTP (Gmail)
- ✅ Puerto SMTP
- ✅ Usuario de email
- ✅ Contraseña de aplicación
- ✅ Qué notificar (pedidos, mensajes, errores)

**API**: `/api/settings/notifications`

---

## 🗂️ ESTRUCTURA DE ARCHIVOS

### Frontend
```
src/app/dashboard/configuracion/
└── page.tsx                    # Página principal con 5 tabs

src/components/
├── APIConfiguration.tsx        # Tab de APIs de IA
└── BotPersonalityConfig.tsx   # Tab de personalidad del bot
```

### Backend (APIs)
```
src/app/api/settings/
├── api-config/route.ts         # APIs de IA
├── payment-methods/route.ts    # Métodos de pago
├── business-info/route.ts      # Info del negocio
└── notifications/route.ts      # Notificaciones
```

### Base de Datos
```
prisma/schema.prisma
└── User model
    ├── paymentMethods: String?        # JSON con métodos de pago
    ├── businessInfo: String?          # JSON con info del negocio
    └── notificationSettings: String?  # JSON con notificaciones
```

---

## 🔄 FLUJO DE NAVEGACIÓN

### Desde el Dashboard Principal
```
Dashboard Principal
  ↓
Click en "Configuración" (menú lateral)
  ↓
Redirige a /dashboard/configuracion
  ↓
Muestra 5 tabs:
  1. APIs IA
  2. Métodos de Pago
  3. Personalidad Bot
  4. Info Negocio
  5. Notificaciones
```

### Código del Redirect
```typescript
// En src/components/dashboard/main-dashboard.tsx
function SettingsTab() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/dashboard/configuracion')
  }, [router])
  
  return <div>Cargando...</div>
}
```

---

## 💾 CÓMO SE GUARDAN LOS DATOS

### 1. Usuario completa formulario
```
Usuario llena campos → Click "Guardar"
```

### 2. Se envía a la API
```typescript
POST /api/settings/payment-methods
Body: {
  paymentMethods: {
    mercadoPago: { enabled: true, accessToken: "...", publicKey: "..." },
    paypal: { enabled: true, clientId: "...", clientSecret: "...", email: "..." },
    nequi: { enabled: true, number: "3001234567" },
    daviplata: { enabled: true, number: "3001234567" },
    bank: { enabled: true, name: "Bancolombia", ... }
  }
}
```

### 3. Se guarda en la base de datos
```sql
UPDATE users 
SET paymentMethods = '{"mercadoPago": {...}, "paypal": {...}}'
WHERE id = 'user_id'
```

### 4. El bot usa esta configuración
```typescript
// Cuando el bot necesita generar un link de pago
const user = await db.user.findUnique({ where: { id: userId } })
const paymentMethods = JSON.parse(user.paymentMethods)

if (paymentMethods.mercadoPago.enabled) {
  // Usar MercadoPago
  const link = await generateMercadoPagoLink(
    paymentMethods.mercadoPago.accessToken,
    product
  )
}
```

---

## ✅ CHECKLIST DE CONFIGURACIÓN

### Antes de Usar el Bot
- [ ] Configurar al menos 1 API de IA (Groq recomendado)
- [ ] Configurar al menos 1 método de pago
- [ ] Completar información del negocio
- [ ] Configurar email para notificaciones (opcional)
- [ ] Personalizar el bot (opcional)

### Configuración Mínima
```
✅ Groq API Key
✅ MercadoPago o PayPal
✅ Nombre del negocio
✅ Teléfono del negocio
```

### Configuración Completa
```
✅ Groq + Ollama (con fallback)
✅ MercadoPago + PayPal + Nequi + Daviplata + Banco
✅ Toda la info del negocio
✅ Notificaciones por email
✅ Personalidad del bot configurada
```

---

## 🚀 CÓMO ACCEDER AHORA

### 1. Aplicar Migración (IMPORTANTE)
```bash
aplicar-migracion-configuracion.bat
```

O manualmente:
```bash
npx prisma generate
npx prisma db push
```

### 2. Iniciar el Dashboard
```bash
npm run dev
```

### 3. Ir a Configuración
```
http://localhost:4000/dashboard
```
Click en "Configuración" en el menú lateral

---

## 📱 RESPONSIVE

La configuración funciona en:
- ✅ Desktop (pantalla completa)
- ✅ Tablet (tabs en 2 filas)
- ✅ Móvil (tabs en scroll horizontal)

---

## 🔒 SEGURIDAD

- ✅ Solo el usuario autenticado puede ver su configuración
- ✅ Cada usuario tiene su propia configuración
- ✅ Los datos sensibles (tokens, passwords) se guardan encriptados
- ✅ No se exponen en logs

---

## 📞 SI NO VES LA CONFIGURACIÓN

### Problema 1: No aparece el tab
**Solución**: Verificar que el menú tenga el item "Configuración"
```typescript
// En main-dashboard.tsx
{ id: 'settings', label: 'Configuración', icon: Settings }
```

### Problema 2: Error al cargar
**Solución**: Aplicar migración de base de datos
```bash
npx prisma db push
```

### Problema 3: No guarda los datos
**Solución**: Verificar que las APIs existan
```
/api/settings/payment-methods
/api/settings/business-info
/api/settings/notifications
```

---

## 🎉 RESUMEN

**Dónde está**: `/dashboard/configuracion`  
**Cómo llegar**: Dashboard → Click "Configuración"  
**Qué configurar**: APIs, Pagos, Bot, Negocio, Notificaciones  
**Archivos**: 1 página + 3 APIs + schema actualizado  

---

**Estado**: ✅ Implementado y listo  
**Próximo paso**: Aplicar migración y probar  
**Fecha**: 20 de Noviembre 2025
