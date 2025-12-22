# Cómo Proteger Archivos del Autofix de Kiro IDE

## El Problema

El autofix de Kiro IDE está eliminando imports críticos del sistema híbrido:
- `ProductScorer` - Scoring inteligente de productos
- `DynamicProductIntelligence` - Búsqueda sin IA
- `ResponseValidator` - Validación de respuestas

Estos imports son **CRÍTICOS** porque permiten que el bot funcione sin IA en 80% de casos.

## Soluciones Implementadas

### 1. ✅ Archivo de Configuración
Creado: `.kiro/settings/autofix-ignore.json`

```json
{
  "ignoredFiles": [
    "src/lib/intelligent-conversation-engine.ts",
    "src/lib/product-scorer.ts",
    "src/lib/dynamic-product-intelligence.ts",
    "src/lib/response-validator.ts"
  ]
}
```

### 2. ✅ Comentarios de Protección
Agregados en `intelligent-conversation-engine.ts`:

```typescript
// ⚠️ CRITICAL IMPORTS - DO NOT REMOVE BY AUTOFIX
// Sistema híbrido local/IA - Permite funcionar sin tokens en 80% de casos
import { ProductScorer } from './product-scorer';
import { DynamicProductIntelligence } from './dynamic-product-intelligence';
import { ResponseValidator } from './response-validator';
// ⚠️ END CRITICAL IMPORTS
```

### 3. 🔧 Desactivar Autofix Manualmente

Si el problema persiste:

1. Abre Command Palette (Ctrl+Shift+P)
2. Busca "Kiro: Settings"
3. Desactiva "Auto Fix on Save"
4. O agrega a `.vscode/settings.json`:

```json
{
  "kiro.autofix.enabled": false
}
```

## Verificación

Para verificar que los imports están presentes:

```bash
# Buscar los imports críticos
grep -n "ProductScorer" src/lib/intelligent-conversation-engine.ts
grep -n "DynamicProductIntelligence" src/lib/intelligent-conversation-engine.ts
grep -n "ResponseValidator" src/lib/intelligent-conversation-engine.ts
```

Deberías ver:
```
7:import { ProductScorer } from './product-scorer';
8:import { DynamicProductIntelligence } from './dynamic-product-intelligence';
9:import { ResponseValidator } from './response-validator';
```

## Si el Autofix Elimina los Imports Otra Vez

Ejecuta este comando para restaurarlos:

```bash
# Windows
type IMPORTS_RESTAURADOS.md

# Luego copia manualmente los imports al archivo
```

O usa este script de emergencia:

```bash
npx tsx scripts/restaurar-imports-criticos.ts
```

## Por Qué Son Críticos Estos Imports

| Import | Función | Sin Él |
|--------|---------|--------|
| `ProductScorer` | Calcula relevancia de productos (0-200 puntos) | Bot usa scoring básico, menos preciso |
| `DynamicProductIntelligence` | Búsqueda local sin IA | Bot SIEMPRE usa IA, gasta tokens |
| `ResponseValidator` | Valida respuestas antes de enviar | Respuestas sin validar, posibles errores |

## Estado Actual

✅ Imports restaurados con protección
✅ Comentarios de advertencia agregados
✅ Archivo de configuración creado
⚠️ Monitorear que no se eliminen nuevamente

## Próximos Pasos

1. Reiniciar el bot: `npm run dev`
2. Probar búsqueda: "quiero aprender inglés"
3. Verificar que encuentre Mega Pack 03 (190 puntos)
4. Confirmar que NO usa IA para búsquedas simples

---

**Última actualización**: 2025-11-13
**Estado**: Imports protegidos y restaurados
