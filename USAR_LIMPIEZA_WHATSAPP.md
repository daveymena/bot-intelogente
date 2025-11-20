# 🚀 Cómo Usar la Limpieza de WhatsApp

## ✅ Tu Sesión Está Saludable

Según el diagnóstico que ejecutaste:
```
Total de sesiones: 1
Sesiones saludables: 1
Sesiones corruptas: 0
Estado: DISCONNECTED ✅
```

**Esto es NORMAL** cuando no estás conectado a WhatsApp.

## 🎯 Comandos Correctos para PowerShell

### Opción 1: Script Interactivo (Recomendado)
```powershell
.\limpiar-whatsapp.ps1
```
Este script:
- ✅ Verifica el estado de tu sesión
- ✅ Te pregunta si deseas limpiar
- ✅ Muestra mensajes claros
- ✅ Te guía paso a paso

### Opción 2: Diagnóstico Rápido
```powershell
npx tsx scripts/test-session-cleanup.ts
```
Este comando:
- ✅ Muestra el estado de todas las sesiones
- ✅ Limpia automáticamente si detecta problemas
- ✅ Funciona sin servidor corriendo

### Opción 3: Desde la API (Servidor debe estar corriendo)
```powershell
# Verificar estado
Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/cleanup" -Method GET

# Limpiar forzado
$body = @{ action = "cleanup"; force = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/cleanup" -Method POST -Body $body -ContentType "application/json"
```

## 🔄 Flujo Recomendado

### Si el botón "Conectar WhatsApp" no funciona:

```
1️⃣ Ejecutar diagnóstico:
   npx tsx scripts/test-session-cleanup.ts

2️⃣ Si muestra "Sesiones corruptas: 0":
   → Tu sesión está bien
   → Intenta conectar de nuevo desde el dashboard
   → El QR debería aparecer

3️⃣ Si muestra "Sesiones corruptas: 1":
   → El script ya limpió automáticamente
   → Espera 5 segundos
   → Intenta conectar de nuevo

4️⃣ Si sigue sin funcionar:
   → Ejecuta: .\limpiar-whatsapp.ps1
   → Confirma la limpieza
   → Intenta conectar de nuevo
```

## 🤖 Sistema Automático

El sistema se limpia automáticamente cada 2 minutos cuando el servidor está corriendo:

```powershell
# Iniciar servidor (incluye auto-limpieza)
npm run dev
```

Verás logs como:
```
[SessionCleanup] 🔄 Iniciando auto-limpieza...
[SessionCleanup] 📊 Encontradas 1 sesiones activas
[SessionCleanup] ✅ Auto-limpieza completada: 0 sesiones limpiadas
```

## 📊 Estados de Sesión

| Estado | Significado | Acción |
|--------|-------------|--------|
| DISCONNECTED | No conectado (normal) | Conectar desde dashboard |
| CONNECTING | Conectando... | Esperar o limpiar si >3 min |
| QR_PENDING | Esperando escaneo QR | Escanear QR o esperar |
| CONNECTED | Conectado ✅ | Todo bien |

## 🚨 Cuándo Limpiar

Limpia la sesión si:
- ❌ Estado CONNECTING por más de 3 minutos
- ❌ QR no aparece después de hacer clic en "Conectar"
- ❌ Bucle infinito: Conectar → Conectar → Conectar
- ❌ Error "Sesión no encontrada"
- ❌ El diagnóstico muestra "Sesiones corruptas: 1"

NO limpies si:
- ✅ Estado DISCONNECTED (es normal)
- ✅ Estado CONNECTED (está funcionando)
- ✅ Diagnóstico muestra "Sesiones saludables: 1"

## 💡 Consejos

1. **Espera 2 minutos** antes de limpiar manualmente (auto-limpieza automática)
2. **No hagas clic múltiples veces** en "Conectar" (crea locks)
3. **Ejecuta el diagnóstico primero** antes de limpiar
4. **Lee los logs** del servidor para entender qué pasa

## 🆘 Solución de Emergencia

Si nada funciona:

```powershell
# 1. Detener servidor
Ctrl+C

# 2. Limpiar archivos manualmente
Remove-Item -Recurse -Force auth_sessions\*

# 3. Reiniciar servidor
npm run dev

# 4. Conectar desde dashboard
```

## 📝 Archivos Importantes

```
limpiar-whatsapp.ps1                    # Script interactivo PowerShell
limpiar-sesion-whatsapp.bat             # Script para CMD
scripts/test-session-cleanup.ts         # Diagnóstico completo
src/lib/session-cleanup-service.ts      # Servicio de auto-limpieza
src/app/api/whatsapp/cleanup/route.ts   # API de limpieza
```

## ✅ Tu Próximo Paso

Como tu sesión está saludable (DISCONNECTED), simplemente:

1. Abre el dashboard: `npm run dev`
2. Ve a la sección de WhatsApp
3. Haz clic en "Conectar WhatsApp"
4. Escanea el QR que aparece
5. ✅ Listo!

Si el QR no aparece en 30 segundos, ejecuta:
```powershell
npx tsx scripts/test-session-cleanup.ts
```

---

**Última actualización:** 20 Nov 2025
**Tu estado actual:** ✅ Saludable (DISCONNECTED)
