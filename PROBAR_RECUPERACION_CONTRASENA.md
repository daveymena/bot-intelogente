# 🧪 PROBAR RECUPERACIÓN DE CONTRASEÑA (Sin Email)

Como no tienes email configurado aún, vamos a probar el sistema de recuperación de contraseña de forma manual.

## 📋 Pasos para Probar

### 1. Generar Token Manualmente

Ejecuta este script para generar un token de recuperación:

```bash
npx tsx scripts/test-password-reset.ts
```

Esto te dará:
- ✅ Un token de recuperación
- ✅ Una URL completa para resetear la contraseña
- ✅ El token se guardará en la base de datos

### 2. Copiar la URL

El script te mostrará algo como:

```
🔗 URL de recuperación:
   http://localhost:3000/reset-password?token=abc123...
```

### 3. Abrir la URL en el Navegador

1. Copia la URL completa
2. Pégala en tu navegador
3. Verás el formulario para ingresar nueva contraseña

### 4. Ingresar Nueva Contraseña

1. Ingresa una nueva contraseña (mínimo 6 caracteres)
2. Confirma la contraseña
3. Haz clic en "Actualizar contraseña"

### 5. Iniciar Sesión

1. Serás redirigido a `/login`
2. Inicia sesión con:
   - Email: (el que te mostró el script)
   - Contraseña: (la nueva que acabas de crear)

## 🎯 Flujo Completo (Con Email Configurado)

Cuando configures Resend, el flujo será:

1. Usuario va a `/forgot-password`
2. Ingresa su email
3. Recibe un email con el enlace
4. Hace clic en el enlace
5. Ingresa nueva contraseña
6. Inicia sesión

## 📧 Configurar Resend (Opcional)

Si quieres probar con emails reales:

### 1. Crear Cuenta en Resend

```
https://resend.com/signup
```

### 2. Obtener API Key

1. Ve a "API Keys"
2. Crea una nueva API Key
3. Cópiala

### 3. Configurar en .env

```env
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=noreply@tudominio.com
```

### 4. Verificar Dominio (Opcional)

Para enviar desde tu dominio:
1. Ve a "Domains" en Resend
2. Agrega tu dominio
3. Configura los registros DNS
4. Espera verificación

### 5. Probar

```bash
# Probar envío de email
npx tsx scripts/test-email.ts
```

## ⚡ Solución Temporal: Usar Resend con Dominio de Prueba

Resend te da un dominio de prueba gratis:

```env
RESEND_API_KEY=re_tu_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Con esto puedes enviar emails a cualquier dirección para probar.

## 🔧 Alternativa: Usar Logs

Si no quieres configurar email ahora:

1. El sistema funciona igual
2. Los enlaces aparecen en los logs del servidor
3. Copia y pega el enlace manualmente
4. Perfecto para desarrollo

## ✅ Verificar que Funciona

Después de resetear la contraseña:

```bash
# 1. Inicia el servidor
npm run dev

# 2. Ve a login
http://localhost:3000/login

# 3. Inicia sesión con la nueva contraseña
```

Si funciona, ¡el sistema está listo! 🎉

## 📝 Resumen

**Sin Email (Desarrollo)**:
- ✅ Genera token con script
- ✅ Copia URL de los logs
- ✅ Resetea contraseña manualmente

**Con Email (Producción)**:
- ✅ Usuario solicita recuperación
- ✅ Recibe email automáticamente
- ✅ Hace clic en enlace
- ✅ Resetea contraseña

Ambos métodos funcionan perfectamente. El código es el mismo, solo cambia cómo se entrega el enlace al usuario.
