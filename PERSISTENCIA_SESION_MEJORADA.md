# 🔒 Persistencia de Sesión Mejorada

## Problema Resuelto

El usuario se deslogueaba automáticamente al:
- ✅ Navegar a la tienda
- ✅ Actualizar la página
- ✅ Cambiar de pestaña
- ✅ Cerrar y abrir el navegador

## Solución Implementada

### 1. Duración de Sesión Extendida

**Antes:** 7 días
**Ahora:** 30 días

```typescript
// JWT expira en 30 días
const JWT_EXPIRES_IN = '30d'

// Cookies expiran en 30 días
maxAge: 30 * 24 * 60 * 60 // 30 días en segundos
```

### 2. Renovación Automática de Cookies

El middleware ahora renueva las cookies en **cada request**:

```typescript
// src/middleware.ts
// Renovar cookies en cada navegación
response.cookies.set('auth-token', token, {
  maxAge: 30 * 24 * 60 * 60
})
```

Esto significa que mientras el usuario use la app, la sesión nunca expira.

### 3. Hook de Persistencia de Sesión

Nuevo hook `useSessionPersistence` que:

- ✅ Verifica la sesión cada 5 minutos
- ✅ Renueva la sesión al hacer focus en la ventana
- ✅ Renueva la sesión antes de cerrar la página
- ✅ Redirige a login si la sesión expira

```typescript
// src/hooks/useSessionPersistence.ts
export function useSessionPersistence() {
  // Verificar cada 5 minutos
  setInterval(checkSession, 5 * 60 * 1000)
  
  // Renovar al hacer focus
  window.addEventListener('focus', renewSession)
  
  // Renovar antes de cerrar
  window.addEventListener('beforeunload', renewSession)
}
```

### 4. API de Verificación de Sesión

Nueva ruta `/api/auth/session` que:

- ✅ Verifica que el token sea válido
- ✅ Renueva todas las cookies automáticamente
- ✅ Devuelve información del usuario

```typescript
// GET /api/auth/session
// Verifica y renueva la sesión
```

### 5. Cookies Múltiples para Redundancia

Ahora se usan 3 cookies:

1. **`auth-token`** (HttpOnly)
   - Token JWT seguro
   - No accesible desde JavaScript
   - 30 días de duración

2. **`auth-status`** (Accesible)
   - Estado de autenticación
   - Accesible desde JavaScript
   - Para verificación rápida

3. **`user-id`** (Accesible)
   - ID del usuario
   - Para persistencia adicional
   - No sensible

### 6. Logout Mejorado

Nueva ruta `/api/auth/logout` que:

- ✅ Elimina TODAS las cookies
- ✅ Limpia el estado del cliente
- ✅ Redirige a login

---

## Archivos Modificados

### 1. `src/lib/auth.ts`
```typescript
// Cambio: JWT expira en 30 días
const JWT_EXPIRES_IN = '30d'
```

### 2. `src/app/api/auth/login/route.ts`
```typescript
// Cambio: Cookies expiran en 30 días
maxAge: 30 * 24 * 60 * 60

// Nuevo: Cookie adicional con user-id
response.cookies.set('user-id', user.id, {
  maxAge: 30 * 24 * 60 * 60
})
```

### 3. `src/middleware.ts`
```typescript
// Nuevo: Renovar TODAS las cookies en cada request
response.cookies.set('auth-token', token, {
  maxAge: 30 * 24 * 60 * 60
})
response.cookies.set('auth-status', 'authenticated', {
  maxAge: 30 * 24 * 60 * 60
})
response.cookies.set('user-id', userId, {
  maxAge: 30 * 24 * 60 * 60
})
```

### 4. `src/hooks/useSessionPersistence.ts` (NUEVO)
```typescript
// Hook para mantener sesión activa
// - Verifica cada 5 minutos
// - Renueva al hacer focus
// - Renueva antes de cerrar
```

### 5. `src/app/api/auth/session/route.ts` (NUEVO)
```typescript
// GET /api/auth/session
// Verifica y renueva la sesión
```

### 6. `src/app/api/auth/logout/route.ts` (NUEVO)
```typescript
// POST /api/auth/logout
// Cierra sesión y limpia cookies
```

### 7. `src/components/dashboard/main-dashboard.tsx`
```typescript
// Nuevo: Usar hook de persistencia
useSessionPersistence()
```

---

## Cómo Funciona

### Flujo de Persistencia

```
Usuario hace login
    ↓
Se crean 3 cookies (30 días)
    ↓
Usuario navega por la app
    ↓
Middleware renueva cookies en cada request
    ↓
Hook verifica sesión cada 5 minutos
    ↓
Usuario cierra navegador
    ↓
Cookies persisten en el navegador
    ↓
Usuario abre navegador días después
    ↓
Cookies siguen válidas (si no pasaron 30 días)
    ↓
Usuario sigue logueado ✅
```

### Renovación Automática

```
Usuario usa la app
    ↓
Cada navegación renueva cookies
    ↓
Cada 5 minutos verifica sesión
    ↓
Al hacer focus renueva sesión
    ↓
Sesión nunca expira mientras se use la app
```

### Logout Manual

```
Usuario hace clic en "Cerrar Sesión"
    ↓
Se llama a /api/auth/logout
    ↓
Se eliminan TODAS las cookies
    ↓
Se redirige a /login
    ↓
Usuario debe volver a loguearse
```

---

## Beneficios

### Para el Usuario

✅ **No se desloguea al navegar**
- Puede ir a la tienda y volver al dashboard sin problemas

✅ **No se desloguea al actualizar**
- F5 o Ctrl+R no cierra la sesión

✅ **No se desloguea al cerrar el navegador**
- Puede cerrar y abrir días después

✅ **Sesión dura 30 días**
- Solo necesita loguearse una vez al mes

✅ **Renovación automática**
- Mientras use la app, la sesión nunca expira

### Para el Desarrollador

✅ **Código limpio y mantenible**
- Hook reutilizable
- API clara y simple

✅ **Seguridad mejorada**
- Cookies HttpOnly para el token
- Renovación automática

✅ **Fácil de debuggear**
- Logs claros en consola
- Estado visible en cookies

---

## Configuración

### Variables de Entorno

```bash
# .env
JWT_SECRET=tu-secret-super-seguro-aqui
JWT_EXPIRES_IN=30d  # Opcional, por defecto 30d
```

### Ajustar Duración de Sesión

Si quieres cambiar la duración:

```typescript
// src/lib/auth.ts
const JWT_EXPIRES_IN = '60d' // 60 días

// src/app/api/auth/login/route.ts
maxAge: 60 * 24 * 60 * 60 // 60 días

// src/middleware.ts
maxAge: 60 * 24 * 60 * 60 // 60 días
```

### Ajustar Frecuencia de Verificación

```typescript
// src/hooks/useSessionPersistence.ts
// Cambiar de 5 minutos a 10 minutos
setInterval(checkSession, 10 * 60 * 1000)
```

---

## Testing

### Probar Persistencia

1. **Login:**
```bash
# Hacer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"tu-password"}' \
  -c cookies.txt
```

2. **Verificar sesión:**
```bash
# Verificar que la sesión persiste
curl http://localhost:3000/api/auth/session \
  -b cookies.txt
```

3. **Navegar:**
```bash
# Simular navegación
curl http://localhost:3000/dashboard \
  -b cookies.txt
```

4. **Logout:**
```bash
# Cerrar sesión
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Probar en Navegador

1. Hacer login
2. Abrir DevTools → Application → Cookies
3. Verificar que existen 3 cookies:
   - `auth-token` (HttpOnly)
   - `auth-status`
   - `user-id`
4. Navegar a `/tienda`
5. Volver a `/dashboard`
6. Verificar que sigue logueado
7. Actualizar la página (F5)
8. Verificar que sigue logueado
9. Cerrar navegador
10. Abrir navegador
11. Ir a `/dashboard`
12. Verificar que sigue logueado

---

## Troubleshooting

### Problema: Se sigue deslogueando

**Solución 1:** Verificar cookies en DevTools
```
Application → Cookies → localhost
Debe haber 3 cookies con maxAge de 30 días
```

**Solución 2:** Verificar que el hook está activo
```typescript
// En main-dashboard.tsx
useSessionPersistence() // Debe estar presente
```

**Solución 3:** Verificar logs en consola
```
✅ Sesión renovada
✅ Token found, allowing access
```

### Problema: Cookies no persisten

**Causa:** SameSite=Strict
**Solución:** Usar SameSite=Lax (ya implementado)

```typescript
sameSite: 'lax' // Permite navegación normal
```

### Problema: Sesión expira muy rápido

**Causa:** maxAge incorrecto
**Solución:** Verificar que sea en segundos

```typescript
maxAge: 30 * 24 * 60 * 60 // 30 días en SEGUNDOS
```

---

## Seguridad

### Cookies HttpOnly

El token JWT está en una cookie HttpOnly:
- ✅ No accesible desde JavaScript
- ✅ Protegido contra XSS
- ✅ Solo enviado en requests HTTP

### SameSite Lax

Las cookies usan SameSite=Lax:
- ✅ Protección contra CSRF
- ✅ Permite navegación normal
- ✅ No se envían en requests cross-site

### HTTPS en Producción

Las cookies usan Secure en producción:
- ✅ Solo se envían por HTTPS
- ✅ No se envían por HTTP
- ✅ Protegidas en tránsito

---

## Resumen

✅ **Sesión dura 30 días** (antes 7 días)
✅ **Renovación automática** en cada navegación
✅ **Hook de persistencia** verifica cada 5 minutos
✅ **3 cookies** para redundancia
✅ **Logout mejorado** limpia todo
✅ **Seguridad mantenida** (HttpOnly, Secure, SameSite)

**Resultado:** El usuario solo necesita loguearse una vez al mes, y la sesión se mantiene activa mientras use la app.

---

**Fecha:** 2025-11-04
**Versión:** 2.0
