# ✅ Verificar Usuarios Existentes - Guía Rápida

## 🎯 Problema

Usuarios que se registraron antes pero no recibieron el email de verificación y no pueden acceder.

## ✅ Solución Rápida

### Ejecutar el script:

```bash
npx tsx scripts/verificar-usuarios-manualmente.ts
```

Este script:
1. ✅ Busca todos los usuarios no verificados
2. ✅ Los verifica automáticamente (email + teléfono)
3. ✅ Los activa para que puedan acceder
4. ✅ Muestra el resultado

## 📋 Qué hace el script

```
🔧 Verificando usuarios manualmente...

📋 Encontrados 3 usuarios no verificados:

1. usuario1@email.com
   Email verificado: ❌
   Teléfono verificado: ❌
   Activo: ❌

2. usuario2@email.com
   Email verificado: ❌
   Teléfono verificado: ❌
   Activo: ❌

🔄 Verificando TODOS los usuarios automáticamente...

✅ 3 usuarios verificados exitosamente!

📊 Estado final:
   usuario1@email.com: ✅ Verificado y activo
   usuario2@email.com: ✅ Verificado y activo

✅ ¡Todos los usuarios pueden acceder ahora!
```

## 🚀 Después de ejecutar

Los usuarios pueden:
1. Ir a `http://localhost:3000/login`
2. Ingresar su email y contraseña
3. ¡Acceder al dashboard directamente!

## 🔍 Verificar un usuario específico

Si quieres verificar solo un usuario:

```bash
npx prisma studio
```

1. Abrir tabla "User"
2. Buscar el usuario por email
3. Cambiar:
   - `isEmailVerified` → true
   - `isPhoneVerified` → true
   - `isActive` → true
4. Guardar

## 📝 Ver todos los usuarios

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
  users.forEach(u => console.log(u.email, u.isActive ? '✅' : '❌'));
  process.exit(0);
});
"
```

## ⚡ Comando Rápido

```bash
# Verificar todos los usuarios de una vez
npx tsx scripts/verificar-usuarios-manualmente.ts
```

## 🎯 Resultado Esperado

```
✅ 5 usuarios verificados exitosamente!

Ahora todos pueden hacer login:
- usuario1@email.com ✅
- usuario2@email.com ✅
- usuario3@email.com ✅
```

## 💡 Para el Futuro

Los nuevos usuarios que se registren desde ahora:
- ✅ Se verifican automáticamente
- ✅ No necesitan email
- ✅ Acceso inmediato al dashboard

---

**Ejecuta el script ahora:**
```bash
npx tsx scripts/verificar-usuarios-manualmente.ts
```
