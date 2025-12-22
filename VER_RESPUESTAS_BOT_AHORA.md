# 📊 Ver Respuestas del Bot

## ⚠️ Problema Actual

WhatsApp está **DESCONECTADO** (código 401 - logged out)

```
[Baileys] 🚪 Usuario cerró sesión (logged out), no reconectar
```

## ✅ Solución

### 1. Reconectar WhatsApp

```bash
# Opción 1: Script automático
RECONECTAR_WHATSAPP_AHORA.bat

# Opción 2: Manual
rmdir /s /q auth_sessions
npm run dev
# Escanea el QR
```

### 2. Probar Respuestas

Una vez conectado, envía por WhatsApp:

```
"Curso de Piano"
```

### 3. Ver Logs en Consola

Busca en la consola:

```
[SearchAgent] 🦙 Usando Ollama con acceso a base de datos
[SearchAgent] 📦 Cargados XX productos de la BD
[Ollama] 🚀 Usando modelo: gemma2:4b
[SearchAgent] 🦙 Ollama respondió: ...
[SearchAgent] 🎨 Generando respuesta profesional para: ...
```

## 📋 Qué Buscar en la Respuesta

La respuesta debe tener:

✅ **Saludo profesional**:
```
¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**
```

✅ **Emoji del producto**:
```
🎹 **Curso de Piano Completo**
```

✅ **Precio formateado**:
```
💰 **Precio:** 50,000 COP
```

✅ **Características con bullets**:
```
✨ **Características destacadas:**
• Beneficio 1
• Beneficio 2
• Beneficio 3
```

✅ **Métodos de pago**:
```
💳 **¿Cómo prefieres pagar?**
- MercadoPago (tarjetas, PSE)
- PayPal (internacional)
- Nequi / Daviplata
```

## ❌ Lo Que NO Debe Aparecer

- ❌ Respuestas sin emojis
- ❌ Formato plano sin estructura
- ❌ "¿Te interesa?" (debe ser directo)
- ❌ Texto sin saltos de línea

## 🔍 Comandos de Diagnóstico

### Ver logs en tiempo real
```bash
# En PowerShell
Get-Content server-electron.log -Wait -Tail 50
```

### Ver últimos mensajes del bot
```bash
Get-Content server-electron.log -Tail 100 | Select-String "Ollama respondió"
```

### Ver errores
```bash
Get-Content server-electron.log -Tail 100 | Select-String "Error"
```

## 🚀 Flujo Completo

1. **Reconectar WhatsApp**
   ```bash
   RECONECTAR_WHATSAPP_AHORA.bat
   ```

2. **Iniciar bot**
   ```bash
   npm run dev
   ```

3. **Escanear QR**
   - Abre WhatsApp en tu teléfono
   - Ve a Dispositivos vinculados
   - Escanea el QR de la consola

4. **Probar**
   - Envía: "Curso de Piano"
   - Espera respuesta

5. **Verificar logs**
   - Busca: `[SearchAgent] 🎨 Generando respuesta profesional`
   - Verifica que tenga emojis y formato

## 📝 Ejemplo de Log Correcto

```
[SearchAgent] 🦙 Usando Ollama con acceso a base de datos
[SearchAgent] 📦 Cargados 68 productos de la BD
[Ollama] 🚀 Usando modelo: gemma2:4b
[Ollama] ⚡ Respuesta en 4500ms
[SearchAgent] 🦙 Ollama respondió: ¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**...
[SearchAgent] 🎨 Generando respuesta profesional para: Curso de Piano Completo
[SearchAgent] ✅ Ollama seleccionó 1 productos directamente
```

## ⚠️ Si Sigue Sin Funcionar

1. Verifica que Ollama esté corriendo:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Verifica el modelo:
   ```bash
   ollama list
   ```

3. Prueba Ollama directamente:
   ```bash
   ollama run gemma2:4b "Hola"
   ```

4. Revisa variables en `.env`:
   ```env
   OLLAMA_ENABLED=true
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=gemma2:4b
   ```
