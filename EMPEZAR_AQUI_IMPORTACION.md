# 🚀 EMPEZAR AQUÍ - IMPORTACIÓN DE PRODUCTOS CON FOTOS

## ⚡ COMANDO RÁPIDO

```bash
# Opción 1: Script BAT (Windows)
importar-todos-productos-con-fotos.bat

# Opción 2: NPM (Multiplataforma)
npm run import:all
```

**Tiempo estimado**: 10-20 minutos  
**Resultado**: 110-160 productos con fotos reales

---

## 📦 ¿QUÉ SE VA A IMPORTAR?

### 1. MegaComputer (50-100 productos)
- ✅ Portátiles, impresoras, monitores
- ✅ Fotos reales desde megacomputer.com.co
- ✅ Precios actualizados
- ✅ Links directos a la tienda

### 2. Disyvar (30 productos)
- ✅ Productos dropshipping
- ✅ Margen de ganancia: 30%
- ✅ Fotos reales
- ✅ Stock: 50 unidades

### 3. SmartJoys (30 productos)
- ✅ Productos de tecnología
- ✅ Margen de ganancia: $20,000 COP
- ✅ Fotos reales
- ✅ Stock: 50 unidades

---

## 🎯 COMANDOS DISPONIBLES

### Importar TODO (Recomendado)
```bash
npm run import:all
```

### Importar por partes
```bash
# Solo MegaComputer
npm run scrape:megacomputer
npm run import:megacomputer

# Solo Disyvar
npm run import:disyvar

# Solo SmartJoys
npm run scrape:smartjoys
npm run import:smartjoys
```

---

## ✅ VERIFICAR RESULTADOS

```bash
# Ver productos importados
npx tsx scripts/ver-productos.js

# Iniciar dashboard
npm run dev
# Abrir: http://localhost:3000/dashboard
```

---

## 📋 CHECKLIST

- [ ] Ejecutar `npm run import:all` o `importar-todos-productos-con-fotos.bat`
- [ ] Esperar 10-20 minutos
- [ ] Verificar en dashboard que hay productos
- [ ] Verificar que las fotos cargan
- [ ] Probar búsqueda de productos en el bot

---

## 🆘 PROBLEMAS COMUNES

### "No se encontró usuario admin"
```bash
# Crear usuario admin
npx tsx scripts/crear-admin.js
```

### "Error de Prisma"
```bash
npx prisma generate
npx prisma db push
```

### "Timeout en scraping"
- Verifica tu conexión a internet
- Intenta de nuevo (tiene reintentos automáticos)

---

## 📚 MÁS INFORMACIÓN

- `EJECUTAR_IMPORTACION_PRODUCTOS.md` - Guía detallada
- `PLAN_IMPORTACION_PRODUCTOS.md` - Plan completo
- `LISTO_IMPORTAR_PRODUCTOS_CON_FOTOS.md` - Resumen técnico

---

## 🎉 ¡LISTO!

Ejecuta este comando y en 15 minutos tendrás todos los productos:

```bash
npm run import:all
```

O si prefieres el script BAT:

```bash
importar-todos-productos-con-fotos.bat
```
