# 📧 CONFIGURAR SISTEMA DE EMAILS CON RESEND

## 🎯 Problema Resuelto

Los emails de verificación ahora se envían correctamente usando **Resend**, un servicio moderno y confiable de envío de emails.

## ✅ Sistema Implementado

### Emails que se envían:

1. **Email de Verificación** - Al registrarse
2. **Email de Bienvenida** - Al verificar cuenta
3. **Reset de Contraseña** - Al solicitar cambio
4. **Notificación de Login** - Al iniciar sesión

## 🚀 Configuración Rápida (5 minutos)

### Paso 1: Crear Cuenta en Resend

1. Ve a https://resend.com
2. Haz clic en "Sign Up" (Registrarse)
3. Usa tu email de Gmail
4. Verifica tu cuenta

### Paso 2: Obtener API Key

1. Una vez dentro, ve a "API Keys"
2. Haz clic en "Create API Key"
3. Dale un nombre: "Smart Sales Bot"
4. Selecciona permisos: "Sending access"
5. Haz clic en "Create"
6. **COPIA LA API KEY** (solo se muestra una vez)

### Paso 3: Configurar en tu Proyecto

Edita tu archivo `.env`:

```env
# Descomenta y pega tu API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Email remitente (usa el de prueba por ahora)
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Paso 4: Probar el Sistema

```bash
npx tsx scripts/test-email.ts
```

Esto enviará 3 emails de prueba y te mostrará si funcionó.

## 📝 Configuración Avanzada (Opcional)

### Usar tu Propio Dominio

Si quieres enviar emails desde tu dominio (ej: `noreply@tudominio.com`):

#### 1. Agregar Dominio en Resend

1. Ve a "Domains" en Resend
2. Haz clic en "Add Domain"
3. Ingresa tu dominio: `tudominio.com`
4. Haz clic en "Add"

#### 2. Configurar DNS

Resend te dará registros DNS para agregar:

**Registros SPF, DKIM y DMARC:**

```
Tipo: TXT
Nombre: @
Valor: v=spf1 include:resend.com ~all

Tipo: TXT
Nombre: resend._domainkey
Valor: [valor proporcionado por Resend]

Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none
```

#### 3. Verificar Dominio

1. Agrega los registros en tu proveedor de DNS
2. Espera 5-10 minutos
3. Haz clic en "Verify" en Resend
4. Una vez verificado, actualiza `.env`:

```env
RESEND_FROM_EMAIL=noreply@tudominio.com
```

## 🧪 Probar el Sistema

### Opción 1: Script de Prueba

```bash
npx tsx scripts/test-email.ts
```

**Qué hace:**
- Verifica configuración
- Envía 3 emails de prueba
- Muestra resultados

### Opción 2: Registro Real

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Ve a http://localhost:3000

3. Haz clic en "Registrarse"

4. Completa el formulario con tu email real

5. Revisa tu bandeja de entrada

## 📊 Límites de Resend

### Plan Gratuito

- ✅ 100 emails/día
- ✅ 3,000 emails/mes
- ✅ Dominio de prueba incluido
- ✅ API completa

### Plan Pro ($20/mes)

- ✅ 50,000 emails/mes
- ✅ Dominios personalizados ilimitados
- ✅ Soporte prioritario
- ✅ Analytics avanzados

## 🔧 Solución de Problemas

### Email no llega

**1. Verifica configuración:**
```bash
npx tsx scripts/test-email.ts
```

**2. Revisa spam/promociones:**
- Los emails pueden llegar a spam la primera vez
- Marca como "No es spam"

**3. Verifica API Key:**
- Debe empezar con `re_`
- No debe tener espacios
- Debe estar en `.env`

**4. Verifica dominio remitente:**
- Si usas dominio personalizado, debe estar verificado
- Si no, usa `onboarding@resend.dev`

### Error "API Key inválida"

```bash
# Verifica que la API Key esté correcta
echo $RESEND_API_KEY

# Debe mostrar: re_xxxxxxxxxx
```

Si no muestra nada:
1. Verifica que esté en `.env`
2. Reinicia el servidor
3. Verifica que no tenga espacios

### Error "Domain not verified"

Si usas dominio personalizado:
1. Ve a Resend > Domains
2. Verifica que esté en estado "Verified"
3. Si no, revisa los registros DNS
4. Espera 10-15 minutos y verifica de nuevo

### Emails van a spam

**Soluciones:**

1. **Configura SPF, DKIM, DMARC** (ver arriba)

2. **Calienta tu dominio:**
   - Envía pocos emails al inicio
   - Aumenta gradualmente
   - Evita enviar muchos de golpe

3. **Mejora contenido:**
   - Evita palabras spam ("gratis", "urgente", etc.)
   - Incluye texto plano además de HTML
   - Agrega link de "darse de baja"

4. **Usa dominio verificado:**
   - No uses `@gmail.com` como remitente
   - Usa tu dominio verificado

## 📧 Personalizar Emails

### Editar Plantillas

Los emails están en `src/lib/email-service.ts`:

```typescript
// Email de verificación
static async sendVerificationEmail(...)

// Email de bienvenida
static async sendWelcomeEmail(...)

// Reset de contraseña
static async sendPasswordResetEmail(...)
```

### Cambiar Diseño

Edita el HTML en cada función:

```typescript
const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        /* Tu CSS aquí */
      </style>
    </head>
    <body>
      <!-- Tu contenido aquí -->
    </body>
  </html>
`
```

### Agregar Logo

```html
<img src="https://tudominio.com/logo.png" alt="Logo" style="width: 150px;">
```

## 🔐 Seguridad

### Proteger API Key

✅ **Hacer:**
- Guardar en `.env`
- No subir a Git
- Usar variables de entorno en producción

❌ **No hacer:**
- Hardcodear en el código
- Compartir públicamente
- Subir a repositorios públicos

### Verificar `.gitignore`

Asegúrate que `.env` esté en `.gitignore`:

```
.env
.env.local
.env.production
```

## 📊 Monitoreo

### Ver Logs en Resend

1. Ve a https://resend.com/logs
2. Verás todos los emails enviados
3. Estado: Delivered, Bounced, Complained
4. Detalles de cada envío

### Ver Logs en tu App

Los logs aparecen en consola:

```
📧 Enviando email a usuario@example.com...
✅ Email enviado exitosamente: abc123
```

## 🚀 Producción

### Variables de Entorno

En tu servidor de producción, configura:

```env
RESEND_API_KEY=re_tu_api_key_de_produccion
RESEND_FROM_EMAIL=noreply@tudominio.com
NEXTAUTH_URL=https://tudominio.com
```

### Verificar Funcionamiento

```bash
# En producción
npx tsx scripts/test-email.ts
```

## 📚 Recursos

- **Documentación Resend:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **Ejemplos:** https://resend.com/docs/send-with-nodejs
- **Soporte:** https://resend.com/support

## ✅ Checklist

- [ ] Cuenta creada en Resend
- [ ] API Key obtenida
- [ ] API Key configurada en `.env`
- [ ] Script de prueba ejecutado
- [ ] Email de prueba recibido
- [ ] (Opcional) Dominio personalizado configurado
- [ ] (Opcional) DNS verificado
- [ ] Sistema funcionando en producción

## 🎉 Resultado Final

Con esta configuración:

✅ Los usuarios recibirán emails de verificación
✅ Los emails llegarán a la bandeja principal
✅ El sistema es confiable y escalable
✅ Puedes monitorear todos los envíos
✅ Gratis hasta 3,000 emails/mes

---

**Creado:** 31 de Octubre, 2025
**Versión:** 1.0.0
**Estado:** ✅ Listo para usar
