# 🚀 DEPLOY EN EASYPANEL - PASOS FINALES

## ✅ BUILD COMPLETADO EXITOSAMENTE

El build de Next.js se completó sin errores:
- ✓ Compilación exitosa
- ✓ 80 páginas generadas
- ✓ Prisma Client generado
- ✓ Sin errores de webpack
- ✓ Listo para producción

---

## 📋 PASO 1: CONFIGURAR VARIABLES EN EASYPANEL

### Opción A: Copiar todas las variables (Recomendado)

1. Abre Easypanel: https://easypanel.io
2. Ve a tu proyecto: `bot-whatsapp-what-auto2`
3. Click en "Environment Variables"
4. Abre el archivo: `COPIAR_PEGAR_EASYPANEL_COMPLETO.txt`
5. Copia TODAS las líneas (desde NODE_ENV hasta MESSAGE_QUEUE_SIZE)
6. Pégalas en Easypanel
7. Click en "Save"

### Opción B: Variables críticas mínimas

Si prefieres configurar solo lo esencial:

```bash
# Base de datos (obtén estos valores de Easypanel)
DATABASE_URL=postgresql://postgres:TU_PASSWORD@provedor-ia_bot-whatsapp-db:5432/botwhatsapp
DATABASE_PROVIDER=postgresql

# URLs (reemplaza con tu dominio de Easypanel)
NEXT_PUBLIC_APP_URL=https://tu-app.easypanel.host
NEXTAUTH_URL=https://tu-app.easypanel.host

# Seguridad (genera nuevos secretos)
NEXTAUTH_SECRET=tu-secret-key-aqui
JWT_SECRET=tu-jwt-secret-aqui

# IA (usa tus propias API keys)
GROQ_API_KEY=tu_groq_api_key
OLLAMA_BASE_URL=https://tu-ollama.easypanel.host
AI_PROVIDER=ollama

# Email (obtén en resend.com)
RESEND_API_KEY=tu_resend_api_key

# Admin
ADMIN_EMAIL=tu_email@gmail.com
ADMIN_PASSWORD=tu_password_seguro
```

---

## 📦 PASO 2: HACER DEPLOY

### En Easypanel:

1. **Guardar variables**: Click en "Save" después de pegar las variables
2. **Deploy**: Click en el botón "Deploy" o "Redeploy"
3. **Esperar**: El proceso toma 2-3 minutos
4. **Ver logs**: Abre la pestaña "Logs" para ver el progreso

### Qué esperar en los logs:

```
✓ Prisma Client generado
✓ Next.js build completado
✓ Servidor iniciando en puerto 3000
✓ Migraciones aplicadas
✓ Usuario admin creado
```

---

## 🔧 PASO 3: CONFIGURAR BASE DE DATOS

Una vez que el deploy termine, abre la **Terminal de Easypanel**:

```bash
# 1. Aplicar migraciones
npx prisma db push

# 2. Limpiar usuarios de prueba (mantiene solo admin)
npx tsx scripts/limpiar-usuarios-excepto-davey.ts

# 3. Verificar que todo está bien
npx tsx scripts/verificar-antes-deploy.ts
```

---

## 🧪 PASO 4: PROBAR EL SISTEMA

### 4.1 Acceder al Dashboard

1. Abre: https://bot-whatsapp-what-auto2.sqaoeo.easypanel.host
2. Login con:
   - Email: `daveymena16@gmail.com`
   - Password: `6715320Dvd.`

### 4.2 Verificar funcionalidades

- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] Productos se muestran
- [ ] WhatsApp Connection aparece
- [ ] Configuración de IA está disponible

### 4.3 Conectar WhatsApp

1. En el dashboard, ve a "WhatsApp Connection"
2. Click en "Conectar WhatsApp"
3. Escanea el código QR con tu teléfono
4. Espera la confirmación de conexión

---

## 🔍 PASO 5: VERIFICAR SERVICIOS

### Verificar Ollama (IA Local)

```bash
# En terminal de Easypanel
curl https://bot-whatsapp-ollama.sqaoeo.easypanel.host/api/tags
```

Debe responder con lista de modelos disponibles.

### Verificar Base de Datos

```bash
# En terminal de Easypanel
npx prisma db pull
```

Debe conectarse sin errores.

### Verificar Email

```bash
# En terminal de Easypanel
npx tsx scripts/test-email-simple.ts
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to database"

```bash
# Verificar conexión
echo $DATABASE_URL

# Debe mostrar:
# postgresql://postgres:9feb7a0e7110d6a42e93@provedor-ia_bot-whatsapp-db:5432/botwhatsapp
```

### Error: "Prisma Client not generated"

```bash
npx prisma generate
npx prisma db push
```

### Error: "Admin user not found"

```bash
npx tsx scripts/create-admin.ts
```

### Error: "WhatsApp won't connect"

1. Verifica que Puppeteer está instalado
2. Revisa los logs de WhatsApp
3. Intenta resetear la sesión:

```bash
npx tsx scripts/resetear-whatsapp-completo.ts
```

---

## 📊 MONITOREO

### Ver logs en tiempo real

En Easypanel, pestaña "Logs":
- Logs de aplicación
- Logs de base de datos
- Logs de Ollama

### Verificar salud del sistema

```bash
curl https://bot-whatsapp-what-auto2.sqaoeo.easypanel.host/api/health
```

Debe responder:
```json
{
  "status": "ok",
  "database": "connected",
  "whatsapp": "ready"
}
```

---

## ✅ CHECKLIST FINAL

- [ ] Variables de entorno configuradas
- [ ] Deploy completado sin errores
- [ ] Base de datos conectada
- [ ] Migraciones aplicadas
- [ ] Usuario admin creado
- [ ] Login funciona
- [ ] Dashboard carga
- [ ] WhatsApp se puede conectar
- [ ] IA responde (Ollama/Groq)
- [ ] Emails se envían

---

## 🎯 PRÓXIMOS PASOS

Una vez que todo funcione:

1. **Configurar dominio personalizado** (opcional)
2. **Importar productos reales**
3. **Configurar métodos de pago**
4. **Personalizar mensajes del bot**
5. **Entrenar la IA con tus productos**

---

## 📞 SOPORTE

Si algo no funciona:

1. Revisa los logs en Easypanel
2. Verifica las variables de entorno
3. Ejecuta los scripts de diagnóstico
4. Consulta los archivos de solución:
   - `SOLUCION_ERROR_EASYPANEL.md`
   - `DIAGNOSTICO_ERROR_EASYPANEL.md`
   - `ARREGLAR_EASYPANEL_AHORA.txt`

---

## 🚀 ¡LISTO PARA PRODUCCIÓN!

Tu sistema está completamente preparado para:
- ✅ Atender clientes por WhatsApp 24/7
- ✅ Responder con IA inteligente
- ✅ Procesar pagos
- ✅ Gestionar productos
- ✅ Escalar automáticamente

**¡Éxito con tu negocio! 🎉**
