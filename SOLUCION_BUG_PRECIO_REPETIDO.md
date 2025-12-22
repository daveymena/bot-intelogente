# 🐛 Bug: Precio Repetido ($2 $2 $2...)

## Problema Identificado

El bot muestra:
```
• $2• $2• $2• $2• $2• $2• $2• $2• $2• $2• $2• $2• $2• $2
```

En lugar de mostrar el precio correctamente.

## Causa

El `ResponseFormatter` tiene un bug en el método `convertToVisualBullets()`:

```typescript
// PROBLEMA: Este regex captura números seguidos de punto
formatted = formatted.replace(/^\s*(\d+)\.\s*(.+)$/gm, '• $2')
```

Cuando el texto contiene algo como "20.000" (precio), el regex lo interpreta como:
- `(\d+)` captura "20"
- `\.` captura el punto
- `(.+)` captura "000"
- Reemplaza con `• $2` que es "000"

Pero como hay múltiples coincidencias, genera múltiples "• $2".

## Solución

### Opción 1: Desactivar el ResponseFormatter Temporalmente

En `src/lib/baileys-stable-service.ts`, línea ~625:

```typescript
// COMENTAR ESTA LÍNEA:
// const formattedResponse = ResponseFormatter.format(aiResponse.message)

// USAR DIRECTAMENTE:
const formattedResponse = aiResponse.message
```

### Opción 2: Corregir el ResponseFormatter

En `src/lib/response-formatter.ts`, método `convertToVisualBullets`:

```typescript
private static convertToVisualBullets(text: string): string {
  let formatted = text

  // CAMBIAR ESTA LÍNEA:
  // formatted = formatted.replace(/^\s*(\d+)\.\s*(.+)$/gm, '• $2')
  
  // POR ESTA (que NO captura precios):
  formatted = formatted.replace(/^\s*(\d+)\.\s+([A-Za-zÁ-ú].+)$/gm, '• $2')
  
  // Convertir guiones a viñetas •
  formatted = formatted.replace(/^\s*[-–—]\s*(.+)$/gm, '• $1')
  
  // Convertir asteriscos a viñetas •
  formatted = formatted.replace(/^\s*\*\s*(.+)$/gm, '• $1')

  return formatted
}
```

### Opción 3: Solución Rápida (Recomendada)

Desactivar completamente el formateador hasta corregirlo:

```typescript
// En src/lib/response-formatter.ts
static format(response: string): string {
  // DESACTIVAR TEMPORALMENTE
  return response.trim()
  
  // TODO: Corregir bugs antes de reactivar
  // let formatted = response.trim()
  // ...
}
```

## Aplicar Solución Rápida

### Paso 1: Editar response-formatter.ts

```typescript
export class ResponseFormatter {
  static format(response: string): string {
    // 🐛 DESACTIVADO TEMPORALMENTE - Bug con precios
    return response.trim()
  }
  
  // ... resto del código sin cambios
}
```

### Paso 2: Reiniciar el bot

```bash
npm run dev
```

### Paso 3: Probar

```
Cliente: "curso de inglés"
Bot: [Debería mostrar el precio correctamente sin repeticiones]
```

## Corrección Completa (Para Después)

El ResponseFormatter necesita:

1. **No procesar precios como listas**
   - Detectar patrones de precio: `\d+[.,]\d+`
   - No aplicar regex de listas a líneas con precios

2. **Mejorar detección de listas**
   - Solo convertir listas que empiecen con letra
   - Ignorar números que sean parte de precios

3. **Agregar tests**
   - Test con precios
   - Test con listas
   - Test con mezcla de ambos

## Código Corregido

```typescript
private static convertToVisualBullets(text: string): string {
  let formatted = text

  // Convertir listas numeradas a viñetas • 
  // SOLO si la línea empieza con número, punto y LETRA
  formatted = formatted.replace(/^\s*\d+\.\s+([A-Za-zÁ-ú¿¡].+)$/gm, '• $1')
  
  // Convertir guiones a viñetas •
  formatted = formatted.replace(/^\s*[-–—]\s*(.+)$/gm, '• $1')
  
  // Convertir asteriscos a viñetas •
  formatted = formatted.replace(/^\s*\*\s*(.+)$/gm, '• $1')

  return formatted
}
```

## Archivos Afectados

- `src/lib/response-formatter.ts` - Contiene el bug
- `src/lib/baileys-stable-service.ts` - Usa el formateador

## Próximos Pasos

1. ✅ Desactivar formateador temporalmente
2. ✅ Reiniciar bot
3. ✅ Verificar que funcione
4. ⏳ Corregir formateador completamente
5. ⏳ Agregar tests
6. ⏳ Reactivar formateador

---

**Estado**: 🐛 Bug identificado
**Solución temporal**: Desactivar formateador
**Solución permanente**: Corregir regex
**Prioridad**: Alta
