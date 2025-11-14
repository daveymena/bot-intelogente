# 🚀 Activar Sistema de Suscripciones - AHORA

## ⚡ Pasos Rápidos (10 minutos)

### Paso 1: Aplicar Migración de Base de Datos (2 min)

```bash
npx prisma db push
```

**Resultado esperado:**
```
✔ Generated Prisma Client
✔ The database is now in sync with your Prisma schema
```

### Paso 2: Verificar Campos en Base de Datos (1 min)

```bash
npx prisma studio
```

1. Abre en navegador: http://localhost:5555
2. Clic en tabla "User"
3. Verifica que existan estos campos:
   - `subscriptionPlan`
   - `subscriptionStatus`
   - `subscriptionExpiresAt`

### Paso 3: Iniciar Aplicación (1 min)

```bash
npm run dev
```

### Paso 4: Probar Página de Precios (2 min)

1. Abre: http://localhost:3000/pricing
2. Deberías ver 3 planes: Basic, Pro, Enterprise
3. Selector de método de pago: MercadoPago / PayPal

### Paso 5: Agregar Componente al Dashboard (3 min)

Edita tu archivo principal del dashboard (probablemente `src/app/page.tsx`):

```tsx
import { SubscriptionStatus } from '@/components/SubscriptionStatus';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      {/* AGREGAR ESTO */}
      <div className="mb-6">
        <SubscriptionStatus />
      </div>

      {/* Tu dashboard existente */}
      {/* ... resto del código ... */}
    </div>
  );
}
```

### Paso 6: Probar con Usuario (1 min)

1. Registra un nuevo usuario o usa uno existente
2. Ve al dashboard
3. Deberías ver el componente de suscripción mostrando:
   - "Trial activo - 10 días restantes" (si es nuevo)
   - O el estado actual de la suscripción

---

## ✅ Verificación Rápida

### ¿Todo Funciona?

Marca cada item:

- [ ] Migración aplicada sin errores
- [ ] Campos visibles en Prisma Studio
- [ ] Página `/pricing` se carga correctamente
- [ ] Componente `SubscriptionStatus` visible en dashboard
- [ ] Usuario nuevo recibe trial automáticamente

---

## 🧪 Probar Pago (Modo Test)

### Opción A: MercadoPago Test

1. Ve a `/pricing`
2. Selecciona "MercadoPago"
3. Clic en "Seleccionar Plan" (cualquier plan)
4. Usa tarjeta de prueba:
   ```
   Número: 5031 7557 3453 0604
   CVV: 123
   Vencimiento: 11/25
   Nombre: APRO
   DNI: 12345678
   ```
5. Completa el pago
6. Deberías ser redirigido a `/subscription/success`

### Opción B: PayPal Test

1. Ve a `/pricing`
2. Selecciona "PayPal"
3. Clic en "Seleccionar Plan"
4. Usa tu cuenta sandbox de PayPal
5. Completa el pago

---

## 🔧 Configurar Webhook (Producción)

### Para que los pagos se activen automáticamente:

1. **Ve a MercadoPago Developers**
   - https://www.mercadopago.com.co/developers/panel/app

2. **Selecciona tu aplicación**

3. **Ve a "Webhooks"**

4. **Agrega nueva URL:**
   ```
   https://tudominio.com/api/webhooks/mercadopago
   ```

5. **Selecciona eventos:**
   - ✅ Pagos

6. **Guarda**

### Para desarrollo local (opcional):

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 3000
ngrok http 3000

# Copiar URL (ej: https://abc123.ngrok.io)
# Usar en MercadoPago: https://abc123.ngrok.io/api/webhooks/mercadopago
```

---

## 📊 Proteger Rutas API (Opcional pero Recomendado)

### Ejemplo: Proteger envío de mensajes

```typescript
// src/app/api/whatsapp/send/route.ts
import { UserLicenseService } from '@/lib/user-license-service';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session.user.id;

  // Verificar suscripción
  const subCheck = await UserLicenseService.checkUserSubscription(userId);
  
  if (!subCheck.valid) {
    return NextResponse.json(
      { error: 'Suscripción expirada. Actualiza tu plan.' },
      { status: 403 }
    );
  }

  // Verificar límite
  const limitCheck = await UserLicenseService.checkLimit(userId, 'messages');
  
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: `Límite alcanzado (${limitCheck.limit} mensajes)` },
      { status: 429 }
    );
  }

  // Tu código existente para enviar mensaje...
}
```

---

## 🎯 Checklist Final

### Desarrollo Local
- [ ] Migración aplicada
- [ ] Página de precios funciona
- [ ] Componente de suscripción visible
- [ ] Pago de prueba funciona

### Producción
- [ ] Código desplegado en Easypanel
- [ ] Variables de entorno configuradas
- [ ] Webhook configurado en MercadoPago
- [ ] Pago real probado
- [ ] Email de confirmación (opcional)

---

## 💰 Precios Configurados

| Plan | Precio/mes | Características |
|------|------------|-----------------|
| Free | Gratis (10 días) | 100 mensajes, 20 productos |
| Basic | $50.000 COP | 1,000 mensajes, 100 productos |
| Pro | $150.000 COP | 10,000 mensajes, 1,000 productos |
| Enterprise | $500.000 COP | Todo ilimitado |

**Para cambiar precios**, edita:
```typescript
// src/app/api/subscription/create-payment/route.ts
const PLAN_PRICES = {
  basic: 50000,      // Cambiar aquí
  pro: 150000,       // Cambiar aquí
  enterprise: 500000, // Cambiar aquí
};
```

---

## 🆘 Problemas Comunes

### Error: "subscriptionPlan does not exist"
```bash
npx prisma db push
```

### Componente no se muestra
Verifica que importaste correctamente:
```tsx
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
```

### Pago no activa suscripción
1. Verifica webhook configurado
2. Revisa logs del servidor
3. Verifica que `external_reference` tenga userId y plan

---

## 📚 Documentación Completa

- `SISTEMA_SUSCRIPCIONES_IMPLEMENTADO.md` - Guía completa
- `SISTEMA_LICENCIAS_SAAS.md` - Conceptos del sistema
- `CUAL_SISTEMA_USAR.md` - Diferencias entre sistemas

---

## 🎉 ¡Listo!

Tu sistema de suscripciones está implementado y listo para generar ingresos.

**Siguiente paso**: Desplegar a producción y configurar webhook.

---

**Desarrollado por**: Tecnovariedades D&S  
**Versión**: 2.0.0  
**Fecha**: Noviembre 2024
