# ✅ SISTEMA DE RECUPERACIÓN DE CONTRASEÑA

**Estado**: ✅ **IMPLEMENTADO Y LISTO**

---

## 🎯 Funcionalidad

Sistema completo de recuperación de contraseña con:
- ✅ Solicitud de recuperación por email
- ✅ Generación de token seguro
- ✅ Envío de email con enlace
- ✅ Validación de token
- ✅ Actualización de contraseña
- ✅ Expiración de token (1 hora)

---

## 📁 Archivos Creados

### Backend (API)

1. **`src/app/api/auth/forgot-password/route.ts`**
   - Endpoint: `POST /api/auth/forgot-password`
   - Genera token y envía email

2. **`src/app/api/auth/reset-password/route.ts`**
   - Endpoint: `POST /api/auth/reset-password`
   - Valida token y actualiza contraseña

### Frontend (Páginas)

3. **`src/app/forgot-password/page.tsx`**
   - Formulario para solicitar recuperación
   - URL: `/forgot-password`

4. **`src/app/reset-password/page.tsx`**
   - Formulario para ingresar nueva contraseña
   - URL: `/reset-password?token=xxx`

### Testing

5. **`scripts/test-password-reset.ts`**
   - Script para probar el sistema

---

## 🚀 Cómo Usar

### Para el Usuario

1. **Olvidó su contraseña**:
   - Va a `/login`
   - Hace clic en "¿Olvidaste tu contraseña?"

2. **Solicita recuperación**:
   - Ingresa su email en `/forgot-password`
   - Hace clic en "Enviar instrucciones"

3. **Recibe email**:
   - Revisa su bandeja de entrada
   - Hace clic en el enlace de recuperación

4. **Resetea contraseña**:
   - Ingresa nueva contraseña en `/reset-password?token=xxx`
   - Confirma la contraseña
   - Hace clic en "Actualizar contraseña"

5. **Inicia sesión**:
   - Es redirigido a `/login`
   - Inicia sesión con la nueva contraseña

### Para el Administrador

Si un usuario no puede recuperar su contraseña, puedes resetearla manualmente:

```bash
# Opción 1: Usar el script existente
npx tsx scripts/reset-admin-password.ts

# Opción 2: Crear nueva contraseña
npx tsx scripts/set-simple-password.ts
```

---

## 🧪 Probar el Sistema

### 1. Test Automático

```bash
npx tsx scripts/test-password-reset.ts
```

Esto:
- ✅ Busca un usuario
- ✅ Genera un token
- ✅ Simula el reset de contraseña
- ✅ Verifica que funcione

### 2. Test Manual

1. **Inicia el servidor**:
   ```bash
   npm run dev
   ```

2. **Ve a la página de recuperación**:
   ```
   http://localhost:3000/forgot-password
   ```

3. **Ingresa un email válido**:
   - Usa el email de un usuario existente
   - Haz clic en "Enviar instrucciones"

4. **Revisa los logs**:
   - Si no tienes email configurado, verás el enlace en los logs
   - Copia el enlace y ábrelo en el navegador

5. **Ingresa nueva contraseña**:
   - Mínimo 6 caracteres
   - Confirma la contraseña
   - Haz clic en "Actualizar contraseña"

6. **Inicia sesión**:
   - Serás redirigido a `/login`
   - Inicia sesión con la nueva contraseña

---

## 📧 Configuración de Email

### Sin Configuración (Desarrollo)

Si no tienes `RESEND_API_KEY` configurado:
- ✅ El sistema funciona igual
- ✅ Los enlaces aparecen en los logs del servidor
- ✅ Puedes copiar y pegar el enlace manualmente

### Con Resend (Producción)

Para enviar emails reales:

1. **Crea cuenta en Resend**:
   ```
   https://resend.com
   ```

2. **Obtén tu API Key**

3. **Configura en `.env`**:
   ```env
   RESEND_API_KEY=re_tu_api_key_aqui
   RESEND_FROM_EMAIL=noreply@tudominio.com
   ```

4. **Verifica tu dominio** en Resend

---

## 🔒 Seguridad

### Características de Seguridad

✅ **Token aleatorio**: 32 bytes (256 bits)
✅ **Expiración**: 1 hora
✅ **Un solo uso**: El token se elimina después de usarlo
✅ **Hash de contraseña**: bcrypt con 12 rounds
✅ **Validación**: Mínimo 6 caracteres
✅ **Privacidad**: No revela si el email existe

### Flujo Seguro

1. Usuario solicita recuperación
2. Sistema genera token aleatorio
3. Token se guarda en DB con expiración
4. Email se envía con enlace único
5. Usuario hace clic en el enlace
6. Sistema valida token y expiración
7. Usuario ingresa nueva contraseña
8. Contraseña se hashea y guarda
9. Token se elimina de la DB

---

## 🛠️ Personalización

### Cambiar Tiempo de Expiración

En `src/app/api/auth/forgot-password/route.ts`:

```typescript
// Cambiar de 1 hora a 30 minutos
const resetTokenExpiry = new Date(Date.now() + 1800000) // 30 min

// O a 24 horas
const resetTokenExpiry = new Date(Date.now() + 86400000) // 24 horas
```

### Cambiar Longitud Mínima de Contraseña

En `src/app/api/auth/reset-password/route.ts`:

```typescript
// Cambiar de 6 a 8 caracteres
if (password.length < 8) {
  return NextResponse.json(
    { error: 'La contraseña debe tener al menos 8 caracteres' },
    { status: 400 }
  )
}
```

### Personalizar Email

El template del email está en `src/lib/email-service.ts` en el método `sendPasswordResetEmail()`.

---

## 📊 Base de Datos

### Campos Utilizados

En el modelo `User`:

```prisma
model User {
  // ... otros campos
  passwordResetToken    String?
  passwordResetExpires  DateTime?
  // ... otros campos
}
```

Estos campos ya existen en el schema, no necesitas migrar.

---

## 🐛 Troubleshooting

### "Token inválido o expirado"

**Causas**:
- El token ya fue usado
- Pasó más de 1 hora
- El token es incorrecto

**Solución**:
- Solicitar nuevo enlace de recuperación

### "Error enviando email"

**Causas**:
- `RESEND_API_KEY` no configurado
- API key inválido
- Dominio no verificado

**Solución**:
- Revisar configuración de Resend
- Ver logs del servidor para más detalles
- Usar el enlace de los logs en desarrollo

### "Las contraseñas no coinciden"

**Causa**:
- Error al escribir la confirmación

**Solución**:
- Verificar que ambas contraseñas sean iguales

---

## ✅ Checklist de Implementación

- [x] API de forgot-password
- [x] API de reset-password
- [x] Página de forgot-password
- [x] Página de reset-password
- [x] Enlace en página de login
- [x] Validación de token
- [x] Expiración de token
- [x] Hash de contraseña
- [x] Envío de email
- [x] Script de testing
- [x] Documentación

---

## 🎉 Resultado

El sistema de recuperación de contraseña está **100% funcional** y listo para usar en producción.

**Próximo paso**: Hacer commit y push de los cambios.

```bash
git add .
git commit -m "feat: agregar sistema de recuperación de contraseña"
git push
```
