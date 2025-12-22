# 🔌 Solución: Puerto 4000 Ocupado

## ❌ Error

```
Error: listen EADDRINUSE: address already in use 127.0.0.1:4000
```

**Causa:** Ya hay un proceso usando el puerto 4000 (probablemente una instancia anterior del servidor que no se cerró correctamente).

## ✅ Soluciones Rápidas

### Opción 1: Script Automático (Recomendado)
```powershell
.\reiniciar-limpio.bat
```
Este script:
- ✅ Cierra puerto 4000
- ✅ Cierra puerto 3000
- ✅ Cierra todos los procesos Node.js
- ✅ Inicia el servidor automáticamente

### Opción 2: Solo Cerrar Puerto 4000
```powershell
# PowerShell
.\cerrar-puerto-4000.ps1

# O CMD
cerrar-puerto-4000.bat
```

### Opción 3: Manual en PowerShell
```powershell
# Buscar proceso en puerto 4000
Get-NetTCPConnection -LocalPort 4000 | Select-Object OwningProcess

# Cerrar el proceso (reemplaza XXXX con el PID)
Stop-Process -Id XXXX -Force

# O cerrar todos los Node.js
Get-Process node | Stop-Process -Force
```

### Opción 4: Manual en CMD
```cmd
# Buscar proceso
netstat -ano | findstr :4000

# Cerrar proceso (reemplaza XXXX con el PID)
taskkill /F /PID XXXX

# O cerrar todos los Node.js
taskkill /F /IM node.exe
```

## 🎯 Flujo Completo

```
1️⃣ Cerrar procesos:
   .\reiniciar-limpio.bat

2️⃣ Esperar 3 segundos (automático)

3️⃣ El servidor se inicia automáticamente

4️⃣ ✅ Listo!
```

## 🔍 Verificar Puertos

```powershell
# Ver qué está usando el puerto 4000
netstat -ano | findstr :4000

# Ver qué está usando el puerto 3000
netstat -ano | findstr :3000

# Ver todos los procesos Node.js
Get-Process node
```

## 🚨 Si Sigue Sin Funcionar

### Solución Nuclear (Cierra TODO)
```powershell
# Cerrar TODOS los procesos Node.js
taskkill /F /IM node.exe /T

# Cerrar TODOS los procesos tsx
taskkill /F /IM tsx.exe /T

# Cerrar nodemon
taskkill /F /IM nodemon.exe /T

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Iniciar servidor
npm run dev
```

## 💡 Prevención

Para evitar este problema en el futuro:

1. **Siempre cierra el servidor con Ctrl+C** (no cierres la terminal directamente)
2. **Usa el script de reinicio limpio** cuando tengas dudas
3. **Verifica que no haya múltiples terminales** con el servidor corriendo

## 📝 Scripts Creados

```
reiniciar-limpio.bat          # Cierra todo y reinicia (Recomendado)
cerrar-puerto-4000.bat        # Solo cierra puerto 4000 (CMD)
cerrar-puerto-4000.ps1        # Solo cierra puerto 4000 (PowerShell)
```

## 🎬 Uso Inmediato

**Desde PowerShell:**
```powershell
.\reiniciar-limpio.bat
```

**Desde CMD:**
```cmd
reiniciar-limpio.bat
```

El script hará todo automáticamente y el servidor se iniciará limpio.

---

**Última actualización:** 20 Nov 2025
**Estado:** ✅ Scripts listos para usar
