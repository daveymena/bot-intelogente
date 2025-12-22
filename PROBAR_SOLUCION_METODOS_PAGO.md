# 🧪 PROBAR SOLUCIÓN: Métodos de Pago Correctos

## ⚡ Prueba Rápida (Recomendado)

```bash
npx tsx scripts/test-contexto-producto.ts
```

Este script simula una conversación completa y verifica que:
- El producto se mantiene en contexto
- Los métodos de pago corresponden al producto correcto
- No hay cambios inesperados de producto

## 📱 Prueba Manual con WhatsApp

### Escenario 1: Curso de Diseño Gráfico

1. **Iniciar el bot:**
   ```bash
   npm run dev
   ```

2. **Conectar WhatsApp** (si no está conectado)

3. **Enviar mensajes de prueba:**
   ```
   Tú: "Hola, tienes el curso de diseño gráfico?"
   Bot: [Debe responder con info del Mega Pack Diseño Gráfico]
   
   Tú: "¿Cómo puedo pagar?"
   Bot: [Debe mostrar métodos de pago del MEGA PACK DISEÑO GRÁFICO]
   ```

4. **Verificar en la respuesta:**
   - ✅ El título dice "Mega Pack 01: Cursos Diseño Gráfico" (o similar)
   - ✅ El precio es $20,000 COP (o el precio correcto del megapack)
   - ❌ NO debe decir "Curso Completo de Piano Online"

### Escenario 2: Curso de Piano

1. **Enviar mensajes:**
   ```
   Tú: "Tienes el curso de piano?"
   Bot: [Debe responder con info del Curso de Piano]
   
   Tú: "Métodos de pago"
   Bot: [Debe mostrar métodos de pago del CURSO DE PIANO]
   ```

2. **Verificar:**
   - ✅ El título dice "Curso Completo de Piano Online"
   - ✅ El precio es $60,000 COP (o el precio correcto)
   - ❌ NO debe mencionar otros productos

### Escenario 3: Cambio de Producto

1. **Enviar mensajes:**
   ```
   Tú: "Tienes laptops?"
   Bot: [Muestra laptops disponibles]
   
   Tú: "¿Cómo puedo pagar?"
   Bot: [Debe mostrar métodos de pago de la LAPTOP mencionada]
   
   Tú: "Mejor quiero el curso de piano"
   Bot: [Cambia a curso de piano]
   
   Tú: "¿Cómo pago?"
   Bot: [Debe mostrar métodos de pago del CURSO DE PIANO]
   ```

## 🔍 Revisar Logs en Consola

Mientras pruebas, observa los logs en la consola del servidor:

```
[IntelligentEngine] 🔄 Actualizando contexto...
   Producto actual ANTES: Mega Pack 01: Cursos Diseño Gráfico
   Productos encontrados: 1
[IntelligentEngine] ✅ Manteniendo producto actual: Mega Pack 01: Cursos Diseño Gráfico
   Producto actual DESPUÉS: Mega Pack 01: Cursos Diseño Gráfico

[IntelligentEngine] 💳 Generando TODOS los métodos de pago para:
   productoID: abc123
   productoNombre: Mega Pack 01: Cursos Diseño Gráfico
   productoPrecio: 20000

[PaymentLink] ✅ Producto encontrado: Mega Pack 01: Cursos Diseño Gráfico
[PaymentLink] 💰 Precio: 20,000 COP
```

### ✅ Logs Correctos:
- El producto ANTES y DESPUÉS es el mismo
- El nombre del producto coincide en todos los logs
- El precio es consistente

### ❌ Logs Incorrectos (si ves esto, hay un problema):
- El producto cambia entre ANTES y DESPUÉS sin que el usuario lo pida
- El nombre del producto no coincide entre logs
- Aparece "ERROR CRÍTICO: Los links son de un producto diferente"

## 🐛 Si Encuentras Problemas

### Problema: El producto sigue cambiando

1. **Verifica que los cambios se aplicaron:**
   ```bash
   git status
   ```

2. **Reinicia el servidor:**
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

3. **Limpia la memoria del bot:**
   - Envía un mensaje nuevo desde un número diferente
   - O espera 24 horas (la memoria se resetea automáticamente)

### Problema: Los logs no aparecen

1. **Verifica que estás en modo desarrollo:**
   ```bash
   npm run dev
   ```

2. **Revisa que NODE_ENV no esté en producción:**
   ```bash
   echo $NODE_ENV
   ```

### Problema: Error al generar links

1. **Verifica las credenciales de pago en .env:**
   ```bash
   npx tsx scripts/verificar-credenciales-pago.ts
   ```

2. **Revisa que el producto existe en la base de datos:**
   ```bash
   npx tsx scripts/ver-productos.ts
   ```

## 📊 Resultados Esperados

### ✅ Prueba Exitosa:
- El producto se mantiene correcto durante toda la conversación
- Los métodos de pago corresponden al producto consultado
- Los precios son correctos
- Los links de MercadoPago/PayPal funcionan
- No hay errores en los logs

### ❌ Prueba Fallida:
- El producto cambia sin que el usuario lo pida
- Los métodos de pago son de otro producto
- Aparecen errores en los logs
- Los links no se generan

## 🚀 Siguiente Paso

Una vez que confirmes que todo funciona:

1. **Documenta los resultados** en un archivo de prueba
2. **Notifica al equipo** que el problema está resuelto
3. **Monitorea las conversaciones reales** durante las primeras horas

---

**Fecha:** 2025-11-11
**Prioridad:** CRÍTICA
**Estado:** Listo para probar
