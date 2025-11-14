# 🎯 Cómo Activar Tu Propia Suscripción

Como eres el dueño del sistema, puedes activarte una suscripción Enterprise ilimitada sin pagar.

---

## ⚡ Opción 1: Script Automático (Recomendado)

### Paso 1: Asegúrate de tener un usuario registrado

Si no tienes usuario, regístrate primero en `/register`

### Paso 2: Ejecutar el script

```bash
npm run subscription:activate
```

### Paso 3: Ingresar tu email

```
📧 Tu email (el que usas para login): daveymena16@gmail.com
```

### Paso 4: Confirmar

```
¿Activar suscripción ENTERPRISE ILIMITADA? (s/n): s
```

### Resultado:

```
✅ SUSCRIPCIÓN ACTIVADA EXITOSAMENTE

📧 Email:        daveymena16@gmail.com
📦 Plan:         ENTERPRISE
✨ Estado:       ACTIVA
⏱️  Expira:       2124 (100 años)

🎉 Características:
   ✅ Mensajes ilimitados
   ✅ Productos ilimitados
   ✅ Conversaciones ilimitadas
   ✅ Todas las funcionalidades
   ✅ Sin restricciones
```

---

## 🛠️ Opción 2: Manualmente con Prisma Studio

### Paso 1: Abrir Prisma Studio

```bash
npx prisma studio
```

### Paso 2: Ir a tabla "User"

1. Abre http://localhost:5555
2. Clic en tabla "User"
3. Busca tu usuario por email

### Paso 3: Editar campos

Haz clic en tu usuario y edita:

```
subscriptionPlan: "enterprise"
subscriptionStatus: "active"
subscriptionExpiresAt: 2124-12-31 (cualquier fecha lejana)
```

### Paso 4: Guardar

Clic en "Save 1 change"

---

## 💻 Opción 3: Comando SQL Directo

Si prefieres SQL directo:

```sql
-- Reemplaza 'tu@email.com' con tu email real
UPDATE "users" 
SET 
  "subscriptionPlan" = 'enterprise',
  "subscriptionStatus" = 'active',
  "subscriptionExpiresAt" = '2124-12-31T23:59:59.000Z'
WHERE email = 'tu@email.com';
```

Para ejecutar:

```bash
# Si usas PostgreSQL
psql $DATABASE_URL -c "UPDATE users SET subscriptionPlan = 'enterprise', subscriptionStatus = 'active', subscriptionExpiresAt = '2124-12-31' WHERE email = 'tu@email.com';"

# Si usas SQLite
sqlite3 dev.db "UPDATE users SET subscriptionPlan = 'enterprise', subscriptionStatus = 'active', subscriptionExpiresAt = '2124-12-31' WHERE email = 'tu@email.com';"
```

---

## 🎁 Opción 4: Activar Múltiples Usuarios

Si quieres activar varios usuarios (equipo, socios, etc.):

```bash
npm run subscription:activate
# Ejecutar múltiples veces, una por cada email
```

O crear un script personalizado:

```typescript
// scripts/activar-equipo.ts
import { db } from '../src/lib/db';

const EQUIPO_EMAILS = [
  'daveymena16@gmail.com',
  'socio@empresa.com',
  'admin@empresa.com',
];

async function activarEquipo() {
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 100);

  for (const email of EQUIPO_EMAILS) {
    await db.user.update({
      where: { email },
      data: {
        subscriptionPlan: 'enterprise',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt,
      },
    });
    console.log(`✅ Activado: ${email}`);
  }
}

activarEquipo();
```

---

## ✅ Verificar Activación

### Método 1: En el Dashboard

1. Inicia sesión con tu usuario
2. Ve al dashboard
3. Deberías ver el componente `SubscriptionStatus` mostrando:
   - Plan: ENTERPRISE
   - Estado: ACTIVA
   - Límites: ILIMITADO

### Método 2: Con API

```bash
# Obtener token de sesión primero (login)
# Luego:
curl http://localhost:3000/api/subscription/status \
  -H "Cookie: next-auth.session-token=tu_token"
```

### Método 3: Prisma Studio

```bash
npx prisma studio
# Ver tabla User → tu usuario → verificar campos
```

---

## 🎯 Planes Disponibles

Puedes activarte cualquier plan:

| Plan | Valor | Límites |
|------|-------|---------|
| `free` | Trial | 100 mensajes, 20 productos |
| `basic` | $50k | 1,000 mensajes, 100 productos |
| `pro` | $150k | 10,000 mensajes, 1,000 productos |
| `enterprise` | $500k | ✨ TODO ILIMITADO |

**Recomendado para ti**: `enterprise` (sin límites)

---

## 💡 Consejos

### 1. Usa Enterprise para ti

Como dueño, actívate el plan Enterprise para no tener restricciones mientras desarrollas y pruebas.

### 2. Crea usuario de prueba

Crea un usuario separado con plan Free o Basic para probar las limitaciones:

```bash
# Registrar usuario de prueba
# Email: prueba@test.com
# Dejar con plan Free (automático)
```

### 3. Monitorea otros usuarios

Puedes ver las suscripciones de todos los usuarios:

```bash
npx prisma studio
# Tabla User → Ver todos
```

---

## 🆘 Problemas Comunes

### Error: "User not found"

**Causa**: Email incorrecto o usuario no existe

**Solución**: 
1. Verifica el email exacto
2. Regístrate primero si no tienes usuario

### Error: "subscriptionPlan does not exist"

**Causa**: No aplicaste la migración

**Solución**:
```bash
npx prisma db push
```

### Cambios no se reflejan

**Causa**: Cache del navegador

**Solución**:
1. Cierra sesión
2. Limpia cache (Ctrl+Shift+R)
3. Inicia sesión de nuevo

---

## 🎉 ¡Listo!

Ahora tienes acceso ilimitado a todas las funcionalidades del sistema.

**Comando rápido**:
```bash
npm run subscription:activate
```

---

**Desarrollado por**: Tecnovariedades D&S  
**Versión**: 2.0.0  
**Fecha**: Noviembre 2024
