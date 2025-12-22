# ⚡ SOLUCIÓN RÁPIDA: Conflicto de Sesiones WhatsApp

## 🎯 Problema

Estás viendo estos errores en loop:

```
[Baileys] ⚠️ Conflicto detectado: otra sesión está activa
[API Reconnect] ❌ Error: Foreign key constraint violated
userId: cmhc22zw20000kmhgvx5ubazy
```

## ✅ Solución Inmediata (3 pasos)

### 1. Detener el Servidor

Presiona `Ctrl + C` en la terminal donde está corriendo el servidor.

### 2. Eliminar Archivos de Sesión

```bash
# Windows (PowerShell o CMD)
rmdir /s /q auth_sessions

# Linux/Mac
rm -rf auth_sessions
```

### 3. Reiniciar el Servidor

```bash
npm run dev
```

## 🔧 Si el Problema Persiste

### Opción A: Limpiar Base de Datos (Recomendado)

1. Detén el servidor (`Ctrl + C`)

2. Abre la base de datos SQLite:
   ```bash
   # Instalar sqlite3 si no lo tienes
   npm install -g sqlite3
   
   # Abrir la base de datos
   sqlite3 prisma/dev.db
   ```

3. Ejecuta estos comandos SQL:
   ```sql
   -- Ver sesiones actuales
   SELECT * FROM whatsapp_connections;
   
   -- Eliminar todas las sesiones
   DELETE FROM whatsapp_connections;
   
   -- Salir
   .quit
   ```

4. Reinicia el servidor:
   ```bash
   npm run dev
   ```

### Opción B: Reset Completo de Base de Datos

⚠️ **ADVERTENCIA**: Esto eliminará TODOS los datos (usuarios, productos, conversaciones)

```bash
# Detener servidor
# Ctrl + C

# Eliminar base de datos
del prisma\dev.db

# Recrear base de datos
npx prisma db push

# Crear usuario admin
npx tsx scripts/create-admin.ts

# Reiniciar servidor
npm run dev
```

## 📱 Reconectar WhatsApp

Después de limpiar:

1. Ve a http://localhost:3000
2. Inicia sesión
3. Haz clic en "Conectar WhatsApp"
4. Escanea el código QR con tu teléfono
5. Espera a que diga "Conectado"

## 🛡️ Prevenir el Problema

1. **No ejecutes múltiples instancias del servidor**
   - Solo un `npm run dev` a la vez

2. **Cierra WhatsApp Web**
   - Si tienes WhatsApp Web abierto, ciérralo

3. **Un solo dispositivo**
   - Solo escanea el QR desde un teléfono

## ✅ Cambios Aplicados al Código

Los siguientes archivos fueron actualizados para prevenir este problema:

1. **src/app/api/whatsapp/reconnect/route.ts**
   - ✅ Validación de sesión activa
   - ✅ Verificación de usuario existente
   - ✅ Sin userId hardcodeado

2. **src/lib/connection-monitor.ts**
   - ✅ Límite de 3 intentos de reconexión
   - ✅ Detección de conflictos
   - ✅ Pausa automática en conflictos

3. **src/lib/baileys-service.ts**
   - ✅ Notificación al monitor en conflictos
   - ✅ No reconexión automática en conflictos

## 🆘 Si Nada Funciona

1. Cierra TODAS las terminales
2. Reinicia tu computadora
3. Elimina `auth_sessions` y `prisma/dev.db`
4. Ejecuta:
   ```bash
   npm run dev
   npx prisma db push
   npx tsx scripts/create-admin.ts
   ```
5. Vuelve a conectar WhatsApp

## 📞 Soporte

Si el problema persiste después de todos estos pasos, revisa:
- ¿Tienes WhatsApp Web abierto en otro navegador?
- ¿Hay otro proceso usando el puerto 3000?
- ¿Tienes permisos de escritura en la carpeta del proyecto?
