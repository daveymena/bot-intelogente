# 🤖 Cómo Usar el Bot AHORA

## ✅ Estado Actual

- **Baileys**: ✅ Conectado y funcionando (573042748687)
- **IA**: ✅ Lista para responder
- **Servidor**: ⚠️ Usando whatsapp-web.js (ignorar)

## 🚀 Usar el Bot (2 opciones)

### Opción 1: Script Independiente (Funciona AHORA)

**Terminal 1** - Servidor Next.js:
```bash
npm run dev
```

**Terminal 2** - Bot de Baileys:
```bash
npx tsx scripts/conectar-baileys-y-mostrar-qr.ts
```

✅ El bot responderá automáticamente
✅ Mantén ambas terminales abiertas
✅ Si se desconecta, ejecuta el script de nuevo

### Opción 2: Integración Completa (Requiere cambios)

Actualizar el servidor para usar Baileys en lugar de whatsapp-web.js.

## 📱 Probar el Bot

1. Envía un mensaje de WhatsApp al **573042748687**
2. El bot responderá automáticamente
3. Prueba con:
   - "Hola"
   - "Tienes laptops?"
   - "Cuánto cuesta?"

## 🔧 Comandos Útiles

```bash
# Conectar Baileys
npx tsx scripts/conectar-baileys-y-mostrar-qr.ts

# Ver estado
npx tsx scripts/diagnosticar-bot-completo.ts

# Monitorear mensajes
npx tsx scripts/monitorear-bot-tiempo-real.ts
```

## ⚠️ Importante

- **NO uses** el botón "Conectar WhatsApp" del dashboard (usa whatsapp-web.js)
- **USA** el script de Baileys directamente
- Mantén el script corriendo mientras uses el bot

## 🎯 Próximo Paso Recomendado

Integrar Baileys en el servidor para que todo funcione desde el dashboard sin scripts separados.

¿Quieres que haga esa integración? Toma 15 minutos.
