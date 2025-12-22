# 🧹 Guía de Limpieza de Base de Datos

## 📋 Opciones Disponibles

Tienes **2 opciones** para limpiar la base de datos:

### Opción 1: Limpieza Suave (Recomendada)
**Archivo:** `limpiar-datos-demo.bat`

**Elimina:**
- ❌ Productos demo/prueba (Gaming ASUS ROG, Paquete Web, etc.)
- ❌ Conversaciones de prueba
- ❌ Usuarios demo
- ❌ Sesiones expiradas
- ❌ Conexiones WhatsApp antiguas (>7 días)

**Mantiene:**
- ✅ Todos los productos reales (79 productos)
- ✅ Usuarios reales (daveymena16@gmail.com, demo@tecnovariedades.com)
- ✅ Conversaciones reales
- ✅ Todo el backend y scripts

**Usar cuando:**
- Quieres limpiar datos de prueba
- Mantener conversaciones reales existentes
- Limpieza de mantenimiento

### Opción 2: Reset Completo (Empezar de Cero)
**Archivo:** `reset-base-datos.bat`

**Elimina:**
- ❌ TODAS las conversaciones
- ❌ TODOS los mensajes
- ❌ TODAS las conexiones WhatsApp
- ❌ TODAS las sesiones
- ❌ Todos los usuarios excepto admin
- ❌ Productos demo

**Mantiene:**
- ✅ Productos reales (reasignados al admin)
- ✅ Usuario admin (daveymena16@gmail.com)
- ✅ Todo el backend y scripts

**Usar cuando:**
- Quieres empezar completamente de cero
- Limpiar todas las conversaciones de prueba
- Preparar para producción

## 🚀 Cómo Usar

### Opción 1: Limpieza Suave
```bash
# Doble clic en:
limpiar-datos-demo.bat

# O ejecutar:
npx tsx scripts/limpiar-datos-demo.ts
```

### Opción 2: Reset Completo
```bash
# Doble clic en:
reset-base-datos.bat

# O ejecutar:
npx tsx scripts/reset-base-datos-limpia.ts
```

## 📊 Qué se Mantiene Siempre

### Backend y Scripts ✅
Todos estos archivos **NUNCA** se eliminan:
- `src/lib/` - Todos los servicios (IA, WhatsApp, productos)
- `src/app/api/` - Todas las rutas API
- `src/components/` - Todos los componentes
- `scripts/` - Todos los scripts
- `prisma/` - Esquema de base de datos
- `.env` - Configuración

### Productos Reales ✅
Se mantienen todos los productos reales:
- Curso de Piano Completo
- ASUS VivoBook (todos los modelos)
- MacBook Pro M4
- Bajaj Pulsar NS 160 FI
- Mega Packs (40 productos)
- Componentes (RAM, SSD, morrales)
- HP, Lenovo, Acer (laptops)

### Imágenes ✅
Todas las imágenes en `public/fotos/` se mantienen

## 🔍 Verificar Después de Limpiar

### Ver Estadísticas
```bash
npx tsx scripts/ver-productos.ts
```

### Ver en Dashboard
1. Iniciar: `npm run dev`
2. Abrir: `http://localhost:3000`
3. Login: `daveymena16@gmail.com` / `admin123`
4. Ver productos y conversaciones

### Ver Base de Datos
```bash
npx prisma studio
```

## ⚠️ Advertencias Importantes

### Antes de Limpiar
1. **Hacer backup** si tienes conversaciones importantes
2. **Cerrar el servidor** (`Ctrl + C` en la terminal)
3. **Desconectar WhatsApp** desde el dashboard

### Después de Limpiar
1. **Reiniciar el servidor** (`npm run dev`)
2. **Reconectar WhatsApp** (escanear QR nuevamente)
3. **Verificar productos** en el dashboard

## 📝 Ejemplo de Uso

### Escenario 1: Limpieza de Mantenimiento
```bash
# 1. Detener servidor
Ctrl + C

# 2. Limpiar datos demo
limpiar-datos-demo.bat

# 3. Reiniciar servidor
npm run dev

# 4. Verificar en dashboard
http://localhost:3000
```

### Escenario 2: Empezar de Cero
```bash
# 1. Detener servidor
Ctrl + C

# 2. Reset completo
reset-base-datos.bat

# 3. Reiniciar servidor
npm run dev

# 4. Reconectar WhatsApp
http://localhost:3000 → Conectar WhatsApp
```

## 🎯 Qué Hace Cada Script

### limpiar-datos-demo.ts
```typescript
1. Busca productos con nombres demo
2. Busca conversaciones de prueba
3. Busca usuarios demo
4. Elimina sesiones expiradas
5. Elimina conexiones antiguas
6. Muestra estadísticas finales
```

### reset-base-datos-limpia.ts
```typescript
1. Elimina TODAS las conversaciones
2. Elimina TODOS los mensajes
3. Elimina TODAS las conexiones WhatsApp
4. Elimina TODAS las sesiones
5. Elimina productos demo
6. Mantiene solo usuario admin
7. Reasigna productos al admin
8. Muestra estadísticas finales
```

## 📊 Estadísticas Después de Limpiar

### Limpieza Suave
```
✅ Usuarios: 2-3
✅ Productos: 75-79
✅ Conversaciones: Solo reales
✅ Mensajes: Solo reales
✅ Conexiones WhatsApp: Activas
```

### Reset Completo
```
✅ Usuarios: 1 (admin)
✅ Productos: 75-79
✅ Conversaciones: 0
✅ Mensajes: 0
✅ Conexiones WhatsApp: 0
```

## 🔄 Restaurar Productos si se Eliminan

Si accidentalmente eliminas productos reales:

```bash
# Restaurar desde JSON
npx tsx scripts/actualizar-productos-con-imagenes.ts

# O importar catálogo completo
npx tsx scripts/import-productos-completos.ts
```

## ✨ Recomendación

**Para preparar el sistema para producción:**

1. Usar **Reset Completo** (`reset-base-datos.bat`)
2. Verificar que todo esté limpio
3. Iniciar el servidor
4. Conectar WhatsApp real
5. ¡Listo para recibir clientes!

## 🎬 Comando Rápido

```bash
# Limpieza suave (recomendada)
limpiar-datos-demo.bat

# Reset completo (empezar de cero)
reset-base-datos.bat
```

---

**Los archivos de backend, scripts y configuración NUNCA se eliminan. Solo se limpia la base de datos.**
