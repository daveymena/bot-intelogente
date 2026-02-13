# Solución al Error de Build en EasyPanel

## Problema
Error durante `npm install` en Docker build:
```
ERROR: failed to build: failed to solve: process "/bin/sh -c npm install --legacy-peer-deps && npm cache clean --force" did not complete successfully: exit code: 254
```

## Causas Comunes

### 1. **Memoria Insuficiente**
El build de Docker puede quedarse sin memoria durante `npm install`.

**Solución:**
- Aumentar memoria disponible para Docker en EasyPanel
- Usar `NODE_OPTIONS="--max-old-space-size=4096"` en Dockerfile

### 2. **Timeouts de Red**
Algunos paquetes pueden tardar mucho en descargarse.

**Solución:**
- Configurar timeouts más largos en npm
- Usar reintentos automáticos

### 3. **Dependencias Conflictivas**
Algunas dependencias pueden tener conflictos de versiones.

**Solución:**
- Usar `--legacy-peer-deps`
- Verificar que `package-lock.json` esté incluido en el build

### 4. **Paquetes Nativos**
Paquetes como `sharp`, `bufferutil`, `utf-8-validate` requieren compilación.

**Solución:**
- Instalar herramientas de build: `python3`, `make`, `g++`
- Usar imagen `node:20-alpine` con dependencias del sistema

## Soluciones Implementadas

### Dockerfile Mejorado
Se han creado dos versiones del Dockerfile:

1. **Dockerfile** (actualizado)
   - Añadido `git` a dependencias del sistema
   - Configurado `NODE_OPTIONS` para más memoria
   - Añadidos reintentos automáticos en npm install
   - Logging verbose para debugging

2. **Dockerfile.alternative** (nuevo)
   - Usa `npm ci` para instalación más rápida y confiable
   - Mejor manejo de errores con fallback a `npm install`
   - Variables de entorno optimizadas

### .dockerignore Actualizado
- Removido `package-lock.json` de la lista de exclusión
- Esto asegura builds consistentes

## Pasos para Resolver

### Opción 1: Usar Dockerfile Mejorado (Recomendado)
```bash
# El Dockerfile principal ya fue actualizado
# Solo necesitas hacer commit y push
git add Dockerfile .dockerignore
git commit -m "fix: mejorar Dockerfile para resolver error de build"
git push
```

### Opción 2: Usar Dockerfile Alternativo
```bash
# Renombrar archivos
mv Dockerfile Dockerfile.backup
mv Dockerfile.alternative Dockerfile

# Commit y push
git add Dockerfile
git commit -m "fix: usar Dockerfile alternativo con npm ci"
git push
```

### Opción 3: Debugging Avanzado
Si los anteriores no funcionan, añade esto temporalmente al Dockerfile:

```dockerfile
# En la sección de deps, reemplaza el RUN npm install con:
RUN npm config list && \
    npm install --legacy-peer-deps --verbose 2>&1 | tee /tmp/npm-install.log || \
    (cat /tmp/npm-install.log && exit 1)
```

Esto mostrará exactamente qué paquete está fallando.

## Verificación Local

Antes de hacer push, puedes probar el build localmente:

```bash
# Probar build completo
docker build -t test-build .

# Si falla, probar solo la etapa de deps
docker build --target deps -t test-deps .
```

## Configuración de EasyPanel

Si el problema persiste, verifica en EasyPanel:

1. **Recursos del Contenedor**
   - Memoria: Mínimo 2GB recomendado
   - CPU: Mínimo 1 core

2. **Variables de Entorno**
   - Asegúrate de que todas las variables estén configuradas
   - Especialmente `DATABASE_URL`

3. **Build Args**
   - Verifica que todos los `--build-arg` sean correctos
   - Algunos valores pueden tener caracteres especiales que necesitan escape

## Dependencias Problemáticas Conocidas

Estas dependencias pueden causar problemas en Alpine Linux:

- `sharp`: Requiere `python3`, `make`, `g++`
- `puppeteer`: Requiere Chrome/Chromium (ya incluido en deps)
- `@whiskeysockets/baileys`: Requiere `bufferutil`, `utf-8-validate`
- `whatsapp-web.js`: Similar a baileys

Todas están manejadas en el Dockerfile actualizado.

## Monitoreo del Build

Para ver logs detallados en EasyPanel:

1. Ve a tu proyecto
2. Haz clic en "Logs"
3. Selecciona "Build Logs"
4. Busca el mensaje de error específico

## Contacto de Soporte

Si ninguna solución funciona:

1. Captura los logs completos del build
2. Verifica la versión de Node.js en EasyPanel
3. Considera usar una imagen base diferente (ej: `node:20` en lugar de `node:20-alpine`)

## Próximos Pasos

1. Hacer commit de los cambios
2. Push a tu repositorio
3. EasyPanel detectará los cambios automáticamente
4. Monitorear el nuevo build

```bash
git add .
git commit -m "fix: resolver error de npm install en Docker build"
git push origin main
```
