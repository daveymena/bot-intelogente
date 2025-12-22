# 🔧 Solución: Puertos Bloqueados

## 🎯 Problema

Los puertos están ocupados y no permiten ejecutar el bot.

## ✅ Solución Rápida

### Opción 1: Usar Script Automático

```bash
# Ejecutar el script que cierra todos los puertos
cerrar-todos-puertos.bat
```

Este script:
- Cierra puerto 3000 (Next.js)
- Cierra puerto 4000 (Server alternativo)
- Cierra puerto 5000
- Cierra puerto 8080
- Mata todos los procesos de Node.js

### Opción 2: Verificar Primero

```bash
# Ver qué puertos están ocupados
verificar-puertos.bat
```

### Opción 3: Manual (PowerShell)

```powershell
# Ver procesos en puerto 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Matar proceso específico
Stop-Process -Id NUMERO_PID -Force

# O matar todos los Node.js
Get-Process node | Stop-Process -Force
```

### Opción 4: Manual (CMD)

```cmd
# Ver qué está usando el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /F /PID 12345

# O matar todos los Node.js
taskkill /F /IM node.exe
```

## 🚀 Después de Cerrar Puertos

```bash
# Iniciar el bot
npm run dev
```

## 📋 Puertos Comunes del Bot

| Puerto | Uso |
|--------|-----|
| 3000 | Next.js (Dashboard) |
| 4000 | Server alternativo |
| 5000 | API alternativa |
| 8080 | Servidor de desarrollo |

## 🔍 Verificar que Funcionó

```bash
# Debería mostrar "no hay conexiones"
netstat -ano | findstr :3000
netstat -ano | findstr :4000
```

## ⚠️ Si Sigue sin Funcionar

1. **Reiniciar la terminal**
   - Cerrar todas las ventanas de PowerShell/CMD
   - Abrir una nueva

2. **Reiniciar VS Code**
   - Cerrar completamente VS Code
   - Abrir de nuevo

3. **Último recurso: Reiniciar PC**
   - A veces Windows mantiene puertos bloqueados
   - Un reinicio limpia todo

## 🎯 Prevenir el Problema

### Siempre cerrar correctamente:

```bash
# En lugar de cerrar la ventana, usar:
Ctrl + C

# Esperar a que termine el proceso
```

### Usar el script antes de iniciar:

```bash
# 1. Cerrar puertos
cerrar-todos-puertos.bat

# 2. Iniciar bot
npm run dev
```

## 📝 Scripts Creados

1. **`cerrar-todos-puertos.bat`** - Cierra todos los puertos automáticamente
2. **`verificar-puertos.bat`** - Verifica qué puertos están ocupados

## ✅ Checklist

- [ ] Ejecutar `cerrar-todos-puertos.bat`
- [ ] Verificar con `verificar-puertos.bat`
- [ ] Iniciar bot con `npm run dev`
- [ ] Si falla, reiniciar terminal
- [ ] Si sigue fallando, reiniciar VS Code
- [ ] Último recurso: reiniciar PC

## 🎉 Listo

Ahora deberías poder ejecutar el bot sin problemas de puertos bloqueados.
