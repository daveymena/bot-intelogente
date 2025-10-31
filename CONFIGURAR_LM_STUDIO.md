# 🎮 Cómo Configurar LM Studio (Paso a Paso)

## 📥 Paso 1: Descargar e Instalar

1. Ve a: **https://lmstudio.ai/**
2. Descarga la versión para Windows
3. Instala el programa (siguiente, siguiente, instalar)
4. Abre LM Studio

## 📦 Paso 2: Descargar un Modelo

1. En LM Studio, ve a la pestaña **"Search"** (🔍)
2. Busca: **"phi-2"**
3. Encuentra: **"microsoft/phi-2"**
4. Haz clic en **"Download"**
5. Espera a que descargue (puede tardar unos minutos)

### Modelos Recomendados

| Modelo | Tamaño | Velocidad | Calidad | Recomendado Para |
|--------|--------|-----------|---------|------------------|
| **phi-2** | 2.7GB | ⚡⚡⚡ | ⭐⭐⭐ | **Respuestas rápidas** |
| llama-3.2-3b | 3GB | ⚡⚡ | ⭐⭐⭐⭐ | Conversaciones |
| mistral-7b | 7GB | ⚡ | ⭐⭐⭐⭐⭐ | Máxima calidad |

**Recomendación**: Empieza con **phi-2** (rápido y ligero)

## ⚙️ Paso 3: Activar el Servidor API

1. Ve a **Settings** (⚙️) en la esquina superior derecha
2. Busca la sección **"Server"**
3. Activa: **"Enable local REST API server"**
4. Verifica que el puerto sea: **1234**
5. Verifica que la URL sea: **http://localhost:1234**

### Configuración Recomendada

```
✅ Enable local REST API server: ON
✅ Port: 1234
✅ CORS: Enabled
✅ Auto-start server: ON (opcional)
```

## 🚀 Paso 4: Cargar el Modelo

1. Ve a la pestaña **"Chat"** (💬)
2. En la parte superior, haz clic en **"Select a model"**
3. Elige el modelo que descargaste (phi-2)
4. Espera a que cargue (verás una barra de progreso)
5. Cuando esté listo, verás: **"Model loaded"**

## ✅ Paso 5: Verificar que Funciona

### Opción 1: Probar en LM Studio

1. En la pestaña **"Chat"**, escribe un mensaje
2. Ejemplo: "Hola, ¿cómo estás?"
3. Presiona Enter
4. Deberías recibir una respuesta

### Opción 2: Probar desde tu Bot

```bash
# Ejecuta el script de prueba
probar-multi-provider.bat
```

Deberías ver:
```
✅ LMSTUDIO: FUNCIONANDO
```

## 🔧 Configuración Avanzada (Opcional)

### Ajustar Rendimiento

En **Settings** → **Performance**:

```
GPU Acceleration: ON (si tienes GPU)
CPU Threads: Auto (o ajusta según tu PC)
Context Length: 2048 (suficiente para chat)
```

### Ajustar Calidad de Respuestas

En la pestaña **"Chat"** → **Settings**:

```
Temperature: 0.7 (creatividad moderada)
Top P: 0.9 (diversidad de respuestas)
Max Tokens: 500 (longitud de respuesta)
```

## 🎯 Verificación Final

### Checklist

- [ ] LM Studio instalado y abierto
- [ ] Modelo phi-2 descargado
- [ ] Servidor API activado (puerto 1234)
- [ ] Modelo cargado en Chat
- [ ] Probado con mensaje de prueba
- [ ] Script `probar-multi-provider.bat` muestra ✅

## 🔍 Solución de Problemas

### Problema: "Model not loaded"

**Solución**:
1. Ve a la pestaña **"Chat"**
2. Haz clic en **"Select a model"**
3. Elige phi-2
4. Espera a que cargue completamente

### Problema: "Server not running"

**Solución**:
1. Ve a **Settings** (⚙️)
2. Desactiva y vuelve a activar **"Enable local REST API server"**
3. Verifica que el puerto sea 1234
4. Reinicia LM Studio si es necesario

### Problema: "Connection refused"

**Solución**:
1. Verifica que LM Studio esté abierto
2. Verifica que el servidor esté activado
3. Verifica que el modelo esté cargado
4. Prueba acceder a: http://localhost:1234/v1/models
   - Deberías ver una lista de modelos

### Problema: "Respuestas muy lentas"

**Solución**:
1. Usa un modelo más pequeño (phi-2)
2. Activa GPU Acceleration en Settings
3. Reduce Context Length a 1024
4. Cierra otros programas pesados

## 💡 Tips y Trucos

### Mantener LM Studio Ejecutándose

Para que tu bot siempre tenga respaldo:

1. Configura LM Studio para iniciar con Windows
2. Activa **"Auto-start server"** en Settings
3. Minimiza LM Studio a la bandeja del sistema

### Usar Múltiples Modelos

Puedes tener varios modelos descargados:

1. Descarga phi-2 (rápido)
2. Descarga llama-3.2-3b (mejor calidad)
3. Cambia entre ellos según necesites

En tu `.env`:
```env
LM_STUDIO_MODEL=phi-2
# O
LM_STUDIO_MODEL=llama-3.2-3b
```

### Monitorear Uso

En LM Studio puedes ver:
- Tokens por segundo
- Uso de memoria
- Tiempo de respuesta

Esto te ayuda a optimizar el rendimiento.

## 🎉 ¡Listo!

Ahora tienes LM Studio configurado y funcionando.

Tu bot puede usar esta IA local:
- ✅ Sin límites de uso
- ✅ Sin costo
- ✅ Sin necesidad de internet
- ✅ Respuestas rápidas

## 🚀 Siguiente Paso

Ejecuta el script de prueba:

```bash
probar-multi-provider.bat
```

Deberías ver:
```
✅ GROQ: FUNCIONANDO
✅ LMSTUDIO: FUNCIONANDO

🎉 Tu bot tiene respaldo automático!
```

---

**¿Necesitas ayuda?**

1. Revisa la sección de Solución de Problemas
2. Verifica que LM Studio esté ejecutándose
3. Prueba con el script `probar-multi-provider.bat`
4. Lee `GUIA_MULTI_PROVIDER_IA.md` para más detalles
