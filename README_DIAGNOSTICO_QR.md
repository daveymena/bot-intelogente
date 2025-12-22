# 🔍 Diagnóstico de QR WhatsApp - Guía Rápida

## 🚨 Problema

El QR de WhatsApp no se genera en Easypanel y queda en estado "pending".

## ⚡ Solución Rápida (1 comando)

Ejecuta en la consola de Easypanel:

```bash
npx tsx scripts/diagnostico-y-test-qr.ts
```

Este comando ejecuta automáticamente:
1. ✅ Diagnóstico completo del sistema
2. ✅ Test de generación de QR
3. ✅ Verificación de estado en DB

**Tiempo estimado:** 2 minutos

---

## 📋 Archivos Disponibles

### Scripts de Diagnóstico

| Script | Descripción | Uso |
|--------|-------------|-----|
| `diagnostico-y-test-qr.ts` | **TODO EN UNO** - Ejecuta todo automáticamente | `npx tsx scripts/diagnostico-y-test-qr.ts` |
| `diagnostico-completo-whatsapp.ts` | Diagnóstico completo del sistema | `npx tsx scripts/diagnostico-completo-whatsapp.ts` |
| `test-qr-console.ts` | Genera QR en la terminal | `npx tsx scripts/test-qr-console.ts` |
| `verificar-estado-whatsapp.ts` | Verifica estado en DB | `npx tsx scripts/verificar-estado-whatsapp.ts` |

### Archivos Bat (Windows)

| Archivo | Descripción |
|---------|-------------|
| `diagnostico-y-test-qr.bat` | TODO EN UNO para Windows |
| `diagnosticar-whatsapp-completo.bat` | Diagnóstico completo |
| `test-qr-consola.bat` | Test de QR |

### Documentación

| Archivo | Contenido |
|---------|-----------|
| `EJECUTAR_ESTO_EN_EASYPANEL.txt` | **EMPIEZA AQUÍ** - Instrucciones simples |
| `SOLUCION_QR_EASYPANEL_AHORA.md` | Solución paso a paso detallada |
| `DIAGNOSTICO_QR_EASYPANEL.md` | Guía de diagnóstico completa |
| `RESUMEN_SOLUCION_QR_FINAL.md` | Resumen de todos los archivos |
| `COMANDOS_EASYPANEL_CONSOLA.md` | Referencia de comandos |

---

## 🎯 Flujo Recomendado

### Para Easypanel (Producción)

```bash
# Opción 1: Todo en uno (RECOMENDADO)
npx tsx scripts/diagnostico-y-test-qr.ts

# Opción 2: Paso a paso
npx tsx scripts/diagnostico-completo-whatsapp.ts
npx tsx scripts/test-qr-console.ts
npx tsx scripts/verificar-estado-whatsapp.ts
```

### Para Local (Windows)

```bash
# Opción 1: Todo en uno
diagnostico-y-test-qr.bat

# Opción 2: Paso a paso
diagnosticar-whatsapp-completo.bat
test-qr-consola.bat
```

---

## 📊 Resultados Esperados

### ✅ Si todo funciona

```
✅ PROCESO COMPLETADO

📊 Resumen:
   ✅ Diagnóstico: OK
   ✅ Test de QR: OK
   ✅ Estado en DB: Verificado

💡 Próximos pasos:
   1. Ve al dashboard de tu aplicación
   2. Haz clic en "Conectar WhatsApp"
   3. Escanea el QR que aparece
   4. ¡Listo! WhatsApp conectado
```

### ❌ Si hay problemas

El script te dirá exactamente qué está mal:

```
❌ HAY PROBLEMAS CRÍTICOS QUE RESOLVER:

1. Actualizar Node.js a v18 o superior
   En Easypanel: Settings → Runtime → Node.js 18+

2. Instalar Baileys:
   npm install @whiskeysockets/baileys@latest

3. Verificar DATABASE_URL en variables de entorno
   Debe apuntar a PostgreSQL válido
```

---

## 🔧 Soluciones Comunes

### Problema: QR no se genera

```bash
rm -rf auth_sessions/*
npm install @whiskeysockets/baileys@latest
npx tsx scripts/test-qr-console.ts
```

### Problema: QR en consola pero no en frontend

```bash
npx tsx scripts/verificar-estado-whatsapp.ts
# Si está en DB, reiniciar app
npm run build
```

### Problema: Error de conectividad

```bash
curl -I https://web.whatsapp.com
# Si falla, contactar soporte de Easypanel
```

---

## 🆘 Ayuda Adicional

### Ver documentación completa

- **Inicio rápido:** `EJECUTAR_ESTO_EN_EASYPANEL.txt`
- **Guía detallada:** `SOLUCION_QR_EASYPANEL_AHORA.md`
- **Diagnóstico:** `DIAGNOSTICO_QR_EASYPANEL.md`
- **Resumen:** `RESUMEN_SOLUCION_QR_FINAL.md`

### Comandos útiles

```bash
# Ver logs en tiempo real
tail -f /var/log/app.log | grep -i whatsapp

# Limpiar todo y empezar de cero
rm -rf auth_sessions/*
rm -rf .next
npm install @whiskeysockets/baileys@latest
npm run build

# Resetear WhatsApp completo
npx tsx scripts/resetear-whatsapp-completo.ts
```

---

## 🚀 Empieza Aquí

**Ejecuta este comando AHORA en la consola de Easypanel:**

```bash
npx tsx scripts/diagnostico-y-test-qr.ts
```

Espera 2 minutos y comparte el resultado completo.

---

## 📞 Soporte

Si después de ejecutar todos los scripts el problema persiste:

1. Ejecuta y guarda los logs:
```bash
npx tsx scripts/diagnostico-y-test-qr.ts > diagnostico-completo.log 2>&1
```

2. Comparte el archivo `diagnostico-completo.log`

3. Incluye:
   - Versión de Node.js (`node --version`)
   - Plataforma (Easypanel, Railway, etc.)
   - Pasos ya intentados

---

**Última actualización:** 2025-11-04
