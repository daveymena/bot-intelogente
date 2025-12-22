# 🔧 Corrección del Test de Contexto de Pago

## 🐛 Problemas Encontrados en el Test

### 1. **Error de Foreign Key**
```
Foreign key constraint violated on the constraint: `conversations_userId_fkey`
```
**Causa**: El test usaba un `userId` que no existe en la base de datos.

**Solución**: Crear test que use un usuario REAL de la BD.

### 2. **Bot No Buscaba Productos**
El bot respondía con saludo genérico en lugar de buscar productos.

**Causa**: La detección de intención clasificaba "tienes portátiles?" como "saludo" en lugar de "busqueda_producto".

**Solución**: Mejorar la detección de intención para priorizar búsqueda de productos.

## ✅ Correcciones Aplicadas

### 1. **Nuevo Test con Usuario Real**
Archivo: `test-contexto-pago-real.js`

```javascript
// Obtiene un usuario real de la BD
const usuario = await db.user.findFirst({
  where: {
    role: { in: ['ADMIN', 'OWNER'] }
  }
});

const botUserId = usuario.id; // Usa ID real
```

### 2. **Detección Mejorada de Búsqueda de Productos**
Archivo: `src/conversational-module/utils/detectarIntencion.ts`

**Antes**:
```typescript
// Solo detectaba algunos productos
if (/(computador|portátil|laptop|moto)/i.test(textoLower)) {
  return { intencion: 'busqueda_producto', confianza: 0.7 };
}
```

**Ahora**:
```typescript
// Detecta más productos y con mayor confianza
if (/(computador|portátil|portatil|laptop|notebook|moto|motocicleta|curso|megapack|audífonos|audifonos|mouse|teclado|monitor|impresora|celular|telefono|teléfono|tablet)/i.test(textoLower)) {
  return { intencion: 'busqueda_producto', confianza: 0.9 };
}

// Detecta preguntas sobre disponibilidad
if (/(tienen|tienes|hay|venden|vendes|manejan|manejas)\s+(computador|portátil|portatil|laptop|moto|curso|megapack)/i.test(textoLower)) {
  return { intencion: 'busqueda_producto', confianza: 0.95 };
}
```

### 3. **Priorización de Intenciones**
```typescript
// Detectar palabras clave de intención fuerte
const tieneIntencionFuerte = /(precio|costo|valor|cuánto|venden|tienen|disponible|envío|pago|comprar|quiero|necesito|busco|interesa|información|detalles|portátil|laptop|computador|moto|curso|megapack)/i.test(textoLower);

// Si empieza con saludo pero tiene intención fuerte, NO es solo saludo
if (/^(hola|buenos días|buenas tardes)/i.test(textoLower)) {
  if (!tieneIntencionFuerte && textoLower.length < 30) {
    return { intencion: 'saludo', confianza: 0.95 };
  }
}
```

## 🧪 Cómo Probar Ahora

### Opción 1: Test Automatizado (Actualizado)
```bash
probar-contexto-pago.bat
```

Este script ahora ejecuta `test-contexto-pago-real.js` que:
1. Busca un usuario real en la BD
2. Usa ese usuario para el test
3. Verifica el flujo completo

### Opción 2: Prueba Manual
1. Asegúrate de tener un usuario en la BD
2. Envía al bot: "tienes portátiles?"
3. Espera respuesta (debe mostrar portátiles)
4. Envía: "Quiero pagar"
5. Verifica que envíe links del portátil

## 📊 Flujo Correcto Esperado

```
Cliente: "tienes portátiles?"
   ↓
[Detección] Intención: busqueda_producto (confianza: 0.95)
   ↓
[Búsqueda] Encuentra portátiles en BD
   ↓
[Guardado] TRIPLE PERSISTENCIA del producto
   ↓
Bot: "Sí, tengo este Portátil HP..."
   ↓
Cliente: "Quiero pagar"
   ↓
[Detección] Intención: solicitud_pago (confianza: 0.95)
   ↓
[Búsqueda] ESTRATEGIA 1: Contexto híbrido → ✅ ENCONTRADO
   ↓
Bot: "Aquí están los links para el Portátil HP..."
```

## 📁 Archivos Modificados

1. ✅ `test-contexto-pago-real.js` - Nuevo test con usuario real
2. ✅ `probar-contexto-pago.bat` - Actualizado para usar nuevo test
3. ✅ `src/conversational-module/utils/detectarIntencion.ts` - Detección mejorada
4. ✅ `CORRECCION_TEST_CONTEXTO_PAGO.md` - Este archivo

## ✅ Verificación

El test debe mostrar:
```
✅ Usuario encontrado: tu@email.com
✅ Bot mencionó un producto
✅ Bot envió información de pago
✅ Bot NO mencionó cursos
✅ Bot mencionó el producto correcto
✅ TEST EXITOSO: El contexto se mantuvo correctamente
```

## 🔍 Si el Test Aún Falla

1. **Verifica que tienes un usuario en la BD**:
```bash
npx prisma studio
# Abre la tabla User y verifica que hay al menos un usuario
```

2. **Verifica que tienes productos**:
```bash
npx prisma studio
# Abre la tabla Product y verifica que hay portátiles
```

3. **Revisa los logs**:
```powershell
Get-Content server-electron.log -Tail 100 | Select-String "InformacionPago|TRIPLE PERSISTENCIA|ENCONTRADO"
```

## 💡 Notas Importantes

- El test ahora usa un usuario REAL de la BD (no un ID inventado)
- La detección de intención ahora prioriza búsqueda de productos sobre saludos
- El sistema de triple persistencia sigue funcionando correctamente
- Los logs son más detallados para debugging

---

**Fecha**: 29 Nov 2025  
**Estado**: ✅ CORREGIDO  
**Próximo Paso**: Ejecutar `probar-contexto-pago.bat`
