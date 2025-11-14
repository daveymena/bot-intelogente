# ⚡ CONFIGURAR RESEND EN 5 MINUTOS

Resend es **mucho más simple** que Gmail. No necesita OAuth ni configuración compleja.

## 🎯 Por Qué Resend en Lugar de Gmail

| Característica | Gmail | Resend |
|---|---|---|
| Configuración | Compleja (OAuth2) | Simple (API Key) |
| Tiempo setup | 30+ minutos | 5 minutos |
| Límite gratis | 100/día | 3,000/mes |
| Dominio propio | No | Sí |
| Para producción | No recomendado | Sí ✅ |

## 🚀 Pasos Rápidos

### 1. Crear Cuenta (2 minutos)

```
https://resend.com/signup
```

- Usa tu email
- Verifica tu cuenta
- ¡Listo!

### 2. Obtener API Key (1 minuto)

1. Ve a **"API Keys"** en el menú
2. Haz clic en **"Create API Key"**
3. Dale un nombre: "Bot WhatsApp"
4. Copia la API Key (empieza con `re_`)

### 3. Configurar en .env (1 minuto)

Abre tu archivo `.env` y agrega:

```env
# Email con Resend
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
EMAIL_FROM=Tecnovariedades D&S <onboarding@resend.dev>
```

**Nota**: `onboarding@resend.dev` es un dominio de prueba que Resend te da gratis.

### 4. Probar (1 minuto)

```bash
# Reinicia el servidor
npm run dev

# En otra terminal, prueba el email
npx tsx scripts/test-email.ts
```

Si ves "✅ Email enviado", ¡funciona!

## 📧 Usar Tu Propio Dominio (Opcional)

Si quieres enviar desde `noreply@tudominio.com`:

### 1. Agregar Dominio en Resend

1. Ve a **"Domains"**
2. Haz clic en **"Add Domain"**
3. Ingresa tu dominio: `tudominio.com`

### 2. Configurar DNS

Resend te dará 3 registros DNS para agregar:

```
Tipo: TXT
Nombre: _resend
Valor: [valor que te da Resend]

Tipo: MX
Nombre: @
Valor: feedback-smtp.resend.com
Prioridad: 10

Tipo: TXT
Nombre: @
Valor: v=spf1 include:_spf.resend.com ~all
```

### 3. Esperar Verificación

- Tarda 5-30 minutos
- Resend verificará automáticamente
- Te llegará un email cuando esté listo

### 4. Actualizar .env

```env
RESEND_FROM_EMAIL=noreply@tudominio.com
EMAIL_FROM=Tecnovariedades D&S <noreply@tudominio.com>
```

## 🧪 Probar Recuperación de Contraseña

Con Resend configurado:

```bash
# 1. Inicia el servidor
npm run dev

# 2. Ve a forgot-password
http://localhost:3000/forgot-password

# 3. Ingresa tu email
# 4. Revisa tu bandeja de entrada
# 5. Haz clic en el enlace
# 6. Resetea tu contraseña
```

## 💰 Límites y Precios

### Plan Gratuito
- ✅ 3,000 emails/mes
- ✅ 100 emails/día
- ✅ 1 dominio verificado
- ✅ Perfecto para desarrollo y pequeños proyectos

### Plan Pro ($20/mes)
- ✅ 50,000 emails/mes
- ✅ Sin límite diario
- ✅ Dominios ilimitados
- ✅ Soporte prioritario

## 🔧 Troubleshooting

### "API Key inválido"

**Solución**:
- Verifica que copiaste la API Key completa
- Debe empezar con `re_`
- No debe tener espacios

### "Domain not verified"

**Solución**:
- Usa `onboarding@resend.dev` mientras verificas tu dominio
- Verifica que agregaste los registros DNS correctamente
- Espera 30 minutos

### "Rate limit exceeded"

**Solución**:
- Estás enviando más de 100 emails/día
- Espera 24 horas o upgrade a Pro

## ✅ Ventajas de Resend

1. **Simple**: Solo necesitas una API Key
2. **Rápido**: Setup en 5 minutos
3. **Confiable**: 99.9% uptime
4. **Moderno**: API REST simple
5. **Gratis**: 3,000 emails/mes
6. **Profesional**: Perfecto para producción

## 📝 Resumen

```bash
# 1. Crear cuenta en Resend
https://resend.com/signup

# 2. Obtener API Key
Dashboard → API Keys → Create

# 3. Configurar .env
RESEND_API_KEY=re_tu_key
RESEND_FROM_EMAIL=onboarding@resend.dev

# 4. Reiniciar servidor
npm run dev

# 5. Probar
npx tsx scripts/test-email.ts
```

**¡Listo en 5 minutos!** 🎉

## 🆚 Gmail vs Resend

**No uses Gmail para producción**:
- ❌ Configuración compleja
- ❌ OAuth2 tokens expiran
- ❌ Límites muy bajos
- ❌ No profesional

**Usa Resend**:
- ✅ Simple y rápido
- ✅ API Key permanente
- ✅ Límites generosos
- ✅ Profesional y confiable

---

**Siguiente paso**: Abre `PROBAR_RECUPERACION_CONTRASENA.md` para probar el sistema completo.
