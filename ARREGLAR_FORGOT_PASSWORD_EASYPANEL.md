# 🔧 Arreglar Recuperación de Contraseña en Easypanel

## Problema Identificado

Error 400 al intentar recuperar contraseña en producción (Easypanel).

## Causa

El servicio de email no está configurado correctamente en Easypanel, lo que causa que la API falle.

## Solución

### 1. Verificar Variables de Email en Easypanel

Ir a Easypanel → Tu App → Environment Variables y verificar:

```env
# Gmail (Opción 1 - Recomendada)
EMAIL_USER=deinermena25@gmail.com
EMAIL_PASS=uccj yqpq vqlt vcie
EMAIL_FROM=deinermena25@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# O Resend (Opción 2 - Más confiable)
RESEND_API_KEY=re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 2. Verificar URL de la Aplicación

```env
NEXT_PUBLIC_APP_URL=https://bot-whatsapp.sqaoeo.easypanel.host
```

**Importante:** Esta URL debe ser la correcta para que el link de recuperación funcione.

### 3. Código Corregido

Ya actualicé el código para:
- ✅ Validar email antes de enviar
- ✅ Validar formato de email
- ✅ Normalizar email (trim + lowercase)
- ✅ Mejor manejo de errores

### 4. Subir Cambios

```bash
# 1. Agregar cambios
git add src/app/forgot-password/page.tsx

# 2. Commit
git commit -m "fix: Mejorar validación en forgot-password"

# 3. Push
git push origin main

# 4. En Easypanel: Rebuild
```

---

## Alternativa: Desactivar Temporalmente

Si el email no funciona, puedes desactivar temporalmente la recuperación de contraseña y usar el dashboard para resetear contraseñas manualmente.

### Opción A: Mostrar Mensaje Alternativo

Modificar `src/app/forgot-password/page.tsx`:

```typescript
// Al inicio del componente
const [emailDisabled, setEmailDisabled] = useState(true);

// En el formulario
{emailDisabled && (
  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
    <p className="font-medium">Servicio temporalmente no disponible</p>
    <p className="text-sm mt-1">
      Por favor contacta al administrador por WhatsApp: +57 300 556 0186
    </p>
  </div>
)}
```

### Opción B: Recuperación por WhatsApp

Agregar botón alternativo:

```typescript
<div className="mt-4">
  <a
    href="https://wa.me/573005560186?text=Hola,%20necesito%20recuperar%20mi%20contraseña"
    target="_blank"
    rel="noopener noreferrer"
    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
  >
    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    Recuperar por WhatsApp
  </a>
</div>
```

---

## Verificar que Funciona

### Test 1: Probar Email
1. Ir a `/forgot-password`
2. Ingresar email: `daveymena16@gmail.com`
3. Click en "Enviar"
4. Verificar que NO sale error 400
5. Revisar email

### Test 2: Verificar Logs en Easypanel
```bash
# En la consola de Easypanel
# Ver logs en tiempo real
```

Buscar líneas como:
```
[ForgotPassword] Token generado para: email@example.com
[ForgotPassword] Email enviado exitosamente
```

O errores:
```
[ForgotPassword] Error enviando email: ...
```

---

## Configuración Recomendada: Resend

Resend es más confiable que Gmail para emails transaccionales.

### Paso 1: Obtener API Key de Resend
1. Ir a https://resend.com
2. Crear cuenta gratis
3. Obtener API Key

### Paso 2: Configurar en Easypanel
```env
RESEND_API_KEY=tu_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Paso 3: Verificar EmailService
El código ya está preparado para usar Resend automáticamente si está configurado.

---

## Checklist de Verificación

- [ ] Variables de email configuradas en Easypanel
- [ ] `NEXT_PUBLIC_APP_URL` correcta
- [ ] Código actualizado y pusheado a GitHub
- [ ] Rebuild completado en Easypanel
- [ ] Probado en producción
- [ ] Email recibido correctamente

---

## Si Sigue Fallando

### Opción 1: Logs Detallados
Agregar más logs en `src/app/api/auth/forgot-password/route.ts`:

```typescript
console.log('[ForgotPassword] Request body:', await req.json());
console.log('[ForgotPassword] Email config:', {
  user: process.env.EMAIL_USER,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  resend: !!process.env.RESEND_API_KEY
});
```

### Opción 2: Resetear Contraseña Manualmente
Crear script para resetear desde la consola de Easypanel:

```bash
# En consola de Easypanel
npx tsx scripts/reset-user-password.ts email@example.com nuevacontraseña
```

---

## Resumen

1. ✅ Código corregido con mejor validación
2. ⏳ Verificar configuración de email en Easypanel
3. ⏳ Subir cambios y rebuild
4. ⏳ Probar en producción

**El problema más común es que las variables de email no están configuradas en Easypanel.**
