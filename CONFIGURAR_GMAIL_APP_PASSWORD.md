# 📧 CONFIGURAR GMAIL APP PASSWORD (5 MINUTOS)

## 🎯 PROBLEMA ACTUAL

Los emails NO se están enviando porque falta configurar el **App Password** de Gmail.

**Estado actual en .env**:
```env
EMAIL_USER=deinermena25@gmail.com
EMAIL_PASS=PENDIENTE_CONFIGURAR  ← NECESITAS CAMBIAR ESTO
EMAIL_FROM=deinermena25@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

---

## ✅ SOLUCIÓN (5 MINUTOS)

### Paso 1: Activar Verificación en 2 Pasos (si no está activada)

1. Ir a: https://myaccount.google.com/security
2. Buscar "Verificación en 2 pasos"
3. Click en "Activar"
4. Seguir los pasos (te pedirá tu teléfono)

### Paso 2: Crear App Password

1. Ir a: https://myaccount.google.com/apppasswords
2. Iniciar sesión con tu cuenta: **deinermena25@gmail.com**
3. En "Seleccionar app" → Elegir "Correo"
4. En "Seleccionar dispositivo" → Elegir "Otro (nombre personalizado)"
5. Escribir: "Smart Sales Bot"
6. Click en "Generar"
7. **Copiar la contraseña de 16 caracteres** (ejemplo: `abcd efgh ijkl mnop`)

### Paso 3: Agregar a .env

Abrir `.env` y reemplazar:

```env
EMAIL_PASS=PENDIENTE_CONFIGURAR
```

Por:

```env
EMAIL_PASS=abcd efgh ijkl mnop
```

**⚠️ IMPORTANTE**: 
- Usa la contraseña EXACTA que te dio Gmail (con espacios o sin espacios, ambos funcionan)
- NO uses tu contraseña normal de Gmail
- NO compartas esta contraseña

### Paso 4: Reiniciar el Bot

```bash
# Detener el bot (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

### Paso 5: Probar

```bash
npx tsx scripts/test-email-nodemailer.ts
```

Deberías ver:
```
✅ Conexión exitosa con servidor SMTP
✅ Email enviado exitosamente!
📬 Verifica tu bandeja de entrada
```

---

## 🧪 PROBAR SISTEMA COMPLETO

### 1. Test de Email Básico

```bash
# Enviar a tu propio email
npx tsx scripts/test-email-nodemailer.ts

# Enviar a otro email
npx tsx scripts/test-email-nodemailer.ts otro@email.com
```

### 2. Test de Recuperación de Contraseña

1. Ir a: http://localhost:4000/forgot-password
2. Ingresar: deinermena25@gmail.com
3. Click en "Enviar"
4. Verificar que llegue el email
5. Click en el link del email
6. Ingresar nueva contraseña
7. Verificar que funcione

### 3. Test de Notificaciones de Pago

1. Realizar una compra de prueba en WhatsApp
2. Completar el pago
3. Verificar que llegue email de confirmación

---

## 📊 TIPOS DE EMAILS QUE SE ENVIARÁN

Una vez configurado, el sistema enviará automáticamente:

### 1. Recuperación de Contraseñas 🔐
**Cuándo**: Usuario olvida su contraseña
**Contenido**: Link de reset con token seguro
**Expiración**: 1 hora

### 2. Confirmación de Pago 💰
**Cuándo**: Pago confirmado
**Contenido**: Detalles del producto y pago
**Incluye**: Link de descarga (productos digitales)

### 3. Notificación de Pedido 📦
**Cuándo**: Pedido procesado
**Contenido**: Estado del pedido
**Incluye**: Número de seguimiento

### 4. Recordatorios Automáticos 🔔
**Cuándo**: Programados automáticamente
**Contenido**: Recordatorios de pago, renovación, etc.

### 5. Verificación de Cuenta ✅
**Cuándo**: Usuario se registra
**Contenido**: Link de verificación
**Expiración**: 24 horas

---

## 🔒 SEGURIDAD

### ✅ Buenas Prácticas

1. **Usa App Password** (no tu contraseña normal)
2. **No subas .env a Git** (ya está en .gitignore)
3. **Rota contraseñas cada 3-6 meses**
4. **Revoca acceso si sospechas compromiso**

### ⚠️ Nunca Hagas Esto

❌ No uses tu contraseña normal de Gmail  
❌ No compartas el App Password  
❌ No subas .env a repositorios públicos  
❌ No hardcodees credenciales en el código  

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Problema: "Invalid login"

**Causa**: App Password incorrecto

**Solución**:
1. Generar nuevo App Password
2. Copiar exactamente como aparece
3. Actualizar en .env
4. Reiniciar bot

### Problema: "Connection timeout"

**Causa**: Puerto o host incorrecto

**Solución**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Problema: Email no llega

**Causas posibles**:
1. Email en spam
2. App Password incorrecto
3. Verificación en 2 pasos no activada

**Solución**:
1. Revisar carpeta de spam
2. Verificar configuración
3. Ejecutar test: `npx tsx scripts/test-email-nodemailer.ts`

### Problema: "Less secure app access"

**Causa**: Gmail bloqueó el acceso

**Solución**:
- Usar App Password (no contraseña normal)
- Activar verificación en 2 pasos
- Generar nuevo App Password

---

## 📝 CHECKLIST FINAL

Antes de producción:

- [ ] App Password generado
- [ ] Variables agregadas a .env
- [ ] Test de email exitoso
- [ ] Email de recuperación funcionando
- [ ] Email de notificaciones funcionando
- [ ] Emails NO van a spam
- [ ] Variables configuradas en Easypanel

---

## 🚀 DESPLEGAR A PRODUCCIÓN

### Variables en Easypanel

Agregar en Easypanel:

```env
EMAIL_USER=deinermena25@gmail.com
EMAIL_PASS=tu_app_password_aqui
EMAIL_FROM=deinermena25@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Verificar en Producción

1. Probar recuperación de contraseña
2. Realizar compra de prueba
3. Verificar emails llegando
4. Verificar links funcionando

---

## 📞 COMANDOS RÁPIDOS

```bash
# Test de email
npx tsx scripts/test-email-nodemailer.ts

# Test del sistema completo
npx tsx scripts/test-sistema-completo-final.ts

# Iniciar bot
npm run dev
```

---

**Estado**: ⚠️ PENDIENTE CONFIGURACIÓN  
**Tiempo**: 5 minutos  
**Prioridad**: ALTA  
**Siguiente paso**: Crear App Password en Gmail
