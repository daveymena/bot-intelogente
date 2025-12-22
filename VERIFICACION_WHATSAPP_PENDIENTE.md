# 📱 Verificación por WhatsApp - Implementación Pendiente

## ✅ Completado:
- Schema de Prisma actualizado con campos de verificación por teléfono

## 📋 Pendiente de Implementar:

### 1. Servicio de Verificación WhatsApp (`src/lib/whatsapp-verification-service.ts`)
```typescript
- generateVerificationCode() // Genera código de 6 dígitos
- sendVerificationCode(phone, code) // Envía por WhatsApp
- verifyCode(phone, code) // Valida el código
```

### 2. API Endpoints
- `POST /api/auth/send-verification-code` - Enviar código
- `POST /api/auth/verify-phone` - Verificar código

### 3. Actualizar Registro (`src/lib/auth.ts`)
- Agregar campo `phone` obligatorio
- Enviar código por WhatsApp en lugar de email
- Guardar código en BD con expiración (5 minutos)

### 4. Página de Verificación (`src/app/verify-phone/page.tsx`)
- Input para código de 6 dígitos
- Botón "Reenviar código"
- Timer de expiración

### 5. Actualizar Formulario de Registro
- Agregar campo "Número de WhatsApp" (obligatorio)
- Validar formato de teléfono
- Redirigir a página de verificación

## 🔄 Flujo Completo:

1. Usuario se registra con: email, password, nombre, **teléfono**
2. Sistema genera código de 6 dígitos
3. Guarda código en BD con expiración de 5 minutos
4. Envía código por WhatsApp usando BaileysService
5. Usuario ingresa código en la web
6. Sistema valida código
7. Marca `isPhoneVerified = true`
8. Usuario puede hacer login

## 📝 Próximos Pasos:

1. Ejecutar migración de Prisma:
   ```bash
   npm run db:push
   ```

2. Implementar los archivos listados arriba

3. Probar el flujo completo

## 💡 Ventajas:

✅ Gratis (usa tu WhatsApp)
✅ Instantáneo
✅ Más seguro
✅ Mejor UX
✅ No necesita configurar email

---

**Estado:** Schema actualizado, falta implementar servicios y UI
**Tiempo estimado:** 20-30 minutos
