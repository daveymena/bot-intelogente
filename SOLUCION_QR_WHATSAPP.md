# 🔧 SOLUCIÓN: Problema con QR de WhatsApp

## 🎯 Problema Detectado

**Error en logs:**
```
[Baileys] 🔌 Conexión cerrada. Código: 401
[Baileys] 🚪 Usuario cerró sesión (logged out)
```

**Causa:** La sesión guardada está expirada o inválida.

---

## ✅ SOLUCIÓN RÁPIDA (2 minutos)

### Paso 1: Limpiar sesión antigua
```bash
LIMPIAR_Y_RECONECTAR_WHATSAPP.bat
```

### Paso 2: Iniciar servidor
```bash
npm run dev
```

### Paso 3: Conectar WhatsApp
1. Abre http://localhost:3000
2. Haz login con tu cuenta
3. Ve a la sección de WhatsApp
4. Haz clic en "Conectar WhatsApp"
5. Escanea el QR con tu teléfono

---

## 🔧 SOLUCIÓN MANUAL

Si el script no funciona, hazlo manualmente:

### 1. Detener servidor
```bash
# Presiona Ctrl+C en la terminal donde corre npm run dev
```

### 2. Eliminar sesiones antiguas
```bash
# En Windows
rmdir /s /q auth_sessions
mkdir auth_sessions

# En Linux/Mac
rm -rf auth_sessions
mkdir auth_sessions
```

### 3. Reiniciar servidor
```bash
npm run dev
```

### 4. Conectar desde dashboard
- Abre http://localhost:3000
- Login → WhatsApp → Conectar
- Escanea QR

---

## 📱 Cómo Escanear el QR

1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración** (⚙️)
3. Toca **Dispositivos vinculados**
4. Toca **Vincular un dispositivo**
5. Escanea el QR que aparece en el dashboard

---

## ⚠️ Si Sigue Sin Funcionar

### Problema: No aparece el QR

**Solución 1:** Verificar que el servidor esté corriendo
```bash
# Deberías ver:
✓ Ready on http://localhost:3000
Socket.IO server running
```

**Solución 2:** Limpiar caché del navegador
- Presiona Ctrl+Shift+R para recargar
- O abre en ventana incógnita

**Solución 3:** Verificar puerto
```bash
# Si el puerto 3000 está ocupado
netstat -ano | findstr :3000

# Cerrar proceso
taskkill /F /PID [número_del_proceso]
```

### Problema: QR aparece pero no conecta

**Solución 1:** Verificar internet
- Tanto en PC como en teléfono

**Solución 2:** Reintentar
- Espera 30 segundos
- Refresca la página
- Escanea de nuevo

**Solución 3:** Verificar versión de WhatsApp
- Actualiza WhatsApp en tu teléfono
- Debe ser versión reciente

---

## 🔍 Verificar Logs

Para ver qué está pasando:

```bash
# En la terminal donde corre npm run dev
# Busca estos mensajes:

✅ BUENO:
[Baileys] ✅ Socket creado
[Baileys] 📱 QR generado
[Baileys] ✅ Conectado exitosamente

❌ MALO:
[Baileys] 🔌 Conexión cerrada. Código: 401
[Baileys] ❌ Error al conectar
```

---

## 📝 Checklist de Solución

- [ ] Detener servidor (Ctrl+C)
- [ ] Ejecutar `LIMPIAR_Y_RECONECTAR_WHATSAPP.bat`
- [ ] Iniciar servidor (`npm run dev`)
- [ ] Abrir http://localhost:3000
- [ ] Login con tu cuenta
- [ ] Ir a sección WhatsApp
- [ ] Clic en "Conectar WhatsApp"
- [ ] Escanear QR con teléfono
- [ ] Esperar mensaje "✅ Conectado"

---

## 🎯 Después de Conectar

Una vez conectado verás:
```
✅ WhatsApp conectado
📱 Número: +57 XXX XXX XXXX
🟢 Estado: Activo
```

Ahora puedes:
1. Enviar mensajes de prueba
2. Probar el bot con tu número
3. Ver conversaciones en el dashboard

---

## 💡 Prevenir Problemas Futuros

### 1. No cerrar sesión desde WhatsApp
- No desvincula el dispositivo desde el teléfono
- Eso invalida la sesión

### 2. Mantener servidor corriendo
- Si apagas el servidor, WhatsApp se desconecta
- Al reiniciar, reconecta automáticamente

### 3. Backup de sesión (opcional)
```bash
# Copiar carpeta auth_sessions
xcopy auth_sessions auth_sessions_backup /E /I
```

---

## 🚀 Comando Rápido

```bash
# Todo en uno
LIMPIAR_Y_RECONECTAR_WHATSAPP.bat && npm run dev
```

---

**Estado:** 🔧 Solución lista  
**Tiempo:** 2 minutos  
**Dificultad:** Fácil

¡A reconectar! 📱
