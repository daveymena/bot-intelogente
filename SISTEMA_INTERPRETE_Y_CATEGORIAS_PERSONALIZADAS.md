# 🧠 Sistema de Intérprete + Categorías Personalizadas

## Implementación Completada

### 1. Agente Intérprete (InterpreterAgent)

**Archivo:** `src/agents/interpreter-agent.ts`

#### ¿Qué hace?
Reinterpreta las consultas del cliente ANTES de que lleguen a los demás agentes, actuando como un "traductor interno" que entiende la intención REAL.

#### Ejemplos de Interpretación

**Caso 1: Búsqueda General**
```
Cliente: "portátiles"
❌ SIN Intérprete: Muestra productos aleatorios
✅ CON Intérprete: 
   - Detecta: "El cliente quiere VER OPCIONES, no comprar específico"
   - Pregunta: "¿Para qué uso? (trabajo, estudio, gaming, diseño)"
   - Pregunta: "¿Cuál es su presupuesto?"
```

**Caso 2: Búsqueda Específica**
```
Cliente: "curso de piano"
❌ SIN Intérprete: Puede mostrar otros cursos
✅ CON Intérprete:
   - Detecta: "Quiere ESE curso específico"
   - Busca: Solo cursos de piano
   - Muestra: Información completa del curso
```

**Caso 3: Métodos de Pago**
```
Cliente: "métodos de pago"
❌ SIN Intérprete: Respuesta genérica
✅ CON Intérprete:
   - Detecta: "Quiere saber opciones disponibles"
   - Envía: Lista completa de métodos
   - Explica: Cómo funciona cada uno
```

**Caso 4: Pago Específico**
```
Cliente: "quiero pagar por Nequi"
❌ SIN Intérprete: Puede confundirse
✅ CON Intérprete:
   - Detecta: "Quiere pagar por Nequi específicamente"
   - Envía: Número de Nequi
   - Indica: "Esperamos tu comprobante"
```

**Caso 5: Presupuesto**
```
Cliente: "tengo $500,000"
❌ SIN Intérprete: No entiende el contexto
✅ CON Intérprete:
   - Detecta: "Tiene presupuesto de $500,000"
   - Busca: Productos dentro de ese rango
   - Muestra: Opciones a su medida
```

### 2. Flujo de Interpretación

```
1. Cliente envía mensaje
   ↓
2. 🔍 INTÉRPRETE analiza
   - ¿Es búsqueda general o específica?
   - ¿Qué categoría busca?
   - ¿Tiene presupuesto?
   - ¿Quiere comparar o comprar?
   ↓
3. 🧠 RAZONAMIENTO PROFUNDO
   - Usa la interpretación
   - Analiza contexto completo
   - Identifica producto actual
   ↓
4. 🤖 AGENTE ESPECIALIZADO
   - Recibe interpretación clara
   - Responde con precisión
   - Sin confusiones
```

### 3. Intenciones Detectadas

El intérprete detecta automáticamente:

#### Búsqueda de Productos
- **browse_category**: Quiere ver opciones (ej: "portátiles")
- **specific_product**: Quiere producto específico (ej: "curso de piano")
- **budget_search**: Busca por presupuesto (ej: "tengo $500,000")
- **check_availability**: Pregunta disponibilidad (ej: "tienen motos?")
- **compare_products**: Quiere comparar (ej: "diferencia entre...")

#### Pagos
- **payment_options**: Quiere ver métodos disponibles
- **specific_payment_method**: Quiere pagar por método específico

#### Información
- **product_details**: Quiere características, garantía, etc.
- **product_info**: Información general

### 4. Categorías Personalizadas

**Campo agregado:** `customCategory` en el schema de Prisma

#### ¿Para qué sirve?
Permite al cliente crear sus propias categorías para organizar su tienda como quiera.

#### Ejemplos de Uso

**Tienda de Tecnología:**
```
- Categoría: PHYSICAL
- Subcategoría: Portátiles
- Categoría Personalizada: "Gaming Pro"
```

**Tienda de Cursos:**
```
- Categoría: DIGITAL
- Subcategoría: Cursos de Música
- Categoría Personalizada: "Piano Avanzado"
```

**Tienda de Servicios:**
```
- Categoría: SERVICE
- Subcategoría: Reparación
- Categoría Personalizada: "Reparación Express 24h"
```

### 5. Ventajas del Sistema

#### Sin Intérprete (Antes)
```
Cliente: "portátiles"
Bot: "Te muestro: Laptop ASUS, Tinta HP, Pilas"
Cliente: 😕 (confundido)
```

#### Con Intérprete (Ahora)
```
Cliente: "portátiles"
Bot: "¡Claro! Tenemos portátiles para:
     - 💼 Trabajo y oficina
     - 📚 Estudio
     - 🎮 Gaming
     - 🎨 Diseño gráfico
     
     ¿Para qué lo necesitas? Y ¿cuál es tu presupuesto?"
Cliente: "para gaming, tengo $2,000,000"
Bot: "Perfecto! Te muestro las mejores opciones gaming en tu presupuesto:
     1. Laptop ASUS ROG - $1,850,000
     2. Laptop Lenovo Legion - $1,950,000"
```

### 6. Razonamiento Profundo Activado

**Variables en `.env`:**
```env
AI_USE_REASONING=true
AI_REASONING_DEPTH=deep
AI_REASONING_TIMEOUT=30000
ENABLE_INTERPRETER_AGENT=true
```

#### ¿Qué hace el Razonamiento Profundo?
1. Analiza TODO el historial de conversación
2. Identifica el producto actual en discusión
3. Detecta referencias implícitas
4. Previene respuestas fuera de contexto
5. Enriquece el contexto para otros agentes

#### Ejemplo de Razonamiento
```
Cliente: "foto"
❌ Sin razonamiento: "¿Foto de qué?"
✅ Con razonamiento:
   - Analiza: "Hace 2 mensajes hablamos del Laptop ASUS"
   - Entiende: "Quiere la foto de ESE laptop"
   - Envía: Foto del Laptop ASUS
```

### 7. Archivos Modificados/Creados

#### Nuevos Archivos
1. ✅ `src/agents/interpreter-agent.ts` - Agente intérprete
2. ✅ `SISTEMA_INTERPRETE_Y_CATEGORIAS_PERSONALIZADAS.md` - Esta documentación

#### Archivos Modificados
1. ✅ `src/agents/orchestrator.ts` - Integración del intérprete
2. ✅ `src/agents/deep-reasoning-agent.ts` - Usa interpretación
3. ✅ `prisma/schema.prisma` - Campo `customCategory`
4. ✅ `.env` - Variable `ENABLE_INTERPRETER_AGENT=true`

### 8. Próximos Pasos

#### Para Activar en Producción:

1. **Aplicar migración de base de datos:**
```bash
npx prisma migrate dev --name add_custom_category
```

2. **Regenerar cliente de Prisma:**
```bash
npx prisma generate
```

3. **Subir cambios a GitHub:**
```bash
git add .
git commit -m "feat: Sistema de intérprete + categorías personalizadas"
git push origin main
```

4. **En Easypanel:**
   - Pull del repositorio
   - Rebuild de la aplicación
   - Aplicar migración: `npx prisma migrate deploy`

### 9. Probar el Sistema

#### Test 1: Búsqueda General
```
Cliente: "portátiles"
Esperado: Bot pregunta uso y presupuesto
```

#### Test 2: Búsqueda Específica
```
Cliente: "curso de piano"
Esperado: Bot muestra solo cursos de piano
```

#### Test 3: Métodos de Pago
```
Cliente: "cómo puedo pagar?"
Esperado: Bot lista todos los métodos disponibles
```

#### Test 4: Pago Específico
```
Cliente: "quiero pagar por Nequi"
Esperado: Bot envía número de Nequi y espera comprobante
```

#### Test 5: Presupuesto
```
Cliente: "tengo $500,000 para un portátil"
Esperado: Bot muestra opciones dentro de ese presupuesto
```

### 10. Beneficios Finales

✅ **Sin confusiones**: El intérprete entiende la intención real  
✅ **Respuestas precisas**: Cada agente recibe contexto claro  
✅ **Mejor experiencia**: Cliente siente que lo entienden  
✅ **Más ventas**: Menos abandonos por malentendidos  
✅ **Personalizable**: Categorías propias del cliente  
✅ **Escalable**: Fácil agregar nuevas intenciones  

---

**Fecha:** 20 Nov 2025  
**Estado:** ✅ IMPLEMENTADO  
**Listo para:** Migración y pruebas
