# 🚀 Desplegar Mejoras a Easypanel

## Mejoras Incluidas en Este Deploy

### 1. 🧠 Comprensión Mejorada de Megapacks
- ✅ Entiende "Pack Completo 40 Mega Packs"
- ✅ Tolera errores de escritura ("megapak", "paquete")
- ✅ Detecta sinónimos ("completo", "todos", "40")
- ✅ Búsqueda por número específico

### 2. 🔒 Persistencia de Sesión
- ✅ Sesión dura 30 días (antes 7 días)
- ✅ Renovación automática en cada navegación
- ✅ No se desloguea al actualizar o cambiar de pestaña
- ✅ Hook de verificación cada 5 minutos

### 3. 🧹 Limpieza Robusta de QR
- ✅ Limpieza en 3 niveles (memoria + archivos + DB)
- ✅ Botón de limpieza mejorado
- ✅ Logs detallados
- ✅ Manejo robusto de errores

---

## Pasos para Desplegar

### PASO 1: Verificar Cambios Locales

```bash
# Ver archivos modificados
git status

# Ver diferencias
git diff
```

### PASO 2: Agregar Archivos al Staging

```bash
# Agregar todos los archivos
git add .

# O agregar archivos específicos
git add src/
git add scripts/
```

### PASO 3: Hacer Commit

```bash
git commit -m "feat: Mejoras en comprensión, persistencia y limpieza

- Comprensión mejorada de megapacks con fuzzy matching
- Persistencia de sesión extendida a 30 días
- Sistema robusto de limpieza de QR WhatsApp
- Renovación automática de cookies
- Hook de verificación de sesión
- Logs detallados en limpieza"
```

### PASO 4: Push a GitHub

```bash
# Push a la rama principal
git push origin main

# O si usas master
git push origin master
```

### PASO 5: Verificar en Easypanel

1. Ve a **Easypanel Dashboard**
2. Selecciona tu aplicación
3. Ve a **Deployments**
4. Verifica que el nuevo deploy se está ejecutando
5. Espera 2-3 minutos

### PASO 6: Verificar que Funciona

1. Abre tu aplicación
2. Verifica que carga correctamente
3. Prueba las nuevas funciones:
   - Login (debe persistir)
   - Búsqueda de megapacks
   - Limpieza de QR

---

## Comandos Completos (Copiar y Pegar)

```bash
# 1. Ver estado
git status

# 2. Agregar todos los cambios
git add .

# 3. Commit con mensaje descriptivo
git commit -m "feat: Mejoras en comprensión, persistencia y limpieza

- Comprensión mejorada de megapacks con fuzzy matching
- Persistencia de sesión extendida a 30 días
- Sistema robusto de limpieza de QR WhatsApp
- Renovación automática de cookies
- Hook de verificación de sesión
- Logs detallados en limpieza"

# 4. Push a GitHub
git push origin main

# 5. Verificar
echo "✅ Cambios enviados a GitHub"
echo "🔄 Easypanel desplegará automáticamente"
echo "⏳ Espera 2-3 minutos"
```

---

## Si Hay Conflictos

### Conflicto: "Your branch is behind"

```bash
# Traer cambios remotos
git pull origin main

# Resolver conflictos si los hay
# Editar archivos en conflicto

# Agregar archivos resueltos
git add .

# Continuar con commit
git commit -m "feat: Mejoras en comprensión, persistencia y limpieza"

# Push
git push origin main
```

### Conflicto: "Failed to push"

```bash
# Forzar push (CUIDADO: solo si estás seguro)
git push origin main --force

# O mejor: crear nueva rama
git checkout -b mejoras-nov-04
git push origin mejoras-nov-04

# Luego hacer merge en GitHub
```

---

## Verificación Post-Deploy

### 1. Verificar que la App Está Corriendo

```bash
# En Easypanel → Logs
# Debe mostrar:
✓ Server listening on port 3000
✓ Database connected
```

### 2. Probar Persistencia de Sesión

1. Hacer login
2. Navegar a `/tienda`
3. Volver a `/dashboard`
4. Verificar que sigue logueado ✅

### 3. Probar Comprensión de Megapacks

1. Conectar WhatsApp
2. Enviar mensaje: "Pack Completo 40 Mega Packs"
3. El bot debe encontrar el producto ✅

### 4. Probar Limpieza de QR

1. Dashboard → WhatsApp
2. Clic en "Limpiar Sesión"
3. Debe limpiar y generar nuevo QR ✅

---

## Rollback (Si Algo Sale Mal)

### Opción 1: Revertir Último Commit

```bash
# Revertir localmente
git revert HEAD

# Push
git push origin main
```

### Opción 2: Volver a Commit Anterior

```bash
# Ver historial
git log --oneline

# Volver a commit específico
git reset --hard COMMIT_ID

# Force push
git push origin main --force
```

### Opción 3: Rebuild en Easypanel

1. Easypanel → Tu App
2. Deployments → Ver historial
3. Seleccionar deploy anterior
4. Clic en "Redeploy"

---

## Troubleshooting

### Problema: Build Falla en Easypanel

**Ver logs:**
```
Easypanel → Tu App → Logs
```

**Errores comunes:**

1. **"Cannot find module"**
   ```bash
   # Verificar package.json
   # Asegurar que todas las dependencias estén
   ```

2. **"TypeScript error"**
   ```bash
   # Verificar tipos
   npm run build
   ```

3. **"Out of memory"**
   ```
   Easypanel → Settings → Resources
   Aumentar memoria a 512MB o más
   ```

### Problema: App No Inicia

**Verificar:**
1. Variables de entorno configuradas
2. DATABASE_URL correcta
3. Puerto 3000 disponible

**Solución:**
```
Easypanel → Tu App → Restart
```

---

## Checklist Final

Antes de considerar el deploy exitoso:

- [ ] Git push exitoso
- [ ] Easypanel muestra nuevo deploy
- [ ] App está 🟢 Running
- [ ] Login funciona
- [ ] Sesión persiste al navegar
- [ ] Bot entiende "Pack Completo 40 Mega Packs"
- [ ] Limpieza de QR funciona
- [ ] No hay errores en logs

---

## Archivos Nuevos en Este Deploy

### Comprensión de Megapacks
- `src/lib/fuzzy-match-service.ts` (modificado)
- `src/lib/product-intelligence-service.ts` (modificado)
- `src/lib/text-normalizer.ts` (modificado)
- `scripts/test-megapack-search.ts` (nuevo)
- `MEJORAS_COMPRENSION_MEGAPACKS.md` (nuevo)
- `RESUMEN_MEJORAS_COMPRENSION.md` (nuevo)

### Persistencia de Sesión
- `src/lib/auth.ts` (modificado)
- `src/app/api/auth/login/route.ts` (modificado)
- `src/middleware.ts` (modificado)
- `src/hooks/useSessionPersistence.ts` (nuevo)
- `src/app/api/auth/session/route.ts` (nuevo)
- `src/app/api/auth/logout/route.ts` (nuevo)
- `src/components/dashboard/main-dashboard.tsx` (modificado)
- `PERSISTENCIA_SESION_MEJORADA.md` (nuevo)

### Limpieza Robusta de QR
- `src/app/api/whatsapp/cleanup/route.ts` (nuevo)
- `src/components/dashboard/WhatsAppConnection.tsx` (modificado)
- `scripts/limpiar-whatsapp-robusto.ts` (nuevo)
- `limpiar-whatsapp-robusto.bat` (nuevo)
- `LIMPIEZA_QR_ROBUSTA.md` (nuevo)

---

## Resumen

```bash
# Comando único para desplegar
git add . && \
git commit -m "feat: Mejoras en comprensión, persistencia y limpieza" && \
git push origin main && \
echo "✅ Desplegado a Easypanel"
```

**Tiempo estimado:** 3-5 minutos

**Resultado esperado:**
- ✅ Comprensión mejorada de megapacks
- ✅ Sesión persiste 30 días
- ✅ Limpieza robusta de QR

---

**Fecha:** 2025-11-04
**Versión:** 3.0
