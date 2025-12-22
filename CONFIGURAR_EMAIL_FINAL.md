# 📧 CONFIGURAR EMAIL PARA NOTIFICACIONES

## ✅ ESTADO ACTUAL

### Sistemas Implementados ✅
1. **Recuperación de contraseñas** ✅
   - Endpoints: forgot-password, reset-password
   - Página de reset funcionando
   
2. **Sistema de notificaciones** ✅
   - Servicio de notificaciones implementado
   - Endpoints de confirmación de pago
   
3. **Sistema de emails** ✅
   - Servicio de email implementado
   - Listo para enviar

4. **Sistema de pagos** ✅
   - MercadoPago configurado
   - PayPal configurado
   - Nequi/Daviplata configurado

### ⚠️ Falta Configurar

**Email** - Necesario para:
- Recuperación de contraseñas
- Notificaciones de pago
- Entrega de productos digitales
- Confirmaciones de suscripción

---

## 🔧 CONFIGURAR EMAIL (5 MINUTOS)

### Opción 1: Gmail (Recomendado)

#### Paso 1: Obtener App Password

1. Ir a: https://myaccount.google.com/apppasswords
2. Iniciar sesión con tu cuenta de Gmail
3. Crear contraseña de aplicación:
   - Nombre: "Bot WhatsApp"
   - Click en "Crear"
4. Copiar la contraseña generada (16 caracteres)

#### Paso 2: Agregar a .env

Abrir `.env` y agregar:

```env
# ===== EMAIL - NOTIFICACIONES =====
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=tu_email@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

**Ejemplo real**:
```env
EMAIL_USER=deinermena25@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=deinermena25@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

#### Paso 3: Reiniciar el Bot

```bash
# Detener el bot (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

---

### Opción 2: Otro Proveedor

#### Outlook/Hotmail

```env
EMAIL_USER=tu_email@outlook.com
EMAIL_PASS=tu_contraseña
EMAIL_FROM=tu_email@outlook.com
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

#### Yahoo

```env
EMAIL_USER=tu_email@yahoo.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=tu_email@yahoo.com
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

---

## 🧪 PROBAR EL SISTEMA

### 1. Probar Recuperación de Contraseñas (2 min)

```bash
# Iniciar el bot
npm run dev
```

1. Ir a: http://localhost:4000/forgot-password
2. Ingresar tu email de prueba
3. Click en "Enviar"
4. Verificar que llegue el email
5. Click en el link del email
6. Ingresar nueva contraseña
7. Verificar que funcione

**Email esperado**:
```
Asunto: Recuperación de Contraseña - Smart Sales Bot Pro

Hola,

Recibimos una solicitud para restablecer tu contraseña.

Click aquí para crear una nueva contraseña:
http://localhost:4000/reset-password?token=XXXXX

Este link expira en 1 hora.

Si no solicitaste esto, ignora este email.

Saludos,
Smart Sales Bot Pro
```

### 2. Probar Notificaciones de Pago (5 min)

1. Realizar una compra de prueba en WhatsApp
2. Completar el pago
3. Verificar que llegue email de confirmación

**Email esperado**:
```
Asunto: Confirmación de Pago - Mega Pack de Idiomas

¡Gracias por tu compra!

Producto: Mega Pack de Idiomas
Monto: $60.000 COP
Método: MercadoPago

Tu producto ha sido enviado.

Saludos,
Smart Sales Bot Pro
```

### 3. Probar Suscripciones (5 min)

1. Ir a: http://localhost:4000/membresias
2. Seleccionar un plan
3. Completar pago
4. Verificar email de confirmación

**Email esperado**:
```
Asunto: Suscripción Activada - Plan Premium

¡Bienvenido!

Tu suscripción ha sido activada:
Plan: Premium
Duración: 30 días
Precio: $50.000 COP

Disfruta de todas las funciones premium.

Saludos,
Smart Sales Bot Pro
```

---

## 📊 TIPOS DE EMAILS QUE SE ENVÍAN

### 1. Recuperación de Contraseña
- **Cuándo**: Usuario olvida su contraseña
- **Contenido**: Link de reset
- **Expiración**: 1 hora

### 2. Confirmación de Pago
- **Cuándo**: Pago confirmado
- **Contenido**: Detalles del producto y pago
- **Incluye**: Link de descarga (productos digitales)

### 3. Entrega de Producto Digital
- **Cuándo**: Después de confirmar pago
- **Contenido**: Acceso al producto
- **Incluye**: Links, credenciales, archivos

### 4. Activación de Suscripción
- **Cuándo**: Suscripción activada
- **Contenido**: Detalles del plan
- **Incluye**: Fecha de expiración

### 5. Recordatorio de Expiración
- **Cuándo**: 3 días antes de expirar
- **Contenido**: Recordatorio de renovación
- **Incluye**: Link para renovar

---

## 🔒 SEGURIDAD

### App Password vs Contraseña Normal

**NO uses tu contraseña normal de Gmail**. Usa App Password porque:

✅ Más seguro (permisos limitados)  
✅ Puedes revocar sin cambiar contraseña  
✅ No expone tu cuenta principal  
✅ Requerido por Gmail para apps externas  

### Proteger Credenciales

1. **Nunca subir .env a Git**
   - Ya está en .gitignore
   - Verificar antes de commit

2. **Usar variables de entorno en producción**
   - Configurar en Easypanel
   - No hardcodear en código

3. **Rotar contraseñas periódicamente**
   - Cada 3-6 meses
   - Si hay sospecha de compromiso

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Problema: Email no llega

**Causas posibles**:
1. App Password incorrecto
2. Email en spam
3. Configuración SMTP incorrecta

**Solución**:
```bash
# Ver logs del servidor
npm run dev

# Buscar errores de email
# Verificar que diga: "✅ Email enviado"
```

### Problema: Error de autenticación

**Causa**: App Password incorrecto o expirado

**Solución**:
1. Generar nuevo App Password
2. Actualizar en .env
3. Reiniciar bot

### Problema: Email en spam

**Causa**: Primer email desde esa dirección

**Solución**:
1. Marcar como "No es spam"
2. Agregar remitente a contactos
3. Crear regla de filtro

---

## 📝 CHECKLIST FINAL

Antes de producción, verificar:

- [ ] Email configurado en .env
- [ ] App Password generado
- [ ] Test de recuperación funcionando
- [ ] Test de notificaciones funcionando
- [ ] Test de suscripciones funcionando
- [ ] Emails llegando correctamente
- [ ] No van a spam
- [ ] Links en emails funcionan
- [ ] Variables configuradas en Easypanel

---

## 🎯 RESULTADO ESPERADO

### Con Email Configurado ✅

**Recuperación de contraseñas**:
- Usuario recibe email en < 1 minuto
- Link funciona correctamente
- Contraseña se actualiza

**Notificaciones de pago**:
- Cliente recibe confirmación automática
- Email con detalles del producto
- Link de descarga (si aplica)

**Suscripciones**:
- Confirmación de activación
- Recordatorios de expiración
- Notificaciones de renovación

---

## 🚀 DESPLEGAR A PRODUCCIÓN

### Variables de Entorno en Easypanel

Agregar en Easypanel:

```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=tu_email@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Verificar en Producción

1. Probar recuperación de contraseña
2. Realizar compra de prueba
3. Verificar emails llegando
4. Verificar links funcionando

---

## 📞 SOPORTE

Si tienes problemas:

1. **Ver logs**: `npm run dev` y buscar errores
2. **Verificar configuración**: Ejecutar `npx tsx scripts/test-sistema-completo-final.ts`
3. **Revisar documentación**: Este archivo

---

**Estado**: ⚠️ PENDIENTE CONFIGURACIÓN DE EMAIL  
**Tiempo**: 5 minutos  
**Prioridad**: ALTA (necesario para producción)
