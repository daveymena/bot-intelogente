# 📦 Importar Catálogo Completo de Productos

## ✅ Catálogo Listo para Importar

Tu catálogo completo está en `scripts/productos-completos.json` con:

- **40 Mega Packs digitales** (cursos, recursos, plantillas)
- **50+ Laptops** (ASUS, HP, Lenovo, Apple)
- **Componentes** (RAM, SSD, discos externos)
- **Accesorios** (morrales, cámaras, memorias USB)
- **Equipos POS** (puntos de venta)
- **Y más...**

---

## 🚀 Importar Productos (1 Paso)

Ejecuta el script:

```bash
importar-catalogo-completo.bat
```

Esto importará automáticamente:
- Mega Packs con imágenes
- Laptops con especificaciones completas
- Componentes con precios actualizados
- Accesorios con descripciones

---

## 📊 Qué Se Importa

### Mega Packs Digitales (40 productos)
- Diseño y Creatividad
- Oficina y Productividad
- Tecnología y Programación
- Marketing y Negocios
- Educación y Desarrollo Personal
- Y más categorías...

**Precio:** $20,000 COP cada uno
**Tipo:** Digital (acceso inmediato)

### Laptops ASUS VivoBook
- Desde $1,189,000 hasta $7,499,000 COP
- Diferentes procesadores (Ryzen, Intel)
- Varias configuraciones de RAM y SSD
- Con imágenes reales

### Laptops HP
- Desde $1,150,000 hasta $2,669,000 COP
- Modelos para trabajo y estudio
- Diferentes tamaños y especificaciones

### Componentes
- **Memoria RAM:** Desde $95,000 COP
- **Discos SSD:** Desde $87,000 COP
- **Discos Externos:** Desde $299,000 COP

### Accesorios
- **Morrales HP:** Desde $70,000 COP
- **Cámaras IP:** Desde $80,000 COP
- **Memorias USB:** Desde $13,000 COP

---

## 🖼️ Imágenes de Productos

Todos los productos se importan con imágenes reales de Unsplash:
- Laptops: Imágenes de laptops profesionales
- Componentes: Imágenes de hardware
- Accesorios: Imágenes de productos reales
- Mega Packs: Imágenes de cursos digitales

---

## 🤖 El Bot Conocerá Todos los Productos

Después de importar, el bot podrá:
- Recomendar productos específicos
- Responder preguntas sobre precios
- Sugerir productos según necesidades
- Proporcionar especificaciones técnicas

### Ejemplo de Conversación:

**Cliente:** "Necesito una laptop para trabajo"

**Bot:** "Tengo varias opciones para ti:

1. ASUS VivoBook AMD Ryzen 5 - $1,498,000
   - 16GB RAM, 512GB SSD, Pantalla 15.6\" FHD

2. HP Intel Core i5 - $1,729,000
   - 8GB RAM, 512GB SSD, Pantalla 15.6\" FHD

3. Lenovo AMD Ryzen 7 - $2,099,000
   - 16GB RAM, 1TB SSD, Pantalla 15.6\" FHD

¿Cuál te interesa más?"

---

## 📝 Personalizar Productos

Después de importar, puedes:

### Desde el Dashboard:
1. Ve a "Productos"
2. Haz clic en cualquier producto
3. Edita:
   - Precio
   - Descripción
   - Stock
   - Imágenes
   - Tags

### Agregar Más Productos:
1. Haz clic en "Agregar Producto"
2. Completa el formulario
3. Agrega URL de imagen real
4. Guarda

---

## 🎨 Cambiar Imágenes

Para cambiar la imagen de un producto:

1. Busca una imagen en:
   - Unsplash: https://unsplash.com
   - Pexels: https://pexels.com
   - O usa tu propia imagen

2. Copia la URL de la imagen

3. En el dashboard:
   - Edita el producto
   - Pega la URL en el campo "Imágenes"
   - Guarda

**Formato de URL:**
```
https://images.unsplash.com/photo-XXXXXX?w=500
```

---

## 💡 Tips

### Precios
- Todos los precios están en COP (Pesos Colombianos)
- Puedes cambiarlos según tu margen
- El bot mostrará los precios actualizados

### Descripciones
- Incluye especificaciones técnicas
- Menciona beneficios clave
- Usa lenguaje claro y directo

### Tags
- Ayudan al bot a encontrar productos
- Usa palabras clave relevantes
- Ejemplo: `laptop, asus, ryzen, 16gb`

### Stock
- Actualiza regularmente
- Marca como "Agotado" cuando no haya
- El bot no mostrará productos agotados

---

## 🔄 Actualizar Catálogo

Si quieres actualizar el catálogo:

1. Edita `scripts/productos-completos.json`
2. Ejecuta `importar-catalogo-completo.bat` de nuevo
3. Los productos se actualizarán

---

## 📊 Ver Productos Importados

Después de importar:

1. Ve a http://localhost:3000/dashboard
2. Haz clic en "Productos"
3. Verás todos los productos con imágenes
4. Puedes filtrar por categoría y estado

---

## 🤖 Probar el Bot

Después de importar, prueba:

**Cliente:** "Qué laptops tienes?"

**Bot:** [Listará las laptops disponibles con precios]

**Cliente:** "Cuánto cuesta la ASUS Ryzen 5?"

**Bot:** [Dará el precio exacto y especificaciones]

**Cliente:** "Tienes cursos de diseño?"

**Bot:** [Mostrará los Mega Packs de diseño]

---

## ✅ Checklist

- [ ] Ejecutar `importar-catalogo-completo.bat`
- [ ] Verificar productos en el dashboard
- [ ] Revisar imágenes de productos
- [ ] Ajustar precios si es necesario
- [ ] Probar el bot con mensajes de prueba
- [ ] Personalizar descripciones
- [ ] Actualizar stock

---

**¡Tu catálogo completo está listo para importar!** 🎉

Ejecuta `importar-catalogo-completo.bat` y tendrás todos los productos disponibles en minutos.
