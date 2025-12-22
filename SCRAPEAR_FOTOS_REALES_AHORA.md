# 🔍 SCRAPEAR FOTOS REALES - GUÍA COMPLETA

## 🎯 Situación Actual

- **35 productos** con fotos reales ✅
- **78 productos** con fotos Unsplash (genéricas) ⚠️
- **Total: 113 productos**

## 🛠️ Herramientas Disponibles

### 1. Scraper Universal de Fotos
**Archivo:** `scripts/scraper-fotos-todas-tiendas.ts`

Este scraper busca fotos en:
- ✅ Disyvar
- ✅ SmartJoys
- ✅ MegaComputer
- ✅ Alkosto
- ✅ Éxito

### 2. Comandos Batch Disponibles

```bash
# Actualizar productos SIN fotos
actualizar-fotos-sin-imagenes.bat

# Actualizar productos con POCAS fotos (menos de 2)
actualizar-fotos-pocas-imagenes.bat

# Actualizar TODOS los productos
actualizar-todas-fotos.bat
```

## 🚀 Cómo Usar

### Opción 1: Scrapear Productos Sin Fotos Reales

```bash
npx tsx scripts/scraper-fotos-todas-tiendas.ts sin-fotos
```

Esto buscará fotos para los 78 productos que tienen fotos de Unsplash.

### Opción 2: Scrapear Productos con Pocas Fotos

```bash
npx tsx scripts/scraper-fotos-todas-tiendas.ts pocas-fotos
```

Busca productos con menos de 2 imágenes y les agrega más.

### Opción 3: Scrapear TODOS los Productos

```bash
npx tsx scripts/scraper-fotos-todas-tiendas.ts todos
```

⚠️ **ADVERTENCIA:** Esto puede tardar mucho tiempo (113 productos × 5 tiendas)

## 📋 Productos que Necesitan Fotos Reales (78)

### Productos Físicos (47)
- MANILLA DE PAPEL TYVEK PARA EVENTOS
- PAPEL HIGIENICO INSTITUCIONAL
- BORRADOR DE NATA PEQUEÑO
- BASE PARA PORTATIL
- LAPIZ CON BORRADOR CAJA X 12 UNIDES
- MOUSE OPTICO ALAMBRICO
- DESENGRASANTE GL X 3750 CC ORION
- MOUSE ECONOMICO
- CEPILLO DE DIENTES HAPPY TOOTH
- COPA STAR 0.5 CON TAPA X 50 UN
- TOALLA MANOS ROLLO - NUBE
- STRECH TRANSPARENTE 50cmX500mts
- Bolso antirrobo
- Set de cocina
- Mini máquina de coser
- ROLLO DE ETIQUETAS (varios)
- Aspiradora de carro
- Maleta antirrobo
- MASAJEADOR FACIAL REDUCTOR PAPADA
- Papel air fryer por 100
- SEPARADOR PLASTICO DELGADO
- ENVASE CAMPANA JABON DE MANOS
- Lámpara de Escritorio LED Recargable
- SILLA PLEGABLE REDONDA BUTACA
- Tira LED RGB 5m con Control Remoto
- Cepillo deslanador
- Webcam Full HD 1080P con Micrófono
- Silla plástica para niños
- Cámara de Seguridad WiFi 1080P
- Teclado Mecánico RGB Gamer
- Soporte Celular para Auto Magnético
- Power Bank Solar 30000mAh
- Power Bank 20000mAh Carga Rápida
- Parlante Karaoke con Micrófono
- Cable USB-C a Lightning 2m
- Parlante Bluetooth Portátil 20W
- Cargador Rápido 65W USB-C
- Smartwatch Deportivo GPS
- Audífonos Gamer RGB con Micrófono
- Audífonos Bluetooth TWS Pro
- Proyector Portátil HY320
- Smartwatch Serie 9 Plus Ultra
- AirPods Pro (Segunda Generación)
- Control Inalámbrico para PC/PS3/Android
- Anillo de Luz LED para Selfies
- CINTA TRANSPARENTE 2"X 100MTS
- MINI PARLANTE G63 SMART LIGHT
- PILA ALCALINA 9V MAXELL
- TINTA PARA SELLOS PELIKAN
- Mouse Gamer RGB 7200 DPI

### Productos Digitales (31 Megapacks)
- Mega Pack 06: Cursos Programación
- Mega Pack 07: Cursos Marketing Digital
- Mega Pack 08: Cursos Fotografía
- Mega Pack 09: Cursos Video Edición
- Mega Pack 10: Cursos Música Producción
- Mega Pack 12: Cursos Emprendimiento
- Mega Pack 13: Cursos Finanzas Personales
- Mega Pack 14: Cursos Desarrollo Web
- Mega Pack 15: Cursos Inteligencia Artificial
- Mega Pack 17: Cursos Idiomas
- Mega Pack 20: Cursos Cocina
- Mega Pack 21: Cursos Fitness
- Mega Pack 22: Cursos Yoga y Meditación
- Mega Pack 23: Cursos Belleza y Maquillaje
- Mega Pack 24: Cursos Arquitectura
- Mega Pack 25: Cursos Ingeniería
- Mega Pack 26: Cursos Medicina
- Mega Pack 27: Cursos Derecho
- Mega Pack 28: Cursos Contabilidad
- Mega Pack 29: Cursos Administración
- Mega Pack 30: Cursos Ventas
- Mega Pack 31: Cursos Liderazgo
- Mega Pack 32: Cursos Oratoria
- Mega Pack 33: Cursos Escritura Creativa
- Mega Pack 35: Cursos SEO
- Mega Pack 36: Cursos E-commerce
- Mega Pack 40: Cursos Completos

## ⚙️ Configuración del Scraper

El scraper está configurado para:
- ✅ Buscar en 5 tiendas diferentes
- ✅ Extraer hasta 5 imágenes por producto
- ✅ Filtrar imágenes de placeholder/logo
- ✅ Combinar con imágenes existentes
- ✅ Generar reporte JSON

## 📊 Proceso del Scraper

1. **Busca el producto** en cada tienda
2. **Extrae el primer resultado**
3. **Navega a la página del producto**
4. **Extrae todas las imágenes**
5. **Filtra y normaliza URLs**
6. **Actualiza la base de datos**
7. **Genera reporte**

## ⏱️ Tiempo Estimado

- **Sin fotos (78 productos):** ~6-8 horas
- **Pocas fotos:** ~2-4 horas
- **Todos (113 productos):** ~10-12 horas

## 💡 Recomendación

### Para Productos Físicos:
```bash
# Ejecutar el scraper para productos sin fotos
npx tsx scripts/scraper-fotos-todas-tiendas.ts sin-fotos
```

### Para Megapacks:
Los megapacks ya tienen una foto genérica consistente (`/fotos/megapack2.jpg`).
Si quieres fotos específicas, necesitarías:
1. Crear imágenes personalizadas para cada megapack
2. O usar la misma imagen genérica (recomendado)

## 📝 Después del Scraping

1. **Verificar resultados:**
```bash
npx tsx scripts/buscar-fotos-faltantes.ts
```

2. **Ver reporte:**
```bash
type scripts\reporte-fotos.json
```

3. **Verificar en dashboard:**
```bash
npm run dev
```

## 🎯 Alternativa Rápida

Si no quieres esperar el scraping completo, puedes:

1. **Mantener fotos genéricas** para productos que no son críticos
2. **Scrapear solo productos principales** (portátiles, impresoras, etc.)
3. **Agregar fotos manualmente** desde el dashboard

## 🚨 Importante

- El scraper usa Puppeteer (navegador headless)
- Necesita buena conexión a internet
- Puede ser bloqueado por algunas tiendas
- Respeta los delays entre requests
- Genera logs detallados

## ✅ Próximos Pasos

1. Decidir qué productos scrapear
2. Ejecutar el comando correspondiente
3. Esperar a que termine
4. Verificar resultados
5. Actualizar fotos faltantes manualmente si es necesario

---

**Fecha:** 24 de Noviembre 2025  
**Estado:** Listo para ejecutar  
**Productos pendientes:** 78/113
