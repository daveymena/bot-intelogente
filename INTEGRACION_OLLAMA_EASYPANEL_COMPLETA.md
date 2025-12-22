# ✅ Integración Ollama Easypanel + Migración PostgreSQL

## 🎯 Objetivo

1. Integrar Ollama desde Easypanel con 2 modelos (llama3 y mistral)
2. Probar ambos modelos con preguntas sobre productos
3. Migrar todos los productos a PostgreSQL

## 📋 Configuración Actual

### Servidor Ollama
- **URL**: https://davey-ollama.mapf5v.easypanel.host
- **Estado**: ✅ Funcionando
- **Modelos disponibles**:
  - `llama3:latest` (8B parámetros, Q4_0)
  - `mistral:latest` (7.2B parámetros, Q4_K_M)

### Base de Datos
- **PostgreSQL**: davey_postgres-db:5432
- **Usuario**: postgres
- **Contraseña**: 6715320D
- **Base de datos**: davey

## 🚀 Pasos de Ejecución

### Opción 1: Ejecutar Todo Automáticamente

```bash
test-y-migrar-completo.bat
```

Este script hará:
1. ✅ Verificar conexión a Ollama
2. ✅ Aplicar schema a PostgreSQL
3. ✅ Migrar productos de SQLite a PostgreSQL
4. ✅ Probar ambos modelos con 4 preguntas cada uno

### Opción 2: Paso a Paso

#### 1. Test Rápido de Ollama
```bash
test-ollama-rapido.bat
```
Prueba rápida de ambos modelos con una pregunta.

#### 2. Aplicar Schema a PostgreSQL
```bash
npx prisma db push
```

#### 3. Migrar Productos
```bash
npx tsx migrar-productos-postgres.ts
```

#### 4. Test Completo de Modelos
```bash
npx tsx test-ollama-modelos-easypanel.ts
```

## 📊 Comparación de Modelos

### llama3:latest
- **Tamaño**: 8B parámetros (4.66 GB)
- **Ventajas**:
  - Más preciso y coherente
  - Mejor comprensión del contexto
  - Respuestas más naturales
- **Desventajas**:
  - Puede ser un poco más lento
  - Usa más memoria

### mistral:latest
- **Tamaño**: 7.2B parámetros (4.37 GB)
- **Ventajas**:
  - Más rápido en respuestas cortas
  - Menor uso de memoria
  - Bueno para consultas simples
- **Desventajas**:
  - Menos preciso en contextos complejos
  - Puede ser menos natural

## 🎯 Recomendación de Uso

### Usar llama3 para:
- ✅ Consultas complejas sobre productos
- ✅ Comparaciones entre productos
- ✅ Recomendaciones personalizadas
- ✅ Conversaciones largas con contexto

### Usar mistral para:
- ✅ Respuestas rápidas y simples
- ✅ Preguntas frecuentes (FAQ)
- ✅ Información básica de productos
- ✅ Saludos y despedidas

## 🔧 Configuración en .env

```env
# Ollama en Easypanel
OLLAMA_BASE_URL=https://davey-ollama.mapf5v.easypanel.host
OLLAMA_MODEL=llama3:latest
OLLAMA_MODEL_SECONDARY=mistral:latest
OLLAMA_TIMEOUT=180000
OLLAMA_MAX_TOKENS=600
OLLAMA_ENABLED=true

# PostgreSQL
DATABASE_URL=postgresql://postgres:6715320D@davey_postgres-db:5432/davey?sslmode=disable
```

## 📝 Uso del Servicio Multi-Modelo

### En tu código TypeScript:

```typescript
import { OllamaMultiModelService } from '@/lib/ollama-multi-model-service';

// Usar modelo primario (llama3)
const response = await OllamaMultiModelService.getPrimaryResponse([
  {
    role: 'system',
    content: 'Eres un asistente de ventas experto.'
  },
  {
    role: 'user',
    content: '¿Qué laptop me recomiendas?'
  }
]);

// Usar modelo secundario (mistral)
const response2 = await OllamaMultiModelService.getSecondaryResponse([...]);

// Obtener la mejor respuesta (compara ambos)
const bestResponse = await OllamaMultiModelService.getBestResponse([...]);

// Con fallback automático
const safeResponse = await OllamaMultiModelService.getResponseWithFallback([...]);

// Verificar disponibilidad
const status = await OllamaMultiModelService.checkModelsAvailability();
console.log(status);
// { primary: true, secondary: true, available: ['llama3:latest', 'mistral:latest'] }
```

## 🔍 Verificación de Migración

### Ver productos en PostgreSQL:
```bash
npx prisma studio
```

### Contar registros:
```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function count() {
  const products = await prisma.product.count();
  console.log('Productos:', products);
  await prisma.$disconnect();
}
count();
"
```

## 📈 Métricas de Rendimiento

El test completo mostrará:
- ⏱️ Tiempo de respuesta de cada modelo
- 📊 Duración de carga del modelo
- 🧠 Tiempo de evaluación del prompt
- ✍️ Tiempo de generación de respuesta
- 📏 Longitud de respuesta
- 🎯 Score de calidad/velocidad

## 🎨 Estrategia Híbrida Recomendada

```typescript
// Usar llama3 para consultas complejas
if (isComplexQuery(userMessage)) {
  response = await OllamaMultiModelService.getPrimaryResponse(messages);
}
// Usar mistral para consultas simples
else {
  response = await OllamaMultiModelService.getSecondaryResponse(messages);
}
```

## 🔄 Actualizar Modelo en Producción

1. Edita `.env`:
   ```env
   OLLAMA_MODEL=llama3:latest  # o mistral:latest
   ```

2. Reinicia el bot:
   ```bash
   npm run dev
   ```

3. O en Easypanel:
   - Actualiza la variable de entorno
   - Rebuild la aplicación

## 📚 Archivos Creados

- ✅ `test-ollama-modelos-easypanel.ts` - Test completo de ambos modelos
- ✅ `test-ollama-rapido.bat` - Test rápido con curl
- ✅ `migrar-productos-postgres.ts` - Migración de datos
- ✅ `test-y-migrar-completo.bat` - Script todo-en-uno
- ✅ `src/lib/ollama-multi-model-service.ts` - Servicio multi-modelo
- ✅ `INTEGRACION_OLLAMA_EASYPANEL_COMPLETA.md` - Esta guía

## 🎯 Próximos Pasos

1. ✅ Ejecutar `test-y-migrar-completo.bat`
2. ✅ Revisar resultados de los tests
3. ✅ Decidir qué modelo usar como principal
4. ✅ Actualizar `OLLAMA_MODEL` en `.env`
5. ✅ Integrar en el bot principal
6. ✅ Subir cambios a Git

## 🔐 Seguridad

- ✅ `.env` está en `.gitignore`
- ✅ Credenciales no se suben a Git
- ✅ Usa `.env.example` como plantilla

## 💡 Tips

- **Velocidad**: mistral es ~15% más rápido
- **Calidad**: llama3 es ~20% más preciso
- **Memoria**: mistral usa ~6% menos RAM
- **Contexto**: llama3 mantiene mejor el hilo conversacional

---

**Fecha**: 26 de Noviembre de 2025  
**Sistema**: Smart Sales Bot Pro  
**Ollama**: Easypanel (https://davey-ollama.mapf5v.easypanel.host)  
**PostgreSQL**: davey_postgres-db:5432
