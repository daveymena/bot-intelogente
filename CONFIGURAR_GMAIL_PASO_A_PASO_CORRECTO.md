# 🔧 Configurar Gmail OAuth2 - Paso a Paso CORRECTO

## ❌ Problema Detectado

Tu Refresh Token actual NO tiene permisos para enviar emails.

**Scopes actuales:**
- ✅ `openid`
- ✅ `userinfo.email`
- ✅ `userinfo.profile`
- ❌ `https://mail.google.com/` ← **FALTA ESTE**

## ✅ Solución: Obtener Nuevo Refresh Token con Gmail

### Paso 1: Ir al OAuth Playground

Ve a: https://developers.google.com/oauthplayground

### Paso 2: Configurar tus Credenciales

1. Click en el ⚙️ (engranaje) arriba a la derecha
2. Marca ✅ "Use your own OAuth credentials"
3. Pega tus credenciales:
   ```
   OAuth Client ID: TU_CLIENT_ID_AQUI.apps.googleusercontent.com
   OAuth Client secret: TU_CLIENT_SECRET_AQUI
   ```
4. Click "Close"

### Paso 3: Seleccionar el Scope CORRECTO de Gmail

**IMPORTANTE:** En el lado izquierdo, busca:

```
Gmail API v1
  └─ https://mail.google.com/
```

1. Expande "Gmail API v1"
2. Marca SOLO: `https://mail.google.com/`
3. Click en "Authorize APIs"

### Paso 4: Autorizar

1. Selecciona tu cuenta de Gmail (daveymena16@gmail.com)
2. Click "Permitir" / "Allow"
3. Si aparece advertencia de "App no verificada":
   - Click en "Avanzado"
   - Click en "Ir a [tu app] (no seguro)"
   - Click "Permitir"

### Paso 5: Obtener el Refresh Token

1. Después de autorizar, verás un "Authorization code"
2. Click en "Exchange authorization code for tokens"
3. Copia el **Refresh Token** (empieza con `1//0...`)

### Paso 6: Actualizar tu .env

Reemplaza el `GMAIL_REFRESH_TOKEN` en tu `.env` con el nuevo token.

## 🧪 Probar

Después de actualizar el token:

```bash
npx tsx scripts/test-gmail-oauth-simple.ts
```

## 📝 Notas Importantes

- El Refresh Token con Gmail scope NO expira
- Puedes enviar hasta 500 emails/día GRATIS
- No necesitas verificar tu app para uso personal
- Si revocas el acceso, necesitarás generar un nuevo token

## ❓ ¿Por qué falló antes?

El token que obtuviste primero solo tenía permisos de "perfil de usuario" pero NO de "enviar emails". Por eso Gmail rechazaba la autenticación.

## 🎯 Siguiente Paso

Una vez que tengas el nuevo Refresh Token con el scope correcto:

1. Actualiza `GMAIL_REFRESH_TOKEN` en `.env`
2. Ejecuta: `npx tsx scripts/test-gmail-oauth-simple.ts`
3. Deberías recibir un email de prueba ✅
