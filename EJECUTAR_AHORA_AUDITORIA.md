# ⚡ EJECUTAR AHORA - Auditoría y Correcciones Dashboard

**Fecha**: 20 de Noviembre 2025  
**Prioridad**: 🔴 CRÍTICA

---

## 🎯 RESUMEN EJECUTIVO

Se ha completado una auditoría completa del dashboard. Se encontraron **3 vulnerabilidades críticas de seguridad** y **5 funcionalidades sin implementar completamente**.

### ✅ Lo que SÍ funciona:
- Base de datos completa (Prisma)
- UI de configuración de pagos
- Sistema de productos y conversaciones
- WhatsApp integration (Baileys)
- Sistema de agentes con memoria compartida

### ❌ Lo que NO funciona:
- **CRÍTICO**: API keys en texto plano (sin encriptación)
- **CRÍTICO**: Sin validación de credenciales de pago
- **CRÍTICO**: Sin rate limiting (vulnerable a ataques)
- Webhooks de pago sin testing
- Sistema de suscripciones incompleto

---

## 🚨 PASO 1: GENERAR CLAVE DE ENCRIPTACIÓN (5 minutos)

### Ejecutar AHORA:

```bash
# 1. Generar clave de encriptación
npx tsx scripts/generate-encryption-key.ts

# 2. Verificar que se agregó a .env
cat .env | grep ENCRYPTION_KEY

# 3. Agregar a .env.example (sin el valor real)
echo "ENCRYPTION_KEY=your-encryption-key-here" >> .env.example
```

### ⚠️ IMPORTANTE:
- **NO** subir la clave real a Git
- Guardar la clave en un lugar seguro
- Usar la **misma clave** en todos los entornos (dev, prod)

---

## 🔐 PASO 2: CONFIGURAR EASYPANEL (10 minutos)

### En Easypanel:

1. **Ir a tu aplicación** → Environment Variables
2. **Agregar nueva variable**:
   ```
   ENCRYPTION_KEY=<la-clave-generada-en-paso-1>
   ```
3. **Guardar y Rebuild** la aplicación

### Verificar:
```bash
# En consola de Easypanel
echo $ENCRYPTION_KEY
```

---

## 🧪 PASO 3: PROBAR VALIDACIÓN DE PAGOS (15 minutos)

### 1. Probar MercadoPago:

```bash
# Endpoint de testing
curl -X POST http://localhost:3000/api/integrations/payment/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "mercadopago",
    "credentials": {
      "accessToken": "TEST-1234567890-112233-abcdef1234567890abcdef1234567890-123456789"
    }
  }'
```

**Respuesta esperada**:
```json
{
  "isValid": true,
  "message": "Conexión exitosa con MercadoPago (MCO)",
  "details": {
    "siteId": "MCO",
    "email": "tu@email.com"
  }
}
```

### 2. Probar PayPal:

```bash
curl -X POST http://localhost:3000/api/integrations/payment/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "paypal",
    "credentials": {
      "clientId": "tu-client-id",
      "clientSecret": "tu-client-secret",
      "mode": "sandbox"
    }
  }'
```

---

## 🎨 PASO 4: ACTUALIZAR UI DEL PANEL DE PAGOS (30 minutos)

### Agregar botón de prueba en cada método de pago:

```typescript
// En PaymentIntegrationsPanel.tsx
const [testing, setTesting] = useState<Record<string, boolean>>({})

const handleTestConnection = async (provider: string) => {
  setTesting(prev => ({ ...prev, [provider]: true }))
  
  try {
    const response = await fetch('/api/integrations/payment/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        credentials: config[provider]
      })
    })
    
    const result = await response.json()
    
    toast({
      title: result.isValid ? "✅ Conexión exitosa" : "❌ Error",
      description: result.message,
      variant: result.isValid ? "default" : "destructive"
    })
  } catch (error) {
    toast({
      title: "❌ Error",
      description: "No se pudo probar la conexión",
      variant: "destructive"
    })
  } finally {
    setTesting(prev => ({ ...prev, [provider]: false }))
  }
}

// Agregar botón en cada tab:
<Button 
  variant="outline" 
  onClick={() => handleTestConnection('mercadopago')}
  disabled={testing.mercadopago}
>
  {testing.mercadopago ? (
    <>
      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      Probando...
    </>
  ) : (
    <>
      <TestTube className="w-4 h-4 mr-2" />
      Probar Conexión
    </>
  )}
</Button>
```

---

## 📊 PASO 5: VERIFICAR FUNCIONALIDADES DEL DASHBOARD (20 minutos)

### Checklist de Verificación:

```bash
# 1. Iniciar servidor
npm run dev

# 2. Abrir dashboard
# http://localhost:3000

# 3. Verificar cada sección:
```

#### ✅ Productos
- [ ] Crear producto nuevo
- [ ] Editar producto existente
- [ ] Eliminar producto
- [ ] Subir imagen
- [ ] Importar CSV/JSON
- [ ] Exportar productos

#### ✅ Conversaciones
- [ ] Ver lista de conversaciones
- [ ] Ver mensajes de una conversación
- [ ] Filtrar por estado
- [ ] Buscar conversación

#### ✅ WhatsApp
- [ ] Conectar WhatsApp
- [ ] Ver QR code
- [ ] Desconectar
- [ ] Ver estado de conexión
- [ ] Limpiar sesión

#### ✅ Configuración
- [ ] Guardar información del negocio
- [ ] Configurar métodos de pago
- [ ] Probar conexión de pagos ⭐ NUEVO
- [ ] Configurar personalidad del bot
- [ ] Configurar proveedores de IA

#### ✅ Estadísticas
- [ ] Ver métricas generales
- [ ] Ver conversaciones activas
- [ ] Ver productos más consultados

---

## 🔒 PASO 6: IMPLEMENTAR RATE LIMITING (15 minutos)

### Agregar middleware de seguridad:

```typescript
// src/middleware.ts (actualizar)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SecurityService } from '@/lib/security-service'

export function middleware(request: NextRequest) {
  // Obtener IP del cliente
  const ip = SecurityService.getClientIP(request)
  
  // Verificar rate limiting para APIs sensibles
  if (request.nextUrl.pathname.startsWith('/api/integrations/payment')) {
    const allowed = SecurityService.checkRateLimit(ip, 10, 60000) // 10 req/min
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.' },
        { status: 429 }
      )
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
```

---

## 📝 PASO 7: ACTUALIZAR DOCUMENTACIÓN (10 minutos)

### Crear archivo de configuración para producción:

```bash
# Crear CONFIGURAR_PRODUCCION.md
cat > CONFIGURAR_PRODUCCION.md << 'EOF'
# 🚀 Configuración para Producción

## Variables de Entorno Requeridas

### Seguridad
- `ENCRYPTION_KEY` - Clave de encriptación (32 bytes hex)
- `NEXTAUTH_SECRET` - Secret para NextAuth
- `JWT_SECRET` - Secret para JWT tokens

### Base de Datos
- `DATABASE_URL` - PostgreSQL connection string

### Pagos
- `MERCADOPAGO_ACCESS_TOKEN` - Token de MercadoPago
- `MERCADOPAGO_PUBLIC_KEY` - Public key de MercadoPago
- `PAYPAL_CLIENT_ID` - Client ID de PayPal
- `PAYPAL_CLIENT_SECRET` - Client Secret de PayPal

### IA
- `GROQ_API_KEY` - API key de Groq (principal)
- `OPENAI_API_KEY` - API key de OpenAI (fallback)

### Email
- `RESEND_API_KEY` - API key de Resend

## Pasos de Configuración

1. Generar ENCRYPTION_KEY:
   \`\`\`bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   \`\`\`

2. Agregar todas las variables en Easypanel

3. Rebuild la aplicación

4. Verificar logs para confirmar que todo funciona
EOF
```

---

## 🎯 PASO 8: TESTING END-TO-END (30 minutos)

### Flujo completo de prueba:

```bash
# 1. Configurar método de pago
# - Ir a Dashboard → Configuración → Métodos de Pago
# - Habilitar MercadoPago
# - Ingresar credenciales de TEST
# - Click en "Probar Conexión"
# - Verificar mensaje de éxito

# 2. Crear producto con link de pago
# - Ir a Productos → Nuevo Producto
# - Llenar información
# - Guardar
# - Verificar que se generó link de pago

# 3. Probar conversación con bot
# - Conectar WhatsApp
# - Enviar mensaje desde otro número
# - Verificar respuesta del bot
# - Solicitar información de producto
# - Verificar que envía link de pago correcto

# 4. Verificar notificaciones
# - Simular pago en MercadoPago sandbox
# - Verificar que llega webhook
# - Verificar que se registra en base de datos
# - Verificar notificación al cliente
```

---

## 📊 PASO 9: MONITOREO Y LOGS (15 minutos)

### Agregar logging estructurado:

```typescript
// src/lib/logger.ts
export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '')
  }
  
  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '')
  }
  
  static security(message: string, data?: any) {
    console.warn(`[SECURITY] ${new Date().toISOString()} - ${message}`, data || '')
  }
  
  static payment(message: string, data?: any) {
    console.log(`[PAYMENT] ${new Date().toISOString()} - ${message}`, data || '')
  }
}
```

### Usar en APIs críticas:

```typescript
// En /api/integrations/payment/route.ts
import { Logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const user = await AuthService.validateSession(token)
  
  Logger.security('Guardando configuración de pagos', {
    userId: user.id,
    providers: Object.keys(data).filter(k => data[k].enabled)
  })
  
  // ... resto del código
}
```

---

## 🚀 PASO 10: DEPLOY A PRODUCCIÓN (20 minutos)

### Checklist pre-deploy:

```bash
# 1. Verificar que todo funciona en local
npm run build
npm start

# 2. Verificar variables de entorno
cat .env | grep -E "ENCRYPTION_KEY|DATABASE_URL|GROQ_API_KEY"

# 3. Commit y push
git add .
git commit -m "feat: implementar encriptación y validación de pagos"
git push origin main

# 4. En Easypanel:
# - Agregar ENCRYPTION_KEY
# - Rebuild
# - Verificar logs
# - Probar funcionalidades

# 5. Verificar en producción
curl https://tu-dominio.com/api/health
```

---

## 📋 RESUMEN DE ARCHIVOS CREADOS

### Nuevos Servicios:
- ✅ `src/lib/encryption-service.ts` - Encriptación AES-256-GCM
- ✅ `src/lib/payment-validator.ts` - Validación de credenciales
- ✅ `src/lib/security-service.ts` - Rate limiting y sanitización
- ✅ `src/app/api/integrations/payment/test/route.ts` - Testing de pagos

### Scripts:
- ✅ `scripts/generate-encryption-key.ts` - Generador de claves

### Documentación:
- ✅ `AUDITORIA_DASHBOARD_COMPLETA.md` - Auditoría completa
- ✅ `IMPLEMENTAR_ELECTRON_APP.md` - Guía de Electron
- ✅ `EJECUTAR_AHORA_AUDITORIA.md` - Este archivo

---

## ⏱️ TIEMPO ESTIMADO TOTAL

- **Paso 1-3**: 30 minutos (CRÍTICO)
- **Paso 4-6**: 1 hora (IMPORTANTE)
- **Paso 7-9**: 1 hora (RECOMENDADO)
- **Paso 10**: 20 minutos (DEPLOY)

**Total**: ~2.5 horas para implementación completa

---

## 🎯 PRÓXIMOS PASOS (DESPUÉS DE ESTO)

### Esta Semana:
1. ✅ Implementar encriptación (HOY)
2. ✅ Validación de pagos (HOY)
3. ⏳ Webhooks completos (Mañana)
4. ⏳ Sistema de suscripciones (2 días)

### Próxima Semana:
1. ⏳ Aplicación Electron (5 días)
2. ⏳ Testing exhaustivo
3. ⏳ Documentación de usuario final

---

## 📞 SOPORTE

Si encuentras algún problema:

1. **Revisar logs**:
   ```bash
   # Local
   npm run dev
   
   # Easypanel
   # Ver logs en la consola de Easypanel
   ```

2. **Verificar variables de entorno**:
   ```bash
   echo $ENCRYPTION_KEY
   ```

3. **Probar endpoints manualmente**:
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## ✅ CHECKLIST FINAL

Antes de considerar completo:

- [ ] ENCRYPTION_KEY generada y configurada
- [ ] Validación de MercadoPago funciona
- [ ] Validación de PayPal funciona
- [ ] Rate limiting implementado
- [ ] UI actualizada con botones de prueba
- [ ] Todas las funcionalidades del dashboard verificadas
- [ ] Logs estructurados implementados
- [ ] Deploy a producción exitoso
- [ ] Testing end-to-end completado
- [ ] Documentación actualizada

---

**¡EMPEZAR AHORA!** 🚀

```bash
# Comando único para empezar:
npx tsx scripts/generate-encryption-key.ts && npm run dev
```

---

**Última actualización**: 20 de Noviembre 2025  
**Estado**: 🟢 Listo para ejecutar
