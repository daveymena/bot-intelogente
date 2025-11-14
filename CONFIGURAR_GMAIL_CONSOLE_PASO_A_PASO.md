# 📧 Configurar Gmail con Google Console - Guía Completa

## 🎯 Objetivo

Configurar Gmail OAuth2 para enviar emails de verificación desde tu aplicación sin límites de Resend.

## 📋 Requisitos

- Cuenta de Gmail (daveymena16@gmail.com)
- Acceso a Google Cloud Console
- 15-20 minutos

## 🚀 Paso a Paso

### 1️⃣ Crear Proyecto en Google Cloud Console

**1. Ir a Google Cloud Console:**
```
https://console.cloud.google.com/
```

**2. Crear nuevo proyecto:**
- Click en el selector de proyectos (arriba a la izquierda)
- Click en "Nuevo Proyecto"
- Nombre: `Smart Sales Bot` (o el que prefieras)
- Click en "Crear"
- Esperar a que se cree (30 segundos aprox)

**3. Seleccionar el proyecto:**
- Asegúrate de que el nuevo proyecto esté seleccionado en el selector

---

### 2️⃣ Habilitar Gmail API

**1. Ir a la biblioteca de APIs:**
```
https://console.cloud.google.com/apis/library
```

**2. Buscar Gmail API:**
- En el buscador, escribir: `Gmail API`
- Click en "Gmail API"

**3. Habilitar la API:**
- Click en "Habilitar"
- Esperar a que se habilite (10 segundos)

---

### 3️⃣ Configurar Pantalla de Consentimiento OAuth

**1. Ir a pantalla de consentimiento:**
```
https://console.cloud.google.com/apis/credentials/consent
```

**2. Seleccionar tipo de usuario:**
- Seleccionar: **"Externo"** (External)
- Click en "Crear"

**3. Configurar información de la app:**

**Información de la aplicación:**
- Nombre de la aplicación: `Smart Sales Bot`
- Correo de asistencia: `daveymena16@gmail.com`

**Información de contacto del desarrollador:**
- Correo: `daveymena16@gmail.com`

**4. Click en "Guardar y continuar"**

**5. Ámbitos (Scopes):**
- Click en "Agregar o quitar ámbitos"
- Buscar y seleccionar:
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/gmail.compose`
- Click en "Actualizar"
- Click en "Guardar y continuar"

**6. Usuarios de prueba:**
- Click en "Agregar usuarios"
- Agregar: `daveymena16@gmail.com`
- Click en "Agregar"
- Click en "Guardar y continuar"

**7. Resumen:**
- Revisar la información
- Click en "Volver al panel"

---

### 4️⃣ Crear Credenciales OAuth 2.0

**1. Ir a credenciales:**
```
https://console.cloud.google.com/apis/credentials
```

**2. Crear credenciales:**
- Click en "Crear credenciales"
- Seleccionar: "ID de cliente de OAuth 2.0"

**3. Configurar el cliente OAuth:**
- Tipo de aplicación: **"Aplicación web"**
- Nombre: `Smart Sales Bot - Email Service`

**4. URIs de redirección autorizados:**
- Click en "Agregar URI"
- Agregar: `https://developers.google.com/oauthplayground`
- Click en "Crear"

**5. Guardar credenciales:**
- Aparecerá un modal con:
  - **Client ID** (ID de cliente)
  - **Client Secret** (Secreto de cliente)
- **¡COPIAR Y GUARDAR ESTOS VALORES!**
- Los necesitarás en el siguiente paso

---

### 5️⃣ Obtener Refresh Token

**1. Ir a OAuth 2.0 Playground:**
```
https://developers.google.com/oauthplayground
```

**2. Configurar el playground:**
- Click en el ícono de engranaje (⚙️) arriba a la derecha
- Marcar: **"Use your own OAuth credentials"**
- Pegar:
  - **OAuth Client ID:** (el que copiaste)
  - **OAuth Client secret:** (el que copiaste)
- Click fuera del modal para cerrar

**3. Seleccionar ámbitos:**
- En el panel izquierdo, buscar: `Gmail API v1`
- Expandir y seleccionar:
  - `https://mail.google.com/`
- Click en "Authorize APIs"

**4. Autorizar:**
- Seleccionar tu cuenta de Gmail (daveymena16@gmail.com)
- Click en "Continuar" (si aparece advertencia de app no verificada)
- Click en "Ir a Smart Sales Bot (no seguro)"
- Click en "Permitir"

**5. Obtener tokens:**
- Serás redirigido al playground
- Click en "Exchange authorization code for tokens"
- Aparecerá el **Refresh token**
- **¡COPIAR Y GUARDAR ESTE VALOR!**

---

### 6️⃣ Configurar Variables de Entorno

**1. Abrir tu archivo `.env`**

**2. Agregar las credenciales de Gmail:**

```env
# ===== GMAIL OAUTH2 =====
GMAIL_USER=daveymena16@gmail.com
GMAIL_CLIENT_ID=tu_client_id_aqui
GMAIL_CLIENT_SECRET=tu_client_secret_aqui
GMAIL_REFRESH_TOKEN=tu_refresh_token_aqui

# Opcional: Configurar como servicio principal
EMAIL_SERVICE=gmail
```

**3. Guardar el archivo**

---

### 7️⃣ Probar la Configuración

**1. Ejecutar el script de prueba:**

```bash
npx tsx scripts/test-gmail-oauth.ts
```

**2. Si todo está bien, verás:**
```
✅ Gmail OAuth2 configurado correctamente
✅ Email de prueba enviado
```

**3. Revisar tu bandeja de entrada:**
- Deberías recibir un email de prueba

---

## 📝 Resumen de Credenciales

Al final del proceso, deberías tener:

```env
GMAIL_USER=daveymena16@gmail.com
GMAIL_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GMAIL_REFRESH_TOKEN=1//0abcdefghijklmnopqrstuvwxyz
```

---

## 🔧 Solución de Problemas

### Error: "Invalid grant"
- El refresh token expiró
- Volver al paso 5 y generar uno nuevo

### Error: "Access denied"
- Verificar que el email esté en usuarios de prueba
- Ir a pantalla de consentimiento y agregarlo

### Error: "API not enabled"
- Verificar que Gmail API esté habilitada
- Ir al paso 2 y habilitarla

### Email no llega
- Verificar que las credenciales sean correctas
- Revisar carpeta de spam
- Ejecutar script de prueba

---

## ✅ Ventajas de Gmail OAuth2

### vs Resend (modo prueba)
- ✅ Envía a cualquier email (no solo el tuyo)
- ✅ Sin límites de destinatarios
- ✅ Gratis (hasta 500 emails/día)
- ✅ Más confiable

### vs SMTP simple
- ✅ Más seguro (OAuth2 vs contraseña)
- ✅ No requiere "apps menos seguras"
- ✅ Tokens renovables automáticamente

---

## 🎯 Próximos Pasos

Después de configurar:

1. **Probar envío:**
   ```bash
   npx tsx scripts/test-codigo-verificacion.ts email@ejemplo.com
   ```

2. **Probar registro:**
   - Ir a `/register`
   - Registrar nuevo usuario
   - Verificar que llegue el código

3. **Activar usuarios pendientes:**
   ```bash
   npx tsx scripts/activar-usuario-manual.ts eladios.mena@gmail.com
   npx tsx scripts/activar-usuario-manual.ts deinermena25@gmail.com
   npx tsx scripts/activar-usuario-manual.ts daveymena162@gmail.com
   ```

---

## 📖 Documentación Oficial

- **Google Cloud Console:** https://console.cloud.google.com/
- **Gmail API:** https://developers.google.com/gmail/api
- **OAuth 2.0 Playground:** https://developers.google.com/oauthplayground
- **Guía OAuth2:** https://developers.google.com/identity/protocols/oauth2

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas en algún paso:

1. Revisar esta guía paso a paso
2. Verificar que todos los valores estén copiados correctamente
3. Ejecutar el script de prueba
4. Revisar los logs en consola

---

**Tiempo estimado:** 15-20 minutos
**Dificultad:** Media
**Resultado:** Sistema de emails funcionando sin límites ✅
