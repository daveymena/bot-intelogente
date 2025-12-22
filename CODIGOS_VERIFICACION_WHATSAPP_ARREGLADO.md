# ✅ Códigos de Verificación por WhatsApp - Arreglado

## Problema Resuelto

Los códigos de verificación no llegaban por WhatsApp porque:
1. El método `sendMessage` de Baileys requiere `userId` como primer parámetro
2. Los servicios no estaban buscando una conexión activa de WhatsApp
3. El formato de números de teléfono no era consistente

**AHORA**: Los códigos se envían correctamente por WhatsApp para:
- ✅ Registro de nuevos usuarios
- ✅ Recuperación de contraseña
- ✅ Verificación de teléfono

---

## Cambios Implementados

### 1. **WhatsAppVerificationService** (`src/lib/whatsapp-verification-service.ts`)

#### Antes:
```typescript
await BaileysService.sendMessage(whatsappNumber, message)
// ❌ Faltaba el userId
```

#### Ahora:
```typescript
// Buscar conexión activa de WhatsApp
const activeConnection = await db.whatsAppConnection.findFirst({
  where: { status: 'CONNECTED' },
  orderBy: { connectedAt: 'desc' }
})

// Formatear número correctamente
let formattedPhone = phone.replace(/\D/g, '')
if (!formattedPhone.startsWith('57') && formattedPhone.length === 10) {
  formattedPhone = '57' + formattedPhone
}

// Enviar con userId correcto
await BaileysService.sendMessage(activeConnection.userId, whatsappNumber, message)
// ✅ Funciona correctamente
```

### 2. **Forgot Password** (`src/app/api/auth/forgot-password/route.ts`)

#### Mejoras:
- ✅ Busca conexión activa de WhatsApp
- ✅ Formatea números correctamente (agrega +57 si es necesario)
- ✅ Usa el userId correcto para enviar
- ✅ Maneja errores gracefully

### 3. **Formato de Números**

Ahora maneja automáticamente:
```
3041234567     → 573041234567@s.whatsapp.net
+573041234567  → 573041234567@s.whatsapp.net
573041234567   → 573041234567@s.whatsapp.net
```

---

## Cómo Funciona

### Flujo de Registro:

```
1. Usuario se registra con teléfono
   ↓
2. Sistema genera código de 6 dígitos
   ↓
3. Busca conexión activa de WhatsApp
   ↓
4. Formatea número de teléfono
   ↓
5. Envía código por WhatsApp
   ↓
6. Usuario ingresa código
   ↓
7. Sistema verifica y activa cuenta
```

### Flujo de Recuperación de Contraseña:

```
1. Usuario ingresa su teléfono
   ↓
2. Sistema busca usuario por teléfono
   ↓
3. Genera código de 6 dígitos
   ↓
4. Busca conexión activa de WhatsApp
   ↓
5. Envía código por WhatsApp
   ↓
6. Usuario ingresa código
   ↓
7. Sistema permite cambiar contraseña
```

---

## Requisitos

### ✅ WhatsApp Conectado

**IMPORTANTE**: Debe haber al menos una conexión activa de WhatsApp.

Para conectar WhatsApp:
1. Ir al Dashboard
2. Sección "Conexión WhatsApp"
3. Click en "Conectar WhatsApp"
4. Escanear código QR
5. Esperar a que diga "Conectado"

### ✅ Formato de Teléfono

Los números deben estar en formato colombiano:
- `3041234567` (10 dígitos)
- `+573041234567` (con código de país)
- `573041234567` (sin +)

El sistema agrega automáticamente el código de país (+57) si falta.

---

## Pruebas

### Prueba Automática:

```bash
npx tsx scripts/test-verification-codes.ts
```

Este script:
1. ✅ Verifica conexión de WhatsApp
2. ✅ Busca usuario de prueba
3. ✅ Genera código de verificación
4. ✅ Envía código por WhatsApp
5. ✅ Verifica el código
6. ✅ Prueba recuperación de contraseña

### Prueba Manual:

#### Registro:
1. Ir a `/register`
2. Llenar formulario con teléfono
3. Click en "Registrarse"
4. Esperar código por WhatsApp
5. Ingresar código
6. ✅ Cuenta activada

#### Recuperación de Contraseña:
1. Ir a `/forgot-password`
2. Ingresar teléfono
3. Click en "Enviar código"
4. Esperar código por WhatsApp
5. Ingresar código
6. Cambiar contraseña
7. ✅ Contraseña actualizada

---

## Mensajes de WhatsApp

### Código de Verificación (Registro):
```
🔐 *Código de Verificación*

Hola [Nombre],

Tu código de verificación es:

*123456*

Este código expira en 5 minutos.

_No compartas este código con nadie._

_Tecnovariedades D&S_
```

### Código de Recuperación (Contraseña):
```
🔐 *Recuperación de Contraseña*

Tu código de verificación es:

*123456*

Este código expira en 10 minutos.

Si no solicitaste este código, ignora este mensaje.

_Tecnovariedades D&S_
```

---

## Solución de Problemas

### ❌ "No hay conexión activa de WhatsApp"

**Solución:**
1. Ir al Dashboard
2. Conectar WhatsApp
3. Esperar a que esté "Conectado"
4. Intentar de nuevo

### ❌ "Error enviando código"

**Posibles causas:**
1. WhatsApp desconectado → Reconectar
2. Número inválido → Verificar formato
3. WhatsApp bloqueado → Esperar y reintentar

**Solución:**
```bash
# Ver logs del servidor
npm run dev

# Buscar errores en consola
# Verificar que diga: "✅ Código enviado por WhatsApp"
```

### ❌ "Código no llega"

**Verificar:**
1. ✅ WhatsApp conectado en Dashboard
2. ✅ Número de teléfono correcto
3. ✅ WhatsApp del usuario funciona
4. ✅ No hay bloqueo de spam

**Logs a revisar:**
```
[Baileys] Mensaje enviado a 573041234567
✅ Código de verificación enviado a +573041234567
```

---

## Variables de Entorno

No se requieren variables adicionales. El sistema usa la conexión de WhatsApp existente.

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/lib/whatsapp-verification-service.ts` | ✅ Busca conexión activa, formatea números |
| `src/app/api/auth/forgot-password/route.ts` | ✅ Usa conexión activa correctamente |
| `scripts/test-verification-codes.ts` | ✨ Nuevo script de prueba |

---

## Seguridad

### ✅ Códigos Seguros:
- 6 dígitos aleatorios
- Expiran en 5-10 minutos
- Un solo uso
- Almacenados hasheados en BD

### ✅ Protección contra Spam:
- Rate limiting en endpoints
- Verificación de usuario existente
- Logs de intentos

### ✅ Privacidad:
- No revela si el usuario existe
- Mensajes solo al número registrado
- Códigos no se muestran en logs públicos

---

## Próximos Pasos

1. ✅ Probar en desarrollo
2. ✅ Probar en producción
3. ⏳ Monitorear logs de envío
4. ⏳ Ajustar mensajes si es necesario
5. ⏳ Agregar rate limiting adicional

---

## Notas Importantes

- **Conexión requerida**: Debe haber WhatsApp conectado
- **Formato automático**: El sistema formatea números automáticamente
- **Código de país**: Se agrega +57 si falta (Colombia)
- **Expiración**: Códigos expiran en 5-10 minutos
- **Un solo uso**: Cada código solo se puede usar una vez

---

## Soporte

Si los códigos no llegan:

1. **Verificar conexión**:
   ```bash
   # En el dashboard, verificar que WhatsApp esté "Conectado"
   ```

2. **Ver logs**:
   ```bash
   npm run dev
   # Buscar: "✅ Código enviado por WhatsApp"
   ```

3. **Probar script**:
   ```bash
   npx tsx scripts/test-verification-codes.ts
   ```

4. **Verificar número**:
   - Debe ser válido
   - Debe tener WhatsApp activo
   - Debe estar en formato correcto

---

**Estado**: ✅ Funcionando Correctamente  
**Fecha**: 2 de Noviembre, 2025  
**Versión**: 1.0.0
