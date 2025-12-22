# 🔍 DIAGNÓSTICO: EMAIL NO LLEGA EN PRODUCCIÓN

## ❌ PROBLEMA

Configuraste todo en Easypanel pero el email de recuperación no llega a **daveymena16@gmail.com**

---

## 🔍 PASO 1: VERIFICAR LOGS EN EASYPANEL (2 MIN)

### 1.1 Ver Logs en Tiempo Real

1. Ir a Easypanel
2. Seleccionar proyecto: **bot-whatsapp**
3. Click en **Logs**
4. Buscar mensajes relacionados con email

### 1.2 Buscar Estos Mensajes

**✅ Si funciona, verás**:
```
📧 Enviando email a daveymena16@gmail.com...
✅ Email enviado exitosamente: <message-id>
```

**❌ Si hay error, verás**:
```
❌ Error en sendEmail: Invalid login
❌ Error en sendEmail: Connection timeout
⚠️  EMAIL no configurado - Email simulado
```

---

## 🔧 PASO 2: VERIFICAR VARIABLES EN EASYPANEL

### 2.1 Variables Críticas

Ir a: Easypanel → bot-whatsapp → Environment Variables

**Verificar que TODAS estas variables estén configuradas**:

```env
EMAIL_USER=deinermena25@gmail.com
EMAIL_PASS=uccj yqpq vqlt vcie
EMAIL_FROM=deinermena25@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### 2.2 Errores Comunes

❌ **Error 1**: Variable `EMAIL_PASS` tiene espacios extra
- ✅ Correcto: `uccj yqpq vqlt vcie`
- ❌ Incorrecto: ` uccj yqpq vqlt vcie ` (espacios al inicio/fin)

❌ **Error 2**: Variable `EMAIL_USER` es diferente al remitente
- ✅ Debe ser: `deinermena25@gmail.com` (el que envía)
- ❌ NO debe ser: `daveymena16@gmail.com` (el que recibe)

❌ **Error 3**: App Password incorrecto
- Verificar que sea exactamente: `uccj yqpq vqlt vcie`

---

## 🔧 PASO 3: VERIFICAR QUE LA APP SE REINICIÓ

Después de agregar variables, DEBES reiniciar:

1. En Easypanel, click en **Restart**
2. Esperar 2-3 minutos
3. Verificar que el estado sea: **Running** ✅

---

## 🧪 PASO 4: PROBAR DE NUEVO

1. Ir a: https://whatsapp.sqaoeo.easypanel.host/forgot-password
2. Ingresar: **daveymena16@gmail.com**
3. Click en **Enviar**
4. Esperar 1-2 minutos
5. Verificar:
   - ✅ Bandeja de entrada
   - ✅ Carpeta de spam
   - ✅ Carpeta de promociones

---

## 🔍 PASO 5: VERIFICAR EN GMAIL

### 5.1 Revisar Configuración de Gmail

1. Ir a: https://myaccount.google.com/apppasswords
2. Verificar que el App Password **Smart Sales Bot** esté activo
3. Si no está, crear uno nuevo

### 5.2 Verificar Seguridad de Gmail

1. Ir a: https://myaccount.google.com/security
2. Verificar que "Verificación en 2 pasos" esté **ACTIVADA**
3. Verificar que no haya alertas de seguridad

---

## 🚨 SOLUCIONES SEGÚN EL ERROR

### Error 1: "Invalid login" en logs

**Causa**: App Password incorrecto

**Solución**:
1. Generar nuevo App Password en Gmail
2. Actualizar `EMAIL_PASS` en Easypanel
3. Reiniciar aplicación

### Error 2: "Connection timeout" en logs

**Causa**: Puerto o host incorrecto

**Solución**:
Verificar en Easypanel:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Error 3: "EMAIL no configurado" en logs

**Causa**: Variables no están en Easypanel

**Solución**:
1. Agregar TODAS las variables de email
2. Reiniciar aplicación
3. Probar de nuevo

### Error 4: No hay logs de email

**Causa**: La aplicación no está intentando enviar

**Solución**:
1. Verificar que la URL sea correcta
2. Verificar que el formulario funcione
3. Ver logs completos en Easypanel

---

## 🔧 PASO 6: TEST MANUAL DESDE SERVIDOR

Si nada funciona, podemos probar directamente desde el servidor:

### 6.1 Conectar por SSH a Easypanel (si es posible)

```bash
# Probar conexión SMTP
curl -v smtp://smtp.gmail.com:587
```

### 6.2 Verificar Variables de Entorno

```bash
# Ver variables configuradas
echo $EMAIL_USER
echo $EMAIL_PASS
```

---

## 📊 CHECKLIST DE DIAGNÓSTICO

Marca lo que ya verificaste:

- [ ] Variables agregadas en Easypanel
- [ ] `EMAIL_USER` = deinermena25@gmail.com
- [ ] `EMAIL_PASS` = uccj yqpq vqlt vcie (sin espacios extra)
- [ ] `EMAIL_FROM` = deinermena25@gmail.com
- [ ] `EMAIL_HOST` = smtp.gmail.com
- [ ] `EMAIL_PORT` = 587
- [ ] Aplicación reiniciada después de agregar variables
- [ ] Estado de la app: Running
- [ ] Logs revisados en Easypanel
- [ ] Probado recuperación de contraseña
- [ ] Revisado bandeja de entrada
- [ ] Revisado carpeta de spam
- [ ] App Password activo en Gmail
- [ ] Verificación en 2 pasos activa

---

## 🎯 SOLUCIÓN RÁPIDA

Si después de todo esto no funciona:

### Opción 1: Usar Email de Prueba

Cambiar temporalmente a un email de prueba:

```env
EMAIL_USER=tu_otro_email@gmail.com
EMAIL_PASS=otro_app_password
```

### Opción 2: Verificar que el Código se Desplegó

1. Ver último commit en Easypanel
2. Debe ser: `ec4779a` - "Sistema 100% completo - Email funcionando"
3. Si no es ese, hacer redeploy manual

### Opción 3: Contactar Soporte de Easypanel

Si las variables están bien pero no funciona, puede ser un problema de Easypanel.

---

## 📞 COMANDOS ÚTILES

```bash
# Ver logs en tiempo real
# (En Easypanel, sección Logs)

# Buscar errores de email
# Filtrar por: "email" o "sendEmail" o "nodemailer"

# Verificar que la app esté corriendo
# Estado debe ser: Running
```

---

## 🎊 RESULTADO ESPERADO

Una vez solucionado:

```
Usuario: Ir a /forgot-password
Usuario: Ingresar daveymena16@gmail.com
Sistema: ✅ Email enviado
Logs: 📧 Enviando email a daveymena16@gmail.com...
Logs: ✅ Email enviado exitosamente
Gmail: 📬 Email recibido en bandeja de entrada
```

---

**Próximo paso**: Revisar logs en Easypanel y verificar variables
