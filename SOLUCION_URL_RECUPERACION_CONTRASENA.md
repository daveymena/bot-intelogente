# ✅ Solución: URL de Recuperación de Contraseña Incorrecta

## Problema Identificado

El enlace de recuperación de contraseña que llega al email apunta a una URL incorrecta que muestra un error "verifica que la dirección sea correcta".

## Causa Raíz

**Conflicto de URLs en `.env`:**

```env
NEXT_PUBLIC_APP_URL=https://bot-whatsapp.sqaoeo.easypanel.host  ❌ URL incorrecta
NEXTAUTH_URL=https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host  ✅ URL correcta
```

El código de recuperación usaba `NEXT_PUBLIC_APP_URL`, pero la app real está en `NEXTAUTH_URL`.

---

## Solución Aplicada

### Archivo Modificado:
`src/app/api/auth/forgot-password/route.ts`

### Cambio:
```typescript
// ❌ ANTES (Incorrecto)
const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

// ✅ AHORA (Correcto)
const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
```

### Resultado:
✅ El enlace ahora apunta a la URL correcta de Easypanel

---

## URLs Correctas

### Producción (Easypanel):
```
https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host
```

### Desarrollo Local:
```
http://localhost:4000
```

---

## Flujo Completo Corregido

### 1. Usuario Solicita Recuperación
```
Usuario → /forgot-password
Ingresa: daveymena16@gmail.com
Click "Enviar"
✅ Email enviado
```

### 2. Email con URL Correcta
```
Email contiene:
https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host/reset-password?token=abc123...
                                                                      ↑
                                                              Ahora funciona ✅
```

### 3. Usuario Cambia Contraseña
```
Click en link → Página de reset ✅
Ingresa nueva contraseña
Confirma contraseña
Click "Restablecer"
✅ Contraseña actualizada
→ Redirige a /login
```

---

## Próximos Pasos

### 1. Subir Cambios a GitHub
```bash
git add .
git commit -m "fix: URL correcta para recuperación de contraseña"
git push origin main
```

### 2. Rebuild en Easypanel
```
1. Ir a Easypanel
2. Seleccionar tu app
3. Click en "Rebuild"
4. Esperar 2-3 minutos
```

### 3. Probar el Flujo Completo

**Test 1: Solicitar Recuperación**
```
1. Ir a: https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host/forgot-password
2. Ingresar: daveymena16@gmail.com
3. Click "Enviar"
4. ✅ Debe decir "Correo enviado"
```

**Test 2: Verificar Email**
```
1. Revisar bandeja de entrada
2. Abrir email de recuperación
3. ✅ URL debe ser: https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host/reset-password?token=...
```

**Test 3: Cambiar Contraseña**
```
1. Click en link del email
2. ✅ Debe abrir la página de reset (no error 404)
3. Ingresar nueva contraseña
4. Confirmar contraseña
5. Click "Restablecer"
6. ✅ Debe decir "Contraseña actualizada"
7. ✅ Debe redirigir a /login
```

**Test 4: Login con Nueva Contraseña**
```
1. Ingresar email
2. Ingresar nueva contraseña
3. Click "Iniciar sesión"
4. ✅ Debe entrar al dashboard
```

---

## Verificación en Logs

Después del rebuild, los logs mostrarán:

```
[ForgotPassword] Token generado para: daveymena16@gmail.com
[ForgotPassword] Base URL: https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host
[ForgotPassword] URL de reset completa: https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host/reset-password?token=...
[EmailService] Enviando email de recuperación a: daveymena16@gmail.com
[EmailService] URL de reset: https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host/reset-password?token=...
✅ Email enviado exitosamente
```

---

## Opcional: Unificar URLs en .env

Para evitar confusiones futuras, puedes actualizar `.env`:

```env
# Usar la misma URL para ambas
NEXT_PUBLIC_APP_URL=https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host
NEXTAUTH_URL=https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host
```

---

## Archivos Modificados

1. ✅ `src/app/api/auth/forgot-password/route.ts` - URL corregida
2. ✅ `src/lib/email-service.ts` - Logs mejorados
3. ✅ Código listo para subir a GitHub

---

## Estado

- ✅ **Problema identificado:** URL incorrecta en email
- ✅ **Código corregido:** Usa NEXTAUTH_URL primero
- ✅ **Logs mejorados:** Para debugging
- ⏳ **Pendiente:** Subir a GitHub
- ⏳ **Pendiente:** Rebuild en Easypanel
- ⏳ **Pendiente:** Probar flujo completo

---

**Fecha:** 20 Nov 2025  
**Estado:** ✅ ARREGLADO - Listo para deploy

