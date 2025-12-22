# 🔧 Solucionar Error de MercadoPago

## 🔍 Diagnóstico

Ejecuta este comando para verificar la configuración:

```bash
npm run payment:verify
```

Este comando te mostrará:
- ✅ Si MercadoPago está configurado
- ✅ Si el token es válido
- ✅ Si la conexión funciona
- ❌ Qué está fallando

## 🛠️ Soluciones Comunes

### 1️⃣ Token No Configurado

**Síntoma:** Error "MercadoPago no configurado"

**Solución:**

1. Ve a https://www.mercadopago.com.co/developers
2. Inicia sesión con tu cuenta
3. Ve a "Tus integraciones" > "Credenciales"
4. Copia tu **Access Token de Producción**
5. Agrégalo en tu archivo `.env`:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-token-aqui
```

6. Reinicia el servidor:
```bash
npm run dev
```

### 2️⃣ Token Inválido

**Síntoma:** Error 401 o "Token inválido"

**Causas:**
- Estás usando el token de prueba en lugar del de producción
- El token expiró
- El token no tiene los permisos correctos

**Solución:**
1. Verifica que sea el token de **PRODUCCIÓN** (no el de prueba)
2. El token debe empezar con `APP_USR-`
3. Genera un nuevo token si es necesario

### 3️⃣ Producto Sin userId

**Síntoma:** Error "userId requerido"

**Solución:**
Ya está corregido en el código. El sistema ahora usa 'default' si no hay userId.

### 4️⃣ URL de Callback Incorrecta

**Síntoma:** El pago se procesa pero no redirige correctamente

**Solución:**
Verifica que en tu `.env` tengas:

```env
NEXTAUTH_URL=http://localhost:4000
# O en producción:
NEXTAUTH_URL=https://tu-dominio.com
```

## 🧪 Probar el Sistema

### Paso 1: Verificar Configuración
```bash
npm run payment:verify
```

### Paso 2: Ver Logs en Consola
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Intenta generar un link de pago
4. Verás logs detallados como:
   - 🔄 Generando link de pago
   - 📦 Respuesta del servidor
   - ✅ Link generado o ❌ Error

### Paso 3: Ver Logs del Servidor
En la terminal donde corre `npm run dev` verás:
- `[Payment API] Generando link de pago`
- `[MercadoPago] Iniciando generación`
- `[MercadoPago] Token encontrado`
- `[MercadoPago] Respuesta de API`

## 📋 Checklist de Verificación

- [ ] Token de MercadoPago configurado en `.env`
- [ ] Token es de PRODUCCIÓN (no prueba)
- [ ] Token empieza con `APP_USR-`
- [ ] Servidor reiniciado después de agregar token
- [ ] URL de la app configurada correctamente
- [ ] Logs no muestran errores 401 o 403

## 🎯 Configuración Alternativa (Dashboard)

Si no quieres usar `.env`, puedes configurar en el dashboard:

1. Ve a **Configuración** > **Integraciones**
2. Sección **MercadoPago**
3. Pega tu Access Token
4. Guarda cambios

## 🔐 Obtener Token de MercadoPago

### Paso a Paso:

1. **Ir a MercadoPago Developers**
   - https://www.mercadopago.com.co/developers

2. **Iniciar Sesión**
   - Usa tu cuenta de MercadoPago

3. **Ir a Credenciales**
   - Menú: "Tus integraciones" > "Credenciales"

4. **Copiar Access Token de Producción**
   - NO uses el de prueba
   - Debe decir "Producción"
   - Empieza con `APP_USR-`

5. **Agregar a .env**
   ```env
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-1234567890-abcdef-ghijklmnop
   ```

6. **Reiniciar Servidor**
   ```bash
   npm run dev
   ```

## ✅ Verificar que Funciona

1. Ve a la tienda: http://localhost:4000/tienda
2. Selecciona un producto
3. Click en "Pagar con MercadoPago"
4. Deberías ver:
   - ✅ Se abre una nueva pestaña
   - ✅ Página de pago de MercadoPago
   - ✅ Producto y precio correctos

## 🆘 Si Sigue Sin Funcionar

1. **Ejecuta el diagnóstico:**
   ```bash
   npm run payment:verify
   ```

2. **Revisa los logs completos:**
   - Consola del navegador (F12)
   - Terminal del servidor

3. **Verifica el token:**
   - Debe ser de producción
   - Debe estar activo
   - Debe tener permisos de pagos

4. **Prueba con un token nuevo:**
   - Genera un nuevo token en MercadoPago
   - Reemplázalo en `.env`
   - Reinicia el servidor

## 📞 Soporte MercadoPago

Si el problema persiste:
- Soporte: https://www.mercadopago.com.co/ayuda
- Documentación: https://www.mercadopago.com.co/developers/es/docs

## 🎉 Una Vez Funcionando

Cuando todo funcione:
1. Los clientes podrán pagar con tarjeta
2. Los pagos se procesarán automáticamente
3. Recibirás notificaciones de pagos
4. Los clientes recibirán confirmación

## 💡 Consejos

- Usa el token de producción solo en producción
- Guarda el token de forma segura
- No compartas el token públicamente
- Renueva el token periódicamente por seguridad
