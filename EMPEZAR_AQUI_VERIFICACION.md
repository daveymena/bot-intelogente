# 🚀 Inicio Rápido: Gestión de Usuarios No Verificados

## ⚡ Solución Inmediata

### Para Usuarios (Autoservicio)

**Opción 1: Desde el Login**
1. Ir a `https://tu-dominio.com/login`
2. Hacer clic en **"¿No verificaste tu email? Reenviar código"**
3. Ingresar email
4. Recibir nuevo código
5. ¡Verificar y acceder!

**Opción 2: Directamente**
1. Ir a `https://tu-dominio.com/resend-verification`
2. Ingresar email
3. Recibir código
4. ¡Verificar y acceder!

### Para Administradores

**Ver usuarios no verificados:**
```bash
npx tsx scripts/listar-usuarios-no-verificados.ts
```

**Activar usuario manualmente:**
```bash
npx tsx scripts/activar-usuario-manual.ts usuario@ejemplo.com
```

**Menú interactivo (Windows):**
```bash
gestionar-usuarios-no-verificados.bat
```

## 📋 Ejemplo de Uso

### Escenario: Cliente llama diciendo "No puedo entrar"

**Paso 1:** Verificar si está registrado
```bash
npx tsx scripts/listar-usuarios-no-verificados.ts
```

**Paso 2:** Si aparece en la lista, activarlo
```bash
npx tsx scripts/activar-usuario-manual.ts cliente@email.com
```

**Paso 3:** Confirmar al cliente
> "✅ Listo, ya puedes iniciar sesión con tu email y contraseña"

## 🎯 Características

✅ **Reenvío automático** - Los usuarios pueden reenviar el código
✅ **Redirección inteligente** - Desde login a reenvío automático
✅ **Activación manual** - Administradores pueden activar usuarios
✅ **Sin límites** - Reenvíos ilimitados
✅ **10 días gratis** - Trial automático al verificar

## 📁 Archivos Importantes

- **`/resend-verification`** - Página de reenvío
- **`scripts/listar-usuarios-no-verificados.ts`** - Listar usuarios
- **`scripts/activar-usuario-manual.ts`** - Activar manualmente
- **`gestionar-usuarios-no-verificados.bat`** - Menú Windows

## 📖 Documentación Completa

Ver: **`GUIA_USUARIOS_NO_VERIFICADOS.md`**

---

**¿Dudas?** Lee la guía completa o contacta soporte.
