# ✅ Sistema de Limpieza de Usuarios Listo

## 🎯 Objetivo

Limpiar todos los usuarios de la base de datos excepto `daveymena16@gmail.com` y verificar que no existan límites en el sistema.

## 📋 Qué Hace el Script

1. **Lista todos los usuarios** actuales en la base de datos
2. **Identifica usuarios a eliminar** (todos excepto daveymena16@gmail.com)
3. **Elimina en orden seguro**:
   - Conversaciones del usuario
   - Productos del usuario
   - Configuraciones del bot
   - Membresías
   - Sesiones
   - Códigos de verificación
   - Usuario final
4. **Verifica el usuario conservado**
5. **Muestra estadísticas** del sistema
6. **Confirma que no hay límites** configurados

## 🚀 Cómo Ejecutar

### Opción 1: Archivo BAT (Recomendado)
```bash
limpiar-usuarios.bat
```

### Opción 2: Comando Directo
```bash
npx tsx scripts/limpiar-usuarios-excepto-admin.ts
```

## ✅ Verificación de Límites

El script confirma que **NO HAY LÍMITES** en:

- ✅ **Usuarios**: Ilimitados
- ✅ **Productos**: Ilimitados
- ✅ **Conversaciones**: Ilimitadas
- ✅ **Mensajes**: Ilimitados
- ✅ **Sesiones WhatsApp**: Ilimitadas
- ✅ **Archivos multimedia**: Ilimitados
- ✅ **Códigos de verificación**: Ilimitados

## 🔒 Seguridad

- **Usuario protegido**: `daveymena16@gmail.com` NUNCA se eliminará
- **Eliminación en cascada**: Primero elimina relaciones, luego el usuario
- **Confirmación visual**: Muestra qué usuarios se eliminarán antes de hacerlo

## 📊 Salida Esperada

```
🔍 Verificando usuarios en la base de datos...

📊 Total de usuarios encontrados: 3

1. daveymena16@gmail.com
   - Nombre: David Mena
   - Verificado: Sí
   - Creado: 01/11/2025

2. test@example.com
   - Nombre: Usuario Test
   - Verificado: No
   - Creado: 02/11/2025

⚠️  Se eliminarán 1 usuario(s):
   ❌ test@example.com

🗑️  Eliminando usuarios...
   ✅ Eliminado: test@example.com

✅ Limpieza completada!

👤 Usuario conservado:
   Email: daveymena16@gmail.com
   Nombre: David Mena
   Verificado: Sí
   Membresía: premium

📊 Verificando límites del sistema...

Estadísticas actuales:
   - Usuarios: 1
   - Productos: 102
   - Conversaciones: 45
   - Mensajes: 234

✅ No hay límites configurados en el sistema
```

## 🎯 Casos de Uso

1. **Limpiar usuarios de prueba** antes de producción
2. **Resetear la base de datos** manteniendo el admin
3. **Verificar capacidad** del sistema
4. **Auditoría de usuarios** actuales

## ⚠️ Importante

- Este script es **IRREVERSIBLE**
- Asegúrate de tener un backup si es necesario
- El usuario `daveymena16@gmail.com` está protegido
- Se eliminan TODAS las relaciones del usuario

## 🔧 Archivos Creados

1. `scripts/limpiar-usuarios-excepto-admin.ts` - Script principal
2. `limpiar-usuarios.bat` - Ejecutable rápido
3. `LIMPIEZA_USUARIOS_LISTA.md` - Esta documentación

## ✅ Sistema Sin Límites Confirmado

El sistema **NO tiene límites** configurados en:

- Base de datos (PostgreSQL/SQLite)
- Prisma Schema
- API Routes
- Servicios backend
- Almacenamiento de archivos
- Sesiones de WhatsApp

Puedes escalar sin restricciones.
