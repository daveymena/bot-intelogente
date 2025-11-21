# Correcciones Responsive Móvil - 20 Nov 2025

## Problemas Identificados

1. ✅ Botones se salen del viewport en móvil
2. ✅ Header apiñado en landing pages móvil
3. ✅ No hay viewport meta tag correcto
4. ✅ Logo no aparece en links compartidos (Open Graph)

## Soluciones Aplicadas

### 1. Viewport y Meta Tags
- Agregar viewport responsive en layout.tsx
- Configurar Open Graph images correctamente

### 2. Dashboard Responsive
- Sidebar colapsable automático en móvil
- Botones con tamaño adaptativo
- Padding reducido en móvil

### 3. Landing Page Responsive
- Header con altura adaptativa
- Botones con width: 100% en móvil
- Grid responsive para imágenes
- Formulario con campos apilados

### 4. Logo en Links Compartidos
- Configurar opengraph-image.tsx
- Agregar metadata correcta
