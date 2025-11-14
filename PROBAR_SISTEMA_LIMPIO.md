# 🧪 Probar Sistema Limpio

## ✅ Cambios Aplicados

1. ✅ Sistema antiguo `detectAndHandlePayment` desactivado
2. ✅ Solo sistema limpio maneja TODO
3. ✅ Un solo contexto: `ContextService`

## 🚀 Cómo Probar

### 1. Reiniciar Servidor

```bash
npm run dev
```

### 2. Conectar WhatsApp

Escanea el QR desde el dashboard

### 3. Enviar Mensajes de Prueba

#### Prueba 1: Búsqueda de Producto

```
Usuario: "Quiero comprar el curso de piano"
```

**Esperado**:
```
[Baileys] 🧹 Usando SISTEMA LIMPIO
[Clean Bot] 📥 Mensaje recibido
[Clean Bot] 🔍 Buscando productos: curso piano
[Clean Bot] ✅ Encontrado: Curso de Piano Completo
[Clean Bot] 💬 Generando respuesta con IA
[Clean Bot] ✅ Respuesta enviada
```

#### Prueba 2: Solicitud de Pago

```
Usuario: "Quiero pagar"
```

**Esperado**:
```
[Baileys] 🧹 Usando SISTEMA LIMPIO
[Clean Bot] 📥 Mensaje recibido
[Clean Bot] 💳 Intención de pago detectada
[Clean Bot] 🔍 Buscando producto en contexto
[Clean Bot] ✅ Producto: Curso de Piano Completo
[Clean Bot] 💰 Generando links de pago
[Clean Bot] ✅ Links enviados
```

#### Prueba 3: Pregunta General

```
Usuario: "Qué productos tienes?"
```

**Esperado**:
```
[Baileys] 🧹 Usando SISTEMA LIMPIO
[Clean Bot] 📥 Mensaje recibido
[Clean Bot] 🔍 Búsqueda general
[Clean Bot] ✅ Encontrados 102 productos
[Clean Bot] 💬 Generando respuesta con IA
[Clean Bot] ✅ Respuesta enviada
```

## ✅ Verificaciones

### 1. No Debe Aparecer

❌ `[Baileys] 💳 Solicitud de pago detectada` (sistema antiguo)
❌ `ConversationContextService` en logs
❌ `detectAndHandlePayment` en logs

### 2. Debe Aparecer

✅ `[Baileys] 🧹 Usando SISTEMA LIMPIO`
✅ `[Clean Bot]` en todos los logs
✅ `ContextService` en logs (si hay debug)

## 🐛 Si Algo Falla

### Problema: Bot no responde

```bash
# Verificar que el servidor esté corriendo
npm run dev

# Verificar logs en consola
```

### Problema: Bot inventa información

```bash
# Verificar que detectAndHandlePayment esté comentado
grep -n "detectAndHandlePayment" src/lib/baileys-stable-service.ts

# Debe mostrar:
# 384: // const paymentDetected = await this.detectAndHandlePayment(...)
```

### Problema: Contexto no funciona

```bash
# Verificar que solo use ContextService
grep -r "ConversationContextService" src/clean-bot/

# No debe encontrar nada
```

## 📊 Logs Esperados

### Flujo Completo Exitoso

```
[Baileys] 📨 Mensaje procesado de 573001234567: Quiero comprar el curso de piano
[Baileys] 🧹 Usando SISTEMA LIMPIO
[Clean Bot] 📥 Mensaje recibido de 573001234567
[Clean Bot] 🔍 Buscando productos con query: curso piano
[Clean Bot] ✅ Encontrado 1 producto: Curso de Piano Completo
[Clean Bot] 💾 Guardando en contexto: producto ID 123
[Clean Bot] 💬 Generando respuesta con IA
[Clean Bot] ✅ Respuesta generada en 1234ms
[Baileys] ✅ Respuesta enviada
[Clean Bot] 💾 Guardado en BD
```

## 🎯 Criterios de Éxito

✅ Bot responde correctamente
✅ Información viene de BD (no inventada)
✅ Contexto funciona entre mensajes
✅ Links de pago se generan correctamente
✅ Solo aparecen logs del sistema limpio

## 🎉 Si Todo Funciona

¡El sistema limpio está funcionando correctamente! 🚀

Ahora puedes:
1. Probar más escenarios
2. Verificar que no inventa información
3. Confirmar que el contexto persiste
4. Validar que los pagos funcionan
