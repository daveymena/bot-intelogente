# Solución: Error UTF-8 en baileys-stable-service.ts

## 🔴 Error

```
Error: Failed to read source code from C:\davey\bot-whatsapp\src\lib\baileys-stable-service.ts
Caused by: stream did not contain valid UTF-8
```

## 🎯 Causa

El archivo `baileys-stable-service.ts` contiene emojis (🔒, 💓, 🛡️, 🤖) que pueden causar problemas de codificación UTF-8 cuando Next.js intenta leerlo.

## ✅ Solución

### Opción 1: Corregir Codificación (Recomendado)

```bash
# Ejecutar script de corrección
corregir-utf8-baileys.bat
```

Este script:
1. Cierra procesos de Node.js
2. Lee el archivo con codificación UTF-8
3. Lo guarda con codificación UTF-8 correcta (sin BOM)

### Opción 2: Reiniciar Next.js Limpio

```bash
# Reiniciar con cache limpio
reiniciar-nextjs-limpio.bat
```

Este script:
1. Cierra procesos de Node.js
2. Limpia cache de Next.js (.next)
3. Reinicia el servidor

### Opción 3: Manual

1. Cerrar el servidor Next.js (Ctrl+C)
2. Cerrar todos los procesos de Node.js:
   ```bash
   taskkill /F /IM node.exe
   ```
3. Limpiar cache:
   ```bash
   rmdir /s /q .next
   ```
4. Reiniciar:
   ```bash
   npm run dev
   ```

## 🔍 Verificación

Después de aplicar la solución, deberías ver:

```
✓ Compiled successfully
✓ Ready in X.Xs
```

Sin errores de UTF-8.

## 📝 Nota

Este error NO afecta el sistema de memoria compartida que acabamos de implementar. Es solo un problema de codificación del archivo que Next.js está intentando leer.

## 🚀 Continuar

Una vez resuelto el error UTF-8:

1. ✅ El servidor Next.js compilará correctamente
2. ✅ Puedes probar el sistema de memoria compartida
3. ✅ Ejecutar: `probar-memoria-compartida.bat`

---

**Archivos Creados**:
- `corregir-utf8-baileys.bat` - Corrige codificación
- `corregir-utf8-baileys.ps1` - Script PowerShell
- `reiniciar-nextjs-limpio.bat` - Reinicia con cache limpio
