# 🛍️ Guía Rápida: Importar Productos de SmartJoys

## 📋 Proceso Completo

### Paso 1: Scrapear Productos de SmartJoys

Ejecuta el scraper para extraer productos de https://smartjoys.co/tienda/

```bash
# Opción 1: Usando el .bat
scrapear-smartjoys-ahora.bat

# Opción 2: Comando directo
npx tsx scripts/scrape-smartjoys-final.ts
```

**Resultado:**
- Se abrirá un navegador (Puppeteer)
- Extraerá hasta 30 productos con imágenes
- Guardará en: `scripts/productos-dropshipping.json`

**Tiempo estimado:** 5-10 minutos

---

### Paso 2: Importar a la Base de Datos

Una vez scrapeados los productos, impórtalos con margen de ganancia:

```bash
# Opción 1: Usando el .bat
importar-smartjoys-ahora.bat

# Opción 2: Comando directo
npx tsx scripts/importar-smartjoys.ts
```

**Características:**
- ✅ Margen de ganancia: 20%
- ✅ Categorización automática
- ✅ Descripción mejorada con características
- ✅ Tags automáticos (dropshipping, smartjoys, categoría)
- ✅ Detección de duplicados (actualiza en lugar de crear)

---

## 🎯 Categorías Detectadas Automáticamente

El sistema categoriza productos según palabras clave:

- **Audífonos**: audífono, auricular, headphone, earbud, airpod
- **Cargadores y Cables**: cargador, cable, usb, type-c, lightning
- **Smartwatches**: smartwatch, reloj, watch, band
- **Parlantes**: parlante, speaker, bocina, altavoz
- **Power Banks**: power bank, batería, powerbank
- **Fundas y Protectores**: funda, case, protector, cover
- **Periféricos**: mouse, teclado, keyboard
- **Cámaras**: cámara, camera, webcam
- **Iluminación**: luz, led, lámpara
- **Soportes**: soporte, holder, stand
- **Micrófonos**: micrófono, mic, microphone
- **Adaptadores**: adaptador, conversor, hub

---

## 💰 Configuración de Precios

**Margen de ganancia:** 20% sobre el precio de SmartJoys

Ejemplo:
- Precio SmartJoys: $50,000 COP
- Precio con margen: $60,000 COP

Para cambiar el margen, edita en `scripts/importar-smartjoys.ts`:

```typescript
const MARGEN_GANANCIA = 0.20; // 20%
```

---

## 📊 Ejemplo de Salida

```
🔄 ========================================
🔄 IMPORTANDO PRODUCTOS SMARTJOYS
🔄 ========================================

✅ Usuario: admin@smartsalesbot.com
📦 Productos SmartJoys encontrados: 25

✅ Creado: Audífonos Bluetooth TWS - 60,000 COP
✅ Creado: Smartwatch Y68 - 84,000 COP
✅ Creado: Parlante Portátil JBL - 120,000 COP
🔄 Actualizado: Power Bank 20000mAh
...

📊 ========================================
📊 RESUMEN FINAL
📊 ========================================
✅ Productos creados: 20
🔄 Productos actualizados: 5
❌ Errores: 0
📦 Total procesados: 25
💰 Margen aplicado: 20%

✅ ¡Productos SmartJoys importados exitosamente!

🗄️  Total de productos en base de datos: 75
```

---

## 🔧 Solución de Problemas

### Error: "No se encontró el archivo productos-dropshipping.json"

**Solución:** Primero ejecuta el scraper:
```bash
scrapear-smartjoys-ahora.bat
```

### Error: "No se encontró usuario admin"

**Solución:** Crea un usuario admin primero:
```bash
npx tsx scripts/crear-usuario-admin-smart-sales.js
```

### El navegador no se abre

**Solución:** Instala las dependencias de Puppeteer:
```bash
npm install puppeteer
```

### Productos sin imágenes

El scraper solo importa productos con imágenes válidas. Si algunos productos no tienen imágenes, no se importarán.

---

## 📁 Archivos Relacionados

- **Scraper:** `scripts/scrape-smartjoys-final.ts`
- **Importador:** `scripts/importar-smartjoys.ts`
- **Datos scrapeados:** `scripts/productos-dropshipping.json`
- **Ejecutables:**
  - `scrapear-smartjoys-ahora.bat`
  - `importar-smartjoys-ahora.bat`

---

## 🚀 Proceso Completo en 2 Comandos

```bash
# 1. Scrapear productos
scrapear-smartjoys-ahora.bat

# 2. Importar a la base de datos
importar-smartjoys-ahora.bat
```

¡Listo! Tus productos de SmartJoys estarán disponibles en el dashboard y el bot podrá venderlos automáticamente.

---

## 📝 Notas Importantes

1. **Dropshipping:** Los productos se marcan automáticamente como dropshipping
2. **Stock:** Se asigna stock de 50 unidades por defecto
3. **Duplicados:** Si un producto ya existe (mismo nombre), se actualiza en lugar de crear uno nuevo
4. **URL Original:** Se guarda en `paymentLinkCustom` para referencia
5. **Imágenes:** Se importan todas las imágenes encontradas del producto

---

## 🎨 Personalización

Para personalizar el scraper, edita `scripts/scrape-smartjoys-final.ts`:

- Cambiar número máximo de productos
- Modificar selectores CSS
- Ajustar tiempo de espera entre productos
- Agregar más categorías a scrapear

---

**¿Necesitas ayuda?** Revisa los logs en la consola para ver detalles de cada producto procesado.
