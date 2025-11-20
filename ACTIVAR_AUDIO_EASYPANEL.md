# 🎤 Activar Transcripción de Audio en Easypanel

## ✅ Sistema de Audio Implementado

El sistema de transcripción de audio **YA ESTÁ IMPLEMENTADO** y funciona con:
- 🎤 **Groq Whisper API** para transcripción
- 📁 Almacenamiento temporal de audios
- 🗑️ Limpieza automática de archivos antiguos
- ✅ Integración completa con WhatsApp

**Archivo**: `src/lib/audio-transcription-service.ts`

## 🔧 Cómo Funciona

1. Cliente envía **audio de voz** por WhatsApp
2. Bot descarga el audio
3. Envía a **Groq Whisper** para transcripción
4. Recibe el texto transcrito
5. Procesa el texto como mensaje normal
6. Responde al cliente

## ⚙️ Activar en Easypanel

### Paso 1: Ir a Variables de Entorno

1. Ve a **Easypanel**: https://easypanel.io
2. Abre tu proyecto: **Smart Sales Bot Pro**
3. Ve a **"Settings"** → **"Environment Variables"**

### Paso 2: Cambiar Variable

Busca la variable:
```
AUDIO_ENABLED=false
```

Cámbiala a:
```
AUDIO_ENABLED=true
```

### Paso 3: Rebuild

1. Ve a **"Source"** → **"Rebuild"**
2. Espera 2-5 minutos
3. ¡Listo!

## 🧪 Probar el Audio

Una vez activado, prueba enviando:

1. **Audio de voz** por WhatsApp
2. Di: "Hola, me interesa el curso de piano"
3. El bot transcribirá tu audio y responderá

## 📊 Logs de Audio

En los logs verás:
```
[Audio] 🎤 Iniciando transcripción...
[Audio] 🎵 Audio detectado: audio/ogg
[Audio] 💾 Guardado: audio_1234567890_abc123.ogg
[Audio] 🌐 Enviando a Groq Whisper...
[Audio] ✅ Transcripción completada en 1234ms
[Audio] 📝 Texto: "hola me interesa el curso de piano"
```

## 🔑 Requisitos

- ✅ `GROQ_API_KEY` configurada (ya está)
- ✅ `AUDIO_ENABLED=true` (cambiar en Easypanel)
- ✅ Servicio implementado (ya está)

## ⚠️ Notas Importantes

### Formatos Soportados
- ✅ Audio de voz de WhatsApp (OGG)
- ✅ Notas de voz
- ❌ Videos (solo audio)

### Límites
- Groq Whisper es **GRATIS** hasta cierto límite
- Procesa audios de hasta **25 MB**
- Transcripción en **español** e **inglés**

### Limpieza Automática
- Archivos temporales se eliminan después de transcribir
- Limpieza automática cada hora de archivos antiguos
- Carpeta: `temp-audio/`

## 🚀 Ventajas

1. **Accesibilidad**: Clientes pueden hablar en lugar de escribir
2. **Comodidad**: Más rápido que escribir mensajes largos
3. **Natural**: Conversación más fluida
4. **Inclusivo**: Para personas con dificultad para escribir

## 📝 Ejemplo de Uso

**Cliente** (envía audio): 🎤 "Hola, buenos días, me gustaría saber más información sobre el curso de piano que tienen disponible"

**Bot transcribe**: "hola buenos dias me gustaria saber mas informacion sobre el curso de piano que tienen disponible"

**Bot responde**: 
```
¡Hola! 👋 ¿Cómo estás?

Te cuento sobre el Curso Completo de Piano Online 🎹

📚 Aprende piano desde cero hasta nivel avanzado
💰 Precio: $60,000 COP
✅ Disponible: Inmediato

¿Te gustaría comprarlo? 😊
```

---

**Fecha**: 20 Noviembre 2025
**Estado**: Listo para activar
**Tiempo**: 2 minutos
