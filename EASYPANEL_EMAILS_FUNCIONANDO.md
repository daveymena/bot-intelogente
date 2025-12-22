# ✅ Configurar Emails en Easypanel

## 🚀 Pasos Rápidos

### 1. Abre Easypanel
Ve a tu proyecto en Easypanel

### 2. Agrega Variables de Entorno

**Ubicación:** Tu Proyecto → **Environment** o **Environment Variables**

Agrega estas **3 variables**:

```
RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
RESEND_FROM_EMAIL=onboarding@resend.dev
EMAIL_FROM=Tecnovariedades D&S <onboarding@resend.dev>
```

### 3. Guarda y Redeploy

- Click en **Save** o **Update**
- Easypanel redesplegará automáticamente
- Espera 1-2 minutos

### 4. Prueba

Una vez redesplegado, ve a tu app en Easypanel y:

1. Ve a `/forgot-password`
2. Ingresa: `daveymena16@gmail.com`
3. Click "Enviar código por email"
4. ¡Revisa tu email!

## 📋 Cómo Agregar Variables en Easypanel

### Opción A: Interfaz Web (Recomendado)

1. **Abre Easypanel** → Tu proyecto
2. **Click en "Environment"** (en el menú lateral)
3. **Agrega cada variable:**
   - Click "+ Add Variable" o similar
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya`
   - Click "Add"
4. **Repite para las otras 2 variables**
5. **Click "Save"** o "Update"
6. **Espera el redeploy** automático

### Opción B: Archivo .env (Si Easypanel lo soporta)

Si tu Easypanel permite editar `.env`:

1. Ve a **Files** o **Editor**
2. Abre o crea `.env`
3. Agrega:
   ```env
   RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
   RESEND_FROM_EMAIL=onboarding@resend.dev
   EMAIL_FROM=Tecnovariedades D&S <onboarding@resend.dev>
   ```
4. Guarda
5. Redeploy

### Opción C: Terminal de Easypanel

Si tienes acceso a terminal:

```bash
# Editar .env
nano .env

# Agregar las 3 líneas
# Guardar: Ctrl+X, Y, Enter

# Reiniciar app
pm2 restart all
# o
npm run start
```

## ✅ Verificar que Funciona

### Desde Terminal de Easypanel:

```bash
# Verificar variables
echo $RESEND_API_KEY

# Probar envío
npx tsx scripts/test-codigo-recuperacion.ts
```

### Desde la App Web:

1. Ve a tu dominio de Easypanel
2. `/forgot-password`
3. Ingresa tu email
4. ¡Debería llegar el código!

## 🔍 Troubleshooting

### Si no funciona:

1. **Verifica que las variables estén guardadas:**
   - En Easypanel → Environment
   - Deben aparecer las 3 variables

2. **Verifica que redesplegó:**
   - Mira los logs de Easypanel
   - Debe decir "Deployment successful" o similar

3. **Verifica los logs de la app:**
   - En Easypanel → Logs
   - Busca mensajes como:
     ```
     ✅ Email enviado con Resend a daveymena16@gmail.com
     ```

4. **Si ves errores:**
   - `RESEND_API_KEY no configurada` → Falta agregar la variable
   - `Invalid API key` → La key está mal escrita
   - `Rate limit` → Esperaste muy poco entre envíos

## 📊 Estructura de Variables en Easypanel

Easypanel debería mostrar algo así:

```
┌─────────────────────┬──────────────────────────────────────┐
│ Name                │ Value                                │
├─────────────────────┼──────────────────────────────────────┤
│ RESEND_API_KEY      │ re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya │
│ RESEND_FROM_EMAIL   │ onboarding@resend.dev                │
│ EMAIL_FROM          │ Tecnovariedades D&S <onboarding@...> │
│ DATABASE_URL        │ postgresql://...                     │
│ GROQ_API_KEY        │ gsk_...                              │
│ ...                 │ ...                                  │
└─────────────────────┴──────────────────────────────────────┘
```

## ✅ Confirmación

Una vez configurado, el sistema enviará emails para:

1. **Registro** → Email de verificación con enlace
2. **Recuperación** → Código de 6 dígitos por email
3. **Bienvenida** → Email al verificar cuenta

## 🎯 Resumen

**3 variables + Redeploy = Emails funcionando**

```
RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
RESEND_FROM_EMAIL=onboarding@resend.dev
EMAIL_FROM=Tecnovariedades D&S <onboarding@resend.dev>
```

¡Listo para producción! 🚀
