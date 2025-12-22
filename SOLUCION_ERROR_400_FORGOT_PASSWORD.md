# 🔧 Solución Error 400 - Forgot Password en Easypanel

## Problema

Error 400 de Easypanel con mensaje: "No se encontró. Asegúrese de tener la URL correcta"

Esto significa que la ruta `/api/auth/forgot-password` **NO existe** en producción.

## Causa

Next.js no está construyendo la ruta API en producción. Puede ser por:
1. Error de sintaxis que impide el build
2. Archivo no incluido en el build
3. Problema con el routing de Next.js

## Solución Rápida

### Opción 1: Verificar que el archivo se suba a GitHub

```bash
# Verificar que el archivo existe
git ls-files src/app/api/auth/forgot-password/route.ts

# Si no aparece, agregarlo
git add src/app/api/auth/forgot-password/route.ts
git commit -m "fix: Agregar ruta forgot-password"
git push origin main
```

### Opción 2: Rebuild Completo en Easypanel

1. Ir a Easypanel
2. Tu aplicación → **Settings**
3. Click en **"Rebuild"**
4. Esperar a que termine
5. Probar de nuevo

### Opción 3: Verificar Logs de Build

En Easypanel, revisar los logs del build para ver si hay errores:

```
Building...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

Buscar errores relacionados con `forgot-password`.

---

## Solución Definitiva: Crear Ruta Alternativa

Si la ruta sigue sin funcionar, crear una ruta alternativa:

### 1. Crear `src/app/api/password-reset/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { EmailService } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    let user: any = null;
    try {
      user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
    } catch (dbError) {
      console.error('[PasswordReset] Error de base de datos:', dbError);
      return NextResponse.json({
        success: true,
        message: 'Si el correo existe, recibirás un enlace de recuperación'
      });
    }

    if (!user) {
      console.log('[PasswordReset] Email no encontrado:', email);
      return NextResponse.json({
        success: true,
        message: 'Si el correo existe, recibirás un enlace de recuperación'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt
      }
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    try {
      await EmailService.sendPasswordResetEmail({
        to: user.email,
        userName: user.name || 'Usuario',
        resetUrl
      });

      console.log('[PasswordReset] Email enviado exitosamente');
    } catch (emailError) {
      console.error('[PasswordReset] Error enviando email:', emailError);
      
      await db.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null
        }
      });

      return NextResponse.json(
        { error: 'Error al enviar el correo de recuperación' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Si el correo existe, recibirás un enlace de recuperación'
    });

  } catch (error) {
    console.error('[PasswordReset] Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
```

### 2. Actualizar `src/app/forgot-password/page.tsx`

Cambiar la URL de la API:

```typescript
const res = await fetch('/api/password-reset', {  // ← Cambiar aquí
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: email.trim().toLowerCase() })
});
```

### 3. Actualizar middleware

En `src/middleware.ts`, agregar la nueva ruta:

```typescript
const publicRoutes = [
  // ... otras rutas
  '/api/password-reset',  // ← Agregar
];
```

---

## Verificar en Producción

### Test 1: Verificar que la ruta existe

```bash
curl -X POST https://bot-whatsapp.sqaoeo.easypanel.host/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
```

Si devuelve 400 de Easypanel → La ruta NO existe
Si devuelve JSON → La ruta SÍ existe

### Test 2: Verificar rutas construidas

En Easypanel, consola:

```bash
ls -la .next/server/app/api/auth/
```

Debe aparecer `forgot-password/`

---

## Comandos para Aplicar

```bash
# 1. Commit cambios actuales
git add .
git commit -m "fix: Arreglar forgot-password route"
git push origin main

# 2. En Easypanel: Rebuild

# 3. Probar
```

---

## Si Nada Funciona: Solución Temporal

Desactivar la recuperación de contraseña y usar WhatsApp:

```typescript
// En src/app/forgot-password/page.tsx
return (
  <div className="text-center">
    <h1>Recuperación de Contraseña</h1>
    <p>Por favor contacta al administrador:</p>
    <a 
      href="https://wa.me/573005560186?text=Necesito%20recuperar%20mi%20contraseña"
      className="btn btn-primary"
    >
      Contactar por WhatsApp
    </a>
  </div>
);
```

---

## Resumen

1. ✅ Verificar que el archivo existe en GitHub
2. ✅ Hacer rebuild completo en Easypanel
3. ✅ Revisar logs de build
4. ⏳ Si falla, crear ruta alternativa `/api/password-reset`
5. ⏳ Como último recurso, usar recuperación por WhatsApp

**El problema es que Next.js no está construyendo la ruta en producción.**
