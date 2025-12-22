# ⚡ ARREGLAR QR - RÁPIDO

## 🎯 Problema
Sesión de WhatsApp expirada (código 401)

---

## ✅ Solución (2 minutos)

### 1. Ejecutar script
```bash
LIMPIAR_Y_RECONECTAR_WHATSAPP.bat
```

### 2. Iniciar servidor
```bash
npm run dev
```

### 3. Conectar
1. Abre http://localhost:3000
2. Login
3. WhatsApp → Conectar
4. Escanea QR con tu teléfono

---

## 📱 Escanear QR

WhatsApp → ⚙️ Configuración → Dispositivos vinculados → Vincular dispositivo

---

## ⚠️ Si No Funciona

### Manual:
```bash
# Detener servidor (Ctrl+C)
rmdir /s /q auth_sessions
mkdir auth_sessions
npm run dev
```

---

**Tiempo:** 2 minutos  
**Listo!** 🎉
