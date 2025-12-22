# ✅ Imágenes Externas Configuradas

## 🔧 Problema

Next.js bloqueaba imágenes de dominios externos:
```
Error: Invalid src prop (https://dcdn-us.mitiendanube.com/...)
hostname "dcdn-us.mitiendanube.com" is not configured
```

## ✅ Solución

Se agregaron los dominios externos al `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    { hostname: 'megacomputer.com.co' },
    { hostname: 'images.unsplash.com' },
    { hostname: 'via.placeholder.com' },
    { hostname: 'dcdn-us.mitiendanube.com' },      // ✅ Nuevo
    { hostname: '*.mitiendanube.com' },            // ✅ Nuevo (wildcard)
    { hostname: 'http2.mlstatic.com' },            // ✅ Nuevo (MercadoLibre)
    { hostname: 'upload.wikimedia.org' },          // ✅ Nuevo (Wikipedia)
  ]
}
```

## 🚀 Reiniciar Servidor

Los cambios en `next.config.ts` requieren reiniciar:

```bash
# 1. Detener servidor (Ctrl+C)
# 2. Iniciar de nuevo
npm run dev
```

## ✅ Estado

- ✅ Dominios configurados
- ✅ Propiedad `unoptimized` agregada
- ✅ Listo para usar

## 📝 Nota

Si agregas productos con imágenes de otros dominios, agrégalos a `next.config.ts` en la sección `images.remotePatterns`.
