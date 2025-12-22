# 🧠 Sistema de Base de Conocimiento de Productos

## 📋 Descripción

Sistema automático que genera y mantiene información detallada de cada producto para que el bot pueda dar asesoría informada con datos reales.

## ✨ Características Principales

### 1. Generación Automática de Conocimiento
- ✅ Analiza cada producto automáticamente
- ✅ Genera información específica según el tipo (Megapack, Curso, Moto, Laptop)
- ✅ Extrae características, beneficios y casos de uso
- ✅ Crea preguntas comunes con respuestas

### 2. Tipos de Información Generada

Para cada producto se genera:

- **Descripción corta y detallada**
- **Características clave** (6-8 puntos)
- **Beneficios** (5-7 puntos)
- **Público objetivo** (4-5 perfiles)
- **Casos de uso** (4-5 escenarios)
- **Preguntas comunes** (4-5 Q&A)
- **Productos similares**
- **Diferenciadores**
- **Especificaciones técnicas** (cuando aplica)

### 3. Respuestas Inteligentes por Tipo de Pregunta

El sistema detecta automáticamente qué pregunta el cliente:

| Tipo de Pregunta | Ejemplos | Respuesta |
|------------------|----------|-----------|
| **PRECIO** | "¿Cuánto cuesta?", "Precio" | Precio + contexto + diferenciadores |
| **CARACTERÍSTICAS** | "¿Qué incluye?", "Características" | Lista de features + beneficios |
| **PROCESO** | "¿Cómo funciona?", "Proceso" | Paso a paso de compra/uso |
| **GARANTÍA** | "¿Tiene garantía?" | Política de garantía específica |
| **PAGO** | "¿Formas de pago?" | Métodos aceptados |
| **ENTREGA** | "¿Cómo recibo?" | Proceso de entrega |
| **COMPARACIÓN** | "¿Cuál es mejor?" | Comparación detallada |
| **CASOS DE USO** | "¿Para qué sirve?" | Usos y público objetivo |
| **REQUISITOS** | "¿Qué necesito?" | Requisitos previos |

## 🏗️ Arquitectura

### Componentes Principales

```
src/lib/
├── product-knowledge-base.ts          # Generador de conocimiento
├── intelligent-advisor-service.ts     # Asesor inteligente
└── knowledge-enhanced-ai.ts           # Integración con IA
```

### Flujo de Funcionamiento

```
Cliente pregunta
    ↓
Detectar tipo de pregunta
    ↓
Buscar en base de conocimiento
    ↓
Generar respuesta informada
    ↓
Enriquecer contexto de IA
    ↓
Respuesta final al cliente
```

## 📦 Tipos de Productos Soportados

### 1. Megapacks (40 productos)
```typescript
Información generada:
- Tema del megapack
- Contenido incluido
- Proceso de entrega digital
- Garantía de 24 horas
- Preguntas sobre contenido
```

### 2. Cursos Individuales
```typescript
Información generada:
- Tema del curso
- Duración y contenido
- Certificación
- Acceso de por vida
- Requisitos previos
```

### 3. Motos
```typescript
Información generada:
- Modelo y año
- Especificaciones técnicas
- Estado de papeles
- Ubicación
- Precio negociable
```

### 4. Laptops
```typescript
Información generada:
- Especificaciones
- Usos recomendados
- Garantía
- Sistema operativo
```

## 🚀 Uso del Sistema

### Generar Base de Conocimiento

```bash
# Generar conocimiento para todos los productos
npx tsx scripts/generar-base-conocimiento.ts
```

**Resultado**: Archivo `base-conocimiento-productos.json` con toda la información.

### Probar el Sistema

```bash
# Probar respuestas del sistema
npx tsx scripts/test-base-conocimiento.ts
```

### Integración Automática

El sistema se integra automáticamente con el bot. Cuando un cliente pregunta:

1. **Se detecta el producto** mencionado
2. **Se obtiene su conocimiento** de la base
3. **Se genera respuesta** específica y real
4. **Se enriquece el contexto** de la IA

## 📊 Ejemplos de Respuestas

### Ejemplo 1: Pregunta sobre Precio

**Cliente**: "¿Cuánto cuesta el Mega Pack 01?"

**Bot**: 
```
El Mega Pack 01: Cursos Diseño Gráfico tiene un precio de $20.000 COP. 
Es un producto digital, así que después de pagar recibes acceso inmediato. 
Este megapack incluye múltiples cursos y recursos, por lo que el precio 
es súper accesible considerando todo lo que obtienes.

💡 Precio especial de solo $20.000 COP
```

### Ejemplo 2: Pregunta sobre Características

**Cliente**: "¿Qué incluye el curso de piano?"

**Bot**:
```
El Curso Completo de Piano Online incluye:

1. Videos HD con explicaciones paso a paso
2. Material descargable (PDFs, plantillas)
3. Acceso de por vida sin límite de tiempo
4. Certificado de finalización
5. Soporte por WhatsApp

✨ Beneficios principales:
• Domina Piano Online profesionalmente
• Aprende a tu propio ritmo
• Contenido práctico y aplicable
```

### Ejemplo 3: Pregunta sobre Proceso

**Cliente**: "¿Cómo funciona la compra?"

**Bot**:
```
Te explico cómo funciona:

1️⃣ Confirmas tu pedido aquí por WhatsApp
2️⃣ Realizas el pago (te envío los datos)
3️⃣ Me envías el comprobante
4️⃣ Te envío el acceso inmediatamente

Todo el proceso toma menos de 10 minutos y tienes acceso de por vida.
```

## 🔄 Actualización Automática

### Para Productos Nuevos

Cuando se agrega un nuevo producto:

1. **Automático**: El sistema genera conocimiento al detectarlo
2. **Manual**: Ejecutar `generar-base-conocimiento.ts`

### Para Productos Existentes

El conocimiento se regenera automáticamente cada vez que se consulta, asegurando información actualizada.

## 🎯 Ventajas del Sistema

### Para el Bot
✅ Respuestas precisas y reales
✅ No inventa información
✅ Contexto rico para la IA
✅ Respuestas consistentes

### Para el Cliente
✅ Información detallada y clara
✅ Respuestas rápidas
✅ Asesoría profesional
✅ Confianza en la información

### Para el Negocio
✅ Menos errores en información
✅ Mejor conversión de ventas
✅ Escalable a nuevos productos
✅ Mantenimiento automático

## 📈 Estadísticas Actuales

```
📊 Base de Conocimiento Generada:
   • Total productos: 43
   • Productos digitales: 42
   • Productos físicos: 1
   • Megapacks: 41
   • Cursos: 1
   • Motos: 1

📋 Información por Producto:
   • Características: 6-8
   • Beneficios: 5-7
   • Casos de uso: 4-5
   • Preguntas comunes: 4-5
   • Público objetivo: 4-5
```

## 🛠️ API del Sistema

### ProductKnowledgeBaseService

```typescript
// Generar conocimiento de un producto
await ProductKnowledgeBaseService.generateKnowledge(productId);

// Obtener conocimiento existente
await ProductKnowledgeBaseService.getProductKnowledge(productId);

// Buscar respuesta a pregunta específica
await ProductKnowledgeBaseService.findAnswer(productId, question);

// Generar conocimiento de todos los productos
await ProductKnowledgeBaseService.generateAllKnowledge();
```

### IntelligentAdvisorService

```typescript
// Generar respuesta de asesoría
await IntelligentAdvisorService.generateAdvisoryResponse(
  productIds,
  customerQuestion,
  context
);
```

### KnowledgeEnhancedAI

```typescript
// Enriquecer contexto con conocimiento
await KnowledgeEnhancedAI.enrichContextWithKnowledge(
  productIds,
  customerMessage
);

// Generar respuesta basada en conocimiento
await KnowledgeEnhancedAI.generateKnowledgeBasedResponse(
  productIds,
  customerMessage
);

// Generar instrucciones para IA
await KnowledgeEnhancedAI.generateKnowledgeInstructions(
  productIds,
  customerMessage
);
```

## 🔧 Configuración

No requiere configuración adicional. El sistema funciona automáticamente al:

1. Detectar productos en conversaciones
2. Recibir preguntas de clientes
3. Generar respuestas de IA

## 📝 Archivos Generados

- `base-conocimiento-productos.json` - Base de conocimiento completa
- Logs en consola con `[Knowledge]` prefix

## ✅ Verificación

Para verificar que el sistema funciona:

```bash
# Prueba completa
npx tsx scripts/test-base-conocimiento.ts

# Generar base de conocimiento
npx tsx scripts/generar-base-conocimiento.ts
```

## 🎓 Próximos Pasos

1. ✅ Sistema implementado y funcionando
2. ✅ Base de conocimiento generada para 43 productos
3. ✅ Integración con IA lista
4. 🔄 Integrar con `ai-service.ts` (próximo paso)
5. 🔄 Agregar más tipos de productos
6. 🔄 Mejorar detección de intenciones

---

**Estado**: ✅ Implementado y funcionando
**Fecha**: 8 de noviembre de 2025
**Productos con conocimiento**: 43/43 (100%)
