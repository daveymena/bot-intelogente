# 🔧 Arreglar Emails de Verificación - Guía Rápida

## ❓ Problema

Los correos de verificación no están llegando.

## 🔍 Diagnóstico Rápido

### 1. Probar Envío de Email

```bash
# Editar el script primero
# Cambiar 'tu-email@gmail.com' por tu email real

npx tsx scripts/test-email-verificacion-ahora.ts
```

### 2. Verificar Variables de Entorno

```bash
# En .env debe estar:
RESEND_API_KEY=re_tu_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXTAUTH_URL=http://localhost:3000
```

## ✅ Soluciones

### Opción 1: Verificar API Key de Resend (2 min)

1. **Ir a**: https://resend.com/api-keys
2. **Login** con tu cuenta
3. **Verificar** que la key esté activa
4. **Copiar** la key (empieza con `re_`)
5. **Actualizar** en `.env`:
   ```
   RESEND_API_KEY=re_tu_key_nueva
   ```
6. **Reiniciar** el servidor

### Opción 2: Verificar Dominio (5 min)

1. **Ir a**: https://resend.com/domains
2. **Verificar** que `resend.dev` esté activo
3. **O agregar** tu dominio personalizado
4. **Actualizar** `.env`:
   ```
   RESEND_FROM_EMAIL=noreply@tudominio.com
   ```

### Opción 3: Revisar Logs de Resend

1. **Ir a**: https://resend.com/emails
2. **Ver** los últimos envíos
3. **Revisar** errores o rechazos
4. **Verificar** límites de envío

### Opción 4: Usar Gmail OAuth (Alternativa Gratis)

Si Resend no funciona, puedes usar Gmail:

```bash
# Ver guía completa
cat CONFIGURAR_GMAIL_GRATIS.md

# O configurar rápido:
# 1. Habilitar "Aplicaciones menos seguras" en Gmail
# 2. Agregar en .env:
GMAIL_USER=tu-email@gmail.com
GMAIL_PASS=tu-contraseña-app
```

## 🚨 Problemas Comunes

### Error: "API key is invalid"

**Causa**: La API key de Resend es incorrecta o expiró

**Solución**:
```bash
# 1. Ir a https://resend.com/api-keys
# 2. Crear nueva key
# 3. Copiar y pegar en .env
RESEND_API_KEY=re_nueva_key_aqui

# 4. Reiniciar servidor
npm run dev
```

### Error: "Email address not verified"

**Causa**: El email remitente no está verificado

**Solución**:
```bash
# Usar el dominio de prueba de Resend
RESEND_FROM_EMAIL=onboarding@resend.dev

# O verificar tu dominio en:
# https://resend.com/domains
```

### Error: "Rate limit exceeded"

**Causa**: Límite de envíos alcanzado

**Solución**:
- Plan gratuito: 100 emails/día
- Esperar 24 horas
- O actualizar plan en Resend

### Emails van a SPAM

**Solución**:
1. Verificar dominio en Resend
2. Configurar SPF y DKIM
3. Usar dominio personalizado
4. Revisar contenido del email

## 🧪 Probar Manualmente

### 1. Desde el Dashboard

```
1. Ir a http://localhost:3000
2. Click en "Registrarse"
3. Llenar formulario
4. Click "Crear cuenta"
5. Revisar email (y spam)
```

### 2. Desde la API

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu-email@gmail.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 3. Ver Logs del Servidor

```bash
# En la consola donde corre npm run dev
# Buscar:
📧 Enviando email a...
✅ Email enviado exitosamente
# O
❌ Error enviando email
```

## 📊 Checklist de Verificación

- [ ] `RESEND_API_KEY` configurada en .env
- [ ] API key válida en Resend
- [ ] `RESEND_FROM_EMAIL` configurado
- [ ] Dominio verificado en Resend
- [ ] Servidor reiniciado después de cambios
- [ ] Probado con script de test
- [ ] Revisado bandeja de spam
- [ ] Logs del servidor sin errores

## 🎯 Configuración Recomendada

```bash
# .env
RESEND_API_KEY=re_tu_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXTAUTH_URL=http://localhost:3000

# Para producción
RESEND_FROM_EMAIL=noreply@tudominio.com
NEXTAUTH_URL=https://tudominio.com
```

## 🔄 Alternativas a Resend

### 1. Gmail (Gratis - 500/día)
```bash
GMAIL_USER=tu-email@gmail.com
GMAIL_PASS=tu-contraseña-app
```

### 2. SendGrid (Gratis - 100/día)
```bash
SENDGRID_API_KEY=SG.tu_key_aqui
```

### 3. Mailgun (Gratis - 100/día)
```bash
MAILGUN_API_KEY=tu_key_aqui
MAILGUN_DOMAIN=tudominio.com
```

## 📝 Logs Útiles

```bash
# Ver logs en tiempo real
npm run dev

# Buscar errores de email
grep "Email" logs.txt

# Ver últimos 50 logs
tail -n 50 logs.txt
```

## 🆘 Si Nada Funciona

1. **Desactivar verificación temporal**:
   ```typescript
   // En src/app/api/auth/register/route.ts
   // Comentar la línea de verificación
   // emailVerified: null, // ← Cambiar a: new Date()
   ```

2. **Verificar manualmente en DB**:
   ```bash
   npx prisma studio
   # Ir a User
   # Cambiar emailVerified a fecha actual
   ```

3. **Usar WhatsApp para verificación**:
   - Ver: `VERIFICACION_WHATSAPP_COMPLETA.md`

## ✅ Resultado Esperado

Cuando funcione correctamente:

```
📧 Enviando email a usuario@email.com...
✅ Email enviado exitosamente: abc123
```

Y el usuario recibirá:
- **Asunto**: 🤖 Verifica tu cuenta de Smart Sales Bot
- **Contenido**: Email profesional con botón de verificación
- **Link**: http://localhost:3000/verify-email?token=...

---

**¿Necesitas ayuda? Ejecuta el script de prueba y comparte los logs!**

```bash
npx tsx scripts/test-email-verificacion-ahora.ts
```
