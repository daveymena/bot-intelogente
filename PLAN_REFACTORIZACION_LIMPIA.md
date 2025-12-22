# Plan de Refactorización Limpia

## Problema Actual

El sistema tiene DEMASIADA complejidad:
- 10+ sistemas diferentes
- 200+ archivos de documentación
- Código desincronizado
- Parches sobre parches

## Solución: Sistema Limpio Paralelo

Crear un nuevo sistema limpio que coexista con el actual, luego migrar gradualmente.

## Fase 1: Crear Sistema Limpio (2-3 horas)

### 1.1 Estructura Nueva
```
src/
  clean-bot/
    services/
      context.ts          # Gestión de contexto por usuario
      ai.ts               # Detección de intención + generación
      products.ts         # Búsqueda de productos
      payments.ts         # Generación de links
    controllers/
      message-handler.ts  # Controlador principal
    types/
      index.ts            # Tipos TypeScript
```

### 1.2 Principios del Sistema Limpio

1. **IA solo para redacción**, datos del backend
2. **Un solo flujo** sin ramificaciones complejas
3. **Contexto simple** en Prisma
4. **Sin inventar datos** nunca
5. **Logs claros** para debug

### 1.3 Migración Gradual

**Semana 1**: Sistema limpio funcionando en paralelo
**Semana 2**: Migrar usuarios de prueba al sistema limpio
**Semana 3**: Migrar todos los usuarios
**Semana 4**: Eliminar sistema antiguo

## Fase 2: Implementación (Ahora)

### Opción A: Implementar Sistema Limpio Ahora
- Tiempo: 2-3 horas
- Riesgo: Bajo (coexiste con el actual)
- Beneficio: Sistema que funciona correctamente

### Opción B: Seguir Parcheando
- Tiempo: Indefinido
- Riesgo: Alto (más complejidad)
- Beneficio: Ninguno real

## Recomendación

**Implementar el sistema limpio AHORA** basado en el módulo que compartiste, adaptado a tu stack (Baileys, Next.js, Prisma).

¿Quieres que lo implemente?

## Alternativa Rápida

Si no quieres refactorizar ahora, puedo:

1. **Desactivar TODOS los sistemas** excepto uno
2. **Simplificar ese uno** al máximo
3. **Hacer que funcione** correctamente

Esto tomaría 30 minutos pero el código seguirá siendo complejo.

## Tu Decisión

¿Qué prefieres?

A) Implementar sistema limpio nuevo (2-3 horas, solución permanente)
B) Simplificar sistema actual (30 min, solución temporal)
C) Seguir debuggeando el sistema actual (tiempo indefinido)
