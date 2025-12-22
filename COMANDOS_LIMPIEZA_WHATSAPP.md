# 🧹 Comandos de Limpieza WhatsApp

## ✅ Comandos que Funcionan en PowerShell

### 1. Ejecutar Diagnóstico y Limpieza
```powershell
npx tsx scripts/test-session-cleanup.ts
```

### 2. Ejecutar el archivo .bat (desde PowerShell)
```powershell
.\limpiar-sesion-whatsapp.bat
```

### 3. Llamar a la API desde PowerShell

**Verificar salud de sesión:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/cleanup" -Method GET
```

**Limpiar sesión (forzado):**
```powershell
$body = @{
    action = "cleanup"
    force = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/cleanup" -Method POST -Body $body -ContentType "application/json"
```

**Diagnóstico completo:**
```powershell
$body = @{
    action = "diagnostic"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/cleanup" -Method POST -Body $body -ContentType "application/json"
```

**Auto-limpieza de todas las sesiones:**
```powershell
$body = @{
    action = "auto-cleanup"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/cleanup" -Method POST -Body $body -ContentType "application/json"
```

## 📊 Interpretación de Resultados

### Estado Saludable ✅
```
Total de sesiones: 1
Sesiones saludables: 1
Sesiones corruptas: 0

Usuario: cmi6xj8q30000kme42q5fjk41
Estado: DISCONNECTED
Saludable: ✅
```
**Significado:** Todo está bien. La sesión está desconectada normalmente.

### Estado Corrupto ❌
```
Total de sesiones: 1
Sesiones saludables: 0
Sesiones corruptas: 1

Usuario: cmi6xj8q30000kme42q5fjk41
Estado: CONNECTING
Saludable: ❌
Problemas:
  - Sesión en CONNECTING por 245s (máx: 180s)
  - Lock de conexión expirado
🧹 Requiere limpieza
```
**Significado:** Sesión en mal estado, se limpiará automáticamente.

## 🚀 Cuándo Usar Cada Comando

### Situación 1: Botón "Conectar" no funciona
```powershell
# Ejecutar diagnóstico
npx tsx scripts/test-session-cleanup.ts

# Si muestra sesiones corruptas, ya se limpió automáticamente
# Ahora intenta conectar de nuevo desde el dashboard
```

### Situación 2: Bucle infinito de conexión
```powershell
# Forzar limpieza desde API
$body = @{ action = "cleanup"; force = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/cleanup" -Method POST -Body $body -ContentType "application/json"

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Intentar conectar de nuevo
```

### Situación 3: Verificar estado sin limpiar
```powershell
# Solo verificar
Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/cleanup" -Method GET
```

## 🔄 Sistema Automático

El sistema se ejecuta automáticamente cada 2 minutos cuando el servidor está corriendo:

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

## 📝 Notas Importantes

1. **DISCONNECTED es normal** cuando no estás conectado a WhatsApp
2. **CONNECTING por más de 3 minutos** es anormal y se limpia automáticamente
3. **QR_PENDING por más de 5 minutos** es anormal y se limpia automáticamente
4. El sistema **NO afecta** sesiones conectadas correctamente (CONNECTED)

## 🎯 Flujo Recomendado

```
1. Intentar conectar desde dashboard
   ↓
2. Si no funciona después de 1 minuto:
   npx tsx scripts/test-session-cleanup.ts
   ↓
3. Esperar 5 segundos
   ↓
4. Intentar conectar de nuevo
   ↓
5. ✅ Debería funcionar
```

## 🆘 Si Nada Funciona

```powershell
# 1. Detener servidor
Ctrl+C

# 2. Limpiar manualmente archivos de sesión
Remove-Item -Recurse -Force auth_sessions/*

# 3. Limpiar base de datos (opcional)
npx prisma db push --force-reset

# 4. Reiniciar servidor
npm run dev

# 5. Intentar conectar
```

---

**Última actualización:** 20 Nov 2025
