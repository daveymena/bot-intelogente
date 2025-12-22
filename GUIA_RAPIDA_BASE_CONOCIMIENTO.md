# 🚀 Guía Rápida: Base de Conocimiento de Productos

## ¿Qué es esto?

Un sistema que hace que el bot tenga información REAL de cada producto para dar asesoría profesional e informada.

## ✅ Ya está funcionando

El sistema ya está implementado y funcionando con **43 productos**:
- 41 Megapacks
- 1 Curso de Piano
- 1 Moto Bajaj

## 🎯 ¿Qué hace el bot ahora?

Cuando un cliente pregunta sobre un producto, el bot:

1. ✅ Usa información REAL del producto
2. ✅ Responde con datos precisos (precio, características, beneficios)
3. ✅ Adapta la respuesta al tipo de pregunta
4. ✅ NO inventa información

## 📋 Ejemplos Reales

### Antes (sin base de conocimiento)
```
Cliente: "¿Qué incluye el Mega Pack 01?"
Bot: "El megapack incluye varios cursos interesantes..."
❌ Respuesta genérica y vaga
```

### Ahora (con base de conocimiento)
```
Cliente: "¿Qué incluye el Mega Pack 01?"
Bot: "El Mega Pack 01: Cursos Diseño Gráfico incluye:

1. Acceso inmediato después del pago
2. Contenido 100% digital descargable
3. Múltiples cursos y recursos incluidos
4. Sin límite de tiempo de acceso
5. Actualizaciones incluidas
6. Soporte por WhatsApp

✨ Beneficios principales:
• Aprende Diseño Gráfico desde cero hasta nivel avanzado
• Ahorra cientos de miles comprando todo junto
• Contenido organizado y fácil de seguir"

✅ Respuesta específica y detallada
```

## 🔧 Comandos Útiles

### Generar conocimiento de todos los productos
```bash
npx tsx scripts/generar-base-conocimiento.ts
```

### Generar solo para productos nuevos
```bash
npx tsx scripts/auto-generar-conocimiento-nuevos.ts
```

### Probar el sistema
```bash
npx tsx scripts/test-base-conocimiento.ts
```

### Usar el menú interactivo
```bash
GENERAR_CONOCIMIENTO_PRODUCTOS.bat
```

## 📦 Cuando agregas un producto nuevo

### Opción 1: Automático (Recomendado)
El sistema genera conocimiento automáticamente cuando el bot detecta el producto.

### Opción 2: Manual
Ejecuta:
```bash
npx tsx scripts/auto-generar-conocimiento-nuevos.ts
```

## 🎓 Tipos de Preguntas que Responde

| Pregunta del Cliente | El Bot Responde con |
|---------------------|---------------------|
| "¿Cuánto cuesta?" | Precio + contexto + diferenciadores |
| "¿Qué incluye?" | Características + beneficios |
| "¿Cómo funciona?" | Proceso paso a paso |
| "¿Tiene garantía?" | Política de garantía |
| "¿Formas de pago?" | Métodos aceptados |
| "¿Cómo lo recibo?" | Proceso de entrega |
| "¿Para qué sirve?" | Casos de uso + público objetivo |
| "¿Qué necesito?" | Requisitos previos |

## 📊 Estado Actual

```
✅ Sistema implementado
✅ 43 productos con conocimiento
✅ Integración con IA lista
✅ Respuestas automáticas funcionando
```

## 🔍 Verificar que funciona

1. Ejecuta el test:
```bash
npx tsx scripts/test-base-conocimiento.ts
```

2. Verás respuestas como:
```
🧪 PRUEBA 1: Pregunta sobre precio
Cliente: "¿Cuánto cuesta el Mega Pack 01?"

🤖 Respuesta del bot:
El Mega Pack 01: Cursos Diseño Gráfico tiene un precio de $20.000 COP...
```

## 💡 Ventajas

### Para el Bot
- ✅ Respuestas precisas
- ✅ No inventa información
- ✅ Consistencia en respuestas

### Para los Clientes
- ✅ Información detallada
- ✅ Respuestas rápidas
- ✅ Asesoría profesional

### Para el Negocio
- ✅ Mejor conversión
- ✅ Menos errores
- ✅ Escalable

## 🆕 Agregar Productos Nuevos

### Paso 1: Agregar el producto normalmente
Usa el dashboard o scripts existentes.

### Paso 2: Generar conocimiento
```bash
# Opción A: Solo nuevos
npx tsx scripts/auto-generar-conocimiento-nuevos.ts

# Opción B: Todos (incluye nuevos)
npx tsx scripts/generar-base-conocimiento.ts
```

### Paso 3: Listo
El bot ya puede asesorar sobre el producto nuevo.

## 📁 Archivos Importantes

```
src/lib/
├── product-knowledge-base.ts          # Generador de conocimiento
├── intelligent-advisor-service.ts     # Asesor inteligente
└── knowledge-enhanced-ai.ts           # Integración con IA

scripts/
├── generar-base-conocimiento.ts       # Generar todos
├── auto-generar-conocimiento-nuevos.ts # Solo nuevos
└── test-base-conocimiento.ts          # Probar sistema

base-conocimiento-productos.json       # Base de datos de conocimiento
```

## ❓ Preguntas Frecuentes

### ¿Necesito regenerar el conocimiento cada vez?
No, el sistema lo hace automáticamente cuando es necesario.

### ¿Qué pasa si cambio el precio de un producto?
El sistema usa el precio actual de la base de datos, no necesitas regenerar.

### ¿Puedo personalizar el conocimiento de un producto?
Sí, edita el archivo `base-conocimiento-productos.json` o modifica las funciones en `product-knowledge-base.ts`.

### ¿Funciona con productos físicos y digitales?
Sí, el sistema adapta el conocimiento según el tipo de producto.

## 🎯 Próximos Pasos

1. ✅ Sistema funcionando
2. ✅ 43 productos con conocimiento
3. 🔄 Agregar más productos
4. 🔄 Mejorar respuestas según feedback
5. 🔄 Agregar más tipos de productos

## 📞 Soporte

Si tienes dudas o problemas:
1. Revisa `SISTEMA_BASE_CONOCIMIENTO.md` (documentación completa)
2. Ejecuta el test: `npx tsx scripts/test-base-conocimiento.ts`
3. Verifica los logs con `[Knowledge]` prefix

---

**Estado**: ✅ Funcionando
**Última actualización**: 8 de noviembre de 2025
**Productos**: 43/43 con conocimiento
