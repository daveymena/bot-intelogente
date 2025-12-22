# 🔍 DIAGNOSTICAR ERROR DE BUILD EN EASYPANEL

## 🎯 Problema

El build de Docker en Easypanel está fallando con exit code 1.

## 📋 Pasos para Diagnosticar

### 1. Ver Logs Completos en Easypanel

1. Ve a tu proyecto en Easypanel
2. Haz clic en la aplicación `what-auto2`
3. Ve a la pestaña **"Logs"** o **"Build Logs"**
4. Busca el error específico (usualmente al final)

### 2. Errores Comunes y Soluciones

#### Error: "Module not found" o "Cannot find module"

**Causa**: Falta una dependencia en `package.json`

**Solución**:
```bash
# Verificar que todas las dependencias estén instaladas
npm install

# Si falta alguna, agregarla
npm install <nombre-del-paquete>

# Commit y push
git add package.json package-lock.json
git commit -m "fix: agregar dependencia faltante"
git push
```

#### Error: "Type error" o "TypeScript error"

**Causa**: Error de tipos en TypeScript

**Solución**:
```bash
# Verificar errores localmente
npm run build

# Si hay errores, corregirlos y hacer commit
git add .
git commit -m "fix: corregir errores de TypeScript"
git push
```

#### Error: "Prisma generate failed"

**Causa**: Problema con el schema de Prisma

**Solución**:
```bash
# Regenerar cliente de Prisma
npx prisma generate

# Verificar que funcione
npm run build

# Commit y push
git add .
git commit -m "fix: regenerar cliente Prisma"
git push
```

#### Error: "ENOENT: no such file or directory"

**Causa**: Archivo o directorio faltante

**Solución**:
- Verificar que todos los archivos necesarios estén en Git
- Revisar el `.gitignore` para asegurarse de no estar ignorando archivos importantes

### 3. Probar Build Localmente

Antes de subir a Easypanel, prueba el build localmente:

```bash
# Limpiar todo
rm -rf node_modules .next dist

# Reinstalar dependencias
npm ci

# Generar Prisma
npx prisma generate

# Build
npm run build

# Si todo funciona, hacer commit y push
git add .
git commit -m "fix: build funcionando"
git push
```

### 4. Verificar Dockerfile

El Dockerfile debe estar correcto. Verifica que tenga:

```dockerfile
# ✅ Imagen base correcta
FROM ghcr.io/puppeteer/puppeteer:21.6.0

# ✅ Copiar package.json
COPY package*.json ./

# ✅ Instalar dependencias
RUN npm ci

# ✅ Copiar código
COPY . .

# ✅ Generar Prisma
RUN npx prisma generate

# ✅ Build
RUN npm run build
```

### 5. Verificar Variables de Entorno

Asegúrate de que todas las variables necesarias estén configuradas en Easypanel:

- `DATABASE_URL` ✅
- `GROQ_API_KEY` ✅
- `NODE_ENV=production` ✅
- `PORT=3000` ✅
- `NEXTAUTH_SECRET` ✅
- `JWT_SECRET` ✅

## 🚀 Solución Rápida

Si no puedes ver el error completo, intenta esto:

### Opción 1: Forzar Rebuild

1. Ve a Easypanel
2. Haz clic en tu aplicación
3. Haz clic en **"Rebuild"** o **"Redeploy"**
4. Espera a que termine

### Opción 2: Limpiar y Rebuild

1. En Easypanel, elimina la aplicación (NO el proyecto)
2. Vuelve a crear la aplicación desde GitHub
3. Configura las variables de entorno
4. Despliega

### Opción 3: Verificar Commit

```bash
# Ver el último commit
git log -1

# Verificar que sea el correcto (f4a966b)
# Si no, hacer pull
git pull origin main

# Verificar archivos modificados
git show --name-only
```

## 📝 Información Necesaria

Para ayudarte mejor, necesito ver:

1. **Logs completos del build** (últimas 50 líneas)
2. **Mensaje de error específico**
3. **Qué paso del Dockerfile está fallando**

### Cómo Obtener los Logs

1. Ve a Easypanel
2. Proyecto: `bot-whatsapp`
3. Aplicación: `what-auto2`
4. Pestaña: **"Logs"** o **"Build Logs"**
5. Copia las últimas 50-100 líneas
6. Pégalas aquí

## 🔧 Soluciones Específicas

### Si el error es en `npm ci`

```bash
# Verificar package-lock.json
git add package-lock.json
git commit -m "fix: actualizar package-lock.json"
git push
```

### Si el error es en `prisma generate`

```bash
# Verificar schema.prisma
npx prisma validate

# Si hay errores, corregirlos
git add prisma/schema.prisma
git commit -m "fix: corregir schema Prisma"
git push
```

### Si el error es en `npm run build`

```bash
# Probar build localmente
npm run build

# Ver errores específicos
# Corregir y hacer commit
git add .
git commit -m "fix: corregir errores de build"
git push
```

## ✅ Checklist de Verificación

Antes de intentar desplegar de nuevo:

- [ ] Build funciona localmente (`npm run build`)
- [ ] No hay errores de TypeScript
- [ ] Prisma genera correctamente (`npx prisma generate`)
- [ ] Todas las dependencias están en `package.json`
- [ ] El commit está en GitHub
- [ ] Variables de entorno configuradas en Easypanel

## 🆘 Si Nada Funciona

1. **Revierte al commit anterior que funcionaba**:
   ```bash
   git log --oneline
   git revert f4a966b
   git push
   ```

2. **Aplica los cambios de nuevo uno por uno**:
   ```bash
   # Aplicar solo los cambios críticos
   git cherry-pick <commit-hash>
   ```

3. **Contacta con soporte de Easypanel** si el problema persiste

---

**Siguiente paso**: Copia los logs completos del build de Easypanel para diagnosticar el problema específico.
