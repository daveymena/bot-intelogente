# 🔐 SISTEMA DE INTEGRACIONES DE PAGO - COMPLETO

## ✅ LO QUE SE HA IMPLEMENTADO

### 1. Base de Datos (Prisma Schema)
- ✅ Modelo `PaymentIntegration` creado
- ✅ Relación con User
- ✅ Campos para todas las integraciones:
  - Hotmart (API Key, Product ID, Checkout URL, Email)
  - MercadoPago (Access Token, Public Key, Email)
  - PayPal (Client ID, Secret, Email, Mode)
  - Stripe (Secret Key, Publishable Key, Webhook Secret)
  - Nequi (Phone, Name)
  - Daviplata (Phone, Name)
  - Transferencia Bancaria (Banco, Cuenta, Titular, etc.)

### 2. API Backend
- ✅ `src/app/api/integrations/payment/route.ts`
  - GET: Obtener configuración (con datos sensibles ofuscados)
  - POST: Guardar configuración
  - PUT: Actualizar productos con links

### 3. Seguridad
- ✅ Datos sensibles ofuscados al mostrar (****1234)
- ✅ Solo se muestran últimos 4 caracteres
- ✅ Autenticación requerida
- ✅ Validación de usuario

## ⏳ LO QUE FALTA IMPLEMENTAR

### 1. Componente de UI
Crear: `src/components/dashboard/PaymentIntegrationsPanel.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, Save, Check } from 'lucide-react'

export default function PaymentIntegrationsPanel() {
  // Estados para cada integración
  const [hotmart, setHotmart] = useState({
    enabled: false,
    apiKey: '',
    productId: '',
    checkoutUrl: '',
    email: ''
  })
  
  const [mercadopago, setMercadopago] = useState({
    enabled: false,
    accessToken: '',
    publicKey: '',
    email: ''
  })
  
  const [paypal, setPaypal] = useState({
    enabled: false,
    clientId: '',
    clientSecret: '',
    email: '',
    mode: 'sandbox'
  })
  
  const [nequi, setNequi] = useState({
    enabled: false,
    phone: '',
    name: ''
  })
  
  const [daviplata, setDaviplata] = useState({
    enabled: false,
    phone: '',
    name: ''
  })
  
  const [bankTransfer, setBankTransfer] = useState({
    enabled: false,
    bankName: '',
    accountNumber: '',
    accountType: 'Ahorros',
    accountHolder: '',
    idNumber: ''
  })
  
  const [showSecrets, setShowSecrets] = useState({
    hotmartApiKey: false,
    mercadopagoToken: false,
    paypalSecret: false
  })
  
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Cargar configuración al montar
  useEffect(() => {
    loadConfig()
  }, [])
  
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/integrations/payment')
      const data = await res.json()
      
      if (data.hotmart) setHotmart(data.hotmart)
      if (data.mercadopago) setMercadopago(data.mercadopago)
      if (data.paypal) setPaypal(data.paypal)
      if (data.nequi) setNequi(data.nequi)
      if (data.daviplata) setDaviplata(data.daviplata)
      if (data.bankTransfer) setBankTransfer(data.bankTransfer)
    } catch (error) {
      console.error('Error cargando configuración:', error)
    }
  }
  
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/integrations/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotmart,
          mercadopago,
          paypal,
          nequi,
          daviplata,
          bankTransfer
        })
      })
      
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error guardando:', error)
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Integraciones de Pago</h2>
          <p className="text-sm text-muted-foreground">
            Configura tus métodos de pago y genera links automáticamente
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
        </Button>
      </div>
      
      <Tabs defaultValue="hotmart">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="hotmart">Hotmart</TabsTrigger>
          <TabsTrigger value="mercadopago">MercadoPago</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="nequi">Nequi</TabsTrigger>
          <TabsTrigger value="daviplata">Daviplata</TabsTrigger>
          <TabsTrigger value="bank">Banco</TabsTrigger>
        </TabsList>
        
        {/* Tab Hotmart */}
        <TabsContent value="hotmart" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Habilitar Hotmart</Label>
            <Switch
              checked={hotmart.enabled}
              onCheckedChange={(checked) => setHotmart({...hotmart, enabled: checked})}
            />
          </div>
          
          {hotmart.enabled && (
            <>
              <div>
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets.hotmartApiKey ? 'text' : 'password'}
                    value={hotmart.apiKey}
                    onChange={(e) => setHotmart({...hotmart, apiKey: e.target.value})}
                    placeholder="Tu API Key de Hotmart"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecrets({...showSecrets, hotmartApiKey: !showSecrets.hotmartApiKey})}
                  >
                    {showSecrets.hotmartApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Product ID</Label>
                <Input
                  value={hotmart.productId}
                  onChange={(e) => setHotmart({...hotmart, productId: e.target.value})}
                  placeholder="ID del producto en Hotmart"
                />
              </div>
              
              <div>
                <Label>Checkout URL</Label>
                <Input
                  value={hotmart.checkoutUrl}
                  onChange={(e) => setHotmart({...hotmart, checkoutUrl: e.target.value})}
                  placeholder="https://pay.hotmart.com/XXXXXXXX"
                />
              </div>
              
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={hotmart.email}
                  onChange={(e) => setHotmart({...hotmart, email: e.target.value})}
                  placeholder="tu@email.com"
                />
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Tabs similares para MercadoPago, PayPal, Nequi, Daviplata, Banco */}
        {/* ... */}
      </Tabs>
    </Card>
  )
}
```

### 2. Agregar al Dashboard
En `src/components/dashboard/main-dashboard.tsx`:

```typescript
import PaymentIntegrationsPanel from './PaymentIntegrationsPanel'

// Agregar nueva pestaña
<TabsTrigger value="integrations">
  <CreditCard className="w-4 h-4 mr-2" />
  Integraciones
</TabsTrigger>

// Agregar contenido
<TabsContent value="integrations">
  <PaymentIntegrationsPanel />
</TabsContent>
```

### 3. Actualizar API para incluir todos los campos
Actualizar `src/app/api/integrations/payment/route.ts` para incluir:
- Nequi
- Daviplata
- Transferencia Bancaria

### 4. Servicio de Generación de Links
Crear: `src/lib/payment-integration-service.ts`

```typescript
export class PaymentIntegrationService {
  // Generar link de Hotmart
  static async generateHotmartLink(productId: string, price: number): Promise<string> {
    // Lógica para generar link
  }
  
  // Generar link de MercadoPago
  static async generateMercadoPagoLink(accessToken: string, price: number, title: string): Promise<string> {
    // Usar API de MercadoPago
  }
  
  // Generar link de PayPal
  static async generatePayPalLink(clientId: string, price: number): Promise<string> {
    // Usar API de PayPal
  }
  
  // Actualizar todos los productos digitales con links
  static async updateAllProductLinks(userId: string): Promise<void> {
    // Obtener configuración
    // Obtener productos digitales
    // Generar links para cada uno
    // Actualizar en BD
  }
}
```

### 5. Migración de Base de Datos
```bash
npx prisma db push
npx prisma generate
```

## 📋 CAMPOS POR INTEGRACIÓN

### Hotmart
- ✅ Enabled (Boolean)
- ✅ API Key (String, sensible)
- ✅ Product ID (String)
- ✅ Checkout URL (String)
- ✅ Email (String)

### MercadoPago
- ✅ Enabled (Boolean)
- ✅ Access Token (String, sensible)
- ✅ Public Key (String, sensible)
- ✅ Email (String)

### PayPal
- ✅ Enabled (Boolean)
- ✅ Client ID (String, sensible)
- ✅ Client Secret (String, sensible)
- ✅ Email (String)
- ✅ Mode (sandbox/live)

### Stripe
- ✅ Enabled (Boolean)
- ✅ Secret Key (String, sensible)
- ✅ Publishable Key (String, sensible)
- ✅ Webhook Secret (String, sensible)

### Nequi
- ✅ Enabled (Boolean)
- ✅ Phone (String)
- ✅ Name (String)

### Daviplata
- ✅ Enabled (Boolean)
- ✅ Phone (String)
- ✅ Name (String)

### Transferencia Bancaria
- ✅ Enabled (Boolean)
- ✅ Bank Name (String)
- ✅ Account Number (String, sensible)
- ✅ Account Type (Ahorros/Corriente)
- ✅ Account Holder (String)
- ✅ ID Number (String, sensible)

## 🔐 SEGURIDAD IMPLEMENTADA

### Ofuscación de Datos
```typescript
function maskSensitiveData(value: string): string {
  if (!value) return ''
  if (value.length <= 4) return '****'
  return '****' + value.slice(-4)
}
```

### Ejemplo:
- Input: `sk_live_51234567890abcdef`
- Output: `****cdef`

### Campos Sensibles
- API Keys
- Access Tokens
- Client Secrets
- Account Numbers
- ID Numbers

## 🚀 PRÓXIMOS PASOS

1. **Aplicar migración:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

2. **Crear componente UI:**
   - Copiar el código del componente
   - Crear archivo en `src/components/dashboard/PaymentIntegrationsPanel.tsx`

3. **Agregar al dashboard:**
   - Editar `main-dashboard.tsx`
   - Agregar nueva pestaña "Integraciones"

4. **Probar:**
   - Abrir dashboard
   - Ir a pestaña "Integraciones"
   - Configurar Hotmart, MercadoPago, PayPal
   - Guardar
   - Verificar que los datos se ofuscan

5. **Actualizar productos:**
   - Los productos digitales se actualizarán automáticamente
   - O crear botón "Actualizar Links" para hacerlo manual

## 📝 EJEMPLO DE USO

1. Usuario va a "Integraciones"
2. Habilita Hotmart
3. Ingresa API Key: `sk_live_123456789`
4. Ingresa Checkout URL: `https://pay.hotmart.com/A12345`
5. Guarda
6. Al recargar, ve: `****789` (ofuscado)
7. Los productos digitales ahora tienen links automáticos

## ✅ BENEFICIOS

- 🔐 Datos sensibles protegidos
- 🚀 Configuración centralizada
- 🔄 Links automáticos para productos
- 💳 Múltiples métodos de pago
- 🇨🇴 Métodos locales (Nequi, Daviplata)
- 🏦 Transferencias bancarias
- 📊 Todo en un solo lugar

---

**Estado:** ⏳ Base de datos lista, falta UI
**Siguiente:** Crear componente PaymentIntegrationsPanel
**Tiempo estimado:** 30 minutos
