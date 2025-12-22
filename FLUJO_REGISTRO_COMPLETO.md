# 📝 FLUJO DE REGISTRO COMPLETO - EXPLICACIÓN

## 🎯 CÓMO FUNCIONA EL REGISTRO

### Paso a Paso del Usuario

```
1. Usuario va a la página de registro
   URL: /register o /signup
   ↓
2. Llena el formulario:
   - Email
   - Contraseña
   - Nombre (opcional)
   - Teléfono (obligatorio)
   - Nombre del negocio (opcional)
   ↓
3. Hace clic en "Registrarse"
   ↓
4. Sistema crea automáticamente:
   ✅ Usuario en la base de datos
   ✅ Configuración del bot (BotSettings)
   ✅ Prompts de IA por defecto
   ✅ Configuración de pagos (PaymentConfig) ← NUEVO
   ✅ Token de verificación
   ↓
5. Sistema envía:
   📧 Email de verificación (si está configurado)
   📱 Código por WhatsApp al teléfono
   ↓
6. Usuario recibe código por WhatsApp
   Ejemplo: "Tu código de verificación es: 123456"
   ↓
7. Usuario ingresa el código
   URL: /verify-phone
   ↓
8. Sistema verifica el código
   ✅ Marca teléfono como verificado
   ✅ Activa la cuenta
   ↓
9. Usuario puede hacer login
   ✅ Acceso completo al dashboard
   ✅ Puede configurar pagos
   ✅ Puede agregar productos
   ✅ Puede conectar WhatsApp
```

---

## 🔧 QUÉ SE CREA AUTOMÁTICAMENTE

### 1. Usuario (User)
```typescript
{
  email: "usuario@ejemplo.com",
  password: "[hash]",
  name: "Juan Pérez",
  phone: "+573001234567",
  businessName: "Mi Tienda",
  role: "USER",
  membershipType: "FREE",
  isEmailVerified: false,
  isPhoneVerified: false,
  isActive: false, // Se activa al verificar
  trialEnds: [7 días desde ahora]
}
```

### 2. Configuración del Bot (BotSettings)
```typescript
{
  userId: "[id del usuario]",
  businessName: "Mi Tienda",
  businessPhone: "+573001234567",
  responseDelay: 2,
  autoResponseEnabled: true,
  smartWaitingEnabled: true,
  maxTokens: 500,
  temperature: 0.7
}
```

### 3. Prompts de IA (AIPrompt) - 5 por defecto
```typescript
[
  { name: "Bienvenida", type: "WELCOME", isActive: true },
  { name: "Información de Producto", type: "PRODUCT_INFO", isActive: true },
  { name: "Precios", type: "PRICING", isActive: true },
  { name: "Soporte", type: "SUPPORT", isActive: true },
  { name: "Cierre", type: "CLOSING", isActive: true }
]
```

### 4. Configuración de Pagos (PaymentConfig) ← NUEVO ✨
```typescript
{
  userId: "[id del usuario]",
  // Valores por defecto del schema:
  mercadoPagoEnabled: false,
  paypalEnabled: false,
  bankTransferEnabled: true,
  bankName: "Bancolombia",
  nequiEnabled: true,
  nequiPhone: "3136174267",
  daviplataEnabled: true,
  daviplataPhone: "3136174267",
  contactPhone: "+57 304 274 8687",
  contactEmail: "deinermen25@gmail.com",
  contactAddress: "Centro Comercial El Diamante 2"
}
```

---

## 📧 VERIFICACIÓN POR EMAIL

### Si está configurado (RESEND_API_KEY)

```
1. Sistema genera token único
   ↓
2. Envía email con link:
   https://tu-dominio.com/verify-email?token=xxx
   ↓
3. Usuario hace clic en el link
   ↓
4. Sistema verifica el token
   ✅ Marca email como verificado
   ✅ Envía email de bienvenida
```

### Si NO está configurado

```
⚠️  Email no se envía
✅ Usuario puede verificar solo con WhatsApp
```

---

## 📱 VERIFICACIÓN POR WHATSAPP

### Siempre se intenta (obligatorio)

```
1. Sistema genera código de 6 dígitos
   Ejemplo: 123456
   ↓
2. Guarda código en base de datos
   - Expira en 10 minutos
   ↓
3. Envía mensaje por WhatsApp:
   "Hola [Nombre]! Tu código de verificación es: 123456"
   ↓
4. Usuario ingresa código en /verify-phone
   ↓
5. Sistema valida:
   ✅ Código correcto
   ✅ No expirado
   ✅ Marca teléfono como verificado
   ✅ Activa la cuenta
```

---

## 🔐 ESTADOS DE LA CUENTA

### Recién Registrado
```
isEmailVerified: false
isPhoneVerified: false
isActive: false
→ NO puede usar el dashboard
```

### Email Verificado
```
isEmailVerified: true
isPhoneVerified: false
isActive: false
→ Aún NO puede usar el dashboard
```

### Teléfono Verificado
```
isEmailVerified: false (o true)
isPhoneVerified: true
isActive: true ← Se activa aquí
→ ✅ PUEDE usar el dashboard
```

---

## 🎯 CONFIGURACIÓN DE PAGOS AUTOMÁTICA

### Lo que el usuario recibe

Al registrarse, automáticamente tiene:

**Métodos Habilitados por Defecto:**
- ✅ Nequi (3136174267)
- ✅ Daviplata (3136174267)
- ✅ Transferencia Bancaria (Bancolombia)

**Métodos Deshabilitados:**
- ❌ MercadoPago (requiere credenciales)
- ❌ PayPal (requiere credenciales)

### Lo que puede hacer después

```
1. Login al dashboard
   ↓
2. Ir a "Configuración de Pagos"
   ↓
3. Personalizar:
   - Cambiar números de Nequi/Daviplata
   - Agregar cuenta bancaria propia
   - Activar MercadoPago (con credenciales)
   - Activar PayPal (con credenciales)
   - Actualizar información de contacto
   ↓
4. Guardar cambios
   ↓
5. El bot usa automáticamente la nueva configuración
```

---

## 🚀 EJEMPLO COMPLETO

### Registro de "Juan Pérez"

```javascript
// 1. Usuario llena formulario
POST /api/auth/register
{
  "email": "juan@ejemplo.com",
  "password": "mipassword123",
  "name": "Juan Pérez",
  "phone": "+573001234567",
  "businessName": "Tienda de Juan"
}

// 2. Sistema crea todo automáticamente
✅ Usuario creado
✅ BotSettings creado
✅ 5 AIPrompts creados
✅ PaymentConfig creado ← NUEVO
✅ Token generado
✅ Código WhatsApp enviado

// 3. Juan recibe WhatsApp
"Hola Juan Pérez! Tu código de verificación es: 789012"

// 4. Juan ingresa código
POST /api/auth/verify-phone
{
  "userId": "xxx",
  "code": "789012"
}

// 5. Cuenta activada
✅ isPhoneVerified: true
✅ isActive: true
✅ Puede hacer login

// 6. Juan hace login
POST /api/auth/login
{
  "email": "juan@ejemplo.com",
  "password": "mipassword123"
}

// 7. Juan accede al dashboard
✅ Ve sus productos (vacío al inicio)
✅ Puede conectar WhatsApp
✅ Puede configurar pagos
✅ Puede agregar productos

// 8. Juan configura pagos
GET /api/payment-config
→ Recibe configuración por defecto

POST /api/payment-config
{
  "nequiPhone": "3009876543", // Su número
  "bankAccountNumber": "12345678901", // Su cuenta
  "contactPhone": "+573009876543" // Su contacto
}

// 9. Bot de Juan está listo
✅ Responde automáticamente
✅ Usa sus métodos de pago
✅ Envía su información de contacto
```

---

## ✅ VENTAJAS DEL SISTEMA

### Para el Usuario
- ✅ Registro rápido (2 minutos)
- ✅ Verificación por WhatsApp (seguro)
- ✅ Configuración automática
- ✅ Listo para usar inmediatamente
- ✅ Puede personalizar después

### Para el Negocio
- ✅ Onboarding fluido
- ✅ Menos fricción
- ✅ Más conversiones
- ✅ Usuarios activos más rápido

### Para el Código
- ✅ Todo en una transacción
- ✅ Datos consistentes
- ✅ Fácil de mantener
- ✅ Escalable

---

## 🔧 CONFIGURACIÓN REQUERIDA

### Variables de Entorno

```env
# Base de datos (obligatorio)
DATABASE_URL=postgresql://...

# JWT (obligatorio)
JWT_SECRET=tu_secret_key
NEXTAUTH_SECRET=tu_nextauth_secret

# Email (opcional)
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@tudominio.com

# WhatsApp (se configura después del registro)
# No se necesita para el registro
```

---

## 📝 RESUMEN

**Al registrarse, el usuario obtiene:**

1. ✅ Cuenta creada
2. ✅ Bot configurado
3. ✅ Prompts de IA listos
4. ✅ **Métodos de pago configurados** ← NUEVO
5. ✅ Verificación por WhatsApp
6. ✅ Acceso al dashboard

**Puede empezar a usar el bot en:**
- ⏱️ 2-3 minutos (con verificación)
- 🎯 Sin conocimientos técnicos
- 💰 Con métodos de pago ya configurados
- 🤖 Con IA lista para responder

**El sistema es verdaderamente plug-and-play!** 🚀
