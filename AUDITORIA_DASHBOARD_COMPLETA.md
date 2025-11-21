# 🔍 AUDITORÍA COMPLETA DEL DASHBOARD - Smart Sales Bot Pro

**Fecha**: 20 de Noviembre 2025  
**Estado**: En Progreso  
**Objetivo**: Verificar y corregir todas las funcionalidades del dashboard

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Configuración de Pagos](#configuración-de-pagos)
3. [Sistema de Suscripciones](#sistema-de-suscripciones)
4. [Seguridad](#seguridad)
5. [Funcionalidades del Dashboard](#funcionalidades-del-dashboard)
6. [Plan de Implementación](#plan-de-implementación)
7. [Aplicación de Escritorio (Electron)](#aplicación-de-escritorio)

---

## 🎯 RESUMEN EJECUTIVO

### ✅ Funcionalidades Implementadas
- ✅ Estructura de base de datos completa (Prisma)
- ✅ APIs de autenticación
- ✅ Sistema de productos
- ✅ Conversaciones y mensajes
- ✅ WhatsApp integration (Baileys)
- ✅ Sistema de agentes con memoria compartida
- ✅ Landing pages dinámicas

### ⚠️ Funcionalidades Parciales
- ⚠️ **Configuración de pagos** - UI existe pero falta validación
- ⚠️ **Suscripciones** - Modelo existe pero falta integración completa
- ⚠️ **Webhooks de pago** - Estructura básica sin testing
- ⚠️ **Generación de links dinámicos** - Implementado pero sin validación

### ❌ Funcionalidades Faltantes
- ❌ **Validación de credenciales de pago** en tiempo real
- ❌ **Testing de conexiones** a MercadoPago/PayPal
- ❌ **Encriptación de API keys** en base de datos
- ❌ **Logs de transacciones** de pago
- ❌ **Panel de administración** de suscripciones
- ❌ **Aplicación de escritorio** (Electron)

---

## 💳 CONFIGURACIÓN DE PAGOS

### Estado Actual

#### ✅ Lo que SÍ funciona:
1. **UI del Panel de Integraciones**
   - Componente: `PaymentIntegrationsPanel.tsx`
   - Tabs para cada método de pago
   - Toggle para habilitar/deshabilitar
   - Campos con show/hide de secretos

2. **Modelo de Base de Datos**
   ```prisma
   model PaymentIntegration {
     hotmartEnabled, hotmartApiKey, hotmartCheckoutUrl
     mercadopagoEnabled, mercadopagoAccessToken, mercadopagoPublicKey
     paypalEnabled, paypalClientId, paypalClientSecret
     nequiEnabled, daviplataEnabled, bankTransferEnabled
   }
   ```

3. **APIs Básicas**
   - `GET /api/integrations/payment` - Obtener config (con ofuscación)
   - `POST /api/integrations/payment` - Guardar config
   - `GET /api/payment-integration` - Config por usuario

#### ❌ Lo que NO funciona:

1. **Validación de Credenciales**
   - No se valida si las API keys son correctas
   - No hay testing de conexión en tiempo real
   - No se verifica formato de credenciales

2. **Seguridad**
   - ⚠️ **CRÍTICO**: API keys se guardan en texto plano
   - No hay encriptación en base de datos
   - Falta rate limiting en endpoints

3. **Generación de Links**
   - Existe código pero no está integrado con el panel
   - No se actualizan automáticamente los productos
   - Falta validación de URLs generadas

4. **Webhooks**
   - Estructura básica existe
   - No hay manejo de firmas/verificación
   - No se registran eventos en logs

### 🔧 Correcciones Necesarias

#### 1. Encriptación de API Keys
```typescript
// Implementar en: src/lib/encryption-service.ts
import crypto from 'crypto'

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY = process.env.ENCRYPTION_KEY!
  
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(this.KEY, 'hex'), iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }
  
  static decrypt(encrypted: string): string {
    const [ivHex, authTagHex, encryptedText] = encrypted.split(':')
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      Buffer.from(this.KEY, 'hex'),
      Buffer.from(ivHex, 'hex')
    )
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }
}
```

#### 2. Validación de Credenciales
```typescript
// src/lib/payment-validator.ts
export class PaymentValidator {
  static async validateMercadoPago(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.mercadopago.com/v1/account/settings', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      return response.ok
    } catch {
      return false
    }
  }
  
  static async validatePayPal(clientId: string, secret: string, mode: string): Promise<boolean> {
    const baseUrl = mode === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'
    
    try {
      const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')
      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      })
      return response.ok
    } catch {
      return false
    }
  }
}
```

#### 3. Endpoint de Testing
```typescript
// src/app/api/integrations/payment/test/route.ts
export async function POST(request: NextRequest) {
  const { provider, credentials } = await request.json()
  
  let isValid = false
  let message = ''
  
  switch (provider) {
    case 'mercadopago':
      isValid = await PaymentValidator.validateMercadoPago(credentials.accessToken)
      message = isValid ? 'Conexión exitosa con MercadoPago' : 'Credenciales inválidas'
      break
    
    case 'paypal':
      isValid = await PaymentValidator.validatePayPal(
        credentials.clientId,
        credentials.clientSecret,
        credentials.mode
      )
      message = isValid ? 'Conexión exitosa con PayPal' : 'Credenciales inválidas'
      break
  }
  
  return NextResponse.json({ isValid, message })
}
```

---

## 🔐 SEGURIDAD

### Vulnerabilidades Detectadas

#### 🔴 CRÍTICAS

1. **API Keys en Texto Plano**
   - **Riesgo**: Acceso directo a credenciales de pago
   - **Impacto**: Robo de fondos, fraude
   - **Solución**: Encriptación AES-256-GCM

2. **Sin Rate Limiting**
   - **Riesgo**: Ataques de fuerza bruta
   - **Impacto**: Sobrecarga del servidor
   - **Solución**: Implementar rate limiting con Redis o memoria

3. **Tokens de Sesión Sin Rotación**
   - **Riesgo**: Session hijacking
   - **Impacto**: Acceso no autorizado
   - **Solución**: Rotación automática de tokens

#### 🟡 MEDIAS

1. **Logs de Transacciones Insuficientes**
   - Falta registro detallado de operaciones
   - No hay auditoría de cambios

2. **Validación de Entrada Débil**
   - Falta sanitización de inputs
   - No hay validación de tipos estricta

### Plan de Seguridad

```typescript
// src/lib/security-service.ts
export class SecurityService {
  // Rate limiting en memoria (para desarrollo)
  private static requests = new Map<string, number[]>()
  
  static checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const requests = this.requests.get(ip) || []
    
    // Limpiar requests antiguos
    const validRequests = requests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(ip, validRequests)
    return true
  }
  
  // Sanitización de inputs
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 1000) // Límite de longitud
  }
  
  // Validación de API keys
  static validateApiKeyFormat(key: string, provider: string): boolean {
    const patterns = {
      mercadopago: /^APP_USR-[a-zA-Z0-9-]+$/,
      paypal: /^[A-Z0-9]{80}$/,
      hotmart: /^[a-f0-9]{32}$/
    }
    return patterns[provider]?.test(key) || false
  }
}
```

---

## 📊 SISTEMA DE SUSCRIPCIONES

### Estado Actual

#### ✅ Implementado:
- Modelo `Subscription` en Prisma
- Modelo `SubscriptionPlan`
- Enum `MembershipType` (FREE, TRIAL, BASIC, PROFESSIONAL, ENTERPRISE)
- API básica de suscripciones

#### ❌ Faltante:
- Panel de administración de suscripciones
- Integración con pasarelas de pago
- Renovación automática
- Notificaciones de expiración
- Downgrade/Upgrade de planes

### Implementación Necesaria

```typescript
// src/lib/subscription-service.ts
export class SubscriptionService {
  static async checkExpiration(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { membershipEnds: true, membershipType: true }
    })
    
    if (!user?.membershipEnds) return { expired: false }
    
    const now = new Date()
    const expired = user.membershipEnds < now
    
    if (expired && user.membershipType !== 'FREE') {
      // Downgrade a FREE
      await db.user.update({
        where: { id: userId },
        data: { membershipType: 'FREE' }
      })
      
      // Enviar notificación
      await this.sendExpirationNotification(userId)
    }
    
    return { expired, daysLeft: this.getDaysLeft(user.membershipEnds) }
  }
  
  static getDaysLeft(expirationDate: Date): number {
    const now = new Date()
    const diff = expirationDate.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
  
  static async sendExpirationNotification(userId: string) {
    // Implementar notificación por email/WhatsApp
  }
}
```

---

## 🖥️ FUNCIONALIDADES DEL DASHBOARD

### Checklist de Funcionalidades

#### Productos
- [x] Crear producto
- [x] Editar producto
- [x] Eliminar producto
- [x] Importar/Exportar CSV/JSON
- [x] Gestión de imágenes
- [ ] Validación de stock en tiempo real
- [ ] Historial de cambios

#### Conversaciones
- [x] Ver conversaciones
- [x] Filtrar por estado
- [x] Ver mensajes
- [ ] Responder manualmente
- [ ] Asignar etiquetas
- [ ] Exportar conversaciones

#### Configuración
- [x] Información del negocio
- [x] Configuración de IA
- [x] Personalidad del bot
- [x] Métodos de pago (UI)
- [ ] Métodos de pago (validación)
- [ ] Webhooks
- [ ] Notificaciones

#### WhatsApp
- [x] Conectar/Desconectar
- [x] Ver QR
- [x] Estado de conexión
- [x] Limpieza de sesión
- [ ] Múltiples números
- [ ] Estadísticas de mensajes

#### Estadísticas
- [x] Métricas básicas
- [ ] Gráficos de ventas
- [ ] Análisis de conversiones
- [ ] Reportes exportables

---

## 📝 PLAN DE IMPLEMENTACIÓN

### Fase 1: Seguridad (URGENTE) - 2 días

1. **Día 1: Encriptación**
   - [ ] Implementar `EncryptionService`
   - [ ] Migrar API keys existentes
   - [ ] Actualizar APIs de guardado
   - [ ] Testing de encriptación/desencriptación

2. **Día 2: Validación y Rate Limiting**
   - [ ] Implementar `PaymentValidator`
   - [ ] Crear endpoint `/api/integrations/payment/test`
   - [ ] Implementar rate limiting
   - [ ] Agregar logs de seguridad

### Fase 2: Pagos Funcionales - 3 días

1. **Día 3: MercadoPago**
   - [ ] Validación de credenciales
   - [ ] Generación de links dinámicos
   - [ ] Testing de webhooks
   - [ ] Manejo de errores

2. **Día 4: PayPal**
   - [ ] Validación de credenciales
   - [ ] Integración con PayPal SDK
   - [ ] Testing de pagos sandbox
   - [ ] Webhooks de PayPal

3. **Día 5: Métodos Locales**
   - [ ] Validación de Nequi/Daviplata
   - [ ] Generación de instrucciones
   - [ ] Confirmación manual de pagos
   - [ ] Notificaciones

### Fase 3: Suscripciones - 2 días

1. **Día 6: Sistema de Suscripciones**
   - [ ] Panel de administración
   - [ ] Renovación automática
   - [ ] Notificaciones de expiración
   - [ ] Upgrade/Downgrade

2. **Día 7: Integración con Pagos**
   - [ ] Conectar suscripciones con MercadoPago
   - [ ] Conectar con PayPal
   - [ ] Testing end-to-end
   - [ ] Documentación

### Fase 4: Aplicación Electron - 5 días

1. **Día 8-9: Setup Electron**
   - [ ] Configurar Electron
   - [ ] Integrar Next.js
   - [ ] Sistema de actualizaciones
   - [ ] Empaquetado

2. **Día 10-11: Features Desktop**
   - [ ] Notificaciones nativas
   - [ ] Tray icon
   - [ ] Auto-start
   - [ ] Shortcuts

3. **Día 12: Testing y Deploy**
   - [ ] Testing en Windows/Mac/Linux
   - [ ] Firma de aplicación
   - [ ] Instaladores
   - [ ] Documentación

---

## 💻 APLICACIÓN DE ESCRITORIO (ELECTRON)

### Arquitectura Propuesta

```
smart-sales-bot-desktop/
├── electron/
│   ├── main.ts              # Proceso principal
│   ├── preload.ts           # Script de preload
│   ├── tray.ts              # Icono en bandeja
│   └── updater.ts           # Auto-actualización
├── src/                     # Código Next.js existente
├── electron-builder.json    # Configuración de empaquetado
└── package.json             # Scripts de Electron
```

### Características

1. **Ventana Principal**
   - Dashboard completo de Next.js
   - Navegación nativa
   - Shortcuts de teclado

2. **Tray Icon**
   - Acceso rápido
   - Notificaciones
   - Estado de WhatsApp

3. **Notificaciones Nativas**
   - Nuevos mensajes
   - Pagos recibidos
   - Alertas del sistema

4. **Auto-actualización**
   - Actualizaciones automáticas
   - Changelog integrado
   - Rollback si falla

### Implementación Básica

```typescript
// electron/main.ts
import { app, BrowserWindow, Tray, Menu } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null
let tray: Tray | null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, '../public/smart-sales-bot-logo.png')
  })

  // En desarrollo: localhost:3000
  // En producción: archivo local
  const url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`

  mainWindow.loadURL(url)
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../public/smart-sales-bot-logo.png'))
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir Dashboard', click: () => mainWindow?.show() },
    { label: 'Estado WhatsApp', click: () => checkWhatsAppStatus() },
    { type: 'separator' },
    { label: 'Salir', click: () => app.quit() }
  ])
  
  tray.setContextMenu(contextMenu)
  tray.setToolTip('Smart Sales Bot Pro')
}

app.whenReady().then(() => {
  createWindow()
  createTray()
})
```

### Scripts de Desarrollo

```json
{
  "scripts": {
    "dev": "next dev",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "next build && electron-builder",
    "electron:pack": "electron-builder --dir",
    "electron:dist": "electron-builder"
  },
  "build": {
    "appId": "com.smartsalesbot.app",
    "productName": "Smart Sales Bot Pro",
    "directories": {
      "output": "dist"
    },
    "files": [
      "electron/**/*",
      "out/**/*",
      "public/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/smart-sales-bot-logo.png"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "public/smart-sales-bot-logo.png"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "public/smart-sales-bot-logo.png"
    }
  }
}
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### HOY (20 Nov 2025)

1. **Implementar Encriptación** ⚠️ CRÍTICO
   ```bash
   # Generar clave de encriptación
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Agregar a .env: ENCRYPTION_KEY=...
   ```

2. **Crear Servicio de Validación**
   - Archivo: `src/lib/payment-validator.ts`
   - Testing de MercadoPago
   - Testing de PayPal

3. **Actualizar Panel de Pagos**
   - Botón "Probar Conexión"
   - Indicadores de estado
   - Mensajes de error claros

### MAÑANA (21 Nov 2025)

1. **Implementar Webhooks Completos**
2. **Sistema de Logs de Transacciones**
3. **Panel de Suscripciones**

### ESTA SEMANA

1. **Completar Integración de Pagos**
2. **Testing End-to-End**
3. **Iniciar Aplicación Electron**

---

## 📚 RECURSOS Y DOCUMENTACIÓN

### APIs de Pago
- [MercadoPago Docs](https://www.mercadopago.com.co/developers/es/docs)
- [PayPal Developer](https://developer.paypal.com/docs/api/overview/)
- [Stripe Docs](https://stripe.com/docs/api)

### Electron
- [Electron Docs](https://www.electronjs.org/docs/latest/)
- [Electron Builder](https://www.electron.build/)
- [Next.js + Electron](https://github.com/vercel/next.js/tree/canary/examples/with-electron)

### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Última actualización**: 20 de Noviembre 2025  
**Responsable**: Equipo de Desarrollo  
**Estado**: 🟡 En Progreso
