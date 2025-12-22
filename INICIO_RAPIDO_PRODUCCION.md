# 🚀 INICIO RÁPIDO - PRODUCCIÓN

## Para Subir el Bot a Producción en 10 Minutos

### Paso 1: Preparar el Código (2 min)
```bash
.\PREPARAR_DEPLOY_COMPLETO.bat
```
Este script:
- ✅ Cierra puertos
- ✅ Limpia archivos temporales
- ✅ Instala dependencias
- ✅ Compila TypeScript
- ✅ Ejecuta tests

### Paso 2: Subir a GitHub (2 min)
```bash
.\SUBIR_A_REPO_PRIVADO.bat
```
O si prefieres crear repo nuevo:
```bash
.\CREAR_REPO_LIMPIO_DESDE_CERO.bat
```

### Paso 3: Configurar Easypanel (3 min)

#### A. Crear App
1. Ir a Easypanel → "Create App"
2. Nombre: `smart-sales-bot-pro`
3. Conectar con GitHub (repo privado)

#### B. Build Settings
```
Build Command: npm install && npm run build
Start Command: npm start
Port: 3000
```

#### C. Variables de Entorno (COPIAR TODO)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
GROQ_API_KEY=tu_groq_api_key
AI_PROVIDER=groq
AI_MODEL=llama-3.1-70b-versatile
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
USE_OLLAMA=true
WHATSAPP_AUTO_CONNECT=true
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
DEFAULT_USER_ID=tu-user-id
```

#### D. Crear PostgreSQL
1. En Easypanel → "Create Service" → PostgreSQL
2. Copiar `DATABASE_URL`
3. Pegar en variables de entorno

### Paso 4: Deploy (1 min)
1. Click en "Deploy"
2. Esperar build (2-3 minutos)
3. Verificar logs: debe decir "Server running on port 3000"

### Paso 5: Conectar WhatsApp (2 min)
1. Ir a: `https://tu-dominio.com`
2. Login: `admin@example.com` / `admin123`
3. Click "Conectar WhatsApp"
4. Escanear QR con WhatsApp
5. ✅ Listo!

## 🧪 Verificación Rápida

Envía estos mensajes a tu WhatsApp:

1. **"Hola"** → Debe saludar
2. **"megapack de idiomas"** → Debe mostrar producto
3. **"Tienes fotos?"** → Debe enviar fotos
4. **"Como puedo pagar?"** → Debe dar métodos de pago

Si todo funciona: **¡DEPLOY EXITOSO!** 🎉

## ⚠️ Si Algo Falla

### Bot no responde
```bash
# En Easypanel terminal:
npx prisma migrate deploy
npm start
```

### No encuentra productos
```bash
# En Easypanel terminal:
npx prisma db seed
```

### WhatsApp no conecta
1. Limpiar sesión: Click "Limpiar Sesión"
2. Reintentar QR
3. Verificar que `WHATSAPP_AUTO_CONNECT=true`

## 📊 Monitoreo

### Ver Logs en Tiempo Real
Easypanel → Tu App → "Logs"

### Métricas
`https://tu-dominio.com/api/stats`

### Health Check
`https://tu-dominio.com/api/health`

## 🎯 Checklist Final

- [ ] Bot responde a mensajes
- [ ] Busca productos correctamente
- [ ] Envía fotos automáticamente
- [ ] Proporciona info de pago
- [ ] WhatsApp mantiene conexión
- [ ] Logs sin errores críticos

## 🎉 ¡Listo para Producción!

Tu bot está funcionando 24/7 atendiendo clientes automáticamente.

---

**Tiempo total**: ~10 minutos
**Dificultad**: Fácil
**Resultado**: Bot en producción ✅
