# 📧 Guía: Gestión de Usuarios No Verificados

## 🎯 Problema

Los usuarios se registraron pero no verificaron su email, quedando con `emailVerified: false` y no pueden acceder al dashboard.

## ✅ Soluciones Implementadas

### 1. Página de Reenvío de Verificación

**URL:** `/resend-verification`

Los usuarios pueden:
- Ingresar su email manualmente
- Recibir automáticamente el email si vienen desde el login
- Solicitar un nuevo código de verificación

**Características:**
- ✅ Interfaz amigable con instrucciones claras
- ✅ Información sobre los 10 días gratis
- ✅ Consejos para encontrar el email (spam, etc.)
- ✅ Opción de reenviar múltiples veces

### 2. Redirección Automática desde Login

Cuando un usuario intenta iniciar sesión sin verificar su email:

1. El sistema detecta que `emailVerified: false`
2. Muestra un mensaje: "Tu email no está verificado"
3. Redirige automáticamente a `/resend-verification` con el email pre-llenado
4. El usuario solo debe hacer clic en "Enviar"

### 3. Scripts de Administración

#### Listar Usuarios No Verificados

```bash
npx tsx scripts/listar-usuarios-no-verificados.ts
```

Muestra:
- Email, nombre, teléfono
- Estado de verificación (email, teléfono, activo)
- Tipo de membresía y fecha de expiración
- Fecha de registro y último login

#### Activar Usuario Manualmente

```bash
npx tsx scripts/activar-usuario-manual.ts usuario@ejemplo.com
```

Activa automáticamente:
- ✅ Email verificado
- ✅ Teléfono verificado
- ✅ Usuario activo
- ✅ Trial de 10 días desde ahora
- ✅ Suscripción creada/actualizada

### 4. Archivo .bat para Windows

```bash
gestionar-usuarios-no-verificados.bat
```

Menú interactivo con opciones:
1. Listar usuarios no verificados
2. Activar usuario manualmente
3. Salir

## 🚀 Flujo de Usuario

### Opción A: Usuario Reenvía el Código

1. Usuario intenta iniciar sesión
2. Ve mensaje: "Email no verificado"
3. Es redirigido a `/resend-verification`
4. Su email ya está pre-llenado
5. Hace clic en "Enviar correo de verificación"
6. Recibe nuevo email con código
7. Hace clic en el enlace de verificación
8. ¡Activado! Puede iniciar sesión

### Opción B: Administrador Activa Manualmente

1. Administrador ejecuta: `gestionar-usuarios-no-verificados.bat`
2. Selecciona opción "1" para listar usuarios
3. Identifica el usuario a activar
4. Selecciona opción "2" para activar
5. Ingresa el email del usuario
6. ¡Usuario activado! Puede iniciar sesión inmediatamente

## 📋 Comandos Rápidos

### Ver usuarios no verificados
```bash
npx tsx scripts/listar-usuarios-no-verificados.ts
```

### Activar usuario específico
```bash
npx tsx scripts/activar-usuario-manual.ts usuario@ejemplo.com
```

### Usar menú interactivo (Windows)
```bash
gestionar-usuarios-no-verificados.bat
```

## 🔧 Configuración del Sistema

### Verificación de Email Activada

En `src/lib/auth.ts`, la verificación está **ACTIVADA**:

```typescript
if (!user.isEmailVerified) {
  throw new Error('EMAIL_NOT_VERIFIED')
}
```

### Manejo de Error en Login

En `src/app/login/page.tsx`:

```typescript
if (data.error === 'EMAIL_NOT_VERIFIED') {
  toast.error('Tu email no está verificado. Te redirigiremos...')
  setTimeout(() => {
    router.push(`/resend-verification?email=${encodeURIComponent(formData.email)}`)
  }, 2000)
}
```

## 📧 Servicio de Email

El sistema usa el servicio de email configurado en `.env`:

```env
# Resend (Recomendado)
RESEND_API_KEY=tu_api_key

# O Gmail OAuth2
GMAIL_USER=tu@gmail.com
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
```

## 🎁 Beneficios del Trial

Cuando un usuario verifica su email:
- ✅ 10 días de prueba gratuita
- ✅ Acceso completo al sistema
- ✅ Sin tarjeta de crédito requerida
- ✅ Activación automática

## 🆘 Soporte

Si un usuario tiene problemas:

1. **Primero:** Pedirle que revise spam/correo no deseado
2. **Segundo:** Usar `/resend-verification` para reenviar
3. **Tercero:** Activar manualmente con el script
4. **Último recurso:** Verificar configuración de email en `.env`

## 📊 Monitoreo

Para ver el estado de todos los usuarios:

```bash
npx tsx scripts/listar-usuarios-no-verificados.ts
```

Esto te mostrará:
- Cuántos usuarios están pendientes de verificación
- Cuándo se registraron
- Si han intentado iniciar sesión

## 🔐 Seguridad

- Los tokens de verificación son únicos y seguros
- Los emails se envían desde un servidor confiable
- Las contraseñas están hasheadas con bcrypt
- Los tokens expiran después de usarse

## ✨ Mejoras Futuras

- [ ] Recordatorio automático por email después de 24h
- [ ] Verificación por SMS como alternativa
- [ ] Dashboard de administración para gestionar usuarios
- [ ] Estadísticas de tasa de verificación

## 📝 Notas

- Los usuarios pueden reenviar el código cuantas veces necesiten
- No hay límite de intentos de verificación
- El trial de 10 días comienza cuando verifican, no cuando se registran
- Los administradores pueden activar usuarios sin que verifiquen

---

**¿Necesitas ayuda?** Contacta al equipo de soporte.
