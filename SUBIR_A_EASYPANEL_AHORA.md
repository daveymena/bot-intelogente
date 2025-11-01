# 🚀 SUBIR CAMBIOS A EASYPANEL - GUÍA COMPLETA

## ✅ CAMBIOS REALIZADOS EN ESTA SESIÓN

### 1. Sistema de Pagos Flexible 💳
- ✅ Modelo `PaymentConfig` en base de datos
- ✅ API `/api/payment-config` (GET y POST)
- ✅ `PaymentConfigService` para lógica de negocio
- ✅ Links de pago manuales por producto
- ✅ Configuración sin tocar código

### 2. Reasoning con Multi-Provider 🧠
- ✅ `ReasoningService` integrado con `AIMultiProvider`
- ✅ Ollama como prioridad en razonamiento profundo
- ✅ Fallback automático: Ollama → Groq → OpenRouter
- ✅ Respuestas directas para casos simples
- ✅ IA solo para preguntas complejas

### 3. Registro Automático 📝
- ✅ Crea `PaymentConfig` al registrarse
- ✅ Valores por defecto configurados
- ✅ Usuario listo para usar en 2-3 minutos
- ✅ Sistema plug-and-play completo

### 4. Inicialización 🔧
- ✅ 3 usuarios existentes inicializados
- ✅ Script `inicializar-config-pagos.ts`
- ✅ Todos con configuración de pagos

---

## 📋 PASOS PARA SUBIR A EASYPANEL

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar el script
scripts\subir-a-git-completo.bat
```

El script hace:
1. Verifica estado de Git
2. Agrega todos los archivos
3. Crea commit descriptivo
4. Sube a GitHub
5. Te da instrucciones para Easypanel

### Opción 2: Manual

```bash
# 1. Ver cambios
git status

# 2. Agregar todos los archivos
git add .

# 3. Crear commit
git commit -m "feat: Sistema de pagos flexible + Reasoning multi-provider + Registro automatico"

# 4. Subir a GitHub
git push origin main
```

---

## 🔧 CONFIGURAR EN EASYPANEL

### 1. Acceder a Easypanel

```
URL: https://easypanel.io
Login con tu cuenta
```

### 2. Ir a tu Proyecto

```
1. Selecciona tu proyecto (bot-whatsapp)
2. Ve a la pestaña "Deployments"
```

### 3. Redeploy

```
1. Haz clic en "Redeploy"
2. Espera 2-3 minutos
3. Verifica que el deploy sea exitoso
```

### 4. Ejecutar Migraciones

**IMPORTANTE**: Después del deploy, ejecuta las migraciones de Prisma:

```bash
# En Easypanel, ve a "Console" y ejecuta:
npx prisma db push

# O si prefieres migraciones:
npx prisma migrate deploy
```

### 5. Inicializar Configuración de Pagos

Si tienes usuarios existentes en producción:

```bash
# En Easypanel Console:
npx tsx scripts/inicializar-config-pagos.ts
```

---

## ⚙️ VARIABLES DE ENTORNO EN EASYPANEL

Verifica que estas variables estén configuradas:

### Críticas (Ya deberían estar)
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://tu-dominio.com
GROQ_API_KEY=...
RESEND_API_KEY=...
```

### Nuevas (Opcionales)
```env
# Si quieres cambiar los defaults
# (Si no las pones, usa los del schema)
```

---

## 🧪 VERIFICAR QUE TODO FUNCIONA

### 1. Verificar Deploy

```bash
# En Easypanel Console:
npm run build

# Debería compilar sin errores
```

### 2. Verificar Base de Datos

```bash
# En Easypanel Console:
npx prisma studio

# Abrir tabla payment_configs
# Debería ver las configuraciones
```

### 3. Probar API

```bash
# Desde tu navegador o Postman:
GET https://tu-dominio.com/api/payment-config

# Debería devolver la configuración
```

### 4. Probar Registro

```
1. Ir a https://tu-dominio.com/register
2. Registrar un usuario nuevo
3. Verificar que se cree PaymentConfig automáticamente
```

### 5. Probar Bot

```
1. Conectar WhatsApp
2. Enviar: "Quiero el curso de piano"
3. Bot responde con info
4. Enviar: "Dame el link de pago"
5. Bot genera mensaje con métodos configurados
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Table payment_configs doesn't exist"

```bash
# Ejecutar migraciones:
npx prisma db push
```

### Error: "Cannot find module payment-config-service"

```bash
# Rebuild:
npm run build
```

### Error: "PaymentConfig not found"

```bash
# Inicializar configuraciones:
npx tsx scripts/inicializar-config-pagos.ts
```

### Error de compilación

```bash
# Limpiar y rebuild:
rm -rf .next
rm -rf node_modules/.prisma
npm run build
```

---

## 📊 ARCHIVOS MODIFICADOS/CREADOS

### Base de Datos
- `prisma/schema.prisma` - Modelo PaymentConfig + campos en Product

### APIs
- `src/app/api/payment-config/route.ts` - CRUD de configuración

### Servicios
- `src/lib/payment-config-service.ts` - Lógica de pagos
- `src/lib/auth.ts` - Crea PaymentConfig en registro
- `src/lib/reasoning-service.ts` - Integrado con AIMultiProvider

### Scripts
- `scripts/inicializar-config-pagos.ts` - Inicializar usuarios existentes
- `scripts/subir-a-git-completo.bat` - Subir a Git automáticamente

### Documentación
- `SISTEMA_PAGOS_FLEXIBLE_LISTO.md`
- `CONFIGURACION_PAGOS_SIN_CODIGO.md`
- `FLUJO_REGISTRO_COMPLETO.md`
- `REASONING_MULTI_PROVIDER_LISTO.md`
- `LISTO_PARA_CLIENTES_100.md`

---

## ✅ CHECKLIST DE DEPLOY

Antes de hacer deploy, verifica:

- [ ] Todos los archivos están en Git
- [ ] Commit creado con mensaje descriptivo
- [ ] Push a GitHub exitoso
- [ ] Variables de entorno configuradas en Easypanel
- [ ] Backup de base de datos (por si acaso)

Después del deploy:

- [ ] Deploy exitoso en Easypanel
- [ ] Migraciones ejecutadas (`npx prisma db push`)
- [ ] Configuraciones inicializadas (si hay usuarios existentes)
- [ ] API `/api/payment-config` responde
- [ ] Registro crea PaymentConfig automáticamente
- [ ] Bot responde correctamente
- [ ] Métodos de pago se muestran en WhatsApp

---

## 🎯 RESULTADO ESPERADO

Después del deploy, el sistema debe:

1. ✅ Crear `PaymentConfig` al registrar usuarios
2. ✅ API `/api/payment-config` funcionando
3. ✅ Usuarios pueden configurar pagos desde dashboard
4. ✅ Bot usa configuración de la base de datos
5. ✅ Reasoning service usa Ollama como prioridad
6. ✅ Sistema completamente plug-and-play

---

## 📞 SI ALGO FALLA

### Rollback

```bash
# Si algo sale mal, volver a la versión anterior:
git revert HEAD
git push origin main

# Easypanel hará redeploy automático
```

### Logs

```bash
# Ver logs en Easypanel:
# 1. Ve a tu proyecto
# 2. Pestaña "Logs"
# 3. Busca errores
```

### Soporte

Si necesitas ayuda:
1. Revisa los logs en Easypanel
2. Verifica las variables de entorno
3. Ejecuta las migraciones manualmente
4. Revisa la documentación creada

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Subir cambios
scripts\subir-a-git-completo.bat

# En Easypanel Console después del deploy:
npx prisma db push
npx tsx scripts/inicializar-config-pagos.ts

# Verificar
npx prisma studio
```

---

## 🎉 CONCLUSIÓN

Con estos cambios, el sistema está:

- ✅ 100% funcional
- ✅ Configuración sin código
- ✅ Registro automático completo
- ✅ IA multi-provider integrada
- ✅ Listo para clientes

**¡Tiempo estimado de deploy: 5-10 minutos!** 🚀
