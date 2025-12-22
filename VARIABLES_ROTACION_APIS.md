# Variables de Entorno para Rotación de APIs Groq

Si quieres usar el sistema de rotación automática de APIs de Groq, agrega estas variables adicionales en Easypanel:

```env
# === ROTACIÓN DE APIs GROQ (Opcional) ===
# Agrega múltiples API keys de Groq para rotación automática
# El sistema rotará automáticamente cuando una API alcance su límite

GROQ_API_KEY_2=tu_segunda_api_key_aqui
GROQ_API_KEY_3=tu_tercera_api_key_aqui
GROQ_API_KEY_4=tu_cuarta_api_key_aqui
GROQ_API_KEY_5=tu_quinta_api_key_aqui
GROQ_API_KEY_6=tu_sexta_api_key_aqui
GROQ_API_KEY_7=tu_septima_api_key_aqui
GROQ_API_KEY_8=tu_octava_api_key_aqui
```

## Cómo Funciona

1. El sistema usa `GROQ_API_KEY` como API principal
2. Si agregas las variables adicionales, el sistema las detecta automáticamente
3. Cuando una API alcanza su límite de rate, rota a la siguiente
4. Prueba diferentes modelos automáticamente
5. Se reactivan todas las APIs cada hora

## Beneficios

- ✅ Sin interrupciones por límites de rate
- ✅ Mayor capacidad de procesamiento
- ✅ Fallback automático
- ✅ No requiere cambios en el código

## Nota

Si solo tienes una API key de Groq, no necesitas agregar estas variables. El sistema funcionará perfectamente con solo `GROQ_API_KEY`.
