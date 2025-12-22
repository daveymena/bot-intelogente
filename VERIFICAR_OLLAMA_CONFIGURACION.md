# 🔍 VERIFICAR CONFIGURACIÓN DE OLLAMA

## ⚠️ PROBLEMAS DETECTADOS

### 1. Ollama devuelve 404
```
[Orchestrator] ⚠️ Ollama falló: Ollama HTTP 404
```

**Causa:** El modelo `llama3.2:3b` no está instalado en el servidor Ollama.

### 2. Error de Prisma con tags
```
Unknown argument `has`. Did you mean `in`?
```

**Causa:** Sintaxis incorrecta de Prisma para arrays.  
**Solución:** ✅ Ya corregido (cambié `has` por `hasSome`)

---

## ✅ SOLUCIONES APLICADAS

### 1. Configuración Corregida en .env

```bash
# OLLAMA (Principal)
OLLAMA_URL=https://davey-ollama2.mapf5v.easypanel.host
OLLAMA_MODEL=llama3.2:3b
OLLAMA_MODEL_FAST=gemma2:2b
OLLAMA_TIMEOUT=45000  # 45 segundos (más tiempo)
```

### 2. Error de Prisma Corregido

```typescript
// ANTES (❌ Error)
{ tags: { has: keyword } }

// AHORA (✅ Correcto)
{ tags: { hasSome: [keyword] } }
```

### 3. Timeout Aumentado

- **Antes:** 20 segundos
- **Ahora:** 45 segundos (más tiempo para Ollama)

---

## 🚀 PASOS PARA VERIFICAR

### Paso 1: Verificar Configuración

```bash
VERIFICAR_OLLAMA_AHORA.bat
```

Este script hace:
1. ✅ Verifica conexión a Ollama
2. ✅ Lista modelos disponibles
3. ✅ Verifica que `llama3.2:3b` esté instalado
4. ✅ Prueba generación de texto

### Paso 2: Instalar Modelo (si no existe)

Si el modelo no está instalado, ejecutar en **Easypanel**:

```bash
# Conectar al contenedor de Ollama
docker exec -it <ollama-container> bash

# Instalar modelo
ollama pull llama3.2:3b

# Verificar instalación
ollama list
```

### Paso 3: Probar Solo Ollama

```bash
npx tsx scripts/test-solo-ollama.ts
```

Esto prueba Ollama **sin fallbacks** para verificar que funciona correctamente.

---

## 🔧 MODELOS DISPONIBLES

### Recomendados para Producción

| Modelo | Tamaño | Velocidad | Calidad | Uso |
|--------|--------|-----------|---------|-----|
| **llama3.2:3b** | 3B | ⚡⚡⚡ | ⭐⭐⭐⭐ | Principal |
| **gemma2:2b** | 2B | ⚡⚡⚡⚡ | ⭐⭐⭐ | Rápido |
| **mistral:7b** | 7B | ⚡⚡ | ⭐⭐⭐⭐⭐ | Calidad |

### Instalar Modelos

```bash
# Modelo principal (recomendado)
ollama pull llama3.2:3b

# Modelo rápido (alternativa)
ollama pull gemma2:2b

# Modelo de alta calidad (si tienes recursos)
ollama pull mistral:7b
```

---

## 📊 VERIFICAR ESTADO ACTUAL

### 1. Verificar Conexión

```bash
curl https://davey-ollama2.mapf5v.easypanel.host/api/tags
```

**Respuesta esperada:**
```json
{
  "models": [
    {
      "name": "llama3.2:3b",
      "modified_at": "2024-11-26T...",
      "size": 2000000000
    }
  ]
}
```

### 2. Verificar Generación

```bash
curl -X POST https://davey-ollama2.mapf5v.easypanel.host/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:3b",
    "prompt": "Responde en una palabra: ¿Capital de Colombia?",
    "stream": false
  }'
```

**Respuesta esperada:**
```json
{
  "model": "llama3.2:3b",
  "response": "Bogotá",
  "done": true
}
```

---

## 🐛 TROUBLESHOOTING

### Problema: 404 Not Found

**Causa:** Modelo no instalado

**Solución:**
```bash
ollama pull llama3.2:3b
```

### Problema: Timeout

**Causa:** Modelo muy lento o servidor sobrecargado

**Solución:**
1. Usar modelo más rápido: `gemma2:2b`
2. Aumentar timeout en código
3. Verificar recursos del servidor

### Problema: Connection Refused

**Causa:** Ollama no está corriendo

**Solución:**
1. Verificar que el contenedor esté activo en Easypanel
2. Verificar la URL correcta
3. Verificar firewall/puertos

### Problema: Respuestas de Baja Calidad

**Causa:** Modelo muy pequeño o temperatura incorrecta

**Solución:**
1. Usar modelo más grande: `mistral:7b`
2. Ajustar temperatura (0.5-0.9)
3. Mejorar el prompt

---

## 📝 SCRIPTS CREADOS

### 1. `scripts/verificar-ollama-simple.ts`
Verifica configuración básica de Ollama

### 2. `scripts/test-solo-ollama.ts`
Prueba Ollama sin fallbacks

### 3. `VERIFICAR_OLLAMA_AHORA.bat`
Ejecuta ambos scripts automáticamente

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Ollama responde en `/api/tags`
- [ ] Modelo `llama3.2:3b` está instalado
- [ ] Genera texto correctamente
- [ ] Tiempo de respuesta < 10 segundos
- [ ] No hay errores de Prisma
- [ ] Variables de entorno correctas

---

## 🎯 PRÓXIMOS PASOS

### 1. Ejecutar Verificación
```bash
VERIFICAR_OLLAMA_AHORA.bat
```

### 2. Si Todo Está OK
```bash
# Probar el orquestador completo
npx tsx scripts/test-ollama-orchestrator.ts
```

### 3. Si Hay Problemas
- Revisar logs de Easypanel
- Verificar que el modelo esté instalado
- Probar con modelo alternativo (`gemma2:2b`)

---

## 📞 COMANDOS ÚTILES

### Ver Logs de Ollama (Easypanel)
```bash
docker logs <ollama-container> --tail 100 -f
```

### Listar Modelos Instalados
```bash
ollama list
```

### Eliminar Modelo (si necesitas espacio)
```bash
ollama rm <modelo>
```

### Ver Uso de Recursos
```bash
docker stats <ollama-container>
```

---

## 🎉 RESULTADO ESPERADO

Después de la verificación, deberías ver:

```
✅ Conexión exitosa!
✅ Modelo "llama3.2:3b" está disponible
✅ Respuesta generada en 3500ms
✅ Respuesta correcta! Ollama está funcionando bien.

✅ OLLAMA ESTÁ CORRECTAMENTE CONFIGURADO
```

---

**Creado:** 26 Nov 2025  
**Estado:** 🔧 Pendiente de verificación  
**Prioridad:** 🔴 Alta
