# 🌐 SISTEMA DE CONOCIMIENTO EXTERNO

## ¿Qué es?

Un sistema inteligente que permite al bot buscar **información técnica REAL** de productos cuando los clientes hacen preguntas específicas, **SIN INVENTAR NADA**.

## 🎯 Problema que Resuelve

**Antes:**
```
Cliente: "Qué procesador tiene la laptop HP?"
Bot: "Es una excelente laptop con buen procesador" (respuesta genérica)
```

**Ahora:**
```
Cliente: "Qué procesador tiene la laptop HP?"
Bot: "La Laptop HP Core i5 tiene:
     • Procesador: Intel Core i5 de 11va generación
     • RAM: 8GB DDR4
     • Almacenamiento: 256GB SSD
     • Pantalla: 15.6" Full HD
     
     Precio: 1,500,000 COP
     ¿Te interesa?"
```

## ✨ Características

### 1. Búsqueda Inteligente
- Detecta automáticamente cuando el cliente pregunta por detalles técnicos
- Busca información en la base de conocimiento de la IA (Llama 3.1 70B)
- Solo usa información con confianza >= 60%

### 2. Información Verificable
- **NO inventa** especificaciones
- Si no tiene información confiable, lo dice honestamente
- Proporciona contacto directo para confirmar detalles

### 3. Respuestas Naturales
- Integra la información técnica de forma conversacional
- Mantiene el tono amigable del bot
- Incluye precio y llamado a la acción

## 🔍 Palabras Clave que Activan la Búsqueda

El sistema se activa cuando el cliente pregunta por:
- Especificaciones
- Características
- Detalles
- Procesador
- RAM / Memoria
- Pantalla
- Batería
- Cámara
- Rendimiento
- Velocidad
- Capacidad
- Dimensiones
- Peso
- Compatibilidad

## 📋 Cómo Funciona

### Flujo del Sistema

```
1. Cliente pregunta: "Qué características tiene la laptop Asus?"
   ↓
2. Bot detecta que es pregunta técnica
   ↓
3. Busca información externa del producto
   ↓
4. Valida confianza de la información (>= 60%)
   ↓
5. Genera respuesta natural con datos técnicos
   ↓
6. Envía respuesta al cliente
```

### Ejemplo Completo

**Conversación:**
```
Cliente: "Info de la laptop Asus VivoBook"
Bot: "💻 Laptop Asus VivoBook
     Precio: 1,800,000 COP
     Excelente para trabajo y estudio
     ¿Qué te gustaría saber?"

Cliente: "Qué procesador tiene?"
Bot: "La Asus VivoBook tiene:
     
     💻 Especificaciones:
     • Procesador: Intel Core i5-1135G7
     • RAM: 8GB DDR4
     • Almacenamiento: 512GB SSD NVMe
     • Pantalla: 15.6" Full HD IPS
     • Gráficos: Intel Iris Xe
     
     ✨ Características destacadas:
     ✓ Diseño ultradelgado
     ✓ Batería de larga duración
     ✓ Teclado retroiluminado
     
     Precio: 1,800,000 COP
     ¿Te interesa? 😊"
```

## 🧪 Cómo Probar

### Opción 1: Test Automático

```bash
test-conocimiento-externo.bat
```

Este script prueba:
- ✅ Búsqueda de información de varios productos
- ✅ Validación de confianza
- ✅ Generación de respuestas enriquecidas
- ✅ Manejo de productos sin información

### Opción 2: Prueba Manual

1. **Inicia el bot:**
   ```bash
   npm run dev
   ```

2. **Conecta WhatsApp** (escanea QR)

3. **Prueba con estos mensajes:**
   ```
   "Info de la laptop HP"
   "Qué procesador tiene?"
   "Cuáles son las especificaciones?"
   "Qué características tiene la moto Bajaj?"
   ```

## ⚙️ Configuración

### Variables de Entorno

El sistema usa la misma API key de Groq:

```env
GROQ_API_KEY=tu_api_key_aqui
```

### Modelo Usado

- **Modelo:** `llama-3.1-70b-versatile`
- **Temperatura:** 0.1 (muy baja para evitar invenciones)
- **Confianza mínima:** 60%

## 🎛️ Personalización

### Ajustar Confianza Mínima

En `src/lib/external-knowledge-service.ts`:

```typescript
// Cambiar de 60 a otro valor (0-100)
if (info.confidence < 60) {  // <- Ajustar aquí
  return { found: false, ... }
}
```

### Agregar Más Palabras Clave

En `src/lib/external-knowledge-service.ts`:

```typescript
static shouldEnrichProduct(product: any, question: string): boolean {
  const needsEnrichment = [
    'especificaciones',
    'características',
    // Agregar más palabras aquí
    'garantía',
    'colores',
    'tamaño'
  ]
  // ...
}
```

## 📊 Ventajas

### Para el Cliente
- ✅ Obtiene información técnica precisa
- ✅ Respuestas más completas
- ✅ Toma decisiones informadas
- ✅ Menos necesidad de contacto humano

### Para el Negocio
- ✅ Reduce carga de atención manual
- ✅ Aumenta confianza del cliente
- ✅ Mejora tasa de conversión
- ✅ Respuestas 24/7 con información real

## ⚠️ Limitaciones

### Lo que SÍ hace:
- ✅ Busca información técnica general de productos conocidos
- ✅ Proporciona especificaciones comunes
- ✅ Responde preguntas técnicas básicas
- ✅ Valida confianza de la información

### Lo que NO hace:
- ❌ No inventa especificaciones
- ❌ No busca en internet en tiempo real
- ❌ No accede a bases de datos externas
- ❌ No garantiza información 100% actualizada

### Recomendación:
Para información crítica o específica, el bot siempre ofrece contacto directo:
```
"Para confirmar detalles específicos, contáctanos:
📱 WhatsApp: +57 304 274 8687"
```

## 🔧 Solución de Problemas

### El bot no busca información externa

**Verificar:**
1. ¿La pregunta incluye palabras clave técnicas?
2. ¿Está configurada la API key de Groq?
3. ¿Hay errores en la consola?

**Solución:**
```bash
# Ver logs en la consola
# Buscar mensajes: [External Knowledge]
```

### La información no es precisa

**Causa:** Confianza baja del modelo

**Solución:**
- El sistema automáticamente rechaza info con confianza < 60%
- El bot dirá: "No tengo esa información específica"
- Ofrecerá contacto directo

### Respuestas muy lentas

**Causa:** Búsqueda externa toma tiempo

**Solución:**
- El sistema solo busca cuando detecta preguntas técnicas
- Preguntas simples no activan búsqueda
- Considerar aumentar timeout si es necesario

## 📈 Métricas de Éxito

### Indicadores a Monitorear:
1. **Tasa de activación:** ¿Cuántas veces se activa la búsqueda?
2. **Confianza promedio:** ¿Qué tan confiable es la info encontrada?
3. **Satisfacción del cliente:** ¿Las respuestas son útiles?
4. **Tasa de escalamiento:** ¿Cuántos clientes piden hablar con humano?

### Logs a Revisar:
```
🔍 [External Knowledge] Buscando info de: "..."
✅ [External Knowledge] Información encontrada (confianza: X%)
⚠️ [External Knowledge] No se encontró info externa confiable
```

## 🚀 Próximas Mejoras

### Posibles Extensiones:
1. **Caché de información:** Guardar búsquedas frecuentes
2. **Actualización periódica:** Refrescar info cada X días
3. **Múltiples fuentes:** Combinar varias fuentes de información
4. **Aprendizaje:** Mejorar con feedback de clientes
5. **Base de datos propia:** Almacenar specs verificadas manualmente

## 📞 Soporte

Si tienes problemas o preguntas:
- 📱 WhatsApp: +57 304 274 8687
- 📧 Email: deinermen25@gmail.com

---

**Fecha:** 6 de noviembre de 2025
**Versión:** 1.0
**Estado:** ✅ Activo y funcionando
