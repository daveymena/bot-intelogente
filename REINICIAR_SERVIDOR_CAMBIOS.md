# 🔄 Reiniciar Servidor para Aplicar Cambios

## ⚠️ Importante

Los cambios en el código **NO se aplican automáticamente**. Necesitas reiniciar el servidor completamente.

---

## 🚀 Pasos para Reiniciar

### Opción 1: Reinicio Completo (Recomendado)

```bash
# 1. Detener el servidor
# Presiona Ctrl+C en la terminal donde corre npm run dev

# 2. Esperar a que se detenga completamente
# Verás algo como: "Process terminated"

# 3. Limpiar caché de Node (opcional pero recomendado)
rm -rf .next
# En Windows: rmdir /s /q .next

# 4. Iniciar de nuevo
npm run dev

# 5. Esperar a que compile
# Verás: "✓ Ready in X seconds"
```

### Opción 2: Reinicio Rápido

```bash
# 1. Ctrl+C para detener

# 2. Iniciar inmediatamente
npm run dev
```

---

## ✅ Verificar que Tomó los Cambios

Después de reiniciar, busca estos mensajes en los logs:

```
[Baileys] ✅ Producto(s) encontrado(s) con IA
[Baileys] 📸 Enviando 3 producto(s) con fotos
[ProductPhotoSender] 📸 Enviando 3 productos con fotos
[ProductPhotoSender] 📦 Enviando producto 1/3: Lenovo...
[ProductPhotoSender] 🖼️ URL de foto: https://...
[ProductPhotoSender] 📥 Descargando imagen...
[ProductPhotoSender] ✅ Imagen descargada: 245.67 KB
[ProductPhotoSender] ✅ Producto enviado con foto
```

Si ves estos mensajes, significa que está usando el código nuevo.

---

## 🧪 Probar Después de Reiniciar

Envía un mensaje de prueba:

```
"Qué PCs tienes?"
```

**Resultado esperado**:
- Bot envía cada PC con su foto correspondiente
- Cada mensaje tiene: nombre, specs, precio, foto
- Pausas de 2 segundos entre productos

---

## ❌ Si Sigue Sin Funcionar

### 1. Verificar que el servidor se reinició

```bash
# Busca en los logs:
"✓ Ready in X seconds"
```

### 2. Verificar que no hay errores

```bash
# Busca errores en los logs:
"Error:", "❌", "Failed"
```

### 3. Limpiar todo y reiniciar

```bash
# Detener servidor
Ctrl+C

# Limpiar caché
rm -rf .next
rm -rf node_modules/.cache

# Reinstalar dependencias (solo si es necesario)
npm install

# Iniciar
npm run dev
```

### 4. Verificar que el archivo se guardó

```bash
# Ver la fecha de modificación
ls -la src/lib/baileys-stable-service.ts

# Debería mostrar la fecha/hora reciente
```

---

## 🔍 Debugging

Si después de reiniciar sigue sin funcionar:

### Ver logs en tiempo real

```bash
# Los logs mostrarán exactamente qué está pasando
npm run dev

# Observa cada línea cuando envíes un mensaje
```

### Buscar el mensaje específico

Cuando envíes "Qué PCs tienes?", busca en los logs:

```
[Baileys] 📨 Mensaje procesado de...
[Baileys] 🧠 Usando SISTEMA HÍBRIDO
[Baileys] ✅ Producto(s) encontrado(s) con IA  ← DEBE APARECER ESTO
[Baileys] 📸 Enviando X producto(s) con fotos  ← Y ESTO
```

Si NO aparecen esos mensajes, significa que:
- El servidor no se reinició correctamente
- Hay un error antes de llegar a esa parte
- El código no se guardó

---

## 💡 Tip Pro

Para desarrollo, usa **nodemon** que reinicia automáticamente:

```bash
# Ya lo tienes configurado en package.json
npm run dev

# Nodemon detecta cambios y reinicia automáticamente
# Pero a veces necesitas reinicio manual para cambios grandes
```

---

## ✅ Checklist

Antes de probar:

- [ ] Servidor detenido completamente (Ctrl+C)
- [ ] Caché limpiado (opcional: `rm -rf .next`)
- [ ] Servidor iniciado de nuevo (`npm run dev`)
- [ ] Mensaje "Ready" apareció en logs
- [ ] WhatsApp conectado
- [ ] Mensaje de prueba enviado

---

**Importante**: Los cambios en archivos `.ts` requieren reinicio del servidor. No se aplican en caliente.

---

**Fecha**: Noviembre 2024  
**Estado**: Instrucciones actualizadas
