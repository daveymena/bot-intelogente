# 🚀 Actualizar Información del Negocio - AHORA

## ⚡ Pasos Rápidos

### 1. Actualizar Base de Datos

```bash
npx prisma db push
```

Esto agregará los nuevos campos a la tabla `BotSettings`:
- `businessHours` (horarios)
- `businessAddress` (dirección)
- `whatsappNumber` (WhatsApp)
- `shippingInfo` (envíos)
- `warrantyInfo` (garantía)

### 2. Configurar Información

```bash
npx tsx scripts/configurar-info-negocio.ts
```

Esto actualizará la configuración con la información actual del negocio.

### 3. Reiniciar Bot

```bash
npm run dev
```

### 4. Probar

Envía estos mensajes por WhatsApp:

```
"Cuál es el horario" → Debe mostrar horarios actualizados
"Dónde están ubicados" → Debe mostrar dirección actualizada
"Hacen envíos" → Debe mostrar info de envíos actualizada
"Tienen garantía" → Debe mostrar garantía actualizada
```

---

## 📊 Qué Cambia

### ANTES (Hardcodeado)

```typescript
// Información vieja en el código
getHorarioResponse() {
  return "Lunes a Viernes: 9:00 AM - 6:00 PM..."
}
```

### DESPUÉS (Desde BD)

```typescript
// Información actualizada desde base de datos
getHorarioResponse(config) {
  return config.businessHours // Desde BD
}
```

---

## ✅ Ventajas

1. **Actualizable**: Puedes cambiar la información sin modificar código
2. **Centralizada**: Toda la info en un solo lugar (BD)
3. **Cache**: Se cachea por 5 minutos para rendimiento
4. **Fallback**: Si no hay config, usa valores por defecto

---

## 🔧 Actualizar Información Después

### Opción 1: Desde el Dashboard (Futuro)

Agregar interfaz en el dashboard para editar esta información.

### Opción 2: Directamente en BD

```sql
UPDATE bot_settings 
SET business_hours = 'Nuevos horarios...',
    business_address = 'Nueva dirección...'
WHERE user_id = 'tu_user_id';
```

### Opción 3: Script Personalizado

Modifica `scripts/configurar-info-negocio.ts` con tu información y ejecuta:

```bash
npx tsx scripts/configurar-info-negocio.ts
```

---

## 📝 Información Actual Configurada

### Horarios
```
📅 Lunes a Viernes: 9:00 AM - 6:00 PM
📅 Sábados: 9:00 AM - 2:00 PM
📅 Domingos: Cerrado
```

### Ubicación
```
Centro Comercial El Diamante 2
San Nicolás, Cali
Colombia
```

### WhatsApp
```
+57 304 274 8687
```

### Envíos
```
✅ Envíos a toda Colombia
📦 Tiempo de entrega: 2-5 días hábiles
💰 Costo: Depende de la ciudad

📍 Cali: Envío gratis en compras mayores a $100.000
🌎 Otras ciudades: Coordinadora, Servientrega, Interrapidísimo
```

### Garantía
```
✅ Garantía de 30 días en todos los productos
🔄 Cambios y devoluciones sin problema
📦 Productos nuevos y sellados

Condiciones:
• Producto en perfecto estado
• Empaque original
• Factura de compra
```

---

## 🎯 Resultado Final

Después de estos pasos:

✅ Las respuestas directas usarán información actualizada desde BD  
✅ Puedes actualizar la información sin modificar código  
✅ El sistema tiene cache para mejor rendimiento  
✅ Hay fallback si no hay configuración  

---

**¡Ejecuta los comandos ahora y prueba!** 🚀
