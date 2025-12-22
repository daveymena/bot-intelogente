# Solución: URL de Imagen "h"

## 🐛 Problema

La URL de la imagen en la base de datos es solo "h" en lugar de una URL completa.

```
[ProductAgent] ⚠️ URL inválida: h
[Baileys] ❌ Error enviando imagen: Invalid URL
input: 'h'
```

## 🔍 Causa

El campo `images` en la base de datos del curso de piano contiene datos corruptos o incompletos.

## ✅ Solución en 2 Pasos

### Paso 1: Diagnosticar

```bash
diagnosticar-imagenes.bat
```

Esto te mostrará:
- ✅ Productos con imágenes válidas
- ❌ Productos con imágenes inválidas
- ⚠️ Productos sin imágenes
- 🎹 Estado específico del curso de piano

### Paso 2: Corregir

```bash
corregir-imagen-piano.bat
```

Esto:
1. Busca el curso de piano en la BD
2. Actualiza la imagen con una URL válida de Unsplash
3. Confirma la actualización

### Paso 3: Reiniciar y Probar

```bash
# Reiniciar servidor
npm run dev

# Probar en WhatsApp
"curso de piano"
```

## 📊 Resultado Esperado

### Antes:
```
[ProductAgent] ⚠️ URL inválida: h
[Baileys] ❌ Error enviando imagen
```

### Después:
```
[ProductAgent] ✅ URL válida: https://images.unsplash.com/photo-...
[Baileys] 📸 Enviando imagen con texto como caption...
[Baileys] ✅ Imagen con caption enviada exitosamente
```

## 🎯 En WhatsApp

Deberías recibir:

```
[FOTO DE UN PIANO]

🎯 *Curso Completo de Piano Online*

🎵 Curso de Piano Completo...

💰 *Precio:* 60.000 COP

⚡ *Entrega:* Acceso inmediato por enlace
📦 *Formato:* Digital (descarga directa)

¿Te gustaría saber más detalles o proceder con la compra? 😊
```

## 🔧 Solución Manual (Alternativa)

Si los scripts no funcionan, puedes actualizar manualmente desde el dashboard:

1. Ir a Dashboard → Productos
2. Buscar "Curso Completo de Piano Online"
3. Editar producto
4. En el campo "Imágenes", pegar una URL válida:
   ```
   https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80
   ```
5. Guardar

## 💡 URLs de Imágenes Sugeridas

### Para Curso de Piano:
```
https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80
https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80
https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&q=80
```

### Para Otros Cursos:
- **Guitarra**: `https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80`
- **Diseño**: `https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80`
- **Programación**: `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80`

## 🚨 Prevención Futura

Para evitar este problema:

1. **Validar URLs al importar productos**
2. **Usar el dashboard para agregar imágenes**
3. **Verificar que las URLs empiecen con http:// o https://**
4. **Probar las URLs antes de guardar**

## ✅ Checklist

- [ ] Ejecutar `diagnosticar-imagenes.bat`
- [ ] Ver el estado del curso de piano
- [ ] Ejecutar `corregir-imagen-piano.bat`
- [ ] Verificar que la imagen se actualizó
- [ ] Reiniciar servidor
- [ ] Probar en WhatsApp
- [ ] Verificar que la foto se envía correctamente

---

**Última actualización**: 22 de Noviembre de 2025
