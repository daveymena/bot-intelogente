# 🎤📸 Audio y Fotos Activados en Baileys

## ✅ Cambios Aplicados

### 1. **Servicio de Transcripción de Audio** (NUEVO)
Creado `src/lib/audio-transcription-service.ts`:
- ✅ Transcripción con Groq Whisper API
- ✅ Soporte para audio de WhatsApp (OGG)
- ✅ Limpieza automática de archivos temporales
- ✅ Manejo de errores robusto

### 2. **Integración en Baileys**
Modificado `src/lib/baileys-stable-service.ts`:
- ✅ Detección de mensajes de audio
- ✅ Descarga y transcripción automática
- ✅ Detección de imágenes con caption
- ✅ Procesamiento de texto, audio e imágenes

## 🎯 Funcionalidades

### Audio 🎤
```
Cliente: [Envía audio de voz]
Bot: [Transcribe el audio automáticamente]
Bot: [Responde al texto transcrito]
```

**Proceso:**
1. Cliente envía audio de WhatsApp
2. Bot descarga el audio
3. Bot guarda temporalmente
4. Bot transcribe con Groq Whisper
5. Bot procesa como mensaje de texto
6. Bot responde normalmente

### Imágenes 📸
```
Cliente: [Envía foto con caption "Mira esto"]
Bot: [Detecta la imagen y el caption]
Bot: [Responde: "Mira esto"]
```

**Proceso:**
1. Cliente envía imagen
2. Bot detecta la imagen
3. Bot extrae el caption (si existe)
4. Bot usa el caption como mensaje
5. Si no hay caption, usa texto por defecto

## 🔧 Configuración Requerida

### Variables de Entorno
```env
GROQ_API_KEY=tu_api_key_aqui
```

### Dependencias
Ya instaladas en el proyecto:
- `@whiskeysockets/baileys` - WhatsApp
- `form-data` - Para enviar audio a Groq
- `node-fetch` - Para llamadas HTTP

## 🧪 Cómo Probar

### Probar Audio
1. Conecta WhatsApp desde el dashboard
2. Envía un mensaje de voz al bot
3. El bot debería:
   - Mostrar en logs: `🎤 Audio recibido`
   - Mostrar: `✅ Audio transcrito: "tu mensaje"`
   - Responder al contenido del audio

### Probar Imágenes
1. Envía una imagen con caption
2. El bot debería:
   - Mostrar en logs: `📸 Imagen recibida`
   - Procesar el caption como mensaje
   - Responder según el caption

## 📊 Logs Esperados

### Audio Exitoso
```
[Baileys] 🎤 Audio recibido de 573001234567@s.whatsapp.net
[Audio] 🎤 Iniciando transcripción...
[Audio] 🎵 Audio detectado: audio/ogg
[Audio] 💾 Guardado: audio_1699123456789.ogg
[Audio] 🌐 Enviando a Groq Whisper...
[Audio] ✅ Transcripción completada en 1234ms
[Audio] 📝 Texto: "hola quiero comprar un portátil"
[Baileys] ✅ Audio transcrito: "hola quiero comprar un portátil"
[Baileys] 📨 Mensaje procesado de 573001234567@s.whatsapp.net: hola quiero comprar un portátil
```

### Imagen Exitosa
```
[Baileys] 📸 Imagen recibida de 573001234567@s.whatsapp.net
[Baileys] 📨 Mensaje procesado de 573001234567@s.whatsapp.net: Mira este producto
```

## ⚠️ Errores Comunes

### Error: GROQ_API_KEY no configurada
**Solución:** Agrega la variable de entorno en `.env`

### Error: No se pudo descargar el audio
**Solución:** Verifica que Baileys esté conectado correctamente

### Error: Groq API error: 413
**Solución:** El audio es muy largo, Groq tiene límite de tamaño

## 🎯 Próximos Pasos

### Para Mejorar:
1. **Envío de Fotos**: Agregar capacidad de enviar fotos de productos
2. **Análisis de Imágenes**: Usar IA para analizar qué hay en las fotos
3. **Audio de Respuesta**: Generar respuestas en audio
4. **Stickers**: Soporte para stickers

### Para Producción:
1. Configurar límites de tamaño de audio
2. Agregar caché de transcripciones
3. Implementar rate limiting
4. Monitoreo de uso de Groq API

## 📝 Archivos Modificados

1. **NUEVO**: `src/lib/audio-transcription-service.ts`
   - Servicio completo de transcripción

2. **MODIFICADO**: `src/lib/baileys-stable-service.ts`
   - Agregado soporte para audio
   - Agregado soporte para imágenes
   - Import de `downloadMediaMessage`

## 🚀 Estado

✅ **Implementado y listo para usar**

El bot ahora puede:
- ✅ Recibir y transcribir audios
- ✅ Recibir imágenes con caption
- ✅ Procesar todo como mensajes de texto
- ✅ Responder normalmente

---

**Fecha:** 5 de noviembre, 2025
**Estado:** ✅ Completado
**Tecnología:** Baileys + Groq Whisper
