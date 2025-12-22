# ✅ Corrección: Búsqueda de Productos Específicos

## 🎯 Problema Identificado

Cliente dice: **"me interesa el curso de piano"**
Bot responde: **"¿Sobre qué producto te gustaría saber más?"** ❌

### Causa Raíz
- El sistema encontraba 35 productos con "curso" (incluyendo Mega Packs)
- El scoring NO priorizaba correctamente el producto específico "Curso Completo de Piano Online"
- Los Mega Packs genéricos competían con productos específicos

## 🔧 Solución Implementada

### 1. **Prioridad a Palabras Únicas**
```typescript
// Si la keyword NO es común (como "piano"), dar MUCHO más peso
if (!this.isCommonWord(keyword)) {
  if (!isGenericPack) {
    score += 40; // PESO MASIVO para palabras únicas en productos específicos
  }
}
```

### 2. **Penalización Masiva a Packs Genéricos**
```typescript
// Si el usuario busca algo específico, penalizar MASIVAMENTE los packs
if (isGenericPack && !userSearchedPack) {
  const hasSpecificSearch = keywords.some(k => !this.isCommonWord(k));
  
  if (hasSpecificSearch || specificKeywords.length > 0) {
    score -= 50; // PENALIZACIÓN MASIVA
  }
}
```

### 3. **Bonus para Keywords Específicas**
```typescript
// Si hay keyword específica (piano, guitarra, etc.) en producto NO genérico
if (!isGenericPack) {
  score += 50; // BONUS MASIVO
}
```

## 📊 Resultado del Test

### Antes ❌
```
1. Mega Pack 01: Cursos Diseño Gráfico
2. Mega Pack 04: Cursos Excel
3. Curso Completo de Piano Online  ← Aparecía en posición 3+
```

### Después ✅
```
🥇 1. [62] Curso Completo de Piano Online
🥈 2. [-19] Mega Pack 01: Cursos Diseño Gráfico
🥉 3. [-19] Mega Pack 02: Cursos Microsoft Office
```

## 🎯 Lógica de Scoring

### Palabras Comunes (bajo peso)
- curso, completo, desde, cero, online, pack, mega, de, el, la

### Palabras Únicas (alto peso)
- piano, guitarra, laptop, moto, diseño, programación, etc.

### Regla Fundamental
**El nombre del producto es lo MÁS importante**
- Si el cliente menciona una palabra única del nombre → Ese producto gana
- Los Mega Packs solo aparecen si el cliente busca "pack" o "megapack"

## 📝 Archivos Modificados

- `src/agents/search-agent.ts` - Scoring mejorado
- `src/agents/utils/intent-detector.ts` - Extrae producto en intención de pago
- `src/agents/payment-agent.ts` - Busca producto en mensaje actual

## 🧪 Tests Creados

- `test-scoring-piano.js` - Verifica scoring correcto
- `test-busqueda-curso-piano.js` - Verifica que el producto existe en BD

## ✅ Casos de Uso Cubiertos

1. ✅ "me interesa el curso de piano" → Curso Completo de Piano Online
2. ✅ "quiero una laptop" → Laptop específica (no Mega Pack)
3. ✅ "me interesa una moto" → Moto específica (no Mega Pack)
4. ✅ "quiero un megapack" → Muestra Mega Packs
5. ✅ "me envías el método de pago del curso de piano" → Detecta producto + genera link

## 🚀 Próximos Pasos

1. Reiniciar el bot: `npm run dev`
2. Probar con cliente real
3. Verificar que encuentra productos específicos correctamente
