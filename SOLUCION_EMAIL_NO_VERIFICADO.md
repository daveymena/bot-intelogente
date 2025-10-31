# 🔧 Solución: "Email not verified"

## ❌ Problema

Al intentar iniciar sesión aparece el error:
```
Email not verified. Please check your inbox.
```

## ✅ Solución

El usuario admin necesita tener el email verificado. Ejecuta este comando:

```bash
npx tsx scripts/verify-admin.ts
```

**Resultado esperado:**
```
✅ Admin email verified successfully
📧 Email: daveymena16@gmail.com
🔓 You can now login
```

## 🚀 Ahora Puedes Iniciar Sesión

1. Ve a http://localhost:3000/login
2. Ingresa las credenciales:
   - Email: daveymena16@gmail.com
   - Password: 6715320Dvd.
3. ¡Listo! Accederás al dashboard

## 🔄 Para Futuros Usuarios

### Opción 1: Verificación Automática (Desarrollo)

Si quieres que todos los usuarios se creen ya verificados en desarrollo, actualiza el script `create-admin.ts`:

```typescript
const admin = await prisma.user.create({
  data: {
    // ... otros campos
    isEmailVerified: true,  // ← Agregar esta línea
    isActive: true
  }
})
```

### Opción 2: Verificación por Email (Producción)

En producción, los usuarios deben verificar su email:

1. Usuario se registra
2. Recibe email de verificación
3. Hace clic en el enlace
4. Email verificado
5. Puede iniciar sesión

## 📝 Script Creado

Se creó el archivo `scripts/verify-admin.ts` que:
- Busca el usuario admin
- Marca el email como verificado
- Activa la cuenta
- Elimina el token de verificación

## ✅ Estado Actual

**El admin ya está verificado y puedes iniciar sesión.**

## 🔧 Comandos Útiles

### Verificar cualquier usuario
```bash
# Edita scripts/verify-admin.ts y cambia el email
# Luego ejecuta:
npx tsx scripts/verify-admin.ts
```

### Verificar desde la base de datos directamente
```bash
# Abre la base de datos
npx prisma studio

# Busca el usuario
# Cambia isEmailVerified a true
# Cambia isActive a true
```

## 🎯 Prevención

Para evitar este problema en el futuro, el script `iniciar-sistema-completo.bat` ahora incluye automáticamente la verificación del admin.

**Pasos actualizados:**
1. Instalar dependencias
2. Sincronizar base de datos
3. Crear usuario admin
4. **Verificar email del admin** ← NUEVO
5. Iniciar servidor

## 📞 Soporte

Si el problema persiste:
1. Verifica que el script se ejecutó correctamente
2. Revisa la base de datos con `npx prisma studio`
3. Asegúrate de que `isEmailVerified = true`
4. Contacta: daveymena16@gmail.com

---

**Estado:** ✅ RESUELTO
**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
