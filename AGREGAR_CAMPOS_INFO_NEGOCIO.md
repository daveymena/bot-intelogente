# 📝 Agregar Campos de Información del Negocio

## 🎯 Problema

Las respuestas directas usan información hardcodeada (vieja). Necesitamos que usen información actualizada desde la base de datos.

## ✅ Solución

Agregar campos a la tabla `BotSettings` para almacenar:
- Horarios de atención
- Dirección/ubicación
- Información de envíos
- Política de garantía

## 📦 Campos a Agregar

```prisma
model BotSettings {
  // ... campos existentes ...
  
  // Información del Negocio
  businessHours        String?  // Horarios de atención
  businessAddress      String?  // Dirección completa
  whatsappNumber       String?  // Número de WhatsApp
  shippingInfo         String?  // Información de envíos
  warrantyInfo         String?  // Política de garantía
}
```

## 🔧 Pasos para Implementar

### 1. Actualizar Schema de Prisma

Edita `prisma/schema.prisma` y agrega los campos después de `businessPhone`:

```prisma
model BotSettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  businessName          String   @default("Tecnovariedades D&S")
  businessPhone         String
  
  // 📝 NUEVOS CAMPOS - Información del Negocio
  businessHours         String?  // Horarios de atención
  businessAddress       String?  // Dirección completa
  whatsappNumber        String?  // Número de WhatsApp
  shippingInfo          String?  // Información de envíos
  warrantyInfo          String?  // Política de garantía
  
  botPersonality        String?  // Custom bot personality prompt
  // ... resto de campos ...
}
```

### 2. Generar Migración

```bash
npx prisma migrate dev --name add_business_info_fields
```

### 3. Actualizar Base de Datos

```bash
npx prisma db push
```

### 4. Configurar Información en el Dashboard

Ve al dashboard y configura:

1. **Horarios de Atención**:
```
📅 Lunes a Viernes: 9:00 AM - 6:00 PM
📅 Sábados: 9:00 AM - 2:00 PM
📅 Domingos: Cerrado
```

2. **Dirección**:
```
Centro Comercial El Diamante 2
San Nicolás, Cali
Colombia
```

3. **WhatsApp**:
```
+57 304 274 8687
```

4. **Información de Envíos**:
```
✅ Envíos a toda Colombia
📦 Tiempo de entrega: 2-5 días hábiles
💰 Costo: Depende de la ciudad

📍 Cali: Envío gratis en compras mayores a $100.000
🌎 Otras ciudades: Coordinadora, Servientrega, Interrapidísimo
```

5. **Garantía**:
```
✅ Garantía de 30 días en todos los productos
🔄 Cambios y devoluciones sin problema
📦 Productos nuevos y sellados

Condiciones:
• Producto en perfecto estado
• Empaque original
• Factura de compra
```

## 🎨 Interfaz en el Dashboard

Agregar en `src/app/api/settings/route.ts`:

```typescript
// GET - Obtener configuración
export async function GET(request: Request) {
  // ... código existente ...
  
  return NextResponse.json({
    // ... campos existentes ...
    businessHours: settings.businessHours,
    businessAddress: settings.businessAddress,
    whatsappNumber: settings.whatsappNumber,
    shippingInfo: settings.shippingInfo,
    warrantyInfo: settings.warrantyInfo
  })
}

// PUT - Actualizar configuración
export async function PUT(request: Request) {
  const {
    // ... campos existentes ...
    businessHours,
    businessAddress,
    whatsappNumber,
    shippingInfo,
    warrantyInfo
  } = await request.json()
  
  await db.botSettings.update({
    where: { userId },
    data: {
      // ... campos existentes ...
      businessHours,
      businessAddress,
      whatsappNumber,
      shippingInfo,
      warrantyInfo
    }
  })
}
```

## ✅ Resultado

Después de implementar:

1. ✅ Las respuestas directas usarán información actualizada desde BD
2. ✅ Puedes actualizar la información desde el dashboard
3. ✅ Cache de 5 minutos para evitar consultas excesivas
4. ✅ Fallback a valores por defecto si no hay configuración

## 🧪 Probar

```bash
# 1. Actualizar schema
npx prisma db push

# 2. Reiniciar bot
npm run dev

# 3. Enviar mensajes de prueba
"Cuál es el horario" → Debe usar info de BD
"Dónde están ubicados" → Debe usar info de BD
"Hacen envíos" → Debe usar info de BD
"Tienen garantía" → Debe usar info de BD
```

## 📝 Notas

- El sistema ya está preparado para usar estos campos
- Solo falta agregarlos al schema y configurarlos
- El cache evita consultas excesivas a la BD
- Si no hay configuración, usa valores por defecto (fallback)

---

**¿Quieres que agregue estos campos al schema ahora?**
