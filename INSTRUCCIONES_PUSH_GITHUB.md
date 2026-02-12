# 🔐 INSTRUCCIONES PARA PUSH A GITHUB

## ⚠️ PROBLEMA DETECTADO

GitHub está bloqueando el push porque detectó una API key de Groq en commits antiguos.

## ✅ SOLUCIÓN RECOMENDADA

### Opción 1: Permitir el Secreto (Más Rápido)

1. Ir al enlace que GitHub proporciona:
   ```
   https://github.com/daveymena/bot-intelogente/security/secret-scanning/unblock-secret/39ZPhLeIrw3WBHPe8o002vq9kKE
   ```

2. Click en "Allow secret"

3. Volver a hacer push:
   ```bash
   git push origin main
   ```

### Opción 2: Limpiar Historial (Más Seguro)

Si prefieres eliminar completamente el secreto del historial:

```bash
# 1. Instalar BFG Repo-Cleaner
# Descargar de: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Crear archivo con el secreto a eliminar
echo "gsk_tu_api_key_aqui" > secrets.txt

# 3. Limpiar el repositorio
java -jar bfg.jar --replace-text secrets.txt

# 4. Limpiar referencias
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push
git push origin main --force
```

### Opción 3: Nuevo Branch Limpio (Alternativa)

```bash
# 1. Crear nuevo branch desde el commit limpio
git checkout -b main-clean

# 2. Cherry-pick solo los commits necesarios
git cherry-pick ab67390  # Sistema optimizado
git cherry-pick e7c4d94  # Eliminar archivos
git cherry-pick 363db21  # Remove file

# 3. Eliminar branch main antiguo
git branch -D main

# 4. Renombrar branch limpio
git branch -m main

# 5. Force push
git push origin main --force
```

## 📝 ESTADO ACTUAL

### Commits Listos para Push:

```
363db21 - chore: Remove file with exposed API key
e7c4d94 - chore: Eliminar archivos con API keys expuestas
ab67390 - feat: Sistema completo optimizado para Easypanel
```

### Archivos Problemáticos (Ya Eliminados):

- ❌ CONEXION_BD.md
- ❌ CONFIGURACION_EASYPANEL.md
- ❌ GUIA_PRUEBA_LOCAL.md
- ❌ RESUMEN_FINAL.md
- ❌ SISTEMA_MULTIAGENTE_INTEGRADO.md

### Archivos Nuevos Listos:

- ✅ DEPLOY_EASYPANEL.md
- ✅ DEPLOY_EASYPANEL_COMANDOS.md
- ✅ ARQUITECTURA_SAAS_MULTITENANT.md
- ✅ .env.easypanel.example
- ✅ Dockerfile (optimizado)
- ✅ scripts/docker-entrypoint.sh
- ✅ Y 30+ archivos más

## 🎯 RECOMENDACIÓN

**Usar Opción 1** (Permitir el secreto) porque:

1. Es más rápido (1 click)
2. El secreto ya está en commits antiguos públicos
3. Deberías rotar esa API key de todos modos
4. Los nuevos archivos no contienen secretos

## 🔄 DESPUÉS DEL PUSH

### 1. Rotar API Key de Groq

1. Ir a https://console.groq.com/keys
2. Eliminar la key expuesta
3. Crear nueva key
4. Actualizar en `.env`:
   ```env
   GROQ_API_KEY=nueva_key_aqui
   ```

### 2. Verificar Push Exitoso

```bash
git log origin/main --oneline -5
```

### 3. Continuar con Deploy

Seguir la guía en `DEPLOY_EASYPANEL.md`

## 📞 COMANDOS ÚTILES

```bash
# Ver commits pendientes
git log origin/main..main --oneline

# Ver archivos en el último commit
git show --name-only

# Ver diferencias con remoto
git diff origin/main

# Forzar push (solo si usas Opción 2 o 3)
git push origin main --force
```

## ⚠️ IMPORTANTE

- La API key detectada ya está expuesta en commits públicos
- Debes rotarla inmediatamente después del push
- Los nuevos archivos usan placeholders (gsk_..., APP_USR-...)
- El archivo `.env` está en `.gitignore` (no se sube)

---

**Estado:** ⏳ ESPERANDO PUSH  
**Acción requerida:** Permitir secreto en GitHub o limpiar historial  
**Próximo paso:** Deploy en Easypanel
