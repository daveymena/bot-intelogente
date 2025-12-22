# ⚡ ACCIÓN INMEDIATA - CONFIGURAR AHORA

## 🔴 PROBLEMA CONFIRMADO

La auditoría encontró:
- ❌ **PAYPAL_LINK_TEMPLATE** no configurado en `.env`
- ❌ **288 productos** sin links de pago
- ❌ **Productos irrelevantes** (Piano, Auriculares) cuando pregunta por idiomas

---

## ✅ SOLUCIÓN EN 3 PASOS (15 minutos)

### PASO 1: Configurar .env (2 minutos)

Abrir `.env` y agregar estas líneas al final:

```env
# PayPal - Links Dinámicos
PAYPAL_LINK_TEMPLATE=https://www.paypal.com/ncp/payment/LQXDGBXDXHFXE
PAYPAL_BUSINESS_ID=LQXDGBXDXHFXE
```

**IMPORTANTE**: Reemplaza `LQXDGBXDXHFXE` con tu Business ID real de PayPal.

**¿Cómo obtener tu Business ID?**
1. Ir a: https://www.paypal.com/businessprofile/settings
2. Buscar "PayPal.Me link" o "Business ID"
3. Copiar el ID (ejemplo: `ABCD1234EFGH`)
4. Pegar en las variables de arriba

---

### PASO 2: Configurar Links de Pago (5 minutos)

```bash
npx tsx scripts/configurar-links-pago-masivo.ts
```

Esto configurará automáticamente los 288 productos.

---

### PASO 3: Modificar Código (Opcional - 2 horas)

Para solucionar completamente los problemas de contexto y búsqueda, necesitas modificar 6 archivos.

**Lee**: `HACER_AHORA_CORRECIONES.md` para instrucciones detalladas.

---

## 🎯 RESULTADO ESPERADO

Después del PASO 1 y 2:
- ✅ Todos los productos tendrán links de PayPal
- ✅ Bot podrá enviar links de pago

Después del PASO 3:
- ✅ Bot mantendrá contexto del producto
- ✅ Bot NO mostrará productos irrelevantes

---

## 📝 COMANDOS RÁPIDOS

```bash
# 1. Editar .env
code .env

# 2. Configurar links
npx tsx scripts/configurar-links-pago-masivo.ts

# 3. Verificar
npx tsx scripts/test-problema-imagen.ts
```

---

## ⚠️ SI NO TIENES BUSINESS ID DE PAYPAL

**Opción A**: Usar email temporalmente
```env
# Temporal - hasta conseguir Business ID
PAYPAL_LINK_TEMPLATE=https://www.paypal.me/TU_USUARIO_PAYPAL
```

**Opción B**: Configurar manualmente por producto
Ir al dashboard → Productos → Editar → Agregar link de PayPal

---

## 🚀 EMPEZAR AHORA

```bash
code .env
```

Agregar las 2 líneas de PayPal y guardar.

Luego:
```bash
npx tsx scripts/configurar-links-pago-masivo.ts
```

---

**Tiempo**: 15 minutos  
**Prioridad**: 🔴 CRÍTICA  
**Impacto**: Alto - Permite que el bot envíe links de pago
