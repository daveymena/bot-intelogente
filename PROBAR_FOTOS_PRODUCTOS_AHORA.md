# 🧪 Probar Envío de Fotos de Productos - AHORA

## ✅ Sistema Arreglado

El bot ahora envía cada producto con su foto correspondiente.

---

## 🚀 Cómo Probar (5 minutos)

### Paso 1: Reiniciar Servidor

```bash
# Detener servidor (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

### Paso 2: Conectar WhatsApp

1. Ve a tu dashboard
2. Conecta WhatsApp si no está conectado
3. Escanea QR

### Paso 3: Enviar Mensajes de Prueba

Desde tu WhatsApp, envía estos mensajes:

#### Prueba 1: Varios Productos
```
Qué PCs tienes?
```

**Resultado esperado**:
- Bot envía cada PC con su foto
- Cada mensaje tiene: nombre, specs, precio, foto
- Pausas de 2 segundos entre productos

#### Prueba 2: Producto Específico
```
Cuánto cuesta el Lenovo?
```

**Resultado esperado**:
- Bot envía solo el Lenovo con su foto correcta
- Información completa del producto

#### Prueba 3: Categoría
```
Laptops para gaming
```

**Resultado esperado**:
- Bot envía laptops gaming con sus fotos
- Cada una con su información

#### Prueba 4: Precio
```
El más barato
```

**Resultado esperado**:
- Bot envía el producto más económico con su foto

---

## 📊 Qué Verificar

### ✅ Checklist

- [ ] Cada producto se envía con su foto correspondiente
- [ ] La foto es la correcta (no de otro producto)
- [ ] Información completa (nombre, specs, precio)
- [ ] Formato limpio y profesional
- [ ] Pausas entre productos (no todos de golpe)
- [ ] Máximo 5 productos por consulta

### ❌ Si Algo Falla

1. **No envía fotos**
   - Verifica que los productos tengan imágenes en la BD
   - Revisa logs del servidor

2. **Foto incorrecta**
   - Esto ya no debería pasar
   - Si pasa, reporta el caso específico

3. **Muy lento**
   - Normal, descarga imágenes toma tiempo
   - Puedes reducir el máximo de productos

---

## 🔍 Ver Logs

Mientras pruebas, observa los logs del servidor:

```
[ProductPhotoSender] 📸 Enviando 3 productos con fotos
[ProductPhotoSender] 📦 Enviando producto 1/3: Lenovo IdeaPad
[ProductPhotoSender] 🖼️ URL de foto: https://...
[ProductPhotoSender] 📥 Descargando imagen...
[ProductPhotoSender] ✅ Imagen descargada: 245.67 KB
[ProductPhotoSender] ✅ Producto enviado con foto
[ProductPhotoSender] 📦 Enviando producto 2/3: HP Pavilion
...
```

---

## 💡 Ejemplos de Mensajes para Probar

```
# Generales
"Qué productos tienes?"
"Muéstrame laptops"
"Qué computadoras hay?"

# Específicos
"Cuánto cuesta el Lenovo?"
"Info del HP"
"El Asus cuánto vale?"

# Por categoría
"Laptops para gaming"
"Computadoras para trabajo"
"PCs baratos"

# Por precio
"El más barato"
"El más caro"
"Algo entre 1 y 2 millones"

# Con fotos explícitas
"Muéstrame fotos de laptops"
"Envíame imágenes de PCs"
"Quiero ver los productos"
```

---

## 📸 Ejemplo de Respuesta Esperada

**Usuario**: "Qué PCs tienes?"

**Bot**:
```
*Opción 1 de 3*

💻 *Lenovo IdeaPad 3 Intel Core i5*

⚙️ *Procesador:* Intel Core i5-1135G7
💾 *RAM:* 8GB DDR4
💿 *Almacenamiento:* 256GB SSD
🖥️ *Pantalla:* 15.6" FHD

💰 *Precio: $1.200.000 COP*

_Espera un momento, te envío la siguiente opción..._
```
[FOTO DEL LENOVO]

(pausa 2 segundos)

```
*Opción 2 de 3*

💻 *HP Pavilion Gaming*
...
```
[FOTO DEL HP]

---

## 🎯 Resultado Final

Después de probar, deberías tener:

✅ Bot enviando cada producto con su foto correcta  
✅ Información completa y formateada  
✅ Experiencia profesional para el cliente  
✅ Sin confusiones sobre qué producto es cuál  

---

## 🐛 Reportar Problemas

Si encuentras algún problema:

1. Anota el mensaje exacto que enviaste
2. Anota qué producto esperabas vs qué recibiste
3. Copia los logs del servidor
4. Verifica la BD (que el producto tenga imágenes)

---

## ✅ Todo Listo

El sistema está arreglado y listo para usar.

**Siguiente paso**: Probar con mensajes reales y verificar que funciona correctamente.

---

**Fecha**: Noviembre 2024  
**Estado**: ✅ Listo para probar
