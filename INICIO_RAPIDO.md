# ⚡ INICIO RÁPIDO - Bot Super Inteligente

## 🚀 3 Pasos para Empezar

### 1️⃣ Instalar (5 minutos)
```bash
# Ejecuta el instalador automático
install-bot-unificado.bat
```

Esto instalará:
- ✅ Todas las dependencias de npm
- ✅ Base de datos Prisma
- ✅ Archivo .env de configuración

### 2️⃣ Configurar API Key (2 minutos)

1. **Obtén tu API Key de Groq (GRATIS)**
   - Ve a: https://console.groq.com
   - Crea una cuenta (es gratis)
   - Ve a "API Keys"
   - Crea una nueva key
   - Cópiala

2. **Agrégala al archivo .env**
   ```env
   # Abre el archivo .env y pega tu key:
   GROQ_API_KEY=gsk_tu_key_aqui
   ```

### 3️⃣ Iniciar el Bot (1 minuto)
```bash
# Ejecuta el iniciador
iniciar-bot-unificado.bat
```

¡Eso es todo! El bot estará corriendo en: **http://localhost:3000**

---

## 📱 Conectar WhatsApp

1. Abre tu navegador en `http://localhost:3000`
2. Ve a la sección "WhatsApp" o "Conexión"
3. Verás un código QR
4. Abre WhatsApp en tu teléfono
5. Ve a **Configuración > Dispositivos vinculados**
6. Toca **"Vincular un dispositivo"**
7. Escanea el código QR
8. ✅ ¡Conectado!

---

## 🎯 Probar el Bot

### Prueba 1: Mensaje de Texto
```
Tú: "Hola, ¿tienes laptops?"
Bot: "¡Hola! 😊 Sí, tenemos laptops disponibles..."
```

### Prueba 2: Mensaje de Voz
```
Tú: [Audio: "Quiero información sobre productos"]
Bot: [Transcribe y responde automáticamente]
```

### Prueba 3: Solicitar Fotos
```
Tú: "Muéstrame fotos de motos"
Bot: [Envía fotos automáticamente]
```

---

## 🎨 Usar el Dashboard

Abre `http://localhost:3000` y verás:

- **📊 Dashboard**: Métricas en tiempo real
- **💬 Conversaciones**: Historial completo
- **📦 Productos**: Gestión de catálogo
- **⚙️ Configuración**: Ajustes del bot
- **📈 Métricas**: Estadísticas detalladas

---

## ❓ Problemas Comunes

### El bot no responde
✅ **Solución**: Verifica que agregaste tu `GROQ_API_KEY` en el archivo `.env`

### No aparece el código QR
✅ **Solución**: Espera 30 segundos, el QR se genera automáticamente

### Error al instalar dependencias
✅ **Solución**: Asegúrate de tener Node.js 18+ instalado
```bash
node --version  # Debe ser v18 o superior
```

### Puerto 3000 ocupado
✅ **Solución**: Cambia el puerto en `.env`:
```env
PORT=3001
```

---

## 📚 Más Información

- **Documentación Completa**: `README_BOT_UNIFICADO.md`
- **Plan de Unificación**: `PLAN_UNIFICACION.md`
- **Resumen Detallado**: `RESUMEN_UNIFICACION.md`

---

## 🆘 Necesitas Ayuda?

1. Revisa los archivos de documentación
2. Verifica que todas las variables de entorno estén configuradas
3. Revisa los logs en la consola
4. Asegúrate de tener una conexión a internet estable

---

## 🎉 ¡Listo!

Tu Bot Super Inteligente está funcionando con:

- ✅ IA avanzada (Groq Llama 3.1)
- ✅ Transcripción de audio
- ✅ Envío inteligente de fotos
- ✅ Dashboard web profesional
- ✅ Métricas en tiempo real

**¡Disfruta tu bot!** 🚀🤖
