# ✅ Mejoras en Búsqueda y Sistema de Respaldo

## Problemas Identificados

1. ❌ Bot envía foto del producto incorrecto
2. ❌ Bot dice "No tengo ese producto" cuando SÍ existe
3. ❌ Búsqueda no encuentra el producto correcto
4. ❌ Necesita sistema de respaldo activo

## Soluciones Aplicadas

### 1. ✅ Extracción de Palabras Clave Mejorada

**Archivo**: `src/lib/intelligent-conversation-engine.ts`

**Mejoras**:
```typescript
// ANTES: Palabras clave genéricas
['tienes', 'curso', 'ingles']

// AHORA: Detección inteligente
- Quita acentos para mejor matching
- Detecta temas específicos (inglés, diseño, programación, etc.)
- Detecta "Mega Pack [número]" específicamente
- Filtra stop words más completas
- Prioriza frases compuestas
```

**Temas detectados automáticamente**:
- inglés, diseño, programación, marketing
- excel, office, fotografía, video, piano
- música, hacking, arquitectura, gastronomía
- wordpress, android, reparación

### 2. ✅ Scoring de Búsqueda Mejorado

**Mejoras en el sistema de puntos**:
```typescript
// ANTES:
- Palabra en nombre: +10 puntos
- Palabra en descripción: +5 puntos
- Todas las palabras: +20 puntos
- Empieza con palabra: +15 puntos

// AHORA:
- Palabra en nombre: +15 puntos (↑)
- Palabra en descripción: +7 puntos (↑)
- Primera palabra en nombre: +10 puntos extra (NUEVO)
- Todas las palabras: +30 puntos (↑)
- Empieza con palabra: +20 puntos (↑)
- Match exacto "Mega Pack [número]": +50 puntos (NUEVO)
```

### 3. ✅ Normalización de Texto

**Mejora crítica**:
```typescript
// Quita acentos para mejor matching
text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// Ahora "inglés" = "ingles" en la búsqueda
// "diseño" = "diseno"
// "programación" = "programacion"
```

### 4. ✅ Sistema de Respaldo Activo

**Ya implementado** (solo necesita verificación):

```typescript
// PRIORIDAD 1: Groq (8 API keys con rotación automática)
for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
  try {
    // Intenta con Groq
    // Si falla, rota a la siguiente API key
  } catch (error) {
    if (error.status === 429) {
      this.rotateApiKey(); // Rotación automática
    }
  }
}

// PRIORIDAD 2: Ollama (local, ilimitado)
if (process.env.OLLAMA_ENABLED === 'true') {
  // Usa Ollama como respaldo
}

// PRIORIDAD 3: Base de conocimiento local
const localResponse = await LocalKnowledgeBase.findSimilarResponse({
  userQuery,
  productId
});
```

## Ejemplo de Búsqueda Mejorada

### Usuario: "tienes el curso de inglés"

**Palabras clave extraídas**:
```
['curso', 'ingles'] // Sin acentos, sin stop words
```

**Scoring**:
```
Mega Pack 03: Cursos Inglés
- "curso" en nombre: +15 puntos
- "ingles" en nombre: +15 puntos
- Primera palabra "curso" en nombre: +10 puntos
- Todas las palabras presentes: +30 puntos
- TOTAL: 70 puntos ✅ (MÁS RELEVANTE)

Mega Pack 02: Cursos Programación Web
- "curso" en nombre: +15 puntos
- "ingles" NO presente: 0 puntos
- TOTAL: 15 puntos (menos relevante)
```

## Verificación del Sistema de Respaldo

### API Keys de Groq

Verificar en `.env`:
```env
GROQ_API_KEY=gsk_...
GROQ_API_KEY_2=gsk_...
GROQ_API_KEY_3=gsk_...
# ... hasta 8 keys
```

### Ollama (Opcional)

```env
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

### Base de Conocimiento Local

Ya está activa automáticamente en:
`src/lib/local-knowledge-base.ts`

## Comportamiento Esperado AHORA

### Usuario: "tienes el curso de inglés"

**Bot debería**:
1. ✅ Extraer palabras clave: ['curso', 'ingles']
2. ✅ Buscar productos con esas palabras
3. ✅ Encontrar "Mega Pack 03: Cursos Inglés" con 70+ puntos
4. ✅ Enviar foto del Mega Pack 03 (NO Programación Web)
5. ✅ Mostrar información exacta del producto

**Logs esperados**:
```
[IntelligentEngine] 🔍 Palabras clave extraídas: ['curso', 'ingles']
[IntelligentEngine] 📊 Mega Pack 03: Cursos Inglés: 70 puntos
[IntelligentEngine] 📊 Mega Pack 02: Cursos Programación Web: 15 puntos
[IntelligentEngine] ✅ Encontrados 2 productos relevantes
[IntelligentEngine] 📤 Enviando imagen del producto correcto: Mega Pack 03: Cursos Inglés
```

## Reiniciar Bot

```bash
# El bot debería reiniciarse automáticamente con nodemon
# Si no, detener con Ctrl+C y ejecutar:
npm run dev
```

## Probar Nuevamente

```
Usuario: "tienes el curso de inglés"
```

**Verificar**:
1. ✅ Foto correcta (Mega Pack 03: Cursos Inglés)
2. ✅ Información correcta
3. ✅ Precio correcto ($20.000)
4. ✅ Sin inventar información

## Si Aún Falla

### Verificar Logs

Buscar en la consola:
```
[IntelligentEngine] 🔍 Palabras clave extraídas:
[IntelligentEngine] 📊 [Producto]: [Puntos]
[IntelligentEngine] ✅ Encontrados X productos relevantes
```

### Verificar API Keys

```bash
# Ver cuántas API keys están configuradas
grep "GROQ_API_KEY" .env | wc -l
```

### Verificar Producto en BD

```bash
npx tsx -e "import { db } from './src/lib/db'; (async () => { const p = await db.product.findFirst({ where: { name: { contains: 'Inglés' } } }); console.log('Nombre:', p?.name); console.log('Status:', p?.status); })()"
```

---

**✅ Mejoras aplicadas - Reinicia el bot y prueba**
