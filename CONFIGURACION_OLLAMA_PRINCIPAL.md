# 🚀 Configuración: Ollama como IA Principal

**Fecha**: 22 de Noviembre 2025  
**Propósito**: Probar Ollama en Easypanel como proveedor principal de IA

---

## 🎯 Configuración

### IA Principal: **Ollama**
- **URL**: `https://ollama-ollama.sqaoeo.easypanel.host`
- **Modelo**: `llama3:8b-instruct-q2_K`
- **Tamaño**: 2.96 GB
- **Velocidad**: 2-8 segundos
- **Costo**: **GRATIS** (sin límites)

### Fallback: **Groq**
- Se activa si Ollama falla
- Requiere API keys configuradas
- Límites: 30 req/min por key

---

## 📝 Activar Configuración

### Opción 1: Script Automático
```bash
ACTIVAR_OLLAMA_PRINCIPAL.bat
```

### Opción 2: Manual
1. Copiar `.env.ollama-principal` a `.env`
2. Editar `.env` y agregar:
   - `GROQ_API_KEY_1`, `GROQ_API_KEY_2`, `GROQ_API_KEY_3`
   - `DATABASE_URL`
3. Reiniciar servidor: `npm run dev`

---

## ⚙️ Variables Clave

```env
# IA Principal
AI_PROVIDER=ollama
OLLAMA_BASE_URL=https://ollama-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=llama3:8b-instruct-q2_K

# Fallback
AI_FALLBACK_ENABLED=true
GROQ_API_KEY_1=gsk_...
GROQ_API_KEY_2=gsk_...
GROQ_API_KEY_3=gsk_...

# Configuración IA
AI_MAX_TOKENS=500
AI_TEMPERATURE=0.7
AI_TIMEOUT=30000
```

---

## 📊 Comparación: Ollama vs Groq

| Característica | Ollama | Groq |
|----------------|--------|------|
| **Velocidad** | 2-8s | 1-3s |
| **Costo** | Gratis | Gratis (con límites) |
| **Límites** | Sin límites | 30 req/min |
| **Privacidad** | Tu servidor | Externo |
| **Calidad** | Buena | Excelente |
| **Disponibilidad** | 99%+ | 99%+ |

---

## 🎯 Ventajas de Ollama Principal

### ✅ Ventajas:
1. **Sin límites de tokens** - Usa todo lo que necesites
2. **Gratis** - No gastas en APIs externas
3. **Privado** - Datos en tu servidor
4. **Predecible** - Sin rate limits
5. **Fallback a Groq** - Si algo falla

### ⚠️ Consideraciones:
1. **Velocidad** - 2-8s (vs 1-3s de Groq)
2. **Calidad** - Buena pero no excelente
3. **Dependencia** - Requiere servidor Ollama activo

---

## 🧪 Probar Configuración

### Test 1: Verificar Ollama
```bash
probar-ollama-easypanel.bat
```

### Test 2: Probar Bot Completo
```bash
npm run dev
```
Luego envía "Hola" por WhatsApp

### Test 3: Verificar Fallback
1. Detén el servidor Ollama
2. El sistema debe usar Groq automáticamente

---

## 🔄 Flujo de Funcionamiento

```
Usuario envía mensaje
        ↓
Sistema intenta Bot Local
        ↓
¿Necesita IA?
        ↓
    Sí → Ollama (Principal)
        ↓
    ¿Ollama responde?
        ↓
    No → Groq (Fallback)
        ↓
    Respuesta al usuario
```

---

## 📈 Métricas Esperadas

### Con Ollama Principal:

| Métrica | Valor |
|---------|-------|
| Tiempo respuesta | 2-8s |
| Costo por mensaje | $0.00 |
| Límite diario | Ilimitado |
| Calidad respuestas | 8/10 |
| Disponibilidad | 99%+ |

### Comparado con Groq:

| Métrica | Ollama | Groq |
|---------|--------|------|
| Velocidad | 🟡 2-8s | 🟢 1-3s |
| Costo | 🟢 $0 | 🟢 $0 |
| Límites | 🟢 Sin límites | 🟡 30/min |
| Calidad | 🟡 Buena | 🟢 Excelente |

---

## 🔧 Troubleshooting

### Problema: Ollama no responde
**Solución**: 
1. Verificar que el servidor esté activo
2. Probar: `probar-ollama-easypanel.bat`
3. El sistema usará Groq automáticamente

### Problema: Respuestas lentas
**Solución**:
1. Normal: 2-8 segundos
2. Si >10s, verificar servidor Ollama
3. Considerar volver a Groq como principal

### Problema: Respuestas de baja calidad
**Solución**:
1. Ajustar `AI_TEMPERATURE` (0.5-0.9)
2. Mejorar prompts del sistema
3. Considerar usar Groq para casos complejos

---

## 🚀 Volver a Groq como Principal

Si Ollama no funciona bien:

```bash
# Editar .env
AI_PROVIDER=groq
```

O usar:
```bash
copy .env.easypanel.optimizado .env
```

---

## 📝 Notas Importantes

1. **Backup automático**: El script hace backup del `.env` actual
2. **Groq como fallback**: Siempre configurado por seguridad
3. **Sin límites**: Ollama no tiene límites de uso
4. **Velocidad aceptable**: 2-8s es razonable para la mayoría de casos
5. **Gratis**: No gastas en APIs externas

---

## ✅ Checklist de Activación

- [ ] Ejecutar `ACTIVAR_OLLAMA_PRINCIPAL.bat`
- [ ] Editar `.env` con tus API keys de Groq
- [ ] Editar `.env` con tu `DATABASE_URL`
- [ ] Probar: `probar-ollama-easypanel.bat`
- [ ] Reiniciar servidor: `npm run dev`
- [ ] Probar bot por WhatsApp
- [ ] Monitorear velocidad y calidad

---

## 🎉 Resultado Esperado

Con Ollama como principal:
- ✅ Sin límites de tokens
- ✅ Costo $0
- ✅ Privacidad total
- ✅ Fallback a Groq si falla
- ⚡ Velocidad: 2-8 segundos (aceptable)
- 📊 Calidad: Buena (8/10)

---

**Listo para probar!** 🚀

Ejecuta: `ACTIVAR_OLLAMA_PRINCIPAL.bat`
