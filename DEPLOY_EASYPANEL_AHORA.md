# 🚀 DEPLOY A EASYPANEL - GUÍA COMPLETA

## ✅ TODO LISTO PARA SUBIR

Tu proyecto está 100% configurado y listo para producción.

---

## 📋 PASO 1: Preparar Variables de Entorno

### Opción A: Copiar desde archivo (Recomendado)

1. Abre el archivo: **VARIABLES_EASYPANEL_LISTAS.txt**
2. Copia TODAS las variables
3. Ve a Easypanel → Tu App → Environment Variables
4. Pega todas las variables
5. Guarda

### Opción B: Generar Secrets Seguros

Antes de subir, genera nuevos secrets:

```bash
# En PowerShell o CMD
# Genera NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Genera JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Reemplaza estos valores en Easypanel:
- `NEXTAUTH_SECRET=TU_NUEVO_SECRET_AQUI`
- `JWT_SECRET=TU_NUEVO_JWT_SECRET_AQUI`

---

## 📋 PASO 2: Verificar Configuración

### Variables Críticas (VERIFICAR)

```env
# URL de tu app
NEXT_PUBLIC_APP_URL=https://bot-whatsapp-what-auto2.sqaoeo.easypanel.host

# Base de datos (URL INTERNA de Easypanel)
DATABASE_URL=postgresql://postgres:9feb7a0e7110d6a42e93@provedor-ia_bot-whatsapp-db:5432/botwhatsapp

# Ollama (si lo tienes)
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host

# Auth URLs
NEXTAUTH_URL=https://bot-whatsapp-what-auto2.sqaoeo.easypanel.host
```

---

## 📋 PASO 3: Subir Código a Git

```bash
# 1. Verificar cambios
git status

# 2. Agregar todos los archivos
git add .

# 3. Commit
git commit -m "Configuración completa para Easypanel con PostgreSQL"

# 4. Push
git push origin main
```

---

## 📋 PASO 4: Configurar en Easypanel

### 4.1 Crear/Actualizar Aplicación

1. Ve a Easypanel
2. Si no existe, crea nueva aplicación:
   - Tipo: **App**
   - Source: **GitHub**
   - Repositorio: Tu repo
   - Branch: **main**

### 4.2 Configurar Build

```yaml
Build Command: npm run build
Start Command: npm start
Port: 3000
```

### 4.3 Agregar Variables de Entorno

Copia TODAS las variables de **VARIABLES_EASYPANEL_LISTAS.txt**

### 4.4 Conectar PostgreSQL

1. Ve a tu servicio PostgreSQL en Easypanel
2. Copia la URL interna (algo como `provedor-ia_bot-whatsapp-db:5432`)
3. Asegúrate que `DATABASE_URL` use esa URL interna

---

## 📋 PASO 5: Deploy

1. En Easypanel, haz clic en **Deploy**
2. Espera 5-10 minutos
3. Verifica logs para errores

---

## 📋 PASO 6: Después del Deploy

### 6.1 Aplicar Migraciones

```bash
# Conectar por SSH a Easypanel (si está disponible)
# O usar el terminal de Easypanel

npx prisma migrate deploy
```

### 6.2 Crear Usuario Admin

```bash
npx tsx scripts/create-admin.ts
```

### 6.3 Importar Productos (Opcional)

```bash
npx tsx scripts/import-productos-completos.ts
```

---

## 🔍 PASO 7: Verificar que Todo Funciona

### 7.1 Acceder a la Aplicación

```
https://bot-whatsapp-what-auto2.sqaoeo.easypanel.host
```

### 7.2 Login

```
Email: daveymena16@gmail.com
Password: 6715320Dvd.
```

### 7.3 Conectar WhatsApp

1. Ve al Dashboard
2. Sección "WhatsApp Connection"
3. Escanea el código QR con tu WhatsApp
4. Espera confirmación

### 7.4 Probar IA

1. Envía un mensaje de prueba a tu WhatsApp
2. El bot debe responder automáticamente
3. Verifica que use Ollama/Groq

---

## 🐛 Solución de Problemas

### Error: "Build failed"

```bash
# Verifica logs en Easypanel
# Común: falta de memoria

# Solución: Aumentar memoria en Easypanel
# Settings → Resources → Memory: 2GB
```

### Error: "Database connection failed"

```bash
# Verifica DATABASE_URL
# Debe usar URL INTERNA de Easypanel
DATABASE_URL=postgresql://postgres:PASSWORD@provedor-ia_bot-whatsapp-db:5432/botwhatsapp

# NO uses la IP externa (157.173.97.41) en producción
```

### Error: "Prisma Client not generated"

```bash
# En Easypanel terminal:
npx prisma generate
npm run build
```

### Error: "WhatsApp no conecta"

```bash
# 1. Verifica que Puppeteer esté configurado
PUPPETEER_HEADLESS=true
PUPPETEER_SANDBOX=false

# 2. Aumenta memoria si es necesario
# 3. Revisa logs de WhatsApp en Dashboard
```

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

1. Easypanel → Tu App → Logs
2. Filtra por errores
3. Monitorea conexiones de WhatsApp

### Métricas

1. Easypanel → Tu App → Metrics
2. Verifica:
   - CPU usage
   - Memory usage
   - Request rate

---

## 🔄 Actualizar Aplicación

```bash
# 1. Hacer cambios localmente
# 2. Commit y push
git add .
git commit -m "Actualización"
git push

# 3. En Easypanel
# Click en "Redeploy" o espera auto-deploy
```

---

## 🔐 Seguridad Post-Deploy

### 1. Cambiar Contraseñas

```bash
# Conectar a Easypanel terminal
npx tsx scripts/reset-admin-password.ts
```

### 2. Configurar Dominio Personalizado (Opcional)

1. Easypanel → Tu App → Domains
2. Agregar dominio personalizado
3. Configurar DNS
4. Actualizar `NEXT_PUBLIC_APP_URL`

### 3. Habilitar SSL

Easypanel lo hace automáticamente con Let's Encrypt.

### 4. Configurar Backups

1. Easypanel → PostgreSQL → Backups
2. Habilitar backups automáticos
3. Frecuencia: Diaria

---

## 📞 URLs Importantes

```
Dashboard: https://bot-whatsapp-what-auto2.sqaoeo.easypanel.host
Tienda: https://bot-whatsapp-what-auto2.sqaoeo.easypanel.host/tienda
Catálogo: https://bot-whatsapp-what-auto2.sqaoeo.easypanel.host/catalogo
API: https://bot-whatsapp-what-auto2.sqaoeo.easypanel.host/api
```

---

## ✅ Checklist Final

- [ ] Variables de entorno configuradas
- [ ] Código subido a Git
- [ ] Deploy exitoso en Easypanel
- [ ] Base de datos conectada
- [ ] Migraciones aplicadas
- [ ] Usuario admin creado
- [ ] WhatsApp conectado
- [ ] IA funcionando (Ollama/Groq)
- [ ] Productos importados
- [ ] Pagos configurados
- [ ] Emails funcionando
- [ ] SSL habilitado
- [ ] Backups configurados

---

## 🎉 ¡Listo!

Tu aplicación está en producción y funcionando. Ahora puedes:

1. ✅ Recibir mensajes de WhatsApp
2. ✅ Responder automáticamente con IA
3. ✅ Gestionar productos
4. ✅ Procesar pagos
5. ✅ Ver estadísticas

¡Felicidades! 🚀
