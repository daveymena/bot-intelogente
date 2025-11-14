# ⚡ COMANDOS RÁPIDOS - LINKS DE PAGO

## 🚀 Inicio Rápido

```bash
# 1. Configurar variables de entorno
# Edita .env y agrega:
MERCADOPAGO_ACCESS_TOKEN=tu_token
MERCADOPAGO_PUBLIC_KEY=tu_key
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# 2. Probar que funciona
probar-links-pago.bat

# 3. Iniciar el bot
npm run dev
```

## 🧪 Tests

```bash
# Test rápido (recomendado)
probar-links-pago.bat

# O manualmente:
npx tsx scripts/test-payment-links-rapido.ts

# Test completo con conversación
npx tsx scripts/test-payment-links-integration.ts
```

## 🔧 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Ver logs en tiempo real
npm run dev

# Reiniciar servidor
Ctrl+C
npm run dev
```

## 📊 Verificación

```bash
# Ver productos en base de datos
npx tsx scripts/ver-productos.ts

# Verificar configuración
npx tsx scripts/verificar-sistema.ts

# Ver conversaciones activas
npx tsx scripts/ver-conversaciones.ts
```

## 🐛 Debugging

```bash
# Ver logs del servidor
# Los logs aparecen automáticamente en la consola

# Buscar errores específicos
# Busca en los logs:
[IntelligentEngine] ❌
[PaymentLink] ❌
[IntelligentBot] ❌

# Limpiar memoria de conversación
# Reinicia el servidor: Ctrl+C y npm run dev
```

## 📝 Archivos Importantes

```bash
# Configuración
.env                                    # Variables de entorno

# Código principal
src/lib/payment-link-generator.ts       # Generador de links
src/lib/intelligent-conversation-engine.ts  # Motor de IA
src/lib/intelligent-baileys-integration.ts  # Integración WhatsApp

# Tests
scripts/test-payment-links-rapido.ts    # Test rápido
scripts/test-payment-links-integration.ts   # Test completo

# Documentación
USAR_LINKS_PAGO_AHORA.md               # Guía de usuario
INTEGRACION_LINKS_PAGO_COMPLETA.md     # Documentación técnica
FLUJO_VISUAL_LINKS_PAGO.md             # Diagramas visuales
```

## 🔑 Obtener Credenciales

### MercadoPago
```bash
# 1. Ir a: https://www.mercadopago.com.co/developers
# 2. Crear aplicación
# 3. Copiar Access Token y Public Key
# 4. Pegar en .env
```

### PayPal
```bash
# 1. Ir a: https://developer.paypal.com
# 2. Crear aplicación
# 3. Copiar Client ID y Client Secret
# 4. Pegar en .env
```

## 📱 Prueba por WhatsApp

```bash
# 1. Iniciar bot
npm run dev

# 2. Escanear QR

# 3. Enviar desde otro teléfono:
"Hola, me interesa el Curso de Piano"

# 4. Cuando responda:
"¿Cómo puedo pagar?"

# 5. Confirmar método:
"MercadoPago"

# 6. Verificar que se genera el link
```

## 🔍 Logs Esperados

```bash
# Cuando funciona correctamente:
[IntelligentEngine] 🔍 Análisis de confirmación:
  esConfirmacion: true
  longitudMensaje: 12
  tieneProducto: true
  metodoPago: mercadopago

[IntelligentEngine] 💳 Generando link de pago:
  producto: Curso de Piano
  metodo: mercadopago
  precio: 60000

[PaymentLink] Generando links para: Curso de Piano
[PaymentLink] MercadoPago link generado: https://...

[IntelligentBot] 💳 Enviando links de pago formateados...
[IntelligentBot] ✅ Links de pago agregados
```

## ⚠️ Solución de Problemas

### Problema: "MercadoPago no configurado"
```bash
# Solución:
# 1. Verifica .env
# 2. Reinicia servidor: Ctrl+C y npm run dev
```

### Problema: "Error generando link"
```bash
# Solución:
# 1. Verifica credenciales en dashboard de MercadoPago
# 2. Asegúrate de usar credenciales de producción
# 3. Revisa los logs para más detalles
```

### Problema: "Bot no detecta método de pago"
```bash
# Solución:
# 1. Escribe el método correctamente: "MercadoPago", "PayPal"
# 2. Mensaje debe ser corto (<30 caracteres)
# 3. Debe haber un producto en contexto
```

## 📊 Monitoreo

```bash
# Ver estado del sistema
npm run dev
# Los logs muestran todo en tiempo real

# Ver conversaciones activas
# Busca en logs: [IntelligentEngine]

# Ver links generados
# Busca en logs: [PaymentLink]
```

## 🎯 Comandos de Producción

```bash
# Build para producción
npm run build

# Iniciar en producción
npm start

# Ver logs de producción
# Depende de tu hosting (Easypanel, Railway, etc.)
```

## 📚 Documentación Rápida

```bash
# Leer guía de usuario
cat USAR_LINKS_PAGO_AHORA.md

# Leer documentación técnica
cat INTEGRACION_LINKS_PAGO_COMPLETA.md

# Ver flujo visual
cat FLUJO_VISUAL_LINKS_PAGO.md

# Ver resumen
cat RESUMEN_INTEGRACION_LINKS_PAGO.md
```

## 🔄 Actualizar Sistema

```bash
# Pull últimos cambios
git pull

# Instalar dependencias
npm install

# Reiniciar servidor
npm run dev
```

## 💾 Backup

```bash
# Backup de .env
copy .env .env.backup

# Backup de base de datos
copy prisma/dev.db prisma/dev.db.backup
```

## 🎉 Todo Listo

```bash
# Verificar que todo funciona:
probar-links-pago.bat

# Si el test pasa:
# ✅ Sistema listo para producción
# ✅ Puedes empezar a recibir pagos
```

---

## 📞 Ayuda Rápida

```bash
# ¿No funciona algo?
# 1. Revisa los logs
# 2. Ejecuta: probar-links-pago.bat
# 3. Verifica .env
# 4. Reinicia: Ctrl+C y npm run dev
```

---

**¡Comandos listos para usar!** ⚡
