# ⚡ SOLUCIÓN RÁPIDA: Build Fallando en Easypanel

## 🎯 Problema

El build en Easypanel falla con exit code 1, pero el mensaje de error se corta.

## ✅ Soluciones Rápidas (en orden)

### Solución 1: Aumentar Memoria del Build

El problema más común es falta de memoria durante el build de Next.js.

**En Easypanel:**

1. Ve a tu aplicación `what-auto2`
2. Haz clic en "Settings" o "Configuration"
3. Busca "Build Resources" o "Build Memory"
4. Aumenta la memoria a **2GB** o más
5. Guarda y haz "Rebuild"

### Solución 2: Usar Dockerfile Optimizado

Si no puedes aumentar la memoria, usa el Dockerfile optimizado:

```bash
# Renombrar Dockerfile actual
mv Dockerfile Dockerfile.backup

# Usar el optimizado
mv Dockerfile.optimized Dockerfile

# Commit y push
git add Dockerfile
git commit -m "fix: usar Dockerfile optimizado para Easypanel"
git push
```

### Solución 3: Deshabilitar Telemetría de Next.js

Agrega esta variable de entorno en Easypanel:

```
NEXT_TELEMETRY_DISABLED=1
```

### Solución 4: Aumentar Timeout del Build

En Easypanel, busca la configuración de timeout y auméntala a **20 minutos**.

### Solución 5: Build en Múltiples Etapas

Si nada funciona, podemos dividir el build en etapas más pequeñas.

## 🔍 Diagnóstico

Para saber cuál solución aplicar, necesito ver los logs completos.

**Sigue estos pasos:**

1. Ve a Easypanel
2. Aplicación: `what-auto2`
3. Pestaña: "Logs" o "Build Logs"
4. Copia las últimas 100 líneas
5. Pégalas aquí

## 📊 Errores Comunes y Sus Soluciones

### Error: "JavaScript heap out of memory"

**Causa**: Falta de memoria durante el build

**Solución**:
- Aumentar memoria del build a 2GB
- Usar `NODE_OPTIONS="--max-old-space-size=2048"`

### Error: "ENOSPC: System limit for number of file watchers reached"

**Causa**: Límite de watchers del sistema

**Solución**:
- Agregar `CHOKIDAR_USEPOLLING=true` en variables de entorno

### Error: "npm ERR! code ELIFECYCLE"

**Causa**: Error en algún script de npm

**Solución**:
- Ver el log completo para identificar qué script falló
- Verificar que todas las dependencias estén en `package.json`

### Error: "Prisma generate failed"

**Causa**: Problema con el schema de Prisma

**Solución**:
```bash
# Verificar schema localmente
npx prisma validate

# Si hay errores, corregirlos
git add prisma/schema.prisma
git commit -m "fix: corregir schema Prisma"
git push
```

### Error: "Module not found"

**Causa**: Falta una dependencia

**Solución**:
```bash
# Instalar dependencia faltante
npm install <nombre-del-paquete>

# Commit y push
git add package.json package-lock.json
git commit -m "fix: agregar dependencia faltante"
git push
```

## 🚀 Solución Temporal: Desplegar sin Build

Si necesitas desplegar urgentemente:

1. Haz el build localmente:
   ```bash
   npm run build
   ```

2. Sube la carpeta `.next` a Git (temporalmente):
   ```bash
   # Editar .gitignore y comentar .next
   git add .next
   git commit -m "temp: agregar build pre-compilado"
   git push
   ```

3. Modifica el Dockerfile para saltar el build:
   ```dockerfile
   # Comentar esta línea:
   # RUN npm run build
   ```

4. Después de desplegar, revierte los cambios

## 📝 Información Necesaria

Para ayudarte mejor, necesito:

1. **Logs completos del build** (últimas 100 líneas)
2. **En qué paso falla** (npm ci, prisma generate, npm run build)
3. **Configuración de recursos** en Easypanel (memoria, CPU)

## 🆘 Si Nada Funciona

1. **Revierte al commit anterior**:
   ```bash
   git revert HEAD
   git push
   ```

2. **Contacta soporte de Easypanel**:
   - Menciona que el build falla con exit code 1
   - Proporciona los logs completos
   - Pregunta sobre límites de recursos

3. **Considera otra plataforma**:
   - Railway (más memoria para builds)
   - Vercel (optimizado para Next.js)
   - Render (builds más rápidos)

---

**Siguiente paso**: Copia los logs completos de Easypanel para diagnosticar el problema específico.
