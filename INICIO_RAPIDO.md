# 🚀 Inicio Rápido - Smart Sales Bot

## ⚡ Comandos Esenciales

### Desarrollo Normal
```bash
npm run dev
```

### Verificar Estado de WhatsApp
```bash
node verificar-estado-whatsapp.js
```

### Limpiar Conexiones (si hay problemas)
```bash
node limpiar-conexiones-whatsapp.js
```

### Monitorear en Tiempo Real
```bash
monitorear-whatsapp.bat
```

### Sincronizar Base de Datos
```bash
sync-database.bat
```

## 🔧 Solución Rápida de Problemas

### WhatsApp no conecta
```bash
node limpiar-conexiones-whatsapp.js
npm run dev
```

### Loop de reconexiones
```bash
# Detener servidor (Ctrl+C)
node limpiar-conexiones-whatsapp.js
# Esperar 30 segundos
npm run dev
```

### Verificar API Keys
```bash
node verificar-api-keys.js
```

### Ver productos
```bash
npx tsx scripts/ver-productos.ts
```

## 📊 Verificación del Sistema

### 1. Base de Datos
```bash
npx prisma studio
```

### 2. WhatsApp
```bash
node verificar-estado-whatsapp.js
```

### 3. API Keys
```bash
node verificar-api-keys.js
```

### 4. Productos
```bash
npx tsx scripts/ver-productos.ts
```

## 🎯 Flujo de Trabajo Diario

```bash
# 1. Iniciar servidor
npm run dev

# 2. Verificar WhatsApp (en otra terminal)
node verificar-estado-whatsapp.js

# 3. Si todo está bien, trabajar normalmente
# 4. Si hay problemas, limpiar y reiniciar
node limpiar-conexiones-whatsapp.js
npm run dev
```

## 📝 Logs Importantes

### ✅ Sistema Funcionando
```
✅ [Auto-Reconnect] Usuario conectado
[Baileys] ✅ Conexión establecida
[Baileys] 💓 Keep-alive configurado
```

### ❌ Hay Problemas
```
[Baileys] 🔌 Conexión cerrada. Código: 440
[Baileys] 🔄 Reconectando... (repetido)
```

## 🆘 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| No conecta WhatsApp | `node limpiar-conexiones-whatsapp.js` |
| Loop de reconexiones | Limpiar + esperar 30s + reiniciar |
| Error 440 | `node limpiar-conexiones-whatsapp.js` |
| Sesión expirada | Reconectar desde dashboard |
| Base de datos | `sync-database.bat` |

## 📚 Documentación Completa

- `ESTABILIZACION_WHATSAPP_COMPLETA.md` - Guía completa de WhatsApp
- `COMANDOS_WHATSAPP.md` - Todos los comandos disponibles
- `SOLUCION_LOOP_RECONEXION.md` - Explicación técnica
- `LISTO_PARA_DEPLOY_FINAL.md` - Guía de deployment

## 🎉 Todo Listo!

El sistema está estabilizado y listo para usar. Cualquier problema, consulta la documentación o ejecuta los scripts de diagnóstico.
