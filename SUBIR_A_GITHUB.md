# 📤 Guía: Subir a GitHub

## ✅ Verificación Pre-Subida

Ejecuta esto primero:
```bash
npx tsx scripts/test-production-ready.ts
```

Deberías ver: `🎉 ¡TODO PERFECTO!`

## 🚀 Pasos para Subir

### 1. Inicializar Git (si no lo has hecho)

```bash
git init
```

### 2. Verificar que .env NO se subirá

```bash
git status
```

**IMPORTANTE:** NO debes ver `.env` en la lista. Si lo ves, detente y avísame.

### 3. Agregar archivos

```bash
git add .
```

### 4. Hacer commit

```bash
git commit -m "Bot de WhatsApp listo para producción"
```

### 5. Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Configura:
   - **Nombre:** `whatsapp-bot` (o el que prefieras)
   - **Descripción:** "Bot de WhatsApp con IA para ventas automáticas"
   - **Visibilidad:** 
     - ✅ **Privado** (recomendado - tus claves están seguras)
     - ⚠️ Público (solo si quieres compartir el código)
   - **NO** inicialices con README, .gitignore o licencia
3. Click "Create repository"

### 6. Conectar y subir

GitHub te mostrará comandos. Usa estos:

```bash
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

**Reemplaza:**
- `TU-USUARIO` con tu usuario de GitHub
- `TU-REPO` con el nombre que elegiste

### 7. Verificar

1. Refresca la página de GitHub
2. Deberías ver todos tus archivos
3. Verifica que `.env` NO esté ahí (debe estar oculto)

## ✅ Listo para Deploy

Ahora puedes:
- **Railway:** Conectar desde https://railway.app
- **Render:** Conectar desde https://render.com

## 🔒 Seguridad

### ✅ Archivos que SÍ se suben:
- Todo el código fuente
- `package.json`
- `prisma/schema.prisma`
- Guías y documentación
- `.env.production.example` (template sin claves)

### ❌ Archivos que NO se suben:
- `.env` (tus claves secretas)
- `node_modules/`
- `.next/`
- `dev.db` (base de datos local)
- `whatsapp-sessions/` (sesiones locales)

## 🐛 Problemas Comunes

### "fatal: not a git repository"
```bash
git init
```

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
```

### "Permission denied"
- Verifica que estés logueado en GitHub
- Usa HTTPS en lugar de SSH
- O configura SSH keys

### "Updates were rejected"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## 📊 Después de Subir

Tu repositorio debe verse así:

```
whatsapp-bot/
├── src/
├── prisma/
├── scripts/
├── public/
├── package.json
├── Dockerfile
├── render.yaml
├── DEPLOY_RAILWAY.md
├── DEPLOY_RENDER.md
└── ... (otros archivos)
```

**NO debe tener:**
- ❌ `.env`
- ❌ `node_modules/`
- ❌ `dev.db`

## 🎯 Próximo Paso

Una vez subido a GitHub:

1. **Railway:** Abre `DEPLOY_RAILWAY.md`
2. **Render:** Abre `DEPLOY_RENDER.md`

¡Tu bot estará en línea en 5-10 minutos! 🎉

---

## 💡 Tip: Actualizaciones Futuras

Cuando hagas cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Railway/Render detectarán el cambio y redesplegarán automáticamente.
