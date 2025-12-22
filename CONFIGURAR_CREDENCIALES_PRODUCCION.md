# 🔐 Configurar Credenciales de Pago en Producción

## ⚠️ IMPORTANTE: Seguridad

Las credenciales de pago **NUNCA** deben estar en el código fuente de Git.
Deben configurarse como variables de entorno en el servidor de producción.

---

## 📋 Variables de Entorno Requeridas

### Mercado Pago (Colombia)
```bash
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=tu_public_key_aqui
```

### PayPal (Internacional)
```bash
PAYPAL_CLIENT_ID=tu_client_id_aqui
PAYPAL_CLIENT_SECRET=tu_client_secret_aqui
PAYPAL_MODE=sandbox  # o "live" para producción
```

### Otras Variables Importantes
```bash
# Base de datos
DATABASE_URL=tu_database_url

# JWT
JWT_SECRET=tu_jwt_secret_seguro

# Email (si usas)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password_de_aplicacion

# URLs
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 🚀 Configurar en Easypanel

### Paso 1: Acceder a tu Proyecto
1. Entra a Easypanel
2. Selecciona tu proyecto
3. Ve a la sección **"Environment Variables"** o **"Variables de Entorno"**

### Paso 2: Agregar Variables
Para cada variable, haz clic en **"Add Variable"** y agrega:

```
Nombre: MERCADOPAGO_ACCESS_TOKEN
Valor: [tu token de Mercado Pago]

Nombre: MERCADOPAGO_PUBLIC_KEY
Valor: [tu public key de Mercado Pago]

Nombre: PAYPAL_CLIENT_ID
Valor: [tu client ID de PayPal]

Nombre: PAYPAL_CLIENT_SECRET
Valor: [tu client secret de PayPal]

Nombre: PAYPAL_MODE
Valor: sandbox (o "live" cuando estés listo)
```

### Paso 3: Reiniciar la Aplicación
Después de agregar las variables:
1. Guarda los cambios
2. Reinicia el contenedor/aplicación
3. Las variables estarán disponibles

---

## 🧪 Verificar Configuración

### Opción 1: Desde el Dashboard
1. Inicia sesión en tu aplicación
2. Ve a `/membresias`
3. Intenta hacer un pago de prueba
4. Verifica que se redirija correctamente

### Opción 2: Logs del Servidor
Revisa los logs de Easypanel para ver si hay errores:
```
Error: MERCADOPAGO_ACCESS_TOKEN is not defined
```

Si ves este error, significa que falta configurar la variable.

---

## 📝 Obtener Credenciales

### Mercado Pago
1. Ve a https://www.mercadopago.com.co/developers
2. Inicia sesión
3. Ve a "Tus aplicaciones"
4. Crea una aplicación o selecciona una existente
5. Copia:
   - **Access Token** (Production o Test)
   - **Public Key** (Production o Test)

### PayPal
1. Ve a https://developer.paypal.com
2. Inicia sesión
3. Ve a "My Apps & Credentials"
4. Crea una app o selecciona una existente
5. Copia:
   - **Client ID**
   - **Secret**
6. Usa `sandbox` para pruebas, `live` para producción

---

## 🔄 Modo Sandbox vs Producción

### Sandbox (Pruebas)
```bash
PAYPAL_MODE=sandbox
# Usa credenciales de sandbox
# Los pagos son simulados
# No se cobra dinero real
```

### Producción (Real)
```bash
PAYPAL_MODE=live
# Usa credenciales de producción
# Los pagos son reales
# Se cobra dinero real
```

**Recomendación:** Empieza con sandbox para probar todo antes de usar credenciales reales.

---

## ✅ Checklist de Configuración

- [ ] Obtener credenciales de Mercado Pago
- [ ] Obtener credenciales de PayPal
- [ ] Agregar variables en Easypanel
- [ ] Reiniciar aplicación
- [ ] Probar pago de prueba
- [ ] Verificar que se registre en base de datos
- [ ] Verificar que se active la membresía
- [ ] Cambiar a modo producción cuando esté listo

---

## 🛡️ Seguridad

### ✅ Hacer
- Usar variables de entorno
- Mantener credenciales privadas
- Usar HTTPS en producción
- Rotar credenciales periódicamente
- Usar modo sandbox para pruebas

### ❌ NO Hacer
- Subir credenciales a Git
- Compartir credenciales públicamente
- Usar credenciales de producción en desarrollo
- Hardcodear credenciales en el código
- Dejar credenciales en archivos de log

---

## 🔍 Troubleshooting

### Error: "MERCADOPAGO_ACCESS_TOKEN is not defined"
**Solución:** Agrega la variable en Easypanel y reinicia

### Error: "Invalid credentials"
**Solución:** Verifica que las credenciales sean correctas y del ambiente correcto (sandbox/production)

### Error: "Payment failed"
**Solución:** 
1. Verifica que las credenciales estén activas
2. Revisa los logs del servidor
3. Verifica que la URL de callback sea correcta

### Los pagos no se registran
**Solución:**
1. Verifica que DATABASE_URL esté configurado
2. Revisa los logs de la API
3. Verifica que las rutas de callback funcionen

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Easypanel
2. Verifica que todas las variables estén configuradas
3. Prueba con credenciales de sandbox primero
4. Contacta soporte de Mercado Pago o PayPal si es necesario

---

## 🎯 Próximos Pasos

1. **Configurar variables en Easypanel**
2. **Probar con sandbox**
3. **Verificar que todo funcione**
4. **Cambiar a producción**
5. **¡Empezar a recibir pagos!**

---

**Recuerda:** Las credenciales son sensibles. Nunca las compartas ni las subas a Git.
