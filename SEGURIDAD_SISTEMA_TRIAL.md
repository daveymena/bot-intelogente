# 🔒 Seguridad del Sistema de Trial

## ⚠️ Problema Detectado

**Antes:** Un usuario podía activar el trial gratuito múltiples veces después de que expirara.

**Ahora:** ✅ ARREGLADO - Solo se puede usar UNA VEZ por cuenta.

## 🛡️ Validaciones Implementadas

### En `src/lib/membership-service.ts`

```typescript
static async activateTrial(userId: string): Promise<void> {
  // VALIDACIÓN 1: Ya usó el trial antes
  if (user.trialEnds) {
    throw new Error('Ya has usado tu prueba gratuita de 10 días');
  }

  // VALIDACIÓN 2: Ya tiene una membresía activa
  if (user.membershipEnds && user.membershipEnds > new Date()) {
    throw new Error('Ya tienes una membresía activa');
  }

  // VALIDACIÓN 3: Ya tuvo una membresía pagada antes
  const hadPaidMembership = await prisma.payment.findFirst({
    where: { userId, status: 'COMPLETED' }
  });
  
  if (hadPaidMembership) {
    throw new Error('Ya has tenido una membresía pagada');
  }
}
```

## 🔍 Cómo Funciona

### Flujo Normal (Usuario Nuevo)

```
1. Usuario se registra
   ├─ membershipType: FREE
   ├─ trialEnds: null
   └─ membershipEnds: null

2. Usuario activa trial (PRIMERA VEZ)
   ├─ ✅ Validación 1: trialEnds es null → OK
   ├─ ✅ Validación 2: No tiene membresía activa → OK
   ├─ ✅ Validación 3: No tiene pagos → OK
   └─ ✅ Trial activado por 10 días

3. Trial expira después de 10 días
   ├─ membershipType: FREE (automático)
   ├─ trialEnds: 2025-11-13 (guardado)
   └─ membershipEnds: 2025-11-13 (guardado)

4. Usuario intenta activar trial de nuevo
   ├─ ❌ Validación 1: trialEnds NO es null → RECHAZADO
   └─ Error: "Ya has usado tu prueba gratuita"
```

### Flujo con Abuso Bloqueado

```
Usuario intenta activar trial múltiples veces:

Intento 1: ✅ Éxito (primera vez)
Intento 2: ❌ Rechazado (trialEnds != null)
Intento 3: ❌ Rechazado (trialEnds != null)
Intento N: ❌ Rechazado (trialEnds != null)
```

## 📊 Verificar Abusos

### Script de Verificación

```bash
# Ver usuarios que ya usaron el trial
npx tsx scripts/verificar-abusos-trial.ts
```

Este script muestra:
- ✅ Usuarios que ya usaron el trial
- ✅ Usuarios con trial activo
- ✅ Estadísticas generales
- ✅ Tasa de conversión

### Ejemplo de Salida

```
🔍 VERIFICANDO ABUSOS DEL SISTEMA DE TRIAL

📊 Usuarios que ya usaron el trial: 5

1. usuario1@example.com
   Trial expiró: 01/11/2025
   Pagos realizados: 0
   Estado actual: FREE

2. usuario2@example.com
   Trial expiró: 28/10/2025
   Pagos realizados: 1
   Estado actual: BASIC

✅ Usuarios con trial activo: 2

1. usuario3@example.com
   Días restantes: 7
   Expira: 10/11/2025

📊 ESTADÍSTICAS GENERALES:

Total de usuarios: 10
Usuarios que usaron trial: 5
Usuarios con trial activo: 2
Usuarios con membresía pagada: 3
Usuarios en plan FREE: 5

📈 Tasa de conversión (trial → pago): 60.0%
```

## 🔐 Campos de Seguridad en la BD

### Tabla `User`

```prisma
model User {
  membershipType    MembershipType  @default(FREE)
  membershipEnds    DateTime?       // Cuándo expira la membresía actual
  trialEnds         DateTime?       // Cuándo expiró el trial (NUNCA se borra)
}
```

**Importante:**
- `trialEnds` se guarda PERMANENTEMENTE
- Aunque el usuario vuelva a FREE, `trialEnds` sigue ahí
- Esto previene que reactive el trial

## 🚨 Casos de Uso

### Caso 1: Usuario Nuevo

```typescript
// Estado inicial
{
  membershipType: 'FREE',
  trialEnds: null,        // ← Puede activar trial
  membershipEnds: null
}

// Después de activar trial
{
  membershipType: 'TRIAL',
  trialEnds: '2025-11-13',  // ← Guardado permanentemente
  membershipEnds: '2025-11-13'
}
```

### Caso 2: Trial Expirado

```typescript
// Después de que expira
{
  membershipType: 'FREE',
  trialEnds: '2025-11-13',  // ← Sigue ahí, NO se borra
  membershipEnds: '2025-11-13'
}

// Intenta activar trial de nuevo
❌ Error: "Ya has usado tu prueba gratuita"
```

### Caso 3: Usuario con Membresía Pagada

```typescript
// Usuario compró membresía
{
  membershipType: 'BASIC',
  trialEnds: '2025-11-13',
  membershipEnds: '2025-12-13'
}

// Membresía expira
{
  membershipType: 'FREE',
  trialEnds: '2025-11-13',  // ← Sigue ahí
  membershipEnds: '2025-12-13'
}

// Intenta activar trial
❌ Error: "Ya has tenido una membresía pagada"
```

## 🛠️ Acciones Administrativas

### Resetear Trial de un Usuario (Solo Admin)

```typescript
// scripts/resetear-trial-usuario.ts

import { db } from '../src/lib/db'

async function resetearTrial(email: string) {
  await db.user.update({
    where: { email },
    data: {
      trialEnds: null,
      membershipEnds: null,
      membershipType: 'FREE'
    }
  })
  
  console.log(`✅ Trial reseteado para ${email}`)
}

// Usar con precaución
resetearTrial('usuario@example.com')
```

### Bloquear Usuario Abusivo

```typescript
// scripts/bloquear-usuario.ts

import { db } from '../src/lib/db'

async function bloquearUsuario(email: string) {
  await db.user.update({
    where: { email },
    data: {
      isActive: false,
      membershipType: 'FREE'
    }
  })
  
  console.log(`🚫 Usuario bloqueado: ${email}`)
}
```

## 📋 Checklist de Seguridad

- [x] Validación 1: Verificar si ya usó trial
- [x] Validación 2: Verificar membresía activa
- [x] Validación 3: Verificar pagos anteriores
- [x] Campo `trialEnds` nunca se borra
- [x] Mensajes de error claros
- [x] Script de verificación de abusos
- [x] Logs de activación de trial

## 🎯 Resultado

**Antes:**
```
Usuario activa trial → Expira → Activa de nuevo → Expira → Activa de nuevo...
❌ Abuso infinito
```

**Ahora:**
```
Usuario activa trial → Expira → Intenta activar de nuevo
✅ Bloqueado: "Ya has usado tu prueba gratuita"
```

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────────┐
│  USUARIO NUEVO                                          │
│  ├─ Registra cuenta                                     │
│  ├─ membershipType: FREE                                │
│  ├─ trialEnds: null                                     │
│  └─ Puede activar trial: ✅ SÍ                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  ACTIVA TRIAL (PRIMERA VEZ)                             │
│  ├─ Validaciones pasan ✅                               │
│  ├─ membershipType: TRIAL                               │
│  ├─ trialEnds: 2025-11-13                               │
│  └─ 10 días de acceso completo                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  TRIAL EXPIRA                                           │
│  ├─ membershipType: FREE (automático)                   │
│  ├─ trialEnds: 2025-11-13 (PERMANENTE)                  │
│  └─ Acceso limitado                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  INTENTA ACTIVAR TRIAL DE NUEVO                         │
│  ├─ Validación 1: trialEnds != null ❌                  │
│  ├─ Error: "Ya has usado tu prueba gratuita"           │
│  └─ Puede activar trial: ❌ NO                          │
└─────────────────────────────────────────────────────────┘
```

## ✅ Conclusión

El sistema ahora es seguro y previene abusos. Un usuario solo puede usar el trial UNA VEZ en toda la vida de su cuenta.

---

**Fecha de implementación:** 3 de noviembre de 2025
**Estado:** ✅ SEGURO
