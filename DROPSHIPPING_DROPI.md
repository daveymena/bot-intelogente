# 🚀 Dropshipping con Dropi - Guía Completa

## ¿Qué es Dropi?

Dropi es la plataforma de dropshipping #1 en Latinoamérica. Te permite vender miles de productos sin inventario, con envíos directos desde proveedores verificados.

## 🎯 Ventajas de Dropi

- ✅ **Miles de productos** - Catálogo actualizado constantemente
- ✅ **Envíos rápidos** - 3-5 días en Colombia
- ✅ **Sin inventario** - Vende sin comprar stock
- ✅ **Proveedores verificados** - Calidad garantizada
- ✅ **Precios mayoristas** - Márgenes de ganancia altos
- ✅ **Integración fácil** - API y herramientas

## 📋 Requisitos

### 1. Cuenta en Dropi

1. Regístrate en: https://dropi.co
2. Completa tu perfil
3. Obtén tu API key (opcional pero recomendado)

### 2. Configurar API Key (Opcional)

Si tienes cuenta en Dropi, agrega tu API key al `.env`:

```env
DROPI_API_KEY=tu_api_key_aqui
```

**Sin API key**: El script usará productos de demostración.

## 🚀 Uso Rápido

### Opción 1: Con API Key (Recomendado)

```bash
# 1. Configurar API key en .env
echo "DROPI_API_KEY=tu_key" >> .env

# 2. Obtener productos
npm run scrape:dropi

# 3. Importar a base de datos
npm run import:dropi
```

### Opción 2: Sin API Key (Demo)

```bash
# Obtener productos de demostración
npx tsx scripts/scrape-dropi.ts

# Importar
npx tsx scripts/import-dropi.ts
```

## 📦 Categorías Disponibles

El script busca productos en estas categorías:

- 🖥️ **Tecnología** - Gadgets, accesorios tech
- 🏠 **Hogar** - Decoración, organización
- 💄 **Belleza** - Cuidado personal, maquillaje
- ⚽ **Deportes** - Fitness, outdoor
- 🐕 **Mascotas** - Accesorios, juguetes
- 🧸 **Juguetes** - Niños, bebés
- 👕 **Ropa** - Moda, accesorios
- 📱 **Accesorios** - Fundas, cargadores

## 💰 Modelo de Negocio

### Cómo Funciona

1. **Cliente pregunta** por producto en WhatsApp
2. **Bot muestra** producto con tu precio
3. **Cliente compra** y paga
4. **Tú ordenas** en Dropi con precio mayorista
5. **Dropi envía** directo al cliente
6. **Tú ganas** la diferencia

### Ejemplo de Ganancia

```
Precio Dropi:     $89,900
Tu precio venta:  $129,900
Tu ganancia:      $40,000 (44%)
```

## 🤖 Integración con el Bot

Cada producto importado incluye:

```
✅ Nombre y descripción
✅ Precio mayorista
✅ Precio sugerido de venta
✅ Imágenes de alta calidad
✅ SKU del proveedor
✅ Tiempo de envío
✅ Estado de stock
✅ Respuesta automática del bot
```

### Ejemplo de Respuesta del Bot

```
¡Excelente elección! 🎉

Smartwatch Deportivo Pro

💰 Precio: $129,900 COP
🏷️ Antes: $199,900 (35% OFF)

📦 Producto de dropshipping con Dropi
⏱️ Tiempo de entrega: 3-5 días hábiles
✅ Producto nuevo y original
✅ En stock

Reloj inteligente con monitor de frecuencia cardíaca, 
GPS integrado y resistencia al agua IP68...

¿Te gustaría hacer el pedido? 🛒
```

## 🔧 Configuración Avanzada

### Agregar Margen de Ganancia

Edita `scripts/import-dropi.ts`:

```typescript
// Agregar 40% de margen
price: product.price * 1.4,
```

### Filtrar por Categoría

Edita `scripts/scrape-dropi.ts`:

```typescript
const CATEGORIAS = [
  'tecnologia',  // Solo tecnología
  'hogar',       // Solo hogar
];
```

### Personalizar Respuestas

Edita la variable `autoResponse` en `scripts/import-dropi.ts`.

## 📊 Comandos Disponibles

```bash
# Obtener productos de Dropi
npm run scrape:dropi

# Importar a base de datos
npm run import:dropi

# Actualización completa
npm run dropship:dropi
```

## 🔄 Actualización Automática

### Windows (Task Scheduler)

Crea `actualizar-dropi.bat`:

```batch
@echo off
cd C:\ruta\a\tu\proyecto
call npm run scrape:dropi
call npm run import:dropi
```

Programa para ejecutar diariamente.

### Linux/Mac (Cron)

```bash
# Agregar a crontab (diario a las 2 AM)
0 2 * * * cd /ruta/proyecto && npm run dropship:dropi
```

## 💡 Consejos para Vender

### 1. Precios Competitivos
- Investiga precios del mercado
- Agrega margen razonable (30-50%)
- Considera costos de envío

### 2. Descripciones Atractivas
- Destaca beneficios, no solo características
- Usa emojis para llamar la atención
- Incluye garantías y políticas

### 3. Servicio al Cliente
- Responde rápido
- Sé transparente con tiempos de envío
- Ofrece seguimiento del pedido

### 4. Marketing
- Comparte productos en redes sociales
- Crea ofertas especiales
- Usa el catálogo público de tu bot

## 📈 Flujo de Trabajo Recomendado

### Diario
1. Actualizar catálogo (1 vez al día)
2. Revisar mensajes de clientes
3. Procesar pedidos en Dropi

### Semanal
1. Analizar productos más vendidos
2. Ajustar precios si es necesario
3. Agregar nuevos productos

### Mensual
1. Revisar márgenes de ganancia
2. Evaluar proveedores
3. Optimizar catálogo

## 🎯 Productos Más Vendidos

Según estadísticas de Dropi:

1. **Smartwatches** - Alta demanda
2. **Audífonos Bluetooth** - Muy populares
3. **Luces LED** - Decoración hogar
4. **Accesorios para celular** - Rotación rápida
5. **Productos para mascotas** - Nicho creciente

## 🔐 Seguridad y Privacidad

- ✅ No compartas tu API key
- ✅ Usa HTTPS en producción
- ✅ Guarda credenciales en `.env`
- ✅ No subas `.env` a GitHub

## 📞 Soporte Dropi

- 🌐 Web: https://dropi.co
- 📧 Email: soporte@dropi.co
- 💬 WhatsApp: Disponible en su sitio
- 📚 Docs: https://docs.dropi.co

## 🚨 Solución de Problemas

### "No se encontró API key"
```bash
# Agregar al .env
echo "DROPI_API_KEY=tu_key" >> .env
```

### "Error de autenticación"
- Verifica que tu API key sea correcta
- Revisa que tu cuenta esté activa
- Contacta soporte de Dropi

### "Productos no se importan"
```bash
# Verificar archivo JSON
cat scripts/dropi-productos.json

# Revisar logs
npx tsx scripts/import-dropi.ts
```

## 📊 Métricas Esperadas

- **Productos disponibles**: 1000+
- **Tiempo de scraping**: 1-2 minutos
- **Tiempo de importación**: 30-60 segundos
- **Margen promedio**: 30-50%
- **Tiempo de envío**: 3-5 días

## 🎉 Próximos Pasos

1. ✅ Regístrate en Dropi
2. ✅ Obtén tu API key
3. ✅ Configura el `.env`
4. ✅ Ejecuta `npm run dropship:dropi`
5. ✅ Revisa productos en dashboard
6. ✅ Prueba el bot
7. ✅ ¡Empieza a vender!

## 🌟 Ventajas vs Otros Proveedores

| Característica | Dropi | Otros |
|---------------|-------|-------|
| Envíos Colombia | 3-5 días | 15-30 días |
| Soporte | Español | Inglés |
| Precios | Competitivos | Variables |
| Calidad | Verificada | Inconsistente |
| Devoluciones | Fácil | Complicado |

## 💼 Casos de Éxito

Vendedores usando Dropi reportan:
- 📈 Ventas desde el primer mes
- 💰 Márgenes de 40-60%
- ⭐ Alta satisfacción de clientes
- 🚀 Crecimiento sostenible

¡Éxito con tu negocio de dropshipping! 🚀
