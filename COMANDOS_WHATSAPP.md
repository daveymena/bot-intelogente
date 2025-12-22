# 🔧 Comandos Útiles para WhatsApp

## 📊 Verificar Estado

```bash
node verificar-estado-whatsapp.js
```

Muestra:
- Estado de todas las conexiones
- Última vez conectado
- Errores recientes
- Archivos de sesión

## 🧹 Limpiar Conexiones

```bash
node limpiar-conexiones-whatsapp.js
```

Usa esto cuando:
- Hay loops de reconexión
- Errores 440 (conflicto de sesión)
- Múltiples conexiones simultáneas
- El sistema no se estabiliza

## 🔄 Reiniciar Limpiamente

```bash
# 1. Limpiar conexiones
node limpiar-conexiones-whatsapp.js

# 2. Reiniciar servidor
npm run dev
```

## 🗑️ Limpiar Sesiones Completamente

⚠️ **CUIDADO**: Esto borrará las sesiones guardadas. Tendrás que escanear QR de nuevo.

```bash
# Windows
rmdir /s /q auth_sessions

# Linux/Mac
rm -rf auth_sessions

# Luego reiniciar
npm run dev
```

## 📝 Ver Logs en Tiempo Real

```bash
# Ver todos los logs
npm run dev

# Solo logs de WhatsApp (Windows)
npm run dev | findstr "Baileys Auto-Reconnect"

# Solo logs de WhatsApp (Linux/Mac)
npm run dev | grep "Baileys\|Auto-Reconnect"
```

## 🔍 Diagnosticar Problemas

### 1. Verificar Estado
```bash
node verificar-estado-whatsapp.js
```

### 2. Ver Logs del Servidor
Busca estos patrones:

**✅ Correcto (Estable)**:
```
✅ [Auto-Reconnect] Usuario conectado
[Baileys] ✅ Conexión establecida
[Baileys] 💓 Keep-alive configurado
```

**❌ Incorrecto (Loop)**:
```
[Baileys] 🔌 Conexión cerrada. Código: 440
[Baileys] 🔄 Reconectando... (repetido constantemente)
```

### 3. Verificar Archivos de Sesión
```bash
# Windows
dir auth_sessions\[USER_ID]

# Linux/Mac
ls -la auth_sessions/[USER_ID]
```

Debe tener archivos como:
- `creds.json`
- `app-state-sync-key-*.json`
- `app-state-sync-version-*.json`

## 🚀 Flujo de Trabajo Recomendado

### Inicio Normal
```bash
npm run dev
```

### Si Hay Problemas
```bash
# 1. Verificar estado
node verificar-estado-whatsapp.js

# 2. Si hay errores 440 o loops
node limpiar-conexiones-whatsapp.js

# 3. Reiniciar
npm run dev

# 4. Esperar 1-2 minutos para auto-reconexión

# 5. Si no conecta, ir al dashboard y reconectar manualmente
```

### Si Nada Funciona
```bash
# 1. Detener servidor (Ctrl+C)

# 2. Limpiar sesiones
rmdir /s /q auth_sessions  # Windows
rm -rf auth_sessions       # Linux/Mac

# 3. Limpiar conexiones en DB
node limpiar-conexiones-whatsapp.js

# 4. Reiniciar
npm run dev

# 5. Ir al dashboard y escanear QR
```

## 📊 Monitoreo Continuo

### Script de Monitoreo (Opcional)

Crea `monitorear-whatsapp.bat`:

```batch
@echo off
:loop
cls
echo ========================================
echo   MONITOR DE WHATSAPP
echo ========================================
echo.
node verificar-estado-whatsapp.js
echo.
echo Actualizando en 30 segundos...
timeout /t 30 /nobreak > nul
goto loop
```

Ejecuta:
```bash
monitorear-whatsapp.bat
```

## 🔧 Configuración Avanzada

### Ajustar Intervalo de Auto-Reconexión

Edita `src/lib/whatsapp-auto-reconnect.ts`:

```typescript
// Cambiar de 30 segundos a otro valor
this.reconnectInterval = setInterval(async () => {
  await this.checkAndReconnect()
}, 60000) // 60 segundos
```

### Ajustar Cooldown

Edita `src/lib/whatsapp-auto-reconnect.ts`:

```typescript
// Cambiar de 60 segundos a otro valor
if (timeSinceDisconnect < 120000) { // 2 minutos
  continue
}
```

### Ajustar Límite de Reintentos

Edita `src/lib/baileys-stable-service.ts`:

```typescript
// Cambiar de 5 a otro valor
if (session.reconnectAttempts > 10) {
  // Detener reconexión
}
```

## 📝 Notas Importantes

1. **Espera Paciencia**: El sistema ahora espera más tiempo entre reconexiones para evitar loops
2. **No Fuerces**: Si está desconectado, espera 1-2 minutos antes de reconectar manualmente
3. **Una Ventana**: No abras múltiples tabs del dashboard
4. **Monitorea Logs**: Los logs te dirán exactamente qué está pasando
5. **Código 440**: Si ves este código, ejecuta `limpiar-conexiones-whatsapp.js`

## 🆘 Soporte

Si sigues teniendo problemas:

1. Ejecuta `node verificar-estado-whatsapp.js` y guarda el output
2. Revisa los logs del servidor
3. Busca patrones de error repetidos
4. Verifica que solo haya una instancia del servidor corriendo
