# 🎓 Sistema de Entrenamiento Automático 24/7

## 📋 Descripción

Sistema de entrenamiento continuo que genera automáticamente una base de conocimiento local usando **Ollama** (IA gratuita sin límites). Las respuestas entrenadas se usan como **fallback** cuando Groq se queda sin tokens o falla.

## 🎯 Objetivos

1. **Generar base de conocimiento completa** de tu negocio
2. **Responder sin IA externa** cuando Groq falla
3. **Entrenar 24/7** hasta tener respuestas perfectas
4. **Funcionar para cualquier tipo de negocio** (tienda, servicios, consultoría)

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE WHATSAPP                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI SERVICE (Principal)                    │
│                                                             │
│  1. Intenta Groq (rápido, pero con límites)               │
│  2. Si falla → Busca en Base de Conocimiento Local        │
│  3. Si no encuentra → Usa Ollama directo                  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌────────┐    ┌──────────┐    ┌──────────┐
    │  Groq  │    │   Base   │    │  Ollama  │
    │  API   │    │   Local  │    │  Directo │
    └────────┘    └──────────┘    └──────────┘
                        ▲
                        │
                        │ Alimenta continuamente
                        │
         ┌──────────────────────────────────┐
         │  Sistema de Entrenamiento 24/7   │
         │                                  │
         │  • Genera preguntas aleatorias  │
         │  • Ollama responde              │
         │  • Guarda en base de datos      │
         │  • Mejora respuestas            │
         └──────────────────────────────────┘
```

## 🚀 Instalación y Configuración

### 1. Instalar Ollama

**Windows:**
```bash
# Descargar desde: https://ollama.com/download
# O usar winget:
winget install Ollama.Ollama
```

**Linux/Mac:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Configurar Modelos

```bash
# Ejecutar script de configuración
npm run train:setup

# O manualmente:
ollama pull gemma2:2b    # Rápido (1.6GB)
ollama pull qwen3:4b     # Balanceado (2.5GB)
ollama pull gemma3:4b    # Preciso (3.3GB)
```

### 3. Iniciar Ollama

```bash
# En una terminal separada
ollama serve
```

### 4. Iniciar Entrenamiento

**Opción A: Local (Desarrollo)**
```bash
npm run train:24-7
```

**Opción B: Docker (Producción)**
```bash
docker-compose -f docker-compose.training.yml up -d
```

## 📊 Monitoreo

### Ver Estadísticas

```bash
npm run train:stats
```

Muestra:
- Total de respuestas entrenadas
- Respuestas por contexto (saludo, precio, pago, etc.)
- Top 10 más usadas
- Top 10 de mayor calidad
- Productos con más respuestas

### Ver Logs en Tiempo Real

```bash
# Docker
docker logs -f auto-training-system

# Local
# Los logs aparecen en la terminal donde ejecutaste train:24-7
```

## 🎯 Cómo Funciona

### 1. Generación de Preguntas

El sistema genera preguntas aleatorias basadas en:

**Preguntas Generales:**
- Saludos: "Hola", "Buenos días", "Buenas tardes"
- Pagos: "Cómo puedo pagar", "Aceptan Nequi"
- Envíos: "Hacen envíos", "Cuánto demora"
- Garantía: "Tiene garantía", "Puedo devolver"

**Preguntas de Productos:**
- Búsqueda: "Busco {producto}", "Necesito {producto}"
- Precio: "Cuánto cuesta {producto}"
- Características: "Qué incluye {producto}"
- Disponibilidad: "Tienen {producto}"
- Comparación: "Es bueno {producto}"

### 2. Generación de Respuestas

Ollama genera respuestas usando prompts específicos:

```typescript
// Ejemplo para precio
Prompt: "Eres vendedor de Tecnovariedades D&S.
Producto: Laptop HP 15
Precio: $1,200,000 COP
Da el precio de forma amigable en 2 líneas."

Respuesta: "¡Claro! La Laptop HP 15 tiene un precio de 
$1,200,000 COP. Es una excelente opción para trabajo y estudio. 💻"
```

### 3. Almacenamiento

Las respuestas se guardan en:

**Base de Datos (PostgreSQL):**
```sql
conversationKnowledge {
  userQuery: "cuánto cuesta laptop hp 15"
  botResponse: "¡Claro! La Laptop HP 15..."
  context: "precio"
  confidence: 0.85
  usageCount: 0
  successRate: 1.0
}
```

**Archivos JSON (Backup):**
```
data/trained-responses/
  ├── training_progress_1234567890.json
  ├── training_progress_1234567891.json
  └── ...
```

### 4. Uso en Producción

Cuando un cliente pregunta:

```typescript
// 1. Intenta Groq
try {
  response = await groq.chat.completions.create(...)
} catch (error) {
  // 2. Busca en base de conocimiento local
  response = await trainedResponseService.findTrainedResponse(userMessage)
  
  if (response) {
    return response // ✅ Respuesta instantánea sin IA externa
  }
  
  // 3. Usa Ollama directo (más lento pero funciona)
  response = await ollama.generate(...)
}
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b

# Entrenamiento
TRAINING_INTERVAL=1800000  # 30 minutos en ms
MIN_CONFIDENCE=0.7         # Confianza mínima para guardar
```

### Personalizar Plantillas

Edita `src/lib/auto-training-system.ts`:

```typescript
const QUESTION_TEMPLATES = {
  // Agregar nuevos contextos
  cita: [
    'Quiero agendar una cita',
    'Necesito una cita',
    'Puedo reservar'
  ],
  
  // Modificar existentes
  precio: [
    'Cuánto cuesta {producto}',
    'Tu pregunta personalizada aquí'
  ]
}
```

### Ajustar Prompts

Modifica `buildSystemPrompt()` en `auto-training-system.ts`:

```typescript
case 'precio':
  prompt += `Producto: ${product.name}
Precio: $${product.price}

// 👇 Personaliza aquí
Responde de forma [tu estilo]:
- Menciona descuentos si aplica
- Ofrece financiación
- Máximo 3 líneas`;
  break;
```

## 📈 Optimización

### Mejorar Calidad

1. **Revisar respuestas de baja calidad:**
```bash
npm run train:stats
# Ver sección "Baja calidad (<50%)"
```

2. **Eliminar respuestas malas:**
```typescript
// En Prisma Studio o script personalizado
await prisma.conversationKnowledge.deleteMany({
  where: {
    AND: [
      { confidence: { lt: 0.5 } },
      { successRate: { lt: 0.5 } }
    ]
  }
})
```

3. **Regenerar con mejor prompt:**
Ajusta los prompts en `buildSystemPrompt()` y reinicia entrenamiento.

### Acelerar Entrenamiento

```typescript
// En auto-training-system.ts
private async trainBatch() {
  // Reducir pausa entre preguntas
  await this.sleep(100); // Era 300ms
  
  // Aumentar productos por batch
  const productos = await prisma.product.findMany({
    take: 10 // Era 5
  });
}
```

## 🐳 Deploy en Easypanel

### 1. Preparar Repositorio

```bash
git add .
git commit -m "Sistema de entrenamiento 24/7"
git push
```

### 2. Crear Servicios en Easypanel

**Servicio 1: Ollama**
- Imagen: `ollama/ollama:latest`
- Puerto: 11434
- Volumen: `/root/.ollama`
- Recursos: 2 CPU, 4GB RAM

**Servicio 2: Training System**
- Build desde: `Dockerfile.training`
- Variables:
  - `DATABASE_URL`: Tu PostgreSQL
  - `OLLAMA_BASE_URL`: `http://ollama:11434`
  - `OLLAMA_MODEL`: `gemma2:2b`
- Volumen: `./data:/app/data`

**Servicio 3: App Principal**
- Build desde: `Dockerfile`
- Puerto: 4000
- Variables:
  - `DATABASE_URL`
  - `GROQ_API_KEY`
  - `OLLAMA_BASE_URL`: `http://ollama:11434`
  - `AI_FALLBACK_ENABLED`: `true`

### 3. Inicializar Modelos

```bash
# Conectar al contenedor de Ollama
docker exec -it ollama-training bash

# Descargar modelos
ollama pull gemma2:2b
ollama pull qwen3:4b
ollama pull gemma3:4b

exit
```

### 4. Verificar

```bash
# Ver logs del entrenamiento
docker logs -f auto-training-system

# Ver estadísticas
docker exec -it auto-training-system npm run train:stats
```

## 🎓 Casos de Uso

### E-commerce
- Preguntas sobre productos
- Precios y descuentos
- Métodos de pago
- Envíos y entregas

### Servicios Profesionales
- Agendar citas
- Consultar disponibilidad
- Precios de servicios
- Políticas y términos

### Tienda Física
- Horarios de atención
- Ubicación
- Productos disponibles
- Promociones

### Dropshipping
- Tiempos de entrega
- Contraentrega
- Seguimiento de pedidos
- Devoluciones

## 📚 Recursos

- [Ollama Docs](https://github.com/ollama/ollama)
- [Modelos Disponibles](https://ollama.com/library)
- [Prisma Docs](https://www.prisma.io/docs)

## 🆘 Troubleshooting

### Ollama no responde
```bash
# Verificar que está corriendo
curl http://localhost:11434/api/tags

# Reiniciar
pkill ollama
ollama serve
```

### Respuestas de baja calidad
1. Ajustar temperatura en `generateResponse()`:
```typescript
options: {
  temperature: 0.6, // Más bajo = más consistente
  num_predict: 200
}
```

2. Usar modelo más grande:
```env
OLLAMA_MODEL=gemma3:4b  # En vez de gemma2:2b
```

### Base de datos crece mucho
```bash
# Limpiar respuestas de baja calidad
npm run train:cleanup

# O manualmente
await prisma.conversationKnowledge.deleteMany({
  where: {
    AND: [
      { usageCount: { lt: 2 } },
      { confidence: { lt: 0.6 } }
    ]
  }
})
```

## ✅ Checklist de Implementación

- [ ] Ollama instalado y corriendo
- [ ] Modelos descargados (gemma2:2b mínimo)
- [ ] Base de datos configurada
- [ ] Variables de entorno configuradas
- [ ] Entrenamiento iniciado
- [ ] Estadísticas verificadas
- [ ] Fallback funcionando en producción
- [ ] Docker configurado (opcional)
- [ ] Deploy en Easypanel (opcional)

## 🎉 Resultado Final

Después de 24-48 horas de entrenamiento continuo:

- ✅ **1000+ respuestas** entrenadas
- ✅ **Cobertura completa** de preguntas comunes
- ✅ **Fallback instantáneo** cuando Groq falla
- ✅ **Sin costos** de IA externa
- ✅ **Mejora continua** automática
- ✅ **Listo para producción** en cualquier negocio

---

**¿Preguntas?** Revisa los logs o ejecuta `npm run train:stats` para ver el progreso.
