# 🚀 Guía de Deploy en Easypanel

## Requisitos Previos

1. Cuenta en Easypanel (https://easypanel.io)
2. Servidor con al menos 2GB RAM
3. PostgreSQL configurado

## Paso 1: Crear App en Easypanel

1. Ir a Easypanel → Create App
2. Seleccionar "GitHub" como fuente
3. Conectar repositorio: `https://github.com/TU_USUARIO/smart-sales-bot-pro`
4. Branch: `main`

## Paso 2: Configurar Variables de Entorno

En Easypanel → App → Environment, agregar:

```env
# Base de Datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@postgres:5432/whatsappdb?sslmode=disable

# URL de la App (cambiar por tu dominio)
NEXT_PUBLIC_APP_URL=https://tu-app.easypanel.host
NEXTAUTH_URL=https://tu-app.easypanel.host

# IA - Groq (GRATIS - obtener en https://console.groq.com)
GROQ_API_KEY=gsk_tu_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant

# Sistema Híbrido
AI_PROVIDER=hybrid
HYBRID_SYSTEM_ENABLED=true
AI_FALLBACK_ENABLED=true

# MercadoPago (opcional)
MERCADOPAGO_ACCESS_TOKEN=tu_token_aqui

# PayPal (opcional)
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_secret
PAYPAL_MODE=sandbox

# Producción
NODE_ENV=production
```

## Paso 3: Configurar Build

En Easypanel → App → Build:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: `3000`

## Paso 4: Configurar PostgreSQL

1. En Easypanel, crear servicio PostgreSQL
2. Copiar la URL de conexión
3. Actualizar `DATABASE_URL` en variables de entorno

## Paso 5: Ejecutar Migraciones

Después del primer deploy, ejecutar en la consola de Easypanel:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Paso 6: Crear Usuario Admin

```bash
npx tsx scripts/create-admin.ts
```

## Verificación

1. Acceder a `https://tu-app.easypanel.host`
2. Login con credenciales admin
3. Ir a Dashboard → WhatsApp → Escanear QR
4. ¡Listo! El bot está funcionando

## Solución de Problemas

### Error de Base de Datos
```bash
npx prisma db push --force-reset
```

### Error de Build
Verificar que todas las variables de entorno estén configuradas.

### WhatsApp no conecta
1. Eliminar carpeta `auth_sessions` si existe
2. Reiniciar la app
3. Escanear QR nuevamente

## Soporte

- Documentación: Ver archivos `GUIA_*.md` en el repositorio
- Issues: Crear issue en GitHub
