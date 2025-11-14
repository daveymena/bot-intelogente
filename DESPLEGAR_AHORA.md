# 🚀 DESPLEGAR A EASYPANEL - GUÍA RÁPIDA

## ✅ Cambios Realizados en Esta Sesión

### 1. Sistema de IA Mejorado
- ✅ Groq como IA principal (ultra rápido 1-2s)
- ✅ Ollama como fallback (gratis e ilimitado)
- ✅ Base de conocimiento local (158+ respuestas)
- ✅ Triple sistema de respaldo

### 2. Correcciones de Bugs
- ✅ Confusión de productos corregida
- ✅ Métodos de pago duplicados solucionado
- ✅ Detección de despedidas mejorada
- ✅ Contexto de conversación mantenido

### 3. Información de Entrega
- ✅ Google Drive y Hotmart especificados
- ✅ Proceso de entrega claro
- ✅ No inventa información

## 📋 Pasos para Desplegar

### 1. Preparar Git

```bash
# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Sistema IA mejorado con Groq principal y Ollama fallback

- Groq como IA principal (1-2s respuestas)
- Ollama como fallback automático
- Corrección confusión de productos
- Solución métodos de pago duplicados
- Información entrega Google Drive/Hotmart
- Base de conocimiento local activa"

# Subir a GitHub
git push origin main
```

### 2. Variables de Entorno en Easypanel

**IMPORTANTE**: Asegúrate de tener estas variables configuradas en Easypanel:

```env
# IA Principal
GROQ_API_KEY=tu_key_real
AI_PROVIDER=groq
AI_FALLBACK_ENABLED=true

# Ollama Fallback
OLLAMA_BASE_URL=http://bot-whatsapp_ollama:11434
OLLAMA_ENABLED=true

# Base de Datos
DATABASE_URL=postgresql://...

# Métodos de Pago
MERCADO_PAGO_ACCESS_TOKEN=...
PAYPAL_CLIENT_ID=...
NEQUI_NUMBER=...
```

### 3. Despliegue Automático

Easypanel detectará el push y desplegará automáticamente.

**Monitorea los logs:**
- Ve a Easypanel → Tu App → Logs
- Verifica que no haya errores
- Busca: `[IntelligentEngine] 🚀 Intentando con Groq`

### 4. Verificar Funcionamiento

**Prueba estas conversaciones:**

1. **Producto específico:**
   ```
   Usuario: "Tienes el megapack de programación?"
   Bot: Debe mostrar solo ese producto
   ```

2. **Métodos de pago:**
   ```
   Usuario: "Métodos de pago?"
   Bot: Debe mostrar métodos UNA SOLA VEZ
   ```

3. **Despedida:**
   ```
   Usuario: "Muchas gracias"
   Bot: Debe responder brevemente SIN métodos de pago
   ```

4. **Entrega:**
   ```
   Usuario: "¿Cómo recibo el curso?"
   Bot: Debe mencionar Google Drive y Hotmart
   ```

## 🔍 Verificar en Logs

Busca estos mensajes en los logs de Easypanel:

```
✅ Correcto:
[IntelligentEngine] 🚀 Intentando con Groq (llama-3.3-70b)...
[IntelligentEngine] ✅ Respuesta generada con Groq (API key #1)
[IntelligentEngine] ✅ Manteniendo producto actual: Megapack Programación

❌ Si ves esto, hay problema:
[IntelligentEngine] ❌ Todas las opciones agotadas
[IntelligentEngine] 🔄 Usuario cambió de producto (cuando no debería)
```

## ⚠️ Problemas Comunes

### Problema 1: "Ollama no disponible"
**Solución:** Verifica que el servicio Ollama esté corriendo en Easypanel

### Problema 2: "Rate limit en Groq"
**Solución:** El sistema rotará automáticamente a las otras 7 API keys

### Problema 3: "Confusión de productos"
**Solución:** Ya está corregido, verifica logs para confirmar

## 📊 Monitoreo Post-Despliegue

**Primeras 24 horas:**
- Monitorea logs cada 2-3 horas
- Verifica que Groq responda rápido (1-2s)
- Confirma que no hay confusión de productos
- Revisa que métodos de pago no se dupliquen

**Métricas a observar:**
- Tiempo de respuesta promedio
- Tasa de uso de Groq vs Ollama
- Errores en logs
- Quejas de clientes

## ✅ Checklist Final

Antes de desplegar, verifica:

- [ ] `.env` NO está en el repositorio
- [ ] `.env.example` SÍ está en el repositorio
- [ ] Variables configuradas en Easypanel
- [ ] Ollama corriendo en Easypanel
- [ ] Base de datos conectada
- [ ] Commit hecho con mensaje descriptivo
- [ ] Push a GitHub exitoso

## 🎉 Después del Despliegue

1. **Prueba el bot** con conversaciones reales
2. **Monitorea logs** las primeras horas
3. **Verifica métricas** de respuesta
4. **Ajusta si es necesario**

## 📞 Soporte

Si algo falla:
1. Revisa logs en Easypanel
2. Verifica variables de entorno
3. Confirma que Ollama esté corriendo
4. Revisa conexión a base de datos

**¡Listo para desplegar!** 🚀
