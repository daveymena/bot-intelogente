# Debug: Producto Incorrecto

## Problema Reportado
El bot está enviando información de un producto diferente al que pidió el cliente.

## Logs Agregados

He agregado logs detallados en cada paso para rastrear exactamente qué producto se está usando:

### 1. Cuando busca productos:
```
[BuscarProductos] Palabras clave: [...]
[BuscarProductos] Encontrados: X
[BuscarProductos] Mejor match: [NOMBRE] Score: X
```

### 2. Cuando selecciona el producto:
```
[Conversación] 🎯 PRODUCTO SELECCIONADO:
[Conversación]    ID: 123
[Conversación]    Nombre: Curso Completo de Piano Online
[Conversación]    Precio: 150000
[Conversación]    Categoría: DIGITAL
```

### 3. Cuando dirige al flujo:
```
[DirigirFlujo] 📦 PRODUCTO RECIBIDO:
[DirigirFlujo]    ID: 123
[DirigirFlujo]    Nombre: Curso Completo de Piano Online
[DirigirFlujo]    Precio: 150000
[DirigirFlujo]    Tipo: digital
```

### 4. En el flujo digital:
```
[FlujoDigital] 🎯 PRODUCTO EN FLUJO:
[FlujoDigital]    ID: 123
[FlujoDigital]    Nombre: Curso Completo de Piano Online
[FlujoDigital]    Precio: 150000
[FlujoDigital] ✅ Generando respuesta DIRECTA sin IA
[FlujoDigital] 📤 RESPUESTA GENERADA:
✅ *Curso Completo de Piano Online*

💰 150,000 COP
📲 Entrega digital inmediata

¿Quieres comprarlo? 🔗
```

## Cómo Probar

1. **Reinicia el servidor:**
```bash
npm run dev
```

2. **Envía un mensaje de prueba:**
```
"Curso de piano"
```

3. **Copia TODOS los logs de la consola** desde que envías el mensaje hasta que recibes la respuesta

4. **Pega los logs aquí** para que pueda ver exactamente dónde está el problema

## Posibles Causas

### Causa 1: Búsqueda devuelve producto incorrecto
Si en los logs ves:
```
[BuscarProductos] Mejor match: [PRODUCTO EQUIVOCADO]
```
→ El problema está en la lógica de búsqueda

### Causa 2: Producto cambia entre pasos
Si ves:
```
[Conversación] 🎯 PRODUCTO SELECCIONADO: Curso de Piano
[DirigirFlujo] 📦 PRODUCTO RECIBIDO: Otro Producto
```
→ El producto se está cambiando entre funciones

### Causa 3: Respuesta usa producto diferente
Si ves:
```
[FlujoDigital] 🎯 PRODUCTO EN FLUJO: Curso de Piano
[FlujoDigital] 📤 RESPUESTA GENERADA: [Otro producto]
```
→ La función de respuesta está usando datos incorrectos

## Información Necesaria

Por favor proporciona:

1. **Mensaje que enviaste**: "..."
2. **Producto que esperabas**: "..."
3. **Producto que recibiste**: "..."
4. **Logs completos** de la consola

Con esta información podré identificar exactamente dónde está el problema.

## Ejemplo de Logs Correctos

```
[Baileys] 📨 Mensaje procesado de 6988129931330@lid: Curso de piano
[Conversación] Usuario: 6988129931330@lid, Mensaje: Curso de piano
[Conversación] Intención detectada: busqueda_producto
[BuscarProductos] Palabras clave: [ 'curso', 'piano' ]
[BuscarProductos] Encontrados: 5
[BuscarProductos] Mejor match: Curso Completo de Piano Online Score: 8
[BuscarProductos] ✅ Match específico detectado - Devolviendo solo 1 producto
[Conversación] 🎯 PRODUCTO SELECCIONADO:
[Conversación]    ID: 123
[Conversación]    Nombre: Curso Completo de Piano Online
[Conversación]    Precio: 150000
[Conversación]    Categoría: DIGITAL
[DirigirFlujo] 📦 PRODUCTO RECIBIDO:
[DirigirFlujo]    ID: 123
[DirigirFlujo]    Nombre: Curso Completo de Piano Online
[DirigirFlujo]    Precio: 150000
[DirigirFlujo]    Tipo: digital
[DirigirFlujo] ✅ Usando flujo DIGITAL
[FlujoDigital] 🎯 PRODUCTO EN FLUJO:
[FlujoDigital]    ID: 123
[FlujoDigital]    Nombre: Curso Completo de Piano Online
[FlujoDigital]    Precio: 150000
[FlujoDigital] ✅ Generando respuesta DIRECTA sin IA
[FlujoDigital] 📤 RESPUESTA GENERADA:
✅ *Curso Completo de Piano Online*

💰 150,000 COP
📲 Entrega digital inmediata

¿Quieres comprarlo? 🔗
[Baileys] ✅ Respuesta enviada
```

Si los logs muestran que el ID, nombre y precio son consistentes en todos los pasos, entonces el producto es correcto.

Si en algún paso cambia, ahí está el problema.
