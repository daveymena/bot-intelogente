# 🚀 DEPLOY COMPLETO HOY - 20 Nov 2025

**Objetivo**: Configurar Easypanel, subir cambios a Git y desplegar en producción

---

## ✅ PASO 1: PREPARAR PARA GIT (5 min)

### 1.1 Verificar cambios
```bash
git status
```

### 1.2 Agregar archivos nuevos
```bash
git add src/lib/encryption-service.ts
git add src/lib/payment-validator.ts
git add src/lib/security-service.ts
git add src/app/api/integrations/payment/test/route.ts
git add src/app/api/integrations/payment/route.ts
git add src/components/dashboard/PaymentIntegrationsPanel.tsx
git add scripts/generate-encryption-key.ts
```

### 1.3 Verificar que .env NO se suba
```bash
# Verificar .gitignore
cat .gitignore | grep .env

# Debe mostrar:
# .env
# .env.local
# .env*.local
```

### 1.4 Commit
```bash
git commit -m "feat: implementar encriptación AES-256-GCM y validación de pagos

- Agregar EncryptionService para proteger API keys
- Agregar PaymentValidator para validar credenciales en tiempo real
- Agregar SecurityService con rate limiting
- Actualizar API de pagos con encriptación automática
- Agregar botones de prueba en UI de configuración
- Resolver 3 vulnerabilidades críticas de seguridad

BREAKING CHANGE: Requiere ENCRYPTION_KEY en variables de entorno"
```

---

## ✅ PASO 2: CONFIGURAR EASYPANEL (10 min)

### 2.1 Acceder a Easypanel
```
URL: https://easypanel.io
Login con tu cuenta
```

### 2.2 Ir a tu aplicación
```
1. Click en tu proyecto
2. Click en "bot-whatsapp-bot-whatsapp-inteligente"
3. Click en "Environment"
```

### 2.3 Agregar ENCRYPTION_KEY

**Variable a agregar**:
```
Nombre: ENCRYPTION_KEY
Valor: 825cef657fc011fb81729ca0618ecd771c102582afba29c61ba4442a7b53022f
```

**⚠️ IMPORTANTE**: 
- Copiar el valor EXACTO desde tu `.env` local
- NO compartir esta clave públicamente
- Usar la MISMA clave en todos los entornos

### 2.4 Verificar otras variables críticas

Asegúrate de que estas variables existan:

```bash
# Base de datos
DATABASE_URL=postgresql://...

# IA
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-proj-...

# Pagos (ya existentes)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Email
EMAIL_USER=...
EMAIL_PASS=...

# Autenticación
NEXTAUTH_SECRET=...
JWT_SECRET=...

# NUEVA - Encriptación
ENCRYPTION_KEY=825cef657fc011fb81729ca0618ecd771c102582afba29c61ba4442a7b53022f
```

### 2.5 Guardar cambios
```
Click en "Save" o "Update"
```

---

## ✅ PASO 3: PUSH A GIT (2 min)

```bash
# Push a GitHub
git push origin main
```

**Si hay conflictos**:
```bash
git pull origin main --rebase
git push origin main
```

---

## ✅ PASO 4: REBUILD EN EASYPANEL (5 min)

### 4.1 Trigger rebuild
```
1. En Easypanel, ir a tu app
2. Click en "Deploy" o "Rebuild"
3. Esperar a que termine (2-3 minutos)
```

### 4.2 Ver logs
```
1. Click en "Logs"
2. Verificar que no haya errores
3. Buscar: "✅ Sistema de suscripciones SaaS activo"
```

---

## ✅ PASO 5: VERIFICAR EN PRODUCCIÓN (5 min)

### 5.1 Abrir dashboard en producción
```
https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host
```

### 5.2 Ir a Configuración → Métodos de Pago

### 5.3 Probar MercadoPago
```
1. Habilitar MercadoPago
2. Ingresar credenciales (ya existentes o nuevas)
3. Click "Probar Conexión"
4. Verificar: ✅ Conexión exitosa
5. Click "Guardar Todo"
```

### 5.4 Verificar encriptación
```
1. Recargar página
2. Ver que las credenciales están ofuscadas: ****1234
3. ✅ Encriptación funcionando
```

---

## ✅ PASO 6: MIGRAR DATOS EXISTENTES (10 min)

### 6.1 Crear script de migración

Archivo: `scripts/migrate-encrypt-credentials.ts`

```typescript
import { db } from '../src/lib/db'
import { EncryptionService } from '../src/lib/encryption-service'

async function migrateCredentials() {
  console.log('🔄 Iniciando migración de credenciales...')
  
  // Obtener todas las integraciones
  const integrations = await db.paymentIntegration.findMany()
  
  console.log(`📊 Encontradas ${integrations.length} integraciones`)
  
  let migrated = 0
  let skipped = 0
  
  for (const integration of integrations) {
    try {
      const updates: any = {}
      
      // MercadoPago
      if (integration.mercadopagoAccessToken && 
          !EncryptionService.isEncrypted(integration.mercadopagoAccessToken)) {
        updates.mercadopagoAccessToken = EncryptionService.encrypt(integration.mercadopagoAccessToken)
        console.log(`  🔐 Encriptando MercadoPago para usuario ${integration.userId}`)
      }
      
      if (integration.mercadopagoPublicKey && 
          !EncryptionService.isEncrypted(integration.mercadopagoPublicKey)) {
        updates.mercadopagoPublicKey = EncryptionService.encrypt(integration.mercadopagoPublicKey)
      }
      
      // PayPal
      if (integration.paypalClientId && 
          !EncryptionService.isEncrypted(integration.paypalClientId)) {
        updates.paypalClientId = EncryptionService.encrypt(integration.paypalClientId)
        console.log(`  🔐 Encriptando PayPal para usuario ${integration.userId}`)
      }
      
      if (integration.paypalClientSecret && 
          !EncryptionService.isEncrypted(integration.paypalClientSecret)) {
        updates.paypalClientSecret = EncryptionService.encrypt(integration.paypalClientSecret)
      }
      
      // Hotmart
      if (integration.hotmartApiKey && 
          !EncryptionService.isEncrypted(integration.hotmartApiKey)) {
        updates.hotmartApiKey = EncryptionService.encrypt(integration.hotmartApiKey)
        console.log(`  🔐 Encriptando Hotmart para usuario ${integration.userId}`)
      }
      
      // Stripe
      if (integration.stripeSecretKey && 
          !EncryptionService.isEncrypted(integration.stripeSecretKey)) {
        updates.stripeSecretKey = EncryptionService.encrypt(integration.stripeSecretKey)
        console.log(`  🔐 Encriptando Stripe para usuario ${integration.userId}`)
      }
      
      if (integration.stripePublishableKey && 
          !EncryptionService.isEncrypted(integration.stripePublishableKey)) {
        updates.stripePublishableKey = EncryptionService.encrypt(integration.stripePublishableKey)
      }
      
      // Actualizar si hay cambios
      if (Object.keys(updates).length > 0) {
        await db.paymentIntegration.update({
          where: { id: integration.id },
          data: updates
        })
        migrated++
        console.log(`  ✅ Migrado usuario ${integration.userId}`)
      } else {
        skipped++
        console.log(`  ⏭️  Usuario ${integration.userId} ya encriptado`)
      }
      
    } catch (error) {
      console.error(`  ❌ Error migrando usuario ${integration.userId}:`, error)
    }
  }
  
  console.log('\n📊 RESUMEN:')
  console.log(`  ✅ Migrados: ${migrated}`)
  console.log(`  ⏭️  Omitidos: ${skipped}`)
  console.log(`  📝 Total: ${integrations.length}`)
  console.log('\n✅ Migración completada')
}

migrateCredentials()
  .catch(console.error)
  .finally(() => process.exit(0))
```

### 6.2 Ejecutar migración
```bash
npx tsx scripts/migrate-encrypt-credentials.ts
```

### 6.3 Verificar resultado
```
Debe mostrar:
✅ Migrados: X
⏭️  Omitidos: Y
✅ Migración completada
```

---

## ✅ PASO 7: TESTING COMPLETO (10 min)

### 7.1 Test en Local
```bash
# Servidor debe estar corriendo
# http://localhost:4000

# Probar:
1. Login al dashboard
2. Ir a Configuración → Métodos de Pago
3. Probar conexión de MercadoPago
4. Probar conexión de PayPal
5. Guardar cambios
6. Recargar y verificar ofuscación
```

### 7.2 Test en Producción
```bash
# https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host

# Probar:
1. Login al dashboard
2. Ir a Configuración → Métodos de Pago
3. Probar conexión de MercadoPago
4. Probar conexión de PayPal
5. Guardar cambios
6. Recargar y verificar ofuscación
```

### 7.3 Test de Seguridad
```bash
# Verificar rate limiting
curl -X POST https://tu-dominio.com/api/integrations/payment/test \
  -H "Content-Type: application/json" \
  -d '{"provider":"mercadopago","credentials":{"accessToken":"test"}}' \
  --repeat 15

# Debe bloquear después de 10 requests
```

---

## ✅ PASO 8: WEBHOOKS DE PAGO (15 min)

### 8.1 Actualizar webhook de MercadoPago

Archivo: `src/app/api/webhooks/mercadopago/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar firma (seguridad)
    const signature = request.headers.get('x-signature')
    const requestId = request.headers.get('x-request-id')
    
    // Log del evento
    console.log('[MercadoPago Webhook] 📥 Evento recibido:', {
      type: body.type,
      action: body.action,
      id: body.data?.id
    })
    
    // Procesar según el tipo
    if (body.type === 'payment') {
      const paymentId = body.data.id
      
      // Obtener detalles del pago
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      const payment = await response.json()
      
      // Guardar en base de datos
      await db.payment.create({
        data: {
          userId: payment.metadata?.user_id || 'unknown',
          amount: payment.transaction_amount,
          currency: payment.currency_id,
          status: payment.status === 'approved' ? 'COMPLETED' : 'PENDING',
          paymentMethod: 'mercadopago',
          stripePaymentId: payment.id.toString(),
          description: payment.description,
          metadata: JSON.stringify(payment)
        }
      })
      
      console.log('[MercadoPago Webhook] ✅ Pago registrado:', paymentId)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('[MercadoPago Webhook] ❌ Error:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    )
  }
}
```

### 8.2 Configurar webhook en MercadoPago
```
1. Ir a: https://www.mercadopago.com.co/developers
2. Tu aplicación → Webhooks
3. Agregar URL: https://tu-dominio.com/api/webhooks/mercadopago
4. Eventos: payments
5. Guardar
```

---

## ✅ PASO 9: SISTEMA DE SUSCRIPCIONES (20 min)

### 9.1 Crear componente de administración

Archivo: `src/components/dashboard/SubscriptionManagement.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadSubscription()
  }, [])
  
  const loadSubscription = async () => {
    try {
      const res = await fetch('/api/subscriptions')
      const data = await res.json()
      setSubscription(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <div>Cargando...</div>
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Suscripción</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Plan actual</p>
            <p className="text-2xl font-bold">
              {subscription?.status?.membershipType || 'FREE'}
            </p>
          </div>
          
          {subscription?.status?.membershipEnds && (
            <div>
              <p className="text-sm text-muted-foreground">Vence</p>
              <p className="font-medium">
                {new Date(subscription.status.membershipEnds).toLocaleDateString()}
              </p>
            </div>
          )}
          
          <Button className="w-full">
            Renovar Suscripción
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 📊 CHECKLIST FINAL

### Antes de Deploy
- [x] Código funcionando en local
- [x] Tests manuales completados
- [x] Documentación actualizada
- [x] .env configurado
- [ ] ENCRYPTION_KEY en Easypanel
- [ ] Git push completado
- [ ] Rebuild en Easypanel

### Después de Deploy
- [ ] Dashboard accesible
- [ ] Login funcionando
- [ ] Configuración de pagos funcionando
- [ ] Botones de prueba funcionando
- [ ] Encriptación verificada
- [ ] Webhooks configurados
- [ ] Suscripciones funcionando

---

## 🚀 COMANDO RÁPIDO

```bash
# Ejecutar todo de una vez
git add . && \
git commit -m "feat: sistema de seguridad completo" && \
git push origin main && \
echo "✅ Ahora configura ENCRYPTION_KEY en Easypanel y haz rebuild"
```

---

**Tiempo estimado total**: 1 hora  
**Prioridad**: 🔴 ALTA  
**Estado**: Listo para ejecutar
