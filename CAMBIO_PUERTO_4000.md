# ✅ PUERTO CAMBIADO: 3000 → 4000

## Archivos Actualizados

### 1. `.env`
```env
PORT=4000
NEXT_PUBLIC_APP_URL=http://localhost:4000
NEXTAUTH_URL="http://localhost:4000"
```

### 2. `server.ts`
```typescript
const currentPort = parseInt(process.env.PORT || '4000', 10);
```

### 3. `package.json`
```json
"seo:check": "curl -s http://localhost:4000/sitemap.xml"
```

## 🚀 Cómo Iniciar

### Opción 1: Script Automático
```cmd
INICIAR_BOT_PUERTO_4000.bat
```

### Opción 2: Comando Manual
```cmd
npm run dev
```

## 🌐 URLs Actualizadas

- **Dashboard**: http://localhost:4000
- **API**: http://localhost:4000/api
- **Socket.IO**: ws://localhost:4000/api/socketio
- **Catálogo Público**: http://localhost:4000/catalogo

## ⚠️ Importante

Si tienes el bot corriendo en otro puerto, asegúrate de:
1. Detener el proceso anterior
2. Limpiar caché: `rmdir /s /q .next`
3. Reiniciar: `npm run dev`

## 🔧 Verificación

Después de iniciar, verifica que aparezca:
```
> Ready on http://127.0.0.1:4000
> Socket.IO server running at ws://127.0.0.1:4000/api/socketio
```

---

**Fecha**: 8 de Noviembre 2025
**Bot**: bot-whatsapp (C:\davey\bot-whatsapp)
