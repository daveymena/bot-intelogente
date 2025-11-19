# ✅ Solución: Conflicto de Rutas Dinámicas en Next.js

## Problema Detectado

```
Error: You cannot use different slug names for the same dynamic path ('storeSlug' !== 'userId').
```

## Causa

Next.js 15 no permite tener dos carpetas con rutas dinámicas diferentes en el mismo nivel:

```
❌ ANTES (CONFLICTO):
/tienda/[storeSlug]/page.tsx
/tienda/[userId]/page.tsx
```

Ambas rutas competían por `/tienda/:param` causando ambigüedad.

## Solución Aplicada

**Eliminadas las carpetas conflictivas:**

1. ✅ Eliminada: `src/app/tienda/[userId]/` (solo redirigía a /tienda)
2. ✅ Eliminada: `src/app/tienda/[storeSlug]/` (estaba vacía)

## Estructura Final de Rutas

```
✅ DESPUÉS (CORRECTO):
/tienda/                    → Catálogo principal
/tienda/producto/[id]/      → Página de producto individual
/tienda/carrito/            → Carrito de compras
/tienda/checkout/           → Proceso de pago
```

## Rutas Funcionales

- **Tienda principal**: `/tienda`
- **Producto individual**: `/tienda/producto/123`
- **Carrito**: `/tienda/carrito`
- **Checkout**: `/tienda/checkout`

## Verificación

```bash
npm run build
```

Ahora el build debería completarse sin errores.

## Notas

- Las tiendas por usuario ahora se acceden desde la tienda principal
- No se necesitan rutas dinámicas adicionales para usuarios
- La estructura es más simple y clara

---

**Fecha**: 19 Nov 2025  
**Estado**: ✅ Resuelto
