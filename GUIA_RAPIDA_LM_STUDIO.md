# 🚀 Guía Rápida: Configurar LM Studio (5 minutos)

## 📥 Paso 1: Descargar e Instalar (2 min)

1. Ve a: **https://lmstudio.ai/**
2. Haz clic en **"Download for Windows"**
3. Instala el programa (siguiente → siguiente → instalar)
4. Abre LM Studio

## 📦 Paso 2: Descargar Modelo (2 min)

1. En LM Studio, haz clic en el icono de **búsqueda** (🔍) en la barra lateral
2. En el buscador, escribe: **phi-2**
3. Busca: **"microsoft/phi-2"** o **"TheBloke/phi-2"**
4. Haz clic en el botón **"Download"** (descarga)
5. Espera a que descargue (2-3 minutos, ~2.7GB)

### Modelos Recomendados

| Modelo | Tamaño | Velocidad | Calidad |
|--------|--------|-----------|---------|
| **phi-2** ⭐ | 2.7GB | ⚡⚡⚡ Muy rápido | ⭐⭐⭐ Buena |
| llama-3.2-3b | 3GB | ⚡⚡ Rápido | ⭐⭐⭐⭐ Muy buena |
| mistral-7b | 7GB | ⚡ Normal | ⭐⭐⭐⭐⭐ Excelente |

**Recomendación**: Empieza con **phi-2** (más rápido y ligero)

## ⚙️ Paso 3: Activar Servidor API (30 seg)

1. Haz clic en el icono de **Settings** (⚙️) en la esquina superior derecha
2. Busca la sección **"Server"**
3. Activa el switch: **"Enable local REST API server"** ✅
4. Verifica que diga:
   - **Port**: 1234
   - **URL**: http://localhost:1234

## 🎮 Paso 4: Cargar el Modelo (30 seg)

1. Haz clic en el icono de **Chat** (💬) en la barra lateral
2. En la parte superior, haz clic en **"Select a model"**
3. Elige el modelo que descargaste: **phi-2**
4. Espera a que cargue (verás una barra de progreso)
5. Cuando esté listo, verás: **"Model loaded"** ✅

## ✅ Paso 5: Probar (1 min)

### Opción 1: Probar en LM Studio

1. En la pestaña **Chat**, escribe: "Hola"
2. Presiona Enter
3. Deberías recibir una respuesta

### Opción 2: Probar desde tu Bot

```bash
# Ejecuta este archivo
probar-lmstudio.bat
```

Deberías ver:
```
✅ LM Studio está ejecutándose!
✅ RESPUESTA RECIBIDA
```

## 🎯 Verificación Rápida

### Checklist

- [ ] LM Studio instalado y abierto
- [ ] Modelo phi-2 descargado
- [ ] Servidor API activado (puerto 1234)
- [ ] Modelo cargado en Chat
- [ ] Probado con mensaje de prueba

### Comando de Verificación

```bash
probar-lmstudio.bat
```

## 🔧 Solución de Problemas

### Problema: "fetch failed"

**Causa**: LM Studio no está ejecutándose o el servidor no está activo

**Solución**:
1. Abre LM Studio
2. Ve a Settings (⚙️)
3. Activa "Enable local REST API server"
4. Verifica que el puerto sea 1234

### Problema: "Model not loaded"

**Causa**: No hay modelo cargado

**Solución**:
1. Ve a la pestaña Chat (💬)
2. Haz clic en "Select a model"
3. Elige phi-2
4. Espera a que cargue completamente

### Problema: "Respuestas muy lentas"

**Causa**: Modelo muy grande o PC lento

**Solución**:
1. Usa phi-2 (el más rápido)
2. Cierra otros programas
3. En Settings → Performance:
   - Activa GPU Acceleration (si tienes GPU)
   - Reduce Context Length a 1024

### Problema: "Connection refused"

**Causa**: Puerto incorrecto o servidor no iniciado

**Solución**:
1. Verifica en Settings que el puerto sea 1234
2. Desactiva y vuelve a activar el servidor
3. Reinicia LM Studio si es necesario

## 💡 Tips

### Mantener LM Studio Ejecutándose

Para que tu bot siempre tenga respaldo:

1. Inicia LM Studio con Windows (opcional)
2. Minimiza a la bandeja del sistema
3. Deja el modelo cargado

### Verificar que Funciona

Abre en tu navegador:
```
http://localhost:1234/v1/models
```

Deberías ver algo como:
```json
{
  "object": "list",
  "data": [
    {
      "id": "phi-2",
      ...
    }
  ]
}
```

## 🎉 ¡Listo!

Ahora tienes LM Studio configurado y funcionando.

### Próximos Pasos

1. ✅ Ejecuta: `probar-lmstudio.bat`
2. ✅ Verifica que funcione
3. ✅ Inicia tu bot: `npm run dev`
4. ✅ El bot usará LM Studio automáticamente si Groq falla

## 📊 Ventajas de LM Studio

- ✅ **Sin límites**: Usa cuanto quieras
- ✅ **Sin costo**: 100% gratis
- ✅ **Sin internet**: Funciona offline
- ✅ **Privado**: Todo local en tu PC
- ✅ **Rápido**: phi-2 responde en ~2 segundos

---

**¿Necesitas ayuda?**

1. Ejecuta: `probar-lmstudio.bat`
2. Lee los mensajes de error
3. Sigue las soluciones sugeridas
4. Verifica el checklist arriba
