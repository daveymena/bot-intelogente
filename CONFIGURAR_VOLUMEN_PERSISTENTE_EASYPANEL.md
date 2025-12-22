# 💾 Configurar Volumen Persistente en Easypanel

## Problema

Los archivos de sesión de WhatsApp (`auth_sessions/`) se pierden cuando Easypanel reinicia el contenedor, causando que el QR se "pegue" o la sesión se corrompa.

## Solución: Volumen Persistente

Configurar un volumen persistente en Easypanel para que los archivos de sesión sobrevivan a los reinicios.

---

## Pasos en Easypanel

### 1. Ir a Settings → Mounts

1. Abre tu aplicación en Easypanel
2. Ve a **Settings** (menú izquierdo)
3. Busca la sección **Mounts** o **Volumes**

### 2. Agregar Nuevo Mount

Haz clic en **"Add Mount"** y configura:

```
Mount Path (en el contenedor):
/app/auth_sessions

Volume Name:
whatsapp-sessions

Type:
Volume (persistente)
```

### 3. Guardar y Rebuild

1. Haz clic en **"Save"**
2. Ve a **Deploy** → **Rebuild**
3. Espera 2-3 minutos

---

## Verificar que Funciona

### Desde la Consola de Easypanel

```bash
# Ver si el volumen está montado
df -h | grep auth_sessions

# Debe mostrar algo como:
# /dev/vda1  10G  2G  8G  20%  /app/auth_sessions

# Ver permisos
ls -la /app/auth_sessions

# Debe mostrar:
# drwxr-xr-x  2  node  node  4096  Nov 4 10:00  .
```

### Probar Persistencia

1. Conectar WhatsApp (generar QR y escanear)
2. Verificar que se crean archivos:
   ```bash
   ls -la /app/auth_sessions/USER_ID/
   # Debe mostrar: creds.json, app-state-sync-*.json
   ```
3. Reiniciar la app:
   ```bash
   # En Easypanel: Restart
   ```
4. Verificar que los archivos siguen ahí:
   ```bash
   ls -la /app/auth_sessions/USER_ID/
   # Los archivos deben seguir existiendo
   ```

---

## Configuración Alternativa (Docker Compose)

Si Easypanel usa Docker Compose, agrega esto:

```yaml
# docker-compose.yml o easypanel.yml
services:
  app:
    volumes:
      - whatsapp-sessions:/app/auth_sessions

volumes:
  whatsapp-sessions:
    driver: local
```

---

## Troubleshooting

### Problema: Permisos Denegados

```bash
# Error: EACCES: permission denied

# Solución: Cambiar permisos
chmod -R 755 /app/auth_sessions
chown -R node:node /app/auth_sessions
```

### Problema: Volumen No Se Monta

```bash
# Verificar que el volumen existe
docker volume ls | grep whatsapp

# Si no existe, crearlo manualmente
docker volume create whatsapp-sessions
```

### Problema: Archivos Se Siguen Perdiendo

**Causa:** El volumen no está configurado correctamente

**Solución:**
1. Verificar que el path es exactamente `/app/auth_sessions`
2. Verificar que el tipo es "Volume" (no "Bind")
3. Rebuild completo de la app

---

## Ventajas de Esta Solución

✅ **Gratis** - No cuesta nada adicional
✅ **Persistente** - Archivos sobreviven reinicios
✅ **Automático** - No requiere intervención manual
✅ **Compatible** - Funciona con Baileys sin cambios

---

## Desventajas

⚠️ **Configuración manual** - Requiere acceso a Easypanel
⚠️ **Permisos** - Puede tener problemas de permisos
⚠️ **Backup** - Los archivos están en el servidor, no en tu repo

---

## Alternativa: Usar Base de Datos para Sesiones

Si el volumen persistente no funciona, podemos guardar las sesiones en PostgreSQL:

```typescript
// En lugar de archivos, guardar en DB
await db.whatsAppSession.create({
  data: {
    userId: user.id,
    creds: JSON.stringify(creds),
    keys: JSON.stringify(keys)
  }
})
```

**Ventajas:**
- ✅ Más confiable que archivos
- ✅ Backup automático con la DB
- ✅ No depende del filesystem

**Desventajas:**
- ⚠️ Requiere modificar Baileys
- ⚠️ Más complejo de implementar

---

## Recomendación Final

1. **Corto plazo:** Configurar volumen persistente (esta guía)
2. **Mediano plazo:** Migrar a WhatsApp Business API
3. **Largo plazo:** Usar servicio dedicado (Twilio, etc.)

---

**Siguiente paso:** Configurar el volumen en Easypanel siguiendo los pasos arriba.
