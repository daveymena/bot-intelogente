# 🌐 Sistema de Licencias para SaaS Multi-Tenant

## Tu Caso: Modo Web (SaaS)

Como tu aplicación funciona en **modo web** donde múltiples usuarios acceden al mismo servidor, el sistema de licencias funciona diferente:

```
TU SERVIDOR (tudominio.com)
    ↓
Usuario 1 → Cuenta → Suscripción Basic
Usuario 2 → Cuenta → Suscripción Pro  
Usuario 3 → Cuenta → Trial Gratuito
```

---

## 🎯 Cómo Funciona

### 1. Usuario se Registra
```
1. Usuario va a tudominio.com/register
2. Crea su cuenta (email + contraseña)
3. Automáticamente recibe 10 días de trial GRATIS
4. Puede usar el sistema completo
```

### 2. Trial Expira
```
1. Después de 10 días, el sistema bloquea funciones
2. Usuario ve mensaje: "Tu trial expiró"
3. Usuario debe elegir un plan de pago
```

### 3. Usuario Paga
```
1. Usuario va a /pricing o /upgrade
2. Selecciona plan (Basic/Pro/Enterprise)
3. Paga con MercadoPago/PayPal/Stripe
4. Sistema activa suscripción automáticamente
5. Usuario puede seguir usando
```

---

## 💰 Planes Sugeridos

### Plan FREE (Trial)
- **Precio**: Gratis
- **Duración**: 10 días
- **Límites**:
  - 100 mensajes/mes
  - 20 productos
  - 50 conversaciones
  - IA básica

### Plan BASIC
- **Precio**: $50.000 COP/mes
- **Límites**:
  - 1,000 mensajes/mes
  - 100 productos
  - 500 conversaciones
  - IA avanzada
  - Analytics

### Plan PRO
- **Precio**: $150.000 COP/mes
- **Límites**:
  - 10,000 mensajes/mes
  - 1,000 productos
  - 5,000 conversaciones
  - Todo incluido
  - Soporte prioritario
  - Marca personalizada

### Plan ENTERPRISE
- **Precio**: $500.000 COP/mes
- **Límites**:
  - ✅ TODO ILIMITADO
  - API access
  - White label
  - Soporte dedicado

---

## 🔧 Implementación

### 1. Actualizar Base de Datos

```bash
# Agregar campos de suscripción
npx prisma db push
```

Los campos agregados al modelo User:
```prisma
subscriptionPlan      String?   @default("free")
subscriptionStatus    String?   @default("trial")
subscriptionExpiresAt DateTime?
```

### 2. Verificar Suscripción en APIs

```typescript
// src/app/api/whatsapp/send/route.ts
import { UserLicenseService } from '@/lib/user-license-service';

export async function POST(request: NextRequest) {
  const session = await getServerSession(request);
  const userId = session.user.id;

  // Verificar suscripción
  const subCheck = await UserLicenseService.checkUserSubscription(userId);
  
  if (!subCheck.valid) {
    return NextResponse.json(
      { error: 'Suscripción expirada. Actualiza tu plan.' },
      { status: 403 }
    );
  }

  // Verificar límite de mensajes
  const limitCheck = await UserLicenseService.checkLimit(userId, 'messages');
  
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { 
        error: `Límite alcanzado (${limitCheck.limit} mensajes)`,
        upgrade: true 
      },
      { status: 429 }
    );
  }

  // Enviar mensaje...
}
```

### 3. Crear Página de Precios

```tsx
// src/app/pricing/page.tsx
'use client';

import { UserLicenseService } from '@/lib/user-license-service';

export default function PricingPage() {
  const pricing = UserLicenseService.getPricing();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Planes y Precios</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(pricing).map(([key, plan]) => (
          <div key={key} className="border rounded-lg p-6">
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-3xl font-bold my-4">
              ${plan.price.toLocaleString()}
              <span className="text-sm">/mes</span>
            </p>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgrade(key)}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {key === 'free' ? 'Empezar Gratis' : 'Actualizar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Integrar con Pasarela de Pago

```typescript
// src/app/api/payment/create-subscription/route.ts
import { UserLicenseService } from '@/lib/user-license-service';

export async function POST(request: NextRequest) {
  const session = await getServerSession(request);
  const { plan } = await request.json();

  // Crear pago en MercadoPago/Stripe
  const payment = await createPayment({
    amount: getPriceForPlan(plan),
    description: `Suscripción ${plan}`,
    userId: session.user.id,
  });

  // Cuando el pago se confirme (webhook):
  // await UserLicenseService.upgradeSubscription(userId, plan, 30);

  return NextResponse.json({ paymentUrl: payment.url });
}
```

---

## 📊 Diferencias con Sistema Anterior

| Aspecto | Sistema Anterior (Instalable) | Sistema Nuevo (SaaS) |
|---------|-------------------------------|----------------------|
| **Licencia por** | Máquina/Servidor | Usuario/Cuenta |
| **Machine ID** | ✅ Sí (servidor del cliente) | ❌ No necesario |
| **Códigos** | XXXX-XXXX-XXXX-XXXX | ❌ No necesario |
| **Activación** | Manual con código | Automática al pagar |
| **Verificación** | Archivo .license | Base de datos |
| **Trial** | Una vez por máquina | Una vez por usuario |
| **Renovación** | Nuevo código | Pago recurrente |

---

## 🚀 Flujo Completo

### Para el Usuario

```
1. Registro
   ↓
2. Trial automático (10 días)
   ↓
3. Usa el sistema
   ↓
4. Trial expira
   ↓
5. Ve página de precios
   ↓
6. Selecciona plan
   ↓
7. Paga con MercadoPago
   ↓
8. Sistema activa suscripción
   ↓
9. Sigue usando
   ↓
10. Cada mes: renovación automática o manual
```

### Para Ti (Administrador)

```
1. Usuario se registra → Recibes notificación
2. Usuario paga → Recibes pago en MercadoPago
3. Sistema activa automáticamente
4. Monitoreas desde panel admin
5. Ves métricas de ingresos
```

---

## 💡 Ventajas del Modelo SaaS

### Para Ti
✅ Ingresos recurrentes predecibles  
✅ Un solo servidor para todos  
✅ Actualizaciones centralizadas  
✅ Menos soporte técnico  
✅ Escalable con más usuarios  

### Para tus Clientes
✅ No necesitan instalar nada  
✅ Acceso desde cualquier PC  
✅ Siempre actualizado  
✅ Fácil de usar  
✅ Trial gratuito sin compromiso  

---

## 🔧 Comandos para Migrar

```bash
# 1. Actualizar base de datos
npx prisma db push

# 2. Verificar que se agregaron los campos
npx prisma studio

# 3. Probar el sistema
npm run dev
```

---

## 📋 Checklist de Implementación

### Backend
- [x] Servicio de suscripciones por usuario
- [x] Verificación de límites
- [x] Planes y precios
- [ ] Integración con MercadoPago
- [ ] Webhooks de pago
- [ ] Panel de administración

### Frontend
- [ ] Página de precios (/pricing)
- [ ] Página de actualización (/upgrade)
- [ ] Componente de estado de suscripción
- [ ] Alertas de límites alcanzados
- [ ] Proceso de pago

### Base de Datos
- [x] Campos de suscripción agregados
- [ ] Migración aplicada
- [ ] Datos de prueba

---

## 🎯 Próximos Pasos

1. **Aplicar migración de base de datos**
   ```bash
   npx prisma db push
   ```

2. **Crear página de precios**
   - Diseño atractivo
   - Comparación de planes
   - Botones de pago

3. **Integrar MercadoPago**
   - Crear preferencias de pago
   - Configurar webhooks
   - Activar suscripciones automáticamente

4. **Probar flujo completo**
   - Registro → Trial → Expiración → Pago → Activación

---

## 💰 Proyección de Ingresos (SaaS)

### Escenario Conservador
- 10 usuarios Basic ($50k) = $500.000/mes
- 5 usuarios Pro ($150k) = $750.000/mes
- **Total**: $1.250.000/mes = $15M/año

### Escenario Moderado
- 50 usuarios Basic = $2.500.000/mes
- 20 usuarios Pro = $3.000.000/mes
- 5 usuarios Enterprise = $2.500.000/mes
- **Total**: $8.000.000/mes = $96M/año

### Escenario Optimista
- 200 usuarios Basic = $10.000.000/mes
- 100 usuarios Pro = $15.000.000/mes
- 20 usuarios Enterprise = $10.000.000/mes
- **Total**: $35.000.000/mes = $420M/año

---

## 🆘 Soporte

¿Preguntas sobre el modelo SaaS?

1. Lee esta documentación completa
2. Revisa `src/lib/user-license-service.ts`
3. Aplica la migración de base de datos
4. Prueba con usuarios de prueba

---

**Desarrollado por**: Tecnovariedades D&S  
**Versión**: 2.0.0 (SaaS Multi-Tenant)  
**Fecha**: Noviembre 2024  
**Estado**: ✅ Listo para implementar
