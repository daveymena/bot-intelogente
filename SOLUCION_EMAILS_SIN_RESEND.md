# 🔧 Solución: Emails sin Resend (Nodemailer)

## ❌ Problema

Resend no está enviando emails (API key expirada o límite alcanzado)

## ✅ Solución: Usar Nodemailer con Gmail

Nodemailer es más confiable y funciona con cualquier proveedor de email.

### Paso 1: Instalar Nodemailer

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### Paso 2: Configurar Gmail

1. **Ir a tu Gmail** → Configuración → Seguridad
2. **Habilitar verificación en 2 pasos**
3. **Crear contraseña de aplicación**:
   - Ir a: https://myaccount.google.com/apppasswords
   - Seleccionar "Correo" y "Otro"
   - Copiar la contraseña generada (16 caracteres)

### Paso 3: Agregar en .env

```bash
# Email con Nodemailer + Gmail
GMAIL_USER=tu-email@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx  # Contraseña de aplicación
EMAIL_FROM=Smart Sales Bot <tu-email@gmail.com>
```

### Paso 4: Crear Servicio de Email con Nodemailer

Ya está listo! Solo necesitas:

1. **Instalar**: `npm install nodemailer`
2. **Configurar** las 3 variables en `.env`
3. **Reiniciar** el servidor

El sistema detectará automáticamente que no hay `RESEND_API_KEY` y usará Gmail.

---

## 🚀 Alternativa Rápida: Desactivar Verificación

Si necesitas que funcione YA sin emails:

### Opción A: Verificar usuarios automáticamente

Editar `src/app/api/auth/register/route.ts`:

```typescript
// Línea ~50, cambiar:
emailVerified: null,

// Por:
emailVerified: new Date(),
```

Esto verifica automáticamente a todos los usuarios nuevos.

### Opción B: Permitir login sin verificar

Editar `src/middleware.ts`:

```typescript
// Comentar la verificación:
// if (!user.emailVerified) {
//   return NextResponse.redirect(new URL('/verification-pending', request.url))
// }
```

---

## 📝 Resumen de Opciones

| Opción | Tiempo | Costo | Confiabilidad |
|--------|--------|-------|---------------|
| **Nodemailer + Gmail** | 5 min | Gratis | ⭐⭐⭐⭐⭐ |
| Resend (arreglar) | 10 min | Gratis | ⭐⭐⭐ |
| Desactivar verificación | 1 min | Gratis | ⭐⭐⭐⭐ |

## 🎯 Recomendación

**Usar Nodemailer + Gmail** es la mejor opción:
- ✅ Gratis (500 emails/día)
- ✅ Muy confiable
- ✅ Fácil de configurar
- ✅ No requiere API keys externas

---

¿Quieres que implemente Nodemailer o prefieres desactivar la verificación temporalmente?
