# 🔗 CONFIGURAR ENLACES DE CATÁLOGO Y TIENDA

## 📋 NUEVA FUNCIONALIDAD

El bot ahora puede compartir automáticamente los enlaces de tu catálogo y tienda cuando el cliente los solicite.

## 🎯 CUÁNDO SE COMPARTE

La IA detecta automáticamente cuando el cliente quiere ver el catálogo:

```
✅ "quiero ver el catálogo"
✅ "link del catálogo"
✅ "dónde puedo ver los productos"
✅ "tienes tienda online"
✅ "ver todos los productos"
✅ "catálogo completo"
```

## ⚙️ CÓMO CONFIGURAR

### Opción 1: Desde el Dashboard

1. Ve a **Configuración** → **Información del Negocio**
2. Agrega los campos:
   - **Link del Catálogo**: URL de tu catálogo (ej: `/catalogo`)
   - **Link de la Tienda**: URL de tu tienda online

### Opción 2: Directamente en Base de Datos

Actualiza el campo `businessInfo` del usuario:

```sql
UPDATE "User"
SET "businessInfo" = jsonb_set(
  COALESCE("businessInfo", '{}'::jsonb),
  '{catalogLink}',
  '"https://tudominio.com/catalogo"'
)
WHERE id = 'tu_user_id';

UPDATE "User"
SET "businessInfo" = jsonb_set(
  COALESCE("businessInfo", '{}'::jsonb),
  '{storeLink}',
  '"https://tudominio.com/tienda"'
)
WHERE id = 'tu_user_id';
```

### Opción 3: Con Script

Crea un script `scripts/configurar-enlaces-catalogo.ts`:

```typescript
import { db } from '../src/lib/db';

async function configurarEnlaces() {
  const userId = 'tu_user_id'; // Reemplaza con tu ID
  
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    console.log('Usuario no encontrado');
    return;
  }

  const businessInfo = user.businessInfo 
    ? (typeof user.businessInfo === 'string' ? JSON.parse(user.businessInfo) : user.businessInfo)
    : {};

  // Configurar enlaces
  businessInfo.catalogLink = 'http://localhost:4000/catalogo';
  businessInfo.storeLink = 'http://localhost:4000/tienda'; // Opcional

  await db.user.update({
    where: { id: userId },
    data: {
      businessInfo: businessInfo
    }
  });

  console.log('✅ Enlaces configurados:');
  console.log('📋 Catálogo:', businessInfo.catalogLink);
  console.log('🛒 Tienda:', businessInfo.storeLink);
}

configurarEnlaces()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
```

Ejecutar:
```bash
npx tsx scripts/configurar-enlaces-catalogo.ts
```

## 📱 EJEMPLO DE USO

### Con Enlaces Configurados:

```
Cliente: "quiero ver el catálogo"

Bot: "📱 *CATÁLOGO DE PRODUCTOS*

📋 *Ver Catálogo Completo:*
http://localhost:4000/catalogo

🛒 *Visitar Tienda Online:*
http://localhost:4000/tienda

Aquí puedes ver todos nuestros productos con:
✅ Fotos reales
✅ Precios actualizados
✅ Descripciones completas
✅ Disponibilidad en tiempo real

¿Te interesa algo en particular? ¡Pregúntame! 😊"
```

### Sin Enlaces Configurados:

```
Cliente: "quiero ver el catálogo"

Bot: "📱 *NUESTROS PRODUCTOS*

Puedes ver todos nuestros productos disponibles contactándome directamente:

📞 WhatsApp: +57 304 274 8687

¿Te interesa algún producto en particular? 😊"
```

## 🎯 ACCIONES QUE DISPARAN SHARE_CATALOG

La IA decide usar `share_catalog` cuando detecta:

1. **Solicitud directa de catálogo:**
   - "catálogo"
   - "ver catálogo"
   - "link del catálogo"
   - "envíame el catálogo"

2. **Solicitud de tienda:**
   - "tienda"
   - "tienda online"
   - "link de la tienda"
   - "dónde comprar"

3. **Quiere ver todos los productos:**
   - "ver todos los productos"
   - "qué productos tienen"
   - "dónde puedo ver los productos"
   - "mostrar productos"

## 🔧 ESTRUCTURA DEL businessInfo

```json
{
  "catalogLink": "http://localhost:4000/catalogo",
  "storeLink": "http://localhost:4000/tienda",
  "businessName": "Tecnovariedades D&S",
  "phone": "+57 304 274 8687",
  "email": "contacto@tecnovariedades.com",
  "address": "Centro Comercial El Diamante 2, San Nicolás, Cali",
  "schedule": "Lunes a Viernes: 8:00 AM - 6:00 PM"
}
```

## 📊 LOGS ESPERADOS

```
[ActionOrchestrator] Analiza mensaje...
[ActionOrchestrator] 🎯 Acción: share_catalog
[ActionOrchestrator] 💭 Razonamiento: "Cliente solicita ver catálogo completo"
[ActionOrchestrator] 📊 Confianza: 98%
[ActionOrchestrator] ⚡ Ejecutando: share_catalog
[ActionOrchestrator] ✅ Enlaces compartidos
```

## ✅ VENTAJAS

1. **Automático**: IA detecta cuándo compartir el catálogo
2. **Flexible**: Funciona con o sin enlaces configurados
3. **Contextual**: Comparte solo cuando el cliente lo solicita
4. **Profesional**: Mensaje bien formateado con emojis

## 🎉 RESULTADO

El bot ahora puede:
- ✅ Detectar cuando el cliente quiere ver el catálogo
- ✅ Compartir enlaces de catálogo y tienda automáticamente
- ✅ Funcionar sin enlaces (fallback a WhatsApp)
- ✅ Respuesta profesional y clara

**El cliente puede explorar todos tus productos con un solo mensaje.**
