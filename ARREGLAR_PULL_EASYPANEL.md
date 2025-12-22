# 🔧 Arreglar Pull en Easypanel

## ❌ Error
```
Failed to pull changes
```

## 🔍 Causa
Easypanel no puede hacer pull porque hay cambios locales o conflictos.

---

## ✅ Solución 1: Forzar Pull (Recomendado)

### Opción A: Desde Easypanel UI
1. Ve a tu aplicación en Easypanel
2. Ve a la pestaña "Source"
3. Haz clic en "Force Pull" o "Reset & Pull"
4. Esto descartará cambios locales y traerá los últimos del repo

### Opción B: Desde Terminal SSH en Easypanel
```bash
# Conectarse al contenedor
cd /app

# Descartar cambios locales
git reset --hard HEAD

# Limpiar archivos no rastreados
git clean -fd

# Hacer pull
git pull origin main

# Reiniciar la aplicación
pm2 restart all
```

---

## ✅ Solución 2: Redeploy Completo

### Desde Easypanel UI:
1. Ve a tu aplicación
2. Haz clic en "Redeploy"
3. Esto reconstruirá todo desde cero

---

## ✅ Solución 3: Variables de Entorno

Si el problema es por archivos de variables:

### En Easypanel:
1. Ve a "Environment Variables"
2. Verifica que todas las variables estén configuradas:
   ```
   DATABASE_URL=postgresql://...
   GROQ_API_KEY=gsk_...
   NODE_ENV=production
   PORT=3000
   ```

---

## 🔍 Verificar Qué Archivos Causan Conflicto

### Desde Terminal SSH:
```bash
# Ver estado de git
git status

# Ver archivos modificados
git diff

# Ver archivos no rastreados
git ls-files --others --exclude-standard
```

### Archivos Comunes que Causan Problemas:
- `node_modules/` (debe estar en .gitignore)
- `.env` (debe estar en .gitignore)
- `auth_sessions/` (debe estar en .gitignore)
- `prisma/dev.db` (SQLite, debe estar en .gitignore)

---

## 📝 Comandos Paso a Paso

### 1. Conectar por SSH a Easypanel
```bash
# Easypanel te da acceso SSH al contenedor
# Busca el botón "Terminal" o "SSH" en la UI
```

### 2. Navegar al directorio de la app
```bash
cd /app
pwd  # Verificar que estás en /app
```

### 3. Ver el estado actual
```bash
git status
git log --oneline -5
```

### 4. Forzar reset y pull
```bash
# Guardar cambios locales (opcional)
git stash

# Descartar todos los cambios
git reset --hard origin/main

# Limpiar archivos no rastreados
git clean -fd

# Hacer pull
git pull origin main

# Verificar
git log --oneline -5
```

### 5. Reinstalar dependencias (si es necesario)
```bash
npm install
```

### 6. Regenerar Prisma Client
```bash
npx prisma generate
```

### 7. Reiniciar la aplicación
```bash
# Si usas PM2
pm2 restart all

# O reinicia desde Easypanel UI
```

---

## 🚨 Si Nada Funciona: Redeploy Completo

### Pasos:
1. **Backup de la Base de Datos** (importante!)
   ```bash
   # Exportar productos
   npx tsx scripts/exportar-productos-completo.ts
   
   # Descargar el JSON generado
   ```

2. **Eliminar y Recrear la App en Easypanel**
   - Elimina la aplicación actual
   - Crea una nueva desde el repo
   - Configura las variables de entorno
   - Conecta la base de datos

3. **Restaurar Datos**
   ```bash
   # Importar productos
   npx tsx scripts/importar-desde-json.ts
   ```

---

## ✅ Verificación Post-Pull

### 1. Verificar que el código se actualizó
```bash
git log --oneline -5
# Deberías ver: a297833 - chore: Agregar VARIABLES_EASYPANEL_*.txt al .gitignore
```

### 2. Verificar archivos nuevos
```bash
ls scripts/ | grep diagnosticar
# Deberías ver: diagnosticar-whatsapp-completo.ts
```

### 3. Verificar que la app funciona
```bash
# Ver logs
pm2 logs

# O desde Easypanel UI: Ver "Logs"
```

### 4. Probar endpoints
```bash
curl http://localhost:3000/api/health
```

---

## 📋 Checklist

Después de arreglar el pull:

- [ ] Git pull exitoso
- [ ] Código actualizado (verificar commit hash)
- [ ] Dependencias instaladas (`node_modules/`)
- [ ] Prisma client generado
- [ ] Variables de entorno configuradas
- [ ] Base de datos conectada
- [ ] Aplicación reiniciada
- [ ] Logs sin errores
- [ ] Dashboard accesible
- [ ] WhatsApp funcionando
- [ ] Productos visibles (68 productos)

---

## 🆘 Soporte Adicional

### Si el problema persiste:

1. **Revisar logs de Easypanel**
   - Ve a la pestaña "Logs"
   - Busca errores específicos

2. **Verificar permisos**
   ```bash
   ls -la /app
   # Verificar que el usuario tenga permisos
   ```

3. **Verificar espacio en disco**
   ```bash
   df -h
   ```

4. **Contactar soporte de Easypanel**
   - Puede ser un problema de la plataforma

---

## 💡 Prevención Futura

### Para evitar este problema:

1. **No editar archivos directamente en Easypanel**
   - Todos los cambios deben hacerse en local
   - Hacer commit y push
   - Dejar que Easypanel haga pull automático

2. **Usar .gitignore correctamente**
   - Archivos generados no deben estar en git
   - Variables de entorno en Easypanel UI, no en archivos

3. **Hacer backup regular**
   ```bash
   # Exportar productos semanalmente
   npx tsx scripts/exportar-productos-completo.ts
   ```

---

**Fecha**: 4 de noviembre de 2025  
**Problema**: Failed to pull changes  
**Solución**: Force pull o redeploy
