# 🚀 Subir a GitHub (Repositorio Público)

## Paso 1: Crear Repositorio en GitHub

1. Ir a: https://github.com/new
2. Nombre: `smart-sales-bot-pro`
3. Descripción: `Bot de ventas WhatsApp con IA - Sistema completo para automatización de ventas`
4. **Seleccionar: PUBLIC** ✅
5. NO marcar "Add README" (ya tenemos uno)
6. Click en "Create repository"

## Paso 2: Subir el Código

Después de crear el repo, ejecutar en terminal:

```bash
git push -u origin main
```

Si pide credenciales, usar tu token de GitHub.

## Paso 3: Verificar

1. Ir a: https://github.com/daveymena/smart-sales-bot-pro
2. Verificar que todos los archivos estén subidos
3. Verificar que NO haya archivos `.env` (solo `.env.example`)

## ⚠️ Archivos Sensibles (NO se suben)

El `.gitignore` ya excluye:
- `.env` y variantes
- `auth_sessions/` (sesiones WhatsApp)
- `*.db` (bases de datos locales)
- `node_modules/`
- Credenciales y tokens

## 📋 Para Easypanel

Una vez subido, en Easypanel:
1. Conectar repositorio: `https://github.com/daveymena/smart-sales-bot-pro`
2. Branch: `main`
3. Configurar variables de entorno (ver `DEPLOY_EASYPANEL_GUIA.md`)

## Comando Rápido

```bash
git push -u origin main
```

¡Listo! 🎉
