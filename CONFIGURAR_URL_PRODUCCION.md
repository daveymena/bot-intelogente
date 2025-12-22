# 🔧 CONFIGURAR URL DE PRODUCCIÓN

## 🔴 PROBLEMA ACTUAL

El link de recuperación de contraseña apunta a:
```
https://whatsapp.sqaoeo.easypanel.host/reset-password?token=XXX
```

Pero muestra **404 Not Found** porque las variables de entorno en Easypanel están mal configuradas.

---

## ✅ SOLUCIÓN (2 MINUTOS)

### Paso 1: Configurar Variables en Easypanel

1. Ir a Easypanel Dashboard
2. Seleccionar tu proyecto: **bot-whatsapp**
3. Ir a **Environment Variables**
4. Agregar/Actualizar estas variables:

```env
# URL de la aplicación
NEXT_PUBLIC_APP_URL=https://whatsapp.sqaoeo.easypanel.host
NEXTAUTH_URL=https://whatsapp.sqaoeo.easypanel.host

# Node environment
NODE_ENV=production
```

### Paso 2: Reiniciar la Aplicación

1. En Easypanel, click en **Restart**
2. Esperar 1-2 minutos
3. Verificar que esté corriendo

### Paso 3: Probar

1. Ir a: https://whatsapp.sqaoeo.easypanel.host/forgot-password
2. Ingresar tu email
3. Verificar que llegue el email
4. Click en el link
5. Debería abrir la página de reset (no 404)

---

## 📋 VARIABLES DE ENTORNO COMPLETAS PARA EASYPANEL

Copia y pega estas variables en Easypanel:

```env
# ===== URLs =====
NEXT_PUBLIC_APP_URL=https://whatsapp.sqaoeo.easypanel.host
NEXTAUTH_URL=https://whatsapp.sqaoeo.easypanel.host
NODE_ENV=production
PORT=4000

# ===== AUTENTICACIÓN =====
NEXTAUTH_SECRET=tu-secret-key-aqui-cambiar-en-produccion
JWT_SECRET=tu-jwt-secret-key-aqui

# ===== BASE DE DATOS =====
DATABASE_URL=postgresql://postgres:9feb7a0e7110d6a42e93@157.173.97.41:5432/botwhatsapp

# ===== GROQ =====
GROQ_API_KEY=tu_groq_api_key_aqui
GROQ_API_KEY_2=tu_groq_api_key_2_aqui
GROQ_API_KEY_6=tu_groq_api_key_6_aqui
GROQ_ENABLED=true
GROQ_MODEL=llama-3.1-8b-instant

# ===== OLLAMA =====
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=gemma:2b

# ===== MERCADOPAGO =====
MERCADO_PAGO_ACCESS_TOKEN=tu_mercadopago_access_token
MERCADO_PAGO_PUBLIC_KEY=tu_mercadopago_public_key
MERCADO_PAGO_CLIENT_ID=tu_mercadopago_client_id
MERCADOPAGO_ENABLED=true

# ===== PAYPAL =====
PAYPAL_EMAIL=daveymena16@gmail.com
COP_TO_USD_RATE=4000

# ===== NEQUI/DAVIPLATA =====
NEQUI_NUMBER=3136174267
DAVIPLATA_NUMBER=3136174267

# ===== EMAIL (NODEMAILER) =====
EMAIL_USER=deinermena25@gmail.com
EMAIL_PASS=TU_APP_PASSWORD_AQUI
EMAIL_FROM=deinermena25@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

---

## 🔍 VERIFICAR QUE FUNCIONE

### Test 1: Página de Reset

Ir a: https://whatsapp.sqaoeo.easypanel.host/reset-password?token=test

**Resultado esperado**: 
- ✅ Página carga (no 404)
- ⚠️ Muestra "Token inválido" (normal, es un token de prueba)

### Test 2: Recuperación Completa

1. Ir a: https://whatsapp.sqaoeo.easypanel.host/forgot-password
2. Ingresar email
3. Recibir email
4. Click en link
5. Cambiar contraseña
6. Login con nueva contraseña

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Problema: Sigue mostrando 404

**Causa**: Variables no actualizadas o app no reiniciada

**Solución**:
1. Verificar que las variables estén en Easypanel
2. Reiniciar la aplicación
3. Esperar 2 minutos
4. Limpiar caché del navegador (Ctrl+Shift+R)

### Problema: "Token inválido"

**Causa**: Token expirado (1 hora de validez)

**Solución**:
1. Solicitar nuevo link de recuperación
2. Usar el link inmediatamente

### Problema: Email no llega

**Causa**: App Password no configurado en Easypanel

**Solución**:
1. Agregar `EMAIL_PASS` en Easypanel
2. Reiniciar aplicación

---

## 📝 CHECKLIST

Antes de probar:

- [ ] Variables agregadas en Easypanel
- [ ] `NEXT_PUBLIC_APP_URL` = https://whatsapp.sqaoeo.easypanel.host
- [ ] `NEXTAUTH_URL` = https://whatsapp.sqaoeo.easypanel.host
- [ ] `NODE_ENV` = production
- [ ] `EMAIL_PASS` configurado
- [ ] Aplicación reiniciada
- [ ] Esperado 2 minutos

---

## 🎯 RESULTADO ESPERADO

### Antes (404)
```
https://whatsapp.sqaoeo.easypanel.host/reset-password?token=XXX
→ 404 Not Found ❌
```

### Después (Funciona)
```
https://whatsapp.sqaoeo.easypanel.host/reset-password?token=XXX
→ Página de reset de contraseña ✅
→ Formulario para nueva contraseña ✅
→ Cambio exitoso ✅
```

---

**Tiempo**: 2 minutos  
**Prioridad**: ALTA  
**Siguiente paso**: Configurar variables en Easypanel
