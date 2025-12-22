# ⚡ COMANDOS RÁPIDOS - Sistema Conversacional

## 🚀 Integración

```bash
# Integrar automáticamente
npx tsx scripts/integrar-sistema-conversacional.ts

# Reiniciar servidor
npm run dev
```

## 📊 Estadísticas

```bash
# Ver estadísticas de ahorro
npx tsx scripts/ver-estadisticas-conversacional.ts
```

## 🧪 Pruebas

```bash
# Probar sistema híbrido
npx tsx scripts/test-sistema-hibrido-ahorro.ts

# Probar razonamiento profundo
npx tsx scripts/test-razonamiento-profundo.ts

# Probar flujo completo
npx tsx scripts/test-flujo-pago-completo.js
```

## 🔍 Verificación

```bash
# Verificar que está integrado
grep -n "procesarMensaje" src/lib/baileys-stable-service.ts

# Verificar módulo existe
ls -la src/conversational-module/

# Ver logs en tiempo real
npm run dev | grep "Conversación"
```

## 📚 Documentación

```bash
# Guía completa
cat SOLUCION_DEFINITIVA_SISTEMA_CONVERSACIONAL.md

# Guía de integración
cat INTEGRAR_SISTEMA_CONVERSACIONAL_AHORA.md

# Inicio rápido
cat EMPEZAR_AQUI_SISTEMA_CONVERSACIONAL.md

# Teoría del sistema
cat "sistema conversacionnal.txt"
```

## 🎯 Mensajes de Prueba (WhatsApp)

```
1. "Hola" → Respuesta local (sin IA)
2. "Cuánto cuesta" → Precio local
3. "Busco un computador" → Búsqueda con IA
4. "cuanto pa la moto" → Razonamiento profundo
5. "ese que sirve para diseñar" → Interpretación inteligente
6. "Quiero comprar" → Links de pago REALES
7. "Muéstrame fotos" → Fotos automáticas
8. [Audio] → Transcripción automática
```

## 📊 Logs Importantes

```bash
# Respuesta local (ahorro)
[Conversación] ✅ Respuesta local (sin IA) - Tokens ahorrados

# Respuesta con IA
[Conversación] 🤖 Requiere IA para respuesta compleja

# Razonamiento profundo
[Conversación] 🧠 Razonamiento profundo activado

# Fotos automáticas
[Conversación] 📸 Enviando fotos automáticamente

# Pagos dinámicos
[Conversación] 💳 Generando links de pago REALES
```

## 🔧 Troubleshooting

```bash
# Restaurar backup si algo falla
cp src/lib/baileys-stable-service.ts.backup src/lib/baileys-stable-service.ts

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# Regenerar Prisma
npm run db:generate

# Ver errores detallados
npm run dev 2>&1 | tee debug.log
```

## 💾 Backup y Restauración

```bash
# Crear backup manual
cp src/lib/baileys-stable-service.ts src/lib/baileys-stable-service.ts.manual-backup

# Restaurar backup
cp src/lib/baileys-stable-service.ts.backup src/lib/baileys-stable-service.ts

# Ver diferencias
diff src/lib/baileys-stable-service.ts src/lib/baileys-stable-service.ts.backup
```

## 📈 Monitoreo en Producción

```bash
# Ver logs en tiempo real
tail -f logs/app.log | grep "Conversación"

# Contar respuestas locales vs IA
grep "Respuesta local" logs/app.log | wc -l
grep "Requiere IA" logs/app.log | wc -l

# Ver ahorro de tokens
grep "Tokens ahorrados" logs/app.log
```

## 🎯 Comandos de Desarrollo

```bash
# Desarrollo con hot reload
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Ver procesos
ps aux | grep node

# Matar proceso
pkill -f "node.*server"
```

## 📦 Gestión de Módulos

```bash
# Ver estructura del módulo
tree src/conversational-module/

# Contar líneas de código
find src/conversational-module/ -name "*.ts" | xargs wc -l

# Buscar en el módulo
grep -r "procesarMensaje" src/conversational-module/

# Ver exports
cat src/conversational-module/index.ts
```

## 🔍 Debugging

```bash
# Modo debug
DEBUG=* npm run dev

# Solo logs de conversación
npm run dev | grep "\[Conversación\]"

# Solo logs de Baileys
npm run dev | grep "\[Baileys\]"

# Todos los logs importantes
npm run dev | grep -E "\[Conversación\]|\[Baileys\]|\[InformacionPago\]"
```

## 📊 Análisis de Rendimiento

```bash
# Medir tiempo de respuesta
time npx tsx scripts/test-sistema-hibrido-ahorro.ts

# Ver uso de memoria
node --inspect src/lib/baileys-stable-service.ts

# Profiling
node --prof src/lib/baileys-stable-service.ts
```

## 🚀 Deploy

```bash
# Verificar antes de deploy
npm run lint
npm run build
npm run test

# Deploy a producción
git add .
git commit -m "Integrado sistema conversacional completo"
git push origin main

# Reiniciar en servidor
pm2 restart smart-sales-bot
```

## 📚 Documentación Rápida

| Archivo | Descripción |
|---------|-------------|
| `EMPEZAR_AQUI_SISTEMA_CONVERSACIONAL.md` | Inicio rápido |
| `SOLUCION_DEFINITIVA_SISTEMA_CONVERSACIONAL.md` | Guía completa |
| `INTEGRAR_SISTEMA_CONVERSACIONAL_AHORA.md` | Cómo integrar |
| `sistema conversacionnal.txt` | Teoría |
| `RESUMEN_NUEVO_SISTEMA_CONVERSACIONAL.md` | Resumen ejecutivo |
| `RESUMEN_FINAL_SISTEMA_COMPLETO.md` | Detalles completos |

## ⚡ Comandos de 1 Línea

```bash
# Integrar y reiniciar
npx tsx scripts/integrar-sistema-conversacional.ts && npm run dev

# Ver estadísticas y logs
npx tsx scripts/ver-estadisticas-conversacional.ts && tail -f logs/app.log

# Backup, integrar y probar
cp src/lib/baileys-stable-service.ts backup.ts && npx tsx scripts/integrar-sistema-conversacional.ts && npm run dev

# Verificar todo
ls -la src/conversational-module/ && grep -n "procesarMensaje" src/lib/baileys-stable-service.ts && npm run dev
```

## 🎯 Workflow Completo

```bash
# 1. Integrar
npx tsx scripts/integrar-sistema-conversacional.ts

# 2. Verificar
grep -n "procesarMensaje" src/lib/baileys-stable-service.ts

# 3. Reiniciar
npm run dev

# 4. Probar (enviar mensajes por WhatsApp)

# 5. Ver estadísticas
npx tsx scripts/ver-estadisticas-conversacional.ts

# 6. Monitorear logs
tail -f logs/app.log | grep "Conversación"
```

---

## 🚀 Comando Más Importante

```bash
npx tsx scripts/integrar-sistema-conversacional.ts
```

**¡Esto resuelve todo!** 🎯✨
