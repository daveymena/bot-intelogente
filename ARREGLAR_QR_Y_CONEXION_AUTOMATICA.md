# 🔧 Arreglar Sistema de QR y Conexión Automática

## Problemas Identificados

### 1. ❌ QR No Se Muestra en el Dashboard
**Síntoma**: El QR se genera pero no aparece en la interfaz web

**Causa**: El callback de QR no está conectado correctamente con el frontend

### 2. ❌ Reconexión Automática Falla
**Síntoma**: Después de desconexión, no reconecta automáticamente

**Causa**: El sistema de auto-reconexión verifica cada 30 segundos pero no maneja correctamente los estados

### 3. ❌ Múltiples Intentos de Conexión Simultáneos
**Síntoma**: Se crean múltiples conexiones al mismo tiempo

**Causa**: El lock de conexión expira muy rápido (2 minutos)

---

## Soluciones

### SOLUCIÓN 1: Mejorar Generación y Envío de QR

**Archivo**: `src/lib/baileys-stable-service.ts`

**Problema en línea ~177:**
```typescript
// Manejar QR
if (qr) {
  console.log(`[Baileys] 📱 QR recibido para usuario: ${userId}`)
  
  try {
    const qrDataURL = await QRCode.toDataURL(qr, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    session.qr = qrDataURL
    session.status = 'QR_PENDING'
```

**Agregar después de guardar en DB (línea ~210):**
```typescript
// Guardar en DB
await db.whatsAppConnection.upsert({
  where: { userId },
  create: {
    userId,
    phoneNumber: 'pending',
    status: 'QR_PENDING',
    qrCode: qrDataURL,
    qrExpiresAt: new Date(Date.now() + 60000)
  },
  update: {
    status: 'QR_PENDING',
    qrCode: qrDataURL,
    qrExpiresAt: new Date(Date.now() + 60000)
  }
})

console.log(`[Baileys] ✅ QR guardado en DB`)

// 🆕 AGREGAR: Emitir evento de QR para Socket.io
const io = (global as any).io
if (io) {
  io.emit('qr-update', {
    userId,
    qr: qrDataURL,
    expiresAt: new Date(Date.now() + 60000)
  })
  console.log(`[Baileys] 📡 QR emitido via Socket.io`)
}

// Llamar callback si existe
const callback = this.qrCallbacks.get(userId)
if (callback) {
  callback(qrDataURL)
}
```

---

### SOLUCIÓN 2: Mejorar Auto-Reconexión

**Archivo**: `src/lib/whatsapp-auto-reconnect.ts`

**Cambiar línea ~38 (intervalo de verificación):**
```typescript
// ANTES: Verificar cada 30 segundos
this.reconnectInterval = setInterval(async () => {
  await this.checkAndReconnect()
}, 30000) // 30 segundos

// DESPUÉS: Verificar cada 15 segundos (más rápido)
this.reconnectInterval = setInterval(async () => {
  await this.checkAndReconnect()
}, 15000) // 15 segundos
```

**Mejorar lógica de reconexión (línea ~70):**
```typescript
// ANTES:
if (!isConnected) {
  console.log(`🔄 [Auto-Reconnect] Usuario ${user.email} desconectado (estado: ${session?.status || 'sin sesión'}), intentando reconectar...`)
  await this.attemptConnection(user.id)
}

// DESPUÉS: Agregar verificación de sesión guardada
if (!isConnected) {
  // Verificar si hay sesión guardada
  const fs = await import('fs')
  const path = await import('path')
  const authPath = path.join(process.cwd(), 'auth_sessions', user.id)
  
  if (fs.existsSync(authPath) && fs.readdirSync(authPath).length > 0) {
    console.log(`🔄 [Auto-Reconnect] Usuario ${user.email} desconectado, reconectando con sesión guardada...`)
    await this.attemptConnection(user.id)
  } else {
    console.log(`⚠️ [Auto-Reconnect] Usuario ${user.email} sin sesión guardada, requiere QR`)
  }
}
```

---

### SOLUCIÓN 3: Aumentar Tiempo de Lock de Conexión

**Archivo**: `src/lib/baileys-stable-service.ts`

**Cambiar línea ~75:**
```typescript
// ANTES: Lock de 2 minutos
if (lockTime < 120000) {
  console.log(`[Baileys] ⚠️ Ya hay una conexión en proceso...`)
  return { success: false, error: 'Conexión ya en proceso' }
}

// DESPUÉS: Lock de 5 minutos
if (lockTime < 300000) { // 5 minutos
  console.log(`[Baileys] ⚠️ Ya hay una conexión en proceso para ${userId} (${Math.round(lockTime/1000)}s)`)
  return { success: false, error: 'Conexión ya en proceso' }
}
```

---

### SOLUCIÓN 4: Agregar Endpoint para Obtener QR

**Archivo**: `src/app/api/whatsapp/qr/route.ts` (CREAR NUEVO)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener conexión de WhatsApp
    const connection = await db.whatsAppConnection.findUnique({
      where: { userId: user.id },
      select: {
        status: true,
        qrCode: true,
        qrExpiresAt: true,
        isConnected: true
      }
    })

    if (!connection) {
      return NextResponse.json({ 
        status: 'DISCONNECTED',
        qr: null,
        message: 'No hay conexión iniciada'
      })
    }

    // Verificar si el QR expiró
    if (connection.qrCode && connection.qrExpiresAt) {
      const now = new Date()
      if (now > connection.qrExpiresAt) {
        return NextResponse.json({
          status: 'QR_EXPIRED',
          qr: null,
          message: 'QR expirado, solicita uno nuevo'
        })
      }
    }

    return NextResponse.json({
      status: connection.status,
      qr: connection.qrCode,
      isConnected: connection.isConnected,
      expiresAt: connection.qrExpiresAt
    })

  } catch (error) {
    console.error('[API] Error obteniendo QR:', error)
    return NextResponse.json(
      { error: 'Error obteniendo QR' },
      { status: 500 }
    )
  }
}
```

---

### SOLUCIÓN 5: Mejorar Componente de WhatsApp en Frontend

**Archivo**: `src/components/dashboard/WhatsAppConnection.tsx`

**Agregar polling de QR (línea ~50):**
```typescript
// Agregar useEffect para polling de QR
useEffect(() => {
  if (status === 'QR_PENDING' || status === 'CONNECTING') {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/whatsapp/qr')
        const data = await response.json()
        
        if (data.qr && data.qr !== qrCode) {
          setQrCode(data.qr)
        }
        
        if (data.status !== status) {
          setStatus(data.status)
        }
        
        if (data.status === 'CONNECTED') {
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Error obteniendo QR:', error)
      }
    }, 2000) // Verificar cada 2 segundos
    
    return () => clearInterval(interval)
  }
}, [status])
```

---

### SOLUCIÓN 6: Agregar Botón de Reconexión Manual

**Archivo**: `src/components/dashboard/WhatsAppConnection.tsx`

**Agregar función de reconexión:**
```typescript
const handleForceReconnect = async () => {
  try {
    setIsLoading(true)
    const response = await fetch('/api/whatsapp/reconnect', {
      method: 'POST'
    })
    
    const data = await response.json()
    
    if (data.success) {
      toast.success('Reconexión iniciada')
      // Actualizar estado
      setTimeout(() => checkStatus(), 2000)
    } else {
      toast.error(data.error || 'Error al reconectar')
    }
  } catch (error) {
    toast.error('Error al reconectar')
  } finally {
    setIsLoading(false)
  }
}
```

**Agregar botón en el JSX:**
```tsx
{status === 'DISCONNECTED' && (
  <Button 
    onClick={handleForceReconnect}
    disabled={isLoading}
    variant="outline"
  >
    🔄 Reconectar Manualmente
  </Button>
)}
```

---

### SOLUCIÓN 7: Crear Endpoint de Reconexión Manual

**Archivo**: `src/app/api/whatsapp/reconnect/route.ts` (CREAR NUEVO)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { WhatsAppAutoReconnect } from '@/lib/whatsapp-auto-reconnect'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log(`[API] Forzando reconexión para usuario: ${user.email}`)

    // Forzar reconexión
    await WhatsAppAutoReconnect.forceReconnect(user.id)

    return NextResponse.json({ 
      success: true,
      message: 'Reconexión iniciada'
    })

  } catch (error) {
    console.error('[API] Error forzando reconexión:', error)
    return NextResponse.json(
      { error: 'Error al reconectar' },
      { status: 500 }
    )
  }
}
```

---

## Resumen de Cambios

### Archivos a Modificar:

1. ✅ `src/lib/baileys-stable-service.ts`
   - Emitir QR via Socket.io
   - Aumentar tiempo de lock a 5 minutos

2. ✅ `src/lib/whatsapp-auto-reconnect.ts`
   - Reducir intervalo de verificación a 15 segundos
   - Mejorar lógica de verificación de sesión

3. ✅ `src/components/dashboard/WhatsAppConnection.tsx`
   - Agregar polling de QR cada 2 segundos
   - Agregar botón de reconexión manual

### Archivos a Crear:

4. ✅ `src/app/api/whatsapp/qr/route.ts`
   - Endpoint para obtener QR actualizado

5. ✅ `src/app/api/whatsapp/reconnect/route.ts`
   - Endpoint para forzar reconexión manual

---

## Flujo Mejorado

### Conexión Inicial:
```
1. Usuario hace clic en "Conectar WhatsApp"
2. Backend genera QR y lo guarda en DB
3. Backend emite QR via Socket.io
4. Frontend recibe QR y lo muestra
5. Frontend hace polling cada 2s para verificar estado
6. Usuario escanea QR con WhatsApp
7. Conexión establecida → Frontend actualiza estado
```

### Reconexión Automática:
```
1. Sistema verifica cada 15 segundos
2. Si detecta desconexión Y hay sesión guardada
3. Intenta reconectar automáticamente
4. Si falla, espera y reintenta
5. Si no hay sesión, requiere QR nuevo
```

### Reconexión Manual:
```
1. Usuario ve estado "Desconectado"
2. Usuario hace clic en "Reconectar Manualmente"
3. Sistema intenta reconectar inmediatamente
4. Si hay sesión guardada → Reconecta
5. Si no hay sesión → Genera QR nuevo
```

---

## Verificación

### Probar QR:
```bash
# 1. Desconectar WhatsApp
# 2. Ir al dashboard
# 3. Hacer clic en "Conectar WhatsApp"
# 4. Verificar que el QR aparece en menos de 3 segundos
# 5. Escanear QR con WhatsApp
# 6. Verificar que conecta correctamente
```

### Probar Auto-Reconexión:
```bash
# 1. Conectar WhatsApp
# 2. Cerrar WhatsApp en el teléfono
# 3. Esperar 15-30 segundos
# 4. Verificar en logs que intenta reconectar
# 5. Abrir WhatsApp en el teléfono
# 6. Verificar que reconecta automáticamente
```

### Probar Reconexión Manual:
```bash
# 1. Desconectar WhatsApp
# 2. Ir al dashboard
# 3. Hacer clic en "Reconectar Manualmente"
# 4. Verificar que reconecta o genera QR nuevo
```

---

**Última actualización**: 2025-11-13
**Estado**: Listo para implementar
**Tiempo estimado**: 30-45 minutos
