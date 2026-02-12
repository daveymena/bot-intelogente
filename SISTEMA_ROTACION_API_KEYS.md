# 🔑 Sistema de Rotación de API Keys - OpenClaw

## 📋 Descripción

Sistema inteligente de rotación automática de API keys de Groq para maximizar la disponibilidad del bot y evitar interrupciones por rate limits.

## 🎯 Características

### 1. Rotación Automática
- Detecta automáticamente cuando una API key alcanza su rate limit
- Rota inmediatamente a la siguiente key disponible
- Soporta hasta 5 API keys simultáneas

### 2. Sistema de Cooldown
- Marca keys fallidas con timestamp
- Salta keys en cooldown (5 minutos)
- Limpia contador de fallos cuando una key funciona correctamente

### 3. Fallback de Modelos
- **Nivel 1**: llama-3.3-70b-versatile (más potente)
- **Nivel 2**: llama-3.1-8b-instant (más económico)
- **Nivel 3**: mixtral-8x7b-32768 (alternativa robusta)

### 4. Logs Detallados
- Indica qué key y modelo se está usando
- Muestra cuando se rota a otra key
- Alerta cuando todas las keys están en cooldown

## ⚙️ Configuración

### Archivo .env

```env
# API Keys de Groq (agregar tantas como sea necesario)
GROQ_API_KEY=gsk_tu_key_principal_aqui
GROQ_API_KEY_2=gsk_tu_segunda_key_aqui
GROQ_API_KEY_3=gsk_tu_tercera_key_aqui
GROQ_API_KEY_4=gsk_tu_cuarta_key_aqui
GROQ_API_KEY_5=gsk_tu_quinta_key_aqui
```

**Nota**: Puedes usar desde 1 hasta 5 keys. El sistema automáticamente detecta cuántas están configuradas.

### Obtener API Keys

1. Visita https://console.groq.com
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el menú
4. Genera nuevas keys según necesites
5. Copia y pega en tu archivo .env

## 🔄 Flujo de Rotación

```
Mensaje del Cliente
    ↓
OpenClaw intenta con Key 1 + Modelo 1
    ↓
¿Rate Limit?
    ├─→ NO → ✅ Respuesta exitosa
    └─→ SÍ → Marca Key 1 como fallida
              ↓
              Rota a Key 2 + Modelo 1
              ↓
              ¿Rate Limit?
                  ├─→ NO → ✅ Respuesta exitosa
                  └─→ SÍ → Marca Key 2 como fallida
                            ↓
                            Todas las keys agotadas
                            ↓
                            Prueba Key 1 + Modelo 2 (más económico)
                            ↓
                            ¿Rate Limit?
                                ├─→ NO → ✅ Respuesta exitosa
                                └─→ SÍ → Continúa con siguiente modelo
```

## 📊 Ejemplo de Logs

```
[OpenClaw] 🔑 2 API keys disponibles para rotación

[OpenClaw] ⚠️ Rate limit en modelo llama-3.3-70b-versatile con key 1
[OpenClaw] ❌ Key 1 marcada como fallida (1 fallos)
[OpenClaw] 🔄 Rotando a key 2/2
[OpenClaw] 🔄 Intentando con siguiente key...

[OpenClaw] ⚠️ Rate limit en modelo llama-3.3-70b-versatile con key 2
[OpenClaw] ❌ Key 2 marcada como fallida (1 fallos)
[OpenClaw] 🔄 Rotando a key 1/2

[OpenClaw] 🔄 Todas las keys agotadas, probando modelo llama-3.1-8b-instant...
[OpenClaw] ⏭️ Saltando key 1 (cooldown activo)
[OpenClaw] ⏭️ Saltando key 2 (cooldown activo)
[OpenClaw] ⚠️ Todas las keys en cooldown, usando key 1

[OpenClaw] ℹ️ Usando modelo llama-3.1-8b-instant con key 1/2
✅ Respuesta exitosa
```

## 🧪 Testing

### Test de Rotación

```bash
npx tsx test-api-key-rotation.ts
```

Este test:
- Muestra cuántas keys están configuradas
- Simula múltiples llamadas al AI
- Verifica que la rotación funcione correctamente
- Muestra logs detallados del proceso

### Resultado Esperado

```
🔑 TEST: Rotación de API Keys

📊 API Keys configuradas: 2
   1. gsk_dr5od0...7Gir
   2. gsk_dBxD9t...aTI5

🧪 Simulando múltiples llamadas al AI...

📱 Mensaje 1/5: "Hola"
✅ Respuesta recibida (2359ms)

📱 Mensaje 2/5: "Cuéntame sobre tus productos"
[Rotación automática entre keys]
✅ Respuesta recibida (2436ms)

...

✅ Test completado
```

## 💡 Ventajas del Sistema

### 1. Alta Disponibilidad
- El bot nunca se detiene por rate limits
- Rotación automática sin intervención manual
- Múltiples niveles de fallback

### 2. Optimización de Recursos
- Usa el modelo más potente cuando está disponible
- Fallback automático a modelos más económicos
- Cooldown inteligente para no desperdiciar intentos

### 3. Transparencia
- Logs claros de qué está pasando
- Fácil debugging
- Métricas de uso por key

### 4. Escalabilidad
- Soporta hasta 5 keys simultáneas
- Fácil agregar más keys en el futuro
- Sistema modular y extensible

## 📈 Límites de Groq

### Tier Gratuito (On-Demand)
- **100,000 tokens/día** por organización
- Compartido entre todas las keys de la misma organización
- Se resetea cada 24 horas

### Recomendaciones

1. **Múltiples Organizaciones**: Crea cuentas en diferentes organizaciones para keys independientes
2. **Upgrade a Dev Tier**: Considera actualizar para límites más altos
3. **Monitoreo**: Revisa logs regularmente para ver uso de tokens
4. **Optimización**: Usa prompts más cortos cuando sea posible

## 🔧 Mantenimiento

### Agregar Nueva Key

1. Obtén una nueva API key de Groq
2. Agrégala al archivo .env:
   ```env
   GROQ_API_KEY_3=gsk_nueva_key_aqui
   ```
3. Reinicia el servidor
4. El sistema automáticamente detectará la nueva key

### Remover Key

1. Elimina o comenta la línea en .env:
   ```env
   # GROQ_API_KEY_3=gsk_key_vieja
   ```
2. Reinicia el servidor
3. El sistema se ajustará automáticamente

### Verificar Estado

Revisa los logs del servidor para ver:
- Cuántas keys están activas
- Qué key se está usando actualmente
- Cuántas keys están en cooldown
- Qué modelo se está utilizando

## 🚨 Troubleshooting

### Problema: "0 API keys disponibles"
**Solución**: Verifica que al menos GROQ_API_KEY esté configurada en .env

### Problema: "Todas las keys en cooldown"
**Solución**: 
- Espera 5 minutos para que se resetee el cooldown
- Agrega más API keys
- Considera upgrade de plan Groq

### Problema: "Todos los modelos agotados"
**Solución**:
- Todas las keys alcanzaron rate limit
- Espera ~24 horas para reset
- Usa keys de diferentes organizaciones

## 📝 Código Relevante

### Constructor de OpenClaw

```javascript
constructor() {
    this.conversationHistory = new Map();
    this.maxHistory = 20;
    
    // Sistema de rotación de API keys
    this.apiKeys = [
        process.env.GROQ_API_KEY,
        process.env.GROQ_API_KEY_2,
        process.env.GROQ_API_KEY_3,
        process.env.GROQ_API_KEY_4,
        process.env.GROQ_API_KEY_5
    ].filter(Boolean);
    
    this.currentKeyIndex = 0;
    this.keyFailures = new Map();
    
    console.log(`[OpenClaw] 🔑 ${this.apiKeys.length} API keys disponibles`);
}
```

### Métodos Principales

- `getNextApiKey()` - Obtiene la siguiente key disponible
- `markKeyAsFailed(key)` - Marca una key como fallida
- `rotateToNextKey()` - Rota a la siguiente key
- `_callAI()` - Maneja la lógica de rotación y fallback

## 🎯 Mejores Prácticas

1. **Usa al menos 2-3 keys** para mejor disponibilidad
2. **Monitorea los logs** regularmente
3. **Considera diferentes organizaciones** para keys independientes
4. **Optimiza prompts** para reducir consumo de tokens
5. **Implementa caché** para respuestas frecuentes

## 📊 Métricas Sugeridas

- Número de rotaciones por hora
- Keys más utilizadas
- Tasa de éxito por key
- Tiempo promedio de respuesta por modelo
- Consumo de tokens por key

---

**Fecha**: 11 de febrero de 2026  
**Sistema**: Smart Sales Bot Pro  
**Framework**: OpenClaw v2.1  
**Feature**: Sistema de Rotación de API Keys  
**Estado**: ✅ PRODUCCIÓN - COMPLETAMENTE FUNCIONAL
