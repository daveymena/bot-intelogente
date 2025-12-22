# ✅ Pasos para Arreglar Forgot Password AHORA

## El Problema

Error 400 de Easypanel: "No se encontró. Asegúrese de tener la URL correcta"

**Causa:** La ruta `/api/auth/forgot-password` no se construyó en el último build.

## Solución en 3 Pasos

### Paso 1: Subir Cambios a GitHub

```bash
git add .
git commit -m "fix: Mejorar validación forgot-password"
git push origin main
```

### Paso 2: Rebuild en Easypanel

1. Ir a https://easypanel.host
2. Seleccionar tu aplicación `bot-whatsapp`
3. Click en **"Rebuild"** o **"Redeploy"**
4. Esperar 2-3 minutos

### Paso 3: Probar

1. Ir a: `https://bot-whatsapp.sqaoeo.easypanel.host/forgot-password`
2. Ingresar email: `daveymena16@gmail.com`
3. Click en "Enviar enlace de recuperación"
4. ✅ Debe funcionar sin error 400

---

## Si Sigue con Error 400

### Verificar en Consola de Easypanel

```bash
# Ver si la ruta se construyó
ls -la .next/server/app/api/auth/

# Debe aparecer:
# forgot-password/
```

### Si NO aparece la carpeta

Significa que hay un error en el build. Revisar logs:

1. En Easypanel → Logs
2. Buscar errores relacionados con `forgot-password`
3. Buscar líneas con `Error` o `Failed`

---

## Alternativa: Crear Ruta Nueva

Si el rebuild no funciona, crear ruta alternativa:

### 1. Crear archivo nuevo

`src/app/api/auth/password-recovery/route.ts`

(Copiar el contenido de `forgot-password/route.ts`)

### 2. Actualizar página

En `src/app/forgot-password/page.tsx`, cambiar:

```typescript
// Línea 20
const res = await fetch('/api/auth/password-recovery', {  // ← Cambiar
```

### 3. Subir y rebuild

```bash
git add .
git commit -m "fix: Crear ruta alternativa password-recovery"
git push origin main
# Rebuild en Easypanel
```

---

## Verificación Rápida

### Test con curl (desde cualquier terminal)

```bash
curl -X POST https://bot-whatsapp.sqaoeo.easypanel.host/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Si el correo existe, recibirás un enlace de recuperación"
}
```

**Si sale error 400 de Easypanel:**
La ruta NO existe → Necesita rebuild

---

## Checklist

- [ ] Cambios subidos a GitHub
- [ ] Rebuild completado en Easypanel
- [ ] Probado en navegador
- [ ] No sale error 400
- [ ] Email se envía correctamente

---

## Resumen

**El archivo existe en el código.**  
**Solo necesita un REBUILD en Easypanel para que se construya la ruta.**

1. `git push origin main`
2. Rebuild en Easypanel
3. Probar

**Eso es todo.** ✅
