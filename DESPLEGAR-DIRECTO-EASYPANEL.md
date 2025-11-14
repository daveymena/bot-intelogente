# 🚀 Despliegue Directo a EasyPanel (Sin Git)

## ❌ Problema Actual
- GitHub bloquea el push por detectar secretos en commits antiguos
- EasyPanel no puede hacer pull porque el repositorio está desincronizado

## ✅ Solución: Despliegue Manual Directo

### Opción 1: Usar la Consola de EasyPanel (RECOMENDADO)

1. **Ir a EasyPanel** → Tu aplicación → **Terminal**

2. **Copiar archivos modificados directamente**:

```bash
# Navegar al directorio de la app
cd /app

# Actualizar archivos críticos uno por uno
# (Copia el contenido desde tu local y pégalo en EasyPanel)

# Crear/actualizar archivos con nano o vi
nano src/lib/local-knowledge-base.ts
# Pega el contenido actualizado, Ctrl+X, Y, Enter

nano src/lib/intelligent-conversation-engine.ts
# Pega el contenido actualizado

nano src/lib/baileys-stable-service.ts
# Pega el contenido actualizado

nano src/lib/intelligent-baileys-integration.ts
# Pega el contenido actualizado

nano src/app/catalogo/page.tsx
# Pega el contenido actualizado

# Reiniciar la aplicación
pm2 restart all
# o
npm run build && npm start
```

### Opción 2: Usar SFTP/SCP

1. **Conectar por SFTP** a EasyPanel
2. **Subir archivos** directamente a `/app/src/`
3. **Reiniciar** la aplicación

### Opción 3: Limpiar Historial de Git (Más Técnico)

Si quieres seguir usando Git, ejecuta localmente:

```bash
./FORZAR-SUBIDA-LIMPIA.bat
```

Esto creará un repositorio limpio sin secretos y lo subirá a GitHub.

## 📁 Archivos Críticos a Actualizar

### 1. Sistema de Puntuación (CRÍTICO)
```
src/lib/local-knowledge-base.ts
```
**Cambio**: Normalización de acentos en líneas 50-60

### 2. Motor Conversacional (CRÍTICO)
```
src/lib/intelligent-conversation-engine.ts
```
**Cambio**: Lógica mejorada de recomendación

### 3. Conexión WhatsApp (IMPORTANTE)
```
src/lib/baileys-stable-service.ts
src/lib/intelligent-baileys-integration.ts
src/app/api/whatsapp/reconnect/route.ts
src/app/api/whatsapp/cleanup/route.ts
```
**Cambio**: Auto-reconexión y manejo de errores

### 4. Catálogo con Subcategorías (NUEVO)
```
src/app/catalogo/page.tsx
```
**Cambio**: Filtros de dos niveles

### 5. Scripts de Fotos (NUEVO)
```
scripts/extraer-fotos-megacomputer-final.ts
scripts/asignar-subcategorias-automatico.ts
```

## 🔄 Después de Actualizar

1. **Reiniciar la aplicación** en EasyPanel
2. **Verificar logs** para errores
3. **Probar el bot** con WhatsApp
4. **Verificar catálogo** en `/catalogo`

## 💡 Recomendación

La forma más rápida es:
1. Ir a EasyPanel Terminal
2. Editar los 4 archivos críticos con nano
3. Reiniciar la app

Esto toma 5-10 minutos y evita problemas con Git.

## 🆘 Si Prefieres Usar Git

Ejecuta localmente:
```bash
./FORZAR-SUBIDA-LIMPIA.bat
```

Luego en EasyPanel:
1. Settings → Repository
2. Click "Redeploy"
3. Espera 2-3 minutos

## 📝 Notas

- Los secretos están en commits antiguos, no en el código actual
- El código actual está limpio y funcional
- Solo necesitas actualizar los archivos en el servidor
- No necesitas todo el historial de Git para que funcione
