# 🔧 Solución: Error de Hidratación en Tienda

## ❌ Problema

Error de hidratación en Next.js:
```
Hydration failed because the server rendered HTML didn't match the client.
```

## 🔍 Causa

El error ocurría porque estábamos accediendo a `localStorage` durante el render inicial, pero `localStorage` no existe en el servidor (SSR). Esto causaba que el HTML generado en el servidor fuera diferente al generado en el cliente.

**Código problemático:**
```typescript
useEffect(() => {
  fetchProducts()
  updateCartCount() // ❌ Accede a localStorage inmediatamente
  
  window.addEventListener('cartUpdated', updateCartCount)
  return () => window.removeEventListener('cartUpdated', updateCartCount)
}, [])

const updateCartCount = () => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]') // ❌ localStorage no existe en servidor
  const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
  setCartCount(total)
}
```

## ✅ Solución

Separar la carga del carrito en un `useEffect` independiente y verificar que estamos en el cliente:

**Código corregido:**
```typescript
// Efecto 1: Cargar productos
useEffect(() => {
  fetchProducts()
}, [])

// Efecto 2: Cargar carrito solo en el cliente
useEffect(() => {
  updateCartCount() // ✅ Se ejecuta solo en el cliente
  
  window.addEventListener('cartUpdated', updateCartCount)
  return () => window.removeEventListener('cartUpdated', updateCartCount)
}, [])

const updateCartCount = () => {
  if (typeof window === 'undefined') return // ✅ Verificar que estamos en el cliente
  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
  setCartCount(total)
}
```

## 📝 Cambios Aplicados

### 1. **src/app/tienda/page.tsx**
- ✅ Separado `fetchProducts()` y `updateCartCount()` en diferentes `useEffect`
- ✅ Agregado verificación `typeof window === 'undefined'`

### 2. **src/app/tienda/producto/[id]/page.tsx**
- ✅ Separado efectos de carga de producto y carrito
- ✅ Agregado verificación en `updateCartCount()`
- ✅ Agregado verificación en `handleAddToCart()`

## 🎯 Reglas para Evitar Errores de Hidratación

### ❌ NO hacer:
1. Acceder a `localStorage` durante el render
2. Usar `Date.now()` o `Math.random()` en el render
3. Acceder a `window` sin verificar
4. Formatear fechas sin considerar timezone del servidor

### ✅ SÍ hacer:
1. Usar `useEffect` para código que solo debe ejecutarse en el cliente
2. Verificar `typeof window !== 'undefined'` antes de usar APIs del navegador
3. Usar `useState` con valores iniciales que funcionen en servidor y cliente
4. Separar lógica de servidor y cliente en diferentes efectos

## 🔍 Otras Causas Comunes

El error también puede ser causado por:

1. **Extensiones del navegador** (bloqueadores de anuncios, etc.)
   - Solución: Probar en modo incógnito
   
2. **HTML inválido** (tags mal anidados)
   - Solución: Validar estructura HTML
   
3. **Componentes que modifican el DOM directamente**
   - Solución: Usar refs y efectos

4. **Librerías de terceros que modifican el DOM**
   - Solución: Cargarlas solo en el cliente con `dynamic import`

## 🚀 Resultado

Ahora la tienda carga correctamente sin errores de hidratación:
- ✅ El contador del carrito se carga solo en el cliente
- ✅ No hay diferencias entre HTML del servidor y cliente
- ✅ La experiencia del usuario es fluida

---

**Última actualización:** 20 de Noviembre 2025
