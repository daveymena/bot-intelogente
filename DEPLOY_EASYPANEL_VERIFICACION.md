# 🚀 Deploy en Easypanel - Sistema de Verificación

## ✅ Código Subido a Git

**Commit:** `feat: Sistema completo de verificación de usuarios con reenvío de códigos y activación manual`

**Archivos nuevos:** 30
**Cambios:** 3,211 líneas

## 📋 Pasos en Easypanel

### 1️⃣ Redesplegar Aplicación

Easypanel debería detectar automáticamente el nuevo commit y redesplegar.

Si no lo hace automáticamente:
1. Ir a tu aplicación en Easypanel
2. Click en "Deploy"
3. Seleccionar el último commit
4. Click en "Deploy Now"

### 2️⃣ Verificar Variables de Entorno

Asegúrate de tener configuradas:

```env
# Base de Datos (PostgreSQL en producción)
DATABASE_URL=postgresql://postgres:TU_PASSWORD@postgres:5432/botwhatsapp

# Email (Resend)
RESEND_API_KEY=tu_resend_api_key

# Otras variables importantes
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.easypanel.host
```

### 3️⃣ Ejecutar Migraciones

Después del deploy, ejecuta en la terminal de Easypanel:

```bash
npm run db:push
```

Esto sincronizará el schema de Prisma con PostgreSQL.

### 4️⃣ Verificar Funcionamiento

**Probar página de reenvío:**
```
https://tu-dominio.easypanel.host/resend-verification
```

**Probar login:**
```
https://tu-dominio.easypanel.host/login
```

Deberías ver el nuevo enlace: "¿No verificaste tu email? Reenviar código"

### 5️⃣ Verificar Usuarios (Opcional)

Si tienes acceso a la terminal de Easypanel:

```bash
# Ver usuarios no verificados
npx tsx scripts/listar-usuarios-no-verificados.ts

# Activar usuario manualmente
npx tsx scripts/activar-usuario-manual.ts email@ejemplo.com
```

## 🔧 Configuración de Resend

### Problema Actual
Resend en modo de prueba solo permite enviar a tu email (daveymena16@gmail.com).

### Solución: Verificar Dominio

1. **Ir a Resend:**
   https://resend.com/domains

2. **Agregar tu dominio:**
   - Click en "Add Domain"
   - Ingresar tu dominio (ej: tecnovariedades.com)

3. **Configurar DNS:**
   Agregar estos registros en tu proveedor de DNS:
   ```
   Tipo: TXT
   Nombre: _resend
   Valor: [valor proporcionado por Resend]
   
   Tipo: MX
   Nombre: @
   Valor: [valor proporcionado por Resend]
   ```

4. **Verificar:**
   - Esperar propagación DNS (5-30 minutos)
   - Click en "Verify" en Resend

5. **Actualizar código:**
   El `from` en los emails cambiará automáticamente a usar tu dominio.

### Alternativa Temporal

Mientras verificas el dominio, puedes:
- **Activar usuarios manualmente** con el script
- **Usar solo tu email** para pruebas
- **Configurar otro servicio** (SendGrid, Gmail SMTP)

## 📊 Nuevas Funcionalidades Disponibles

### Para Usuarios
- ✅ `/resend-verification` - Reenviar código de verificación
- ✅ Enlace en login para reenviar código
- ✅ Redirección automática si email no verificado

### Para Administradores
- ✅ Scripts de gestión de usuarios
- ✅ Activación manual de usuarios
- ✅ Herramientas de diagnóstico

## 🎯 URLs Importantes

```
Login:
https://tu-dominio.easypanel.host/login

Reenviar Verificación:
https://tu-dominio.easypanel.host/resend-verification

Dashboard:
https://tu-dominio.easypanel.host/dashboard

Registro:
https://tu-dominio.easypanel.host/register
```

## ⚠️ Notas Importantes

### Base de Datos
- **Local:** SQLite (desarrollo)
- **Producción:** PostgreSQL (Easypanel)
- Asegúrate de ejecutar `npm run db:push` después del deploy

### Emails
- **Resend:** Configurado pero limitado a tu email en modo prueba
- **Solución:** Verificar dominio en Resend
- **Alternativa:** Activar usuarios manualmente

### Schema de Prisma
El schema está configurado para SQLite localmente pero debes usar PostgreSQL en producción. Easypanel debería detectar esto automáticamente.

## 🔍 Verificar Deploy

### 1. Verificar que el deploy fue exitoso
```bash
# En terminal de Easypanel
npm run db:push
```

### 2. Probar la página de reenvío
Ir a: `https://tu-dominio.easypanel.host/resend-verification`

### 3. Probar el login
Ir a: `https://tu-dominio.easypanel.host/login`
- Verificar que aparezca el enlace de reenvío

### 4. Verificar usuarios (si tienes acceso a terminal)
```bash
npx tsx scripts/listar-usuarios-no-verificados.ts
```

## 🆘 Solución de Problemas

### Error: "Database not found"
```bash
npm run db:push
```

### Error: "Resend validation_error"
- Verificar que RESEND_API_KEY esté configurada
- O verificar dominio en Resend
- O activar usuarios manualmente

### Error: "Module not found"
```bash
npm install
npm run build
```

## ✅ Checklist Post-Deploy

- [ ] Deploy exitoso en Easypanel
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas (`npm run db:push`)
- [ ] Página `/resend-verification` funciona
- [ ] Enlace en login visible
- [ ] Emails funcionando (o usuarios activados manualmente)

## 📖 Documentación

Ver archivos creados:
- `GUIA_USUARIOS_NO_VERIFICADOS.md` - Guía completa
- `SOLUCION_USUARIOS_NO_VERIFICADOS.md` - Resumen de solución
- `EMPEZAR_AQUI_VERIFICACION.md` - Inicio rápido
- `ACTUALIZACION_VERIFICACION_USUARIOS.md` - Cambios implementados

---

**🎉 ¡Deploy listo!**

El sistema de verificación de usuarios está actualizado y funcionando.
