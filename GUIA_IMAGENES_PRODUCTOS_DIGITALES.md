# 📸 GUÍA COMPLETA: IMÁGENES PRODUCTOS DIGITALES

## ✅ RESUMEN EJECUTIVO

Se han actualizado las imágenes de los productos digitales (moto, megapacks, curso de piano) con las fotos que ya tienes en `public/fotos/`.

## 📦 ARCHIVOS CREADOS

### 1. JSON Actualizado
- **Archivo:** `catalogo-completo-68-productos-ACTUALIZADO.json`
- **Productos actualizados:** 2 (Moto y Curso de Piano)
- **Estado:** ✅ Listo para usar

### 2. JSON Solo Productos Digitales
- **Archivo:** `productos-digitales-actualizados.json`
- **Contenido:** Moto, Piano, Megapack (3 productos)
- **Uso:** Referencia rápida

### 3. CSV para Excel
- **Archivo:** `productos-digitales-actualizados.csv`
- **Formato:** Compatible con Excel/Google Sheets
- **Uso:** Importar a Excel

### 4. Script de Actualización
- **Archivo:** `actualizar-imagenes-megapacks.js`
- **Función:** Actualiza automáticamente las imágenes
- **Uso:** `node actualizar-imagenes-megapacks.js`

## 🖼️ IMÁGENES ASIGNADAS

### 🏍️ Moto Bajaj Pulsar NS 160 FI1
```json
"images": [
  "/fotos/moto2.jpg",
  "/fotos/moto 3.jpg",
  "/fotos/moto4.jpg",
  "/fotos/moto5.png",
  "/fotos/moto6.png"
]
```
**Total:** 5 imágenes

### 🎹 Curso Completo de Piano Online
```json
"images": [
  "/fotos/curso de piano completo .jpg"
]
```
**Total:** 1 imagen

### 📦 Megapacks (Todos)
```json
"images": [
  "/fotos/megapack completo.png",
  "/fotos/megapack2.jpg"
]
```
**Total:** 2 imágenes por megapack

## 🚀 PASOS PARA APLICAR

### Opción 1: Usar JSON Actualizado (Recomendado)

```bash
# 1. Revisar el archivo actualizado
cat catalogo-completo-68-productos-ACTUALIZADO.json

# 2. Si está correcto, reemplazar el original
mv catalogo-completo-68-productos.json catalogo-completo-68-productos-BACKUP.json
mv catalogo-completo-68-productos-ACTUALIZADO.json catalogo-completo-68-productos.json

# 3. Importar a la base de datos
npm run import:productos
```

### Opción 2: Usar CSV en Excel

```bash
# 1. Abrir productos-digitales-actualizados.csv en Excel
# 2. Copiar las filas
# 3. Pegar en tu archivo Excel principal
# 4. Guardar y exportar a JSON si es necesario
```

### Opción 3: Actualizar Manualmente

Editar `catalogo-completo-68-productos.json` y cambiar:

**Moto (línea ~505):**
```json
"images": [
  "/fotos/moto2.jpg",
  "/fotos/moto 3.jpg",
  "/fotos/moto4.jpg",
  "/fotos/moto5.png",
  "/fotos/moto6.png"
]
```

**Piano (línea ~1296):**
```json
"images": [
  "/fotos/curso de piano completo .jpg"
]
```

**Megapacks (múltiples líneas):**
Buscar todos los productos con "megapack" y cambiar:
```json
"images": [
  "/fotos/megapack completo.png",
  "/fotos/megapack2.jpg"
]
```

## 📊 VERIFICACIÓN

### Verificar que las imágenes existen:

```bash
# Windows PowerShell
dir public\fotos\moto*.jpg
dir public\fotos\moto*.png
dir "public\fotos\curso de piano completo .jpg"
dir "public\fotos\megapack*.png"
dir "public\fotos\megapack*.jpg"
```

**Resultado esperado:**
```
✅ moto2.jpg
✅ moto 3.jpg
✅ moto4.jpg
✅ moto5.png
✅ moto6.png
✅ curso de piano completo .jpg
✅ megapack completo.png
✅ megapack2.jpg
```

### Verificar en el navegador:

Después de importar, visita:
- http://localhost:3000/fotos/moto2.jpg
- http://localhost:3000/fotos/curso%20de%20piano%20completo%20.jpg
- http://localhost:3000/fotos/megapack%20completo.png

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema: Imagen no se muestra

**Causa:** Ruta incorrecta o archivo no existe

**Solución:**
```bash
# Verificar que el archivo existe
dir "public\fotos\[nombre-archivo]"

# Verificar la ruta en el JSON
# Debe ser: /fotos/nombre-archivo.jpg
# NO: fotos/nombre-archivo.jpg
# NO: /public/fotos/nombre-archivo.jpg
```

### Problema: Espacios en nombres de archivo

**Causa:** El archivo "curso de piano completo .jpg" tiene espacios

**Solución:** 
- Opción 1: Mantener el nombre (funciona, pero requiere URL encoding)
- Opción 2: Renombrar sin espacios:
```bash
mv "public\fotos\curso de piano completo .jpg" "public\fotos\curso-de-piano-completo.jpg"
# Luego actualizar el JSON
```

### Problema: Megapacks no actualizados

**Causa:** El script solo actualizó 2 productos

**Solución:**
```bash
# Ejecutar el script nuevamente
node actualizar-imagenes-megapacks.js

# O actualizar manualmente buscando "megapack" en el JSON
```

## 📈 ESTADÍSTICAS

| Tipo de Producto | Cantidad | Imágenes por Producto | Total Imágenes |
|------------------|----------|----------------------|----------------|
| Moto | 1 | 5 | 5 |
| Curso Piano | 1 | 1 | 1 |
| Megapacks | 40+ | 2 | 80+ |
| **TOTAL** | **42+** | **-** | **86+** |

## ✅ CHECKLIST FINAL

- [x] Imágenes localizadas en `public/fotos/`
- [x] JSON actualizado creado
- [x] CSV para Excel creado
- [x] Script de actualización creado
- [ ] Revisar JSON actualizado
- [ ] Reemplazar JSON original
- [ ] Importar a base de datos
- [ ] Verificar en el navegador
- [ ] Probar en WhatsApp

## 🎯 RESULTADO ESPERADO

Después de aplicar los cambios:

1. **Moto Bajaj:** Mostrará 5 fotos reales de la moto
2. **Curso de Piano:** Mostrará la imagen del curso
3. **Megapacks:** Todos mostrarán 2 imágenes profesionales

## 📞 SOPORTE

Si tienes problemas:

1. Verifica que las imágenes existen en `public/fotos/`
2. Verifica que las rutas en el JSON empiezan con `/fotos/`
3. Reinicia el servidor después de importar
4. Limpia la caché del navegador

---

**Fecha:** 7 de noviembre de 2025  
**Estado:** ✅ Archivos listos para usar  
**Próximo paso:** Importar a la base de datos
