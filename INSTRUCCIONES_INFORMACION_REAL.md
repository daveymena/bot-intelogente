# 🚨 Instrucciones Críticas - Solo Información Real

## ✅ Implementado

He agregado instrucciones MUY CLARAS en el prompt del bot para que:

### ❌ NO Invente Información

El bot NO debe:
- ❌ Inventar características que no están en la descripción
- ❌ Inventar precios diferentes
- ❌ Inventar garantías no especificadas
- ❌ Inventar testimonios ("500 clientes satisfechos")
- ❌ Inventar durabilidad ("dura 5 años")
- ❌ Inventar comparaciones sin datos reales

### ✅ SÍ Use Información Real

El bot SÍ debe:
- ✅ Usar el precio EXACTO de la base de datos
- ✅ Usar SOLO las características de la descripción
- ✅ Usar los beneficios que SÍ están en tags/descripción
- ✅ Si no sabe algo: "Déjame verificar esa información"

## 📋 Instrucciones Agregadas al Prompt

```
🚨 CRÍTICO - INFORMACIÓN REAL SOLAMENTE:

1. USA SOLO información de los PRODUCTOS DISPONIBLES arriba
2. NO inventes características que no están en la descripción
3. NO inventes precios diferentes a los mostrados
4. NO inventes garantías o beneficios no especificados
5. SI no tienes información específica, di "déjame verificar"

EJEMPLOS DE LO QUE NO DEBES HACER:
❌ "Tiene 8GB RAM" (si no está en la descripción)
❌ "Garantía de 2 años" (si no está especificado)
❌ "Más de 500 clientes" (si no tienes ese dato)
❌ "Dura 5 años" (si no está confirmado)

EJEMPLOS DE LO QUE SÍ DEBES HACER:
✅ Usar el precio EXACTO del producto
✅ Usar las características de la descripción
✅ Usar los beneficios que SÍ están en tags/descripción
✅ Si no sabes algo: "Déjame verificar esa información para ti"
```

## 📱 Ejemplo de Respuesta Correcta

### Si el producto tiene poca información:

**Producto en BD:**
```
Nombre: Laptop ASUS
Precio: 2500000
Descripción: Laptop para trabajo
```

**Respuesta CORRECTA del bot:**
```
¡Excelente! 😍 Te cuento sobre el Laptop ASUS:

Este modelo es ideal para trabajo 💼

💰 Precio: $2.500.000

📝 Es un laptop diseñado para uso profesional

¿Te gustaría saber algo específico? Puedo verificar:
• Especificaciones técnicas
• Garantía disponible
• Opciones de pago

O si prefieres, te envío fotos 📸
```

**Respuesta INCORRECTA (NO hacer):**
```
❌ "Tiene Intel Core i5, 8GB RAM, 512GB SSD"
   (Si no está en la descripción)

❌ "Garantía de 2 años incluida"
   (Si no está especificado)

❌ "Más de 300 clientes satisfechos"
   (Si no tienes ese dato)
```

## 🎯 Cómo Manejar Falta de Información

### Si el cliente pregunta algo que no sabes:

**Cliente:** "¿Cuánta RAM tiene?"

**Respuesta CORRECTA:**
```
Déjame verificar esa información específica para ti 😊

Lo que sí te puedo confirmar es:
• Precio: $2.500.000
• Es ideal para trabajo profesional
• Tenemos disponibilidad inmediata

¿Te gustaría que consulte las especificaciones técnicas completas?
O puedo enviarte fotos detalladas 📸
```

**Respuesta INCORRECTA:**
```
❌ "Tiene 8GB de RAM"
   (Si no lo sabes con certeza)
```

## 💡 Técnicas para Ser Dinámico SIN Inventar

### 1. Usa Microcopy Emocional Genérico

✅ CORRECTO:
```
"Este modelo es muy popular entre profesionales por su confiabilidad 👌"
"Imagina poder trabajar sin preocuparte por el rendimiento ✨"
```

❌ INCORRECTO:
```
"500 profesionales ya lo compraron"
"Dura 10 años sin problemas"
```

### 2. Beneficios Lógicos de Características Reales

Si la descripción dice "Laptop para trabajo":

✅ CORRECTO:
```
"💼 Diseñado para trabajo — Ideal para tareas profesionales diarias"
```

❌ INCORRECTO:
```
"💼 Intel Core i7 — Potencia extrema para multitarea"
(Si no sabes el procesador)
```

### 3. Comparaciones Genéricas

✅ CORRECTO:
```
"A diferencia de modelos básicos, este está diseñado para uso profesional 💪"
```

❌ INCORRECTO:
```
"Dura 3 veces más que otros laptops"
(Si no tienes datos)
```

### 4. Prueba Social Genérica

✅ CORRECTO:
```
"Nuestros clientes valoran mucho la calidad de nuestros productos ⭐"
```

❌ INCORRECTO:
```
"Más de 500 clientes satisfechos con este modelo"
(Si no tienes ese número)
```

## 🔧 Cómo Mejorar la Información en la BD

Para que el bot pueda dar mejor información SIN inventar:

### 1. Agrega Descripciones Completas

En el dashboard, al agregar productos:
```
Nombre: Laptop ASUS VivoBook 15
Precio: 2500000
Descripción: Laptop profesional con Intel Core i5 (11va Gen), 
8GB RAM, 512GB SSD, Pantalla 15.6" Full HD. Ideal para trabajo, 
estudio y multitarea. Incluye Windows 11.
```

### 2. Usa Tags para Beneficios

```
Tags: 
- garantia:1año
- envio:gratis
- uso:profesional
- uso:estudiantes
```

### 3. Especifica Métodos de Pago

```
Tags:
- mercadopago:https://link
- nequi:3042748687
```

## ✅ Resultado Final

Con estas instrucciones, el bot:

1. ✅ USA solo información REAL de la base de datos
2. ✅ NO inventa características, precios o garantías
3. ✅ Si no sabe algo, pregunta o dice "déjame verificar"
4. ✅ Es dinámico y persuasivo CON información real
5. ✅ Usa microcopy emocional genérico (no inventa datos)
6. ✅ Ofrece verificar información adicional

**El bot es honesto, confiable y profesional.** 🎯
