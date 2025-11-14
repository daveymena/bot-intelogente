# 🔍 Diagnóstico: Audio No Llega al Bot

## ✅ Verificaciones

### 1. **¿Reiniciaste el servidor?**
```bash
# Detener (Ctrl+C) y reiniciar
npm run dev
```

### 2. **¿El bot está conectado?**
Verifica en el dashboard que WhatsApp esté conectado (verde).

### 3. **¿Qué logs aparecen cuando envías audio?**

#### Logs Esperados:
```
[Baileys] 📨 Mensaje recibido de 573001234567@s.whatsapp.net
[Baileys] 🎤 Audio recibido de 573001234567@s.whatsapp.net
[Audio] 🎤 Iniciando transcripción...
[Audio] 💾 Guardado: audio_xxx.ogg
[Audio] 🌐 Enviando a Groq Whisper...
[Audio] ✅ Transcripción completada
[Baileys] ✅ Audio transcrito: "tu mensaje"
```

#### Si NO aparece nada:
- El manejador de mensajes NO se está ejecutando
- Verifica que WhatsApp esté conectado

#### Si aparece error:
- Copia el error completo

## 🐛 Posibles Problemas

### Problema 1: No aparece "[Baileys] 📨 Mensaje recibido"
**Causa:** El manejador de mensajes no se configuró
**Solución:** Reiniciar el servidor

### Problema 2: Aparece mensaje pero no "🎤 Audio recibido"
**Causa:** El audio no se está detectando correctamente
**Solución:** Verificar el código de detección

### Problema 3: Error "GROQ_API_KEY no configurada"
**Causa:** Falta la variable de entorno
**Solución:** Agregar en `.env`:
```env
GROQ_API_KEY=tu_api_key_aqui
```

### Problema 4: Error al descargar audio
**Causa:** Problema con Baileys
**Solución:** Verificar que la conexión esté estable

## 🧪 Prueba Manual

1. Abre la terminal donde corre el servidor
2. Envía un mensaje de texto → Debería aparecer log
3. Envía un audio → Debería aparecer log diferente
4. Copia todos los logs y compártelos

## 📋 Checklist

- [ ] Servidor reiniciado
- [ ] WhatsApp conectado (verde en dashboard)
- [ ] GROQ_API_KEY configurada en .env
- [ ] Logs visibles en terminal
- [ ] Audio enviado desde WhatsApp

## 🔧 Si Nada Funciona

Ejecuta este comando para ver si hay errores:

```bash
cd botexperimento
npm run dev 2>&1 | findstr /i "baileys audio error"
```

---

**Siguiente paso:** Envía un audio y copia TODOS los logs que aparezcan
