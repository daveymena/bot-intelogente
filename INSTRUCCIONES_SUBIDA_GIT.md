# 📚 Instrucciones para Subir Cambios a Git de Forma Segura

## 🎯 Objetivo

Subir todos los cambios recientes a GitHub sin exponer API keys, credenciales o información sensible.

## 🚀 Método Rápido (Recomendado)

### Opción 1: Script Automático Completo

```bash
SUBIR_CAMBIOS_SEGURO.bat
```

Este script hace TODO automáticamente:
- ✅ Verifica archivos sensibles
- ✅ Limpia temporales
- ✅ Crea commit descriptivo
- ✅ Pregunta antes de push
- ✅ Muestra resumen

### Opción 2: Verificación + Subida Manual

```bash
# 1. Verificar seguridad
PRE_COMMIT_CHECK.bat

# 2. Si todo está OK, subir
SUBIR_CAMBIOS_SEGURO.bat
```

## 📋 Método Manual (Paso a Paso)

Si prefieres hacerlo manualmente:

### 1. Verificar Estado

```bash
git status
```

### 2. Verificar Archivos Protegidos

```bash
# Verificar que .env esté en .gitignore
findstr ".env" .gitignore

# Verificar que auth_sessions esté en .gitignore
findstr "auth_sessions" .gitignore
```

### 3. Limpiar Temporales

```bash
rmdir /s /q temp
rmdir /s /q temp-audio
```

### 4. Agregar Cambios

```bash
git add .
```

### 5. Verificar Qué Se Va a Subir

```bash
# Ver archivos que se van a commitear
git diff --cached --name-only

# Verificar que NO aparezcan:
# - .env
# - auth_sessions/
# - *.db
# - CREDENCIALES_*.txt
# - VARIABLES_EASYPANEL*.txt
```

### 6. Crear Commit

```bash
git commit -m "feat: Sistema completo de respuestas inteligentes

- Sistema de respuestas progresivas implementado
- Fallback local mejorado con AIDA
- Búsqueda inteligente por tags (diseño, reparación, piano)
- Razonamiento profundo activado
- Mejoras en consistencia de productos
- Flujos específicos por tipo de producto
- Sistema de puntos mejorado para scoring
- Verificación de acceso a productos
- Correcciones en envío de fotos
- Limpieza y optimización de código"
```

### 7. Hacer Push

```bash
# Intentar con main
git push origin main

# Si falla, intentar con master
git push origin master
```

## ⚠️ Verificaciones de Seguridad

### Antes de Hacer Commit

✅ **VERIFICAR** que estos archivos NO estén en staging:
- `.env`
- `.env.backup`
- `.env.easypanel*`
- `.env.postgres*`
- `.env.production`
- `auth_sessions/`
- `.wwebjs_cache/`
- `*.db`
- `llm-config.json` (si contiene keys)
- `CREDENCIALES_*.txt`
- `TUS_CREDENCIALES.txt`
- `VARIABLES_EASYPANEL*.txt`

### Comando de Verificación Rápida

```bash
# Ver qué archivos están en staging
git diff --cached --name-only | findstr /I ".env auth_sessions .db CREDENCIALES VARIABLES_EASYPANEL"
```

Si este comando devuelve algo, **NO HAGAS COMMIT**.

## 🔧 Solución de Problemas

### Problema: "Archivo .env está en staging"

```bash
# Remover del staging
git reset HEAD .env

# Asegurarse que esté en .gitignore
echo .env >> .gitignore
```

### Problema: "auth_sessions está en staging"

```bash
# Remover del staging
git reset HEAD auth_sessions/

# Asegurarse que esté en .gitignore
echo auth_sessions/ >> .gitignore
```

### Problema: "Error al hacer push"

```bash
# Opción 1: Pull primero
git pull origin main --rebase
git push origin main

# Opción 2: Forzar push (CUIDADO)
git push origin main --force
```

### Problema: "Ya subí un archivo sensible por error"

```bash
# Remover del historial (PELIGROSO - hacer backup primero)
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all

# Forzar push
git push origin --force --all
```

## 📊 Archivos que SÍ se Deben Subir

✅ Código fuente (`src/`)
✅ Scripts de utilidad (`scripts/`)
✅ Documentación (`.md`)
✅ Configuración de proyecto (`package.json`, `tsconfig.json`)
✅ Archivos de ejemplo (`.example`)
✅ Tests (`test-*.js`)
✅ Schemas de base de datos (`prisma/schema.prisma`)

## 🚫 Archivos que NO se Deben Subir

❌ Variables de entorno (`.env*`)
❌ Sesiones de WhatsApp (`auth_sessions/`)
❌ Bases de datos (`*.db`)
❌ Credenciales (`CREDENCIALES_*.txt`)
❌ API Keys (`*_API_KEY.txt`)
❌ Tokens (`*_TOKEN.txt`)
❌ Archivos temporales (`temp/`)
❌ Node modules (`node_modules/`)
❌ Build artifacts (`.next/`, `build/`)

## 🎓 Mejores Prácticas

1. **SIEMPRE** usa el script `SUBIR_CAMBIOS_SEGURO.bat`
2. **NUNCA** hagas `git add .` sin verificar primero
3. **REVISA** el output de `git status` antes de commit
4. **VERIFICA** que `.gitignore` esté actualizado
5. **USA** commits descriptivos con mensajes claros
6. **PRUEBA** localmente antes de hacer push
7. **MANTÉN** un backup de archivos sensibles fuera del repo

## 📞 Comandos de Emergencia

### Deshacer el Último Commit (sin perder cambios)

```bash
git reset --soft HEAD~1
```

### Deshacer el Último Commit (perdiendo cambios)

```bash
git reset --hard HEAD~1
```

### Ver Qué Se Subió en el Último Commit

```bash
git show --name-only
```

### Remover Archivo del Staging

```bash
git reset HEAD <archivo>
```

## ✅ Checklist Final

Antes de hacer push, verifica:

- [ ] `.env` está en `.gitignore`
- [ ] `auth_sessions/` está en `.gitignore`
- [ ] No hay API keys en el código
- [ ] No hay credenciales hardcodeadas
- [ ] Los tests pasan localmente
- [ ] El commit tiene un mensaje descriptivo
- [ ] Has revisado los archivos que se van a subir

## 🎉 Después de Subir

1. Verifica en GitHub que los archivos se subieron correctamente
2. Revisa que NO aparezcan archivos sensibles
3. Verifica que el README esté actualizado
4. Comparte el link del repo si es necesario

---

**Última actualización**: 13 de Noviembre de 2025
**Versión**: 1.0
**Autor**: Smart Sales Bot Pro Team
