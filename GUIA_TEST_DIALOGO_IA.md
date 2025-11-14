# 🧪 Guía de Pruebas de Diálogo IA

## 📋 Descripción

Este sistema te permite probar y comparar cómo responde el bot con:
- **Respuestas Simples**: Basadas en palabras clave (rápidas)
- **Razonamiento Profundo**: Análisis paso a paso con IA (más inteligentes)

## 🚀 Cómo Usar

### Opción 1: Modo Interactivo (Recomendado)

```bash
# Windows
PROBAR_DIALOGO_IA.bat

# O directamente
node test-dialogo-ia-interactivo.js
```

### Opción 2: Modo Automático

```bash
node test-dialogo-ia-interactivo.js auto
```

## 🎮 Comandos en Modo Interactivo

### Seleccionar Producto
```
producto 1
producto 2
producto 3
```

### Probar Respuesta Simple
```
simple: ¿Cuánto cuesta?
simple: Dame el link de pago
simple: Hola
```

### Probar Razonamiento Profundo
```
profundo: ¿Cuánto cuesta?
profundo: Dame el link de pago
profundo: Cuéntame sobre este producto
```

### Comparar Ambos Métodos
```
comparar: ¿Cuánto cuesta?
comparar: Dame información completa
comparar: Quiero comprarlo
```

### Sin Prefijo (Usa Razonamiento por Defecto)
```
¿Cuánto cuesta?
Dame el link
Hola
```

## 📊 Qué Observar

### 1. Velocidad de Respuesta
- **Simple**: ~50-200ms (muy rápido)
- **Profundo**: ~500-2000ms (más lento pero más inteligente)

### 2. Calidad de Respuesta
- **Simple**: Directa, basada en palabras clave
- **Profundo**: Contextual, considera historial y razonamiento

### 3. Proceso de Razonamiento
El modo profundo muestra:
- ✅ Pasos de análisis
- 🎯 Intención detectada
- 💯 Nivel de confianza
- 🤖 Decisión de usar IA o respuesta directa

## 🧪 Casos de Prueba Sugeridos

### Saludos
```
Hola
Buenos días
Hey
```

### Preguntas de Precio
```
¿Cuánto cuesta?
¿Qué precio tiene?
¿Cuál es el valor?
```

### Solicitud de Pago
```
Dame el link de pago
¿Cómo puedo pagar?
Quiero comprarlo
Envíame el enlace
```

### Información del Producto
```
Cuéntame sobre este producto
¿Qué características tiene?
Dame más información
¿Qué incluye?
```

### Preguntas con Contexto
```
# Primero selecciona un producto
producto 1

# Luego pregunta sin mencionar el producto
¿Cuánto cuesta?
Dame el link
Cuéntame más
```

## 📈 Análisis de Resultados

### Cuándo Usar Respuesta Simple
✅ Saludos básicos
✅ Preguntas directas con producto en contexto
✅ Cuando la velocidad es crítica

### Cuándo Usar Razonamiento Profundo
✅ Preguntas complejas
✅ Necesita entender contexto
✅ Múltiples intenciones en una pregunta
✅ Conversaciones largas

## 🎯 Objetivos de las Pruebas

1. **Identificar cuándo el bot debe usar razonamiento profundo**
2. **Optimizar la velocidad sin sacrificar calidad**
3. **Mejorar la detección de intenciones**
4. **Refinar las respuestas predefinidas**

## 🔧 Ajustes Recomendados

Después de probar, puedes ajustar:

### En `reasoning-service.ts`
- Umbrales de confianza
- Detección de intenciones
- Reglas de contexto

### En `deep-reasoning-ai-service-optimized.ts`
- Temperatura de IA (creatividad)
- Max tokens (longitud de respuesta)
- Prompts del sistema

### En `greeting-detector.ts`
- Patrones de saludos
- Respuestas predefinidas

## 📝 Notas

- El sistema usa tus productos reales de la base de datos
- Puedes probar con cualquier producto disponible
- El historial de conversación se mantiene durante la sesión
- Usa `salir` para terminar el modo interactivo

## 🐛 Troubleshooting

### Error: No hay productos
```bash
# Verifica que tengas productos en la base de datos
npx prisma studio
```

### Error: No hay usuarios
```bash
# Crea un usuario de prueba o usa el seed
npm run seed
```

### Error de conexión a base de datos
```bash
# Verifica tu .env
DATABASE_URL="postgresql://..."
```

## 💡 Tips

1. **Empieza con modo automático** para ver ejemplos
2. **Luego usa modo interactivo** para tus propias pruebas
3. **Compara siempre** simple vs profundo para decisiones
4. **Anota los casos** donde el bot falla o responde mal
5. **Itera y mejora** los prompts y reglas

---

¿Listo para probar? Ejecuta:
```bash
PROBAR_DIALOGO_IA.bat
```
