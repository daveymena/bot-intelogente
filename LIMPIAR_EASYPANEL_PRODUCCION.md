# 🧹 LIMPIAR BASE DE DATOS EN EASYPANEL (PRODUCCIÓN)

## ⚠️ IMPORTANTE

Los cambios que hiciste localmente **NO afectan** a la base de datos de producción en Easypanel. Necesitas ejecutar el script de limpieza directamente en Easypanel.

---

## 🎯 Opciones para Limpiar Easypanel

### Opción 1: Ejecutar Script desde Easypanel (RECOMENDADO)

#### Paso 1: Subir el Script a Git

```bash
# Asegúrate de que los cambios estén en git
git add scripts/limpiar-todo-whatsapp.ts
git add scripts/verificar-limpieza.ts
git commit -m "feat: agregar scripts de limpieza de WhatsApp"
git push origin main
```

#### Paso 2: Actualizar Easypanel

1. Ve a tu proyecto en Easypanel
2. En la sección de **Deployments**, haz clic en **Deploy**
3. Espera a que se complete el deployment

#### Paso 3: Ejecutar el Script en Easypanel

1. Ve a tu aplicación en Easypanel
2. Haz clic en **Terminal** o **Console**
3. Ejecuta el script:

```bash
npx tsx scripts/limpiar-todo-whatsapp.ts
```

#### Paso 4: Verificar la Limpieza

```bash
npx tsx scripts/verificar-limpieza.ts
```

---

### Opción 2: Conectarse Directamente a la Base de Datos

Si tienes acceso directo a PostgreSQL en Easypanel:

#### Paso 1: Obtener la URL de Conexión

En Easypanel, ve a tu base de datos PostgreSQL y copia el `DATABASE_URL`.

#### Paso 2: Crear Script de Limpieza Remota

Crea un archivo `.env.production` con la URL de producción:

```bash
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
```

#### Paso 3: Ejecutar Localmente contra Producción

```bash
# CUIDADO: Esto limpiará la base de datos de PRODUCCIÓN
DATABASE_URL="tu_url_de_produccion" npx tsx scripts/limpiar-todo-whatsapp.ts
```

---

### Opción 3: Usar Prisma Studio (Visual)

#### Paso 1: Conectar a Producción

```bash
# En tu .env, temporalmente cambia DATABASE_URL a la de producción
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
```

#### Paso 2: Abrir Prisma Studio

```bash
npx prisma studio
```

#### Paso 3: Eliminar Manualmente

1. Ve a la tabla `WhatsAppConnection` → Elimina todos los registros
2. Ve a la tabla `User` → Elimina todos excepto admin
3. Ve a la tabla `Conversation` → Elimina todos los registros
4. Ve a la tabla `Message` → Elimina todos los registros
5. Ve a la tabla `MessageQueue` → Elimina todos los registros
6. Ve a la tabla `Session` → Elimina todos los registros

---

## 🚀 MÉTODO RECOMENDADO: Script Automático

Voy a crear un script especial que puedas ejecutar directamente en Easypanel:

### Script: `limpiar-produccion.ts`

Este script:
- ✅ Detecta automáticamente si está en producción
- ✅ Pide confirmación antes de ejecutar
- ✅ Limpia todo de forma segura
- ✅ Preserva el usuario admin
- ✅ Muestra un reporte completo

---

## 📋 Pasos Detallados (RECOMENDADO)

### 1. Subir Cambios a Git

```bash
git add .
git commit -m "feat: scripts de limpieza para producción"
git push origin main
```

### 2. Desplegar en Easypanel

1. Abre Easypanel: https://easypanel.io
2. Ve a tu proyecto
3. Haz clic en **Deploy** o espera el auto-deploy
4. Espera a que termine (verás el status "Running")

### 3. Abrir Terminal en Easypanel

1. En tu aplicación, busca el botón **Terminal** o **Console**
2. Se abrirá una terminal dentro del contenedor

### 4. Ejecutar el Script de Limpieza

```bash
# Dentro de la terminal de Easypanel
npx tsx scripts/limpiar-todo-whatsapp.ts
```

### 5. Verificar que Funcionó

```bash
npx tsx scripts/verificar-limpieza.ts
```

### 6. Reiniciar la Aplicación

En Easypanel:
1. Ve a tu aplicación
2. Haz clic en **Restart**
3. Espera a que se reinicie

### 7. Conectar WhatsApp Nuevamente

1. Abre tu aplicación en producción
2. Ve a la sección de WhatsApp
3. Escanea el código QR
4. ¡Listo!

---

## ⚠️ ADVERTENCIAS IMPORTANTES

### ⛔ Antes de Ejecutar en Producción:

1. **Backup**: Asegúrate de tener un backup de la base de datos
2. **Horario**: Hazlo en un horario de bajo tráfico
3. **Notificar**: Avisa a tus clientes que habrá mantenimiento
4. **Verificar**: Prueba primero en local (ya lo hiciste ✅)

### 🔒 Datos que se Eliminarán en Producción:

- ❌ Todas las conexiones de WhatsApp
- ❌ Todos los usuarios (excepto admin)
- ❌ Todas las conversaciones
- ❌ Todos los mensajes
- ❌ Todas las sesiones

### ✅ Datos que se Preservarán:

- ✅ Usuario admin (daveymena16@gmail.com)
- ✅ Todos los productos
- ✅ Configuración del bot
- ✅ Prompts de IA
- ✅ Configuración de pagos

---

## 🆘 Si Algo Sale Mal

### Error: "Cannot connect to database"

```bash
# Verifica que la base de datos esté corriendo
# En Easypanel, ve a Services → PostgreSQL → Status
```

### Error: "Permission denied"

```bash
# Asegúrate de tener permisos de escritura
# Verifica el DATABASE_URL en las variables de entorno
```

### Error: "Script not found"

```bash
# Asegúrate de que el deployment se completó
# Verifica que los archivos estén en el contenedor:
ls -la scripts/
```

---

## 📊 Checklist de Limpieza en Producción

- [ ] Hacer backup de la base de datos
- [ ] Subir scripts a Git
- [ ] Desplegar en Easypanel
- [ ] Abrir terminal en Easypanel
- [ ] Ejecutar script de limpieza
- [ ] Verificar que funcionó
- [ ] Reiniciar aplicación
- [ ] Conectar WhatsApp nuevamente
- [ ] Verificar que no hay duplicados
- [ ] Probar envío de mensajes

---

## 🎯 Comando Rápido (Todo en Uno)

Si quieres hacerlo todo de una vez:

```bash
# 1. Subir a Git
git add . && git commit -m "feat: limpieza de WhatsApp" && git push

# 2. Esperar deployment en Easypanel (manual)

# 3. En terminal de Easypanel:
npx tsx scripts/limpiar-todo-whatsapp.ts && npx tsx scripts/verificar-limpieza.ts
```

---

## 💡 Alternativa: Resetear Base de Datos Completa

Si prefieres empezar completamente desde cero:

### En Easypanel:

1. Ve a **Services** → **PostgreSQL**
2. Haz clic en **Delete** (esto eliminará TODO)
3. Crea una nueva base de datos PostgreSQL
4. Actualiza el `DATABASE_URL` en tu aplicación
5. Ejecuta las migraciones:

```bash
npx prisma migrate deploy
```

6. Crea el usuario admin nuevamente:

```bash
npx tsx scripts/create-admin.ts
```

---

## 📝 Notas Finales

- **Local vs Producción**: Son bases de datos separadas
- **Sincronización**: Los cambios en local NO afectan producción
- **Scripts**: Los mismos scripts funcionan en ambos ambientes
- **Seguridad**: Siempre haz backup antes de limpiar producción

---

**¿Necesitas ayuda?** Revisa los logs en Easypanel o ejecuta el script de diagnóstico:

```bash
npx tsx scripts/diagnosticar-whatsapp-completo.ts
```

---

**Fecha**: ${new Date().toLocaleString('es-CO')}
**Ambiente**: 🌐 PRODUCCIÓN (Easypanel)
