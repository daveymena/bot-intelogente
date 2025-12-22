# 🚀 Guía de Deploy en Easypanel

## 📋 Pasos Completos

### 1. Subir Código a Git

```bash
preparar-y-subir-git.bat
```

Este script:
- ✅ Verifica que `.env` no se suba
- ✅ Limpia archivos temporales
- ✅ Crea commit
- ✅ Sube a GitHub

### 2. Configurar Variables en Easypanel

1. **Ir a tu aplicación** en Easypanel
2. **Sección**: "Environment Variables" o "Settings"
3. **Copiar** el contenido de `VARIABLES_EASYPANEL_COMPLETAS.env`
4. **Pegar** en Easypanel
5. **Guardar** cambios

### 3. Variables Críticas

Asegúrate de que estas variables estén configuradas:

```env
# Base de Datos (URL INTERNA)
DATABASE_URL=postgresql://postgres:6715320D@davey_postgres-db:5432/davey?sslmode=disable

# Ollama (URL de tu servicio)
OLLAMA_BASE_URL=https://davey-ollama.mapf5v.easypanel.host
OLLAMA_MODEL=llama3:latest

# Sistema Híbrido
HYBRID_SYSTEM_ENABLED=true
LOCAL_RESPONSE_PRIORITY=true

# Producción
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.easypanel.host
```

### 4. Rebuild la Aplicación

1. En Easypanel, busca el botón **"Rebuild"** o **"Deploy"**
2. Click en **"Rebuild from Git"**
3. Espera a que termine el build (~2-5 minutos)

### 5. Aplicar Schema de Base de Datos

Una vez que la aplicación esté corriendo:

1. **Abrir consola** en Easypanel
2. **Ejecutar**:
   ```bash
   npx prisma db push
   ```
3. Esperar confirmación: "Your database is now in sync"

### 6. Verificar que Todo Funciona

#### Verificar Ollama
```bash
curl https://davey-ollama.mapf5v.easypanel.host/api/tags
```

Debe mostrar los modelos disponibles.

#### Verificar Base de Datos
```bash
npx prisma db pull
```

Debe conectarse sin errores.

#### Ver Logs
En Easypanel, sección "Logs", verifica que no haya errores.

## 🔧 Configuración Específica

### PostgreSQL

**URL Interna** (para la aplicación):
```
postgresql://postgres:6715320D@davey_postgres-db:5432/davey?sslmode=disable
```

**URL Externa** (para desarrollo local):
```
postgresql://postgres:6715320D@157.173.97.41:5432/davey?sslmode=disable
```

### Ollama

**URL del servicio**:
```
https://davey-ollama.mapf5v.easypanel.host
```

**Modelos disponibles**:
- `llama3:latest` (principal)
- `mistral:latest` (secundario)

### Groq (Respaldo)

Si Ollama falla, el sistema usa Groq automáticamente.

API Keys configuradas:
- `GROQ_API_KEY` (principal)
- `GROQ_API_KEY_2` (respaldo 1)
- `GROQ_API_KEY_3` (respaldo 2)
- `GROQ_API_KEY_6` (respaldo 3)

## 📊 Arquitectura en Easypanel

```
┌─────────────────────────────────────┐
│   Tu Aplicación (Next.js)          │
│   - Bot Local (instantáneo)        │
│   - Hybrid Service                 │
└─────────────────────────────────────┘
            │
            ├──────────────┐
            │              │
            ▼              ▼
┌──────────────────┐  ┌──────────────────┐
│   PostgreSQL     │  │   Ollama Server  │
│   davey_postgres │  │   davey-ollama   │
│   (interno)      │  │   (interno)      │
└──────────────────┘  └──────────────────┘
```

## 🎯 Flujo de Funcionamiento

1. Cliente envía mensaje por WhatsApp
2. Bot Local intenta responder (< 100ms)
3. Si no sabe → Ollama analiza (~20s)
4. Ollama busca en PostgreSQL
5. Genera respuesta formateada
6. Respuesta al cliente

## ⚠️ Troubleshooting

### Error: "Can't reach database"

**Solución**: Verifica que `DATABASE_URL` use la URL interna:
```
davey_postgres-db:5432
```

### Error: "Ollama not responding"

**Solución**: Verifica que el servicio Ollama esté corriendo en Easypanel.

### Error: "Module not found"

**Solución**: Rebuild la aplicación desde cero.

### Logs con errores

**Solución**: 
1. Ve a la consola de Easypanel
2. Ejecuta: `npm install`
3. Ejecuta: `npx prisma generate`
4. Restart la aplicación

## 📝 Checklist de Deploy

- [ ] Código subido a Git
- [ ] Variables de entorno configuradas en Easypanel
- [ ] `DATABASE_URL` usa URL interna
- [ ] `OLLAMA_BASE_URL` configurada
- [ ] Aplicación rebuildeada
- [ ] Schema aplicado (`npx prisma db push`)
- [ ] Logs sin errores
- [ ] Ollama respondiendo
- [ ] PostgreSQL conectado
- [ ] WhatsApp funcionando

## 🎉 Resultado Esperado

Una vez completado:

✅ Bot funcionando 24/7  
✅ Respuestas instantáneas (Bot Local)  
✅ Respuestas inteligentes (Ollama)  
✅ Formato profesional WhatsApp  
✅ Memoria conversacional  
✅ Sin costos adicionales  

## 📞 Comandos Útiles en Consola Easypanel

```bash
# Ver estado de la base de datos
npx prisma db pull

# Aplicar schema
npx prisma db push

# Ver productos
npx prisma studio

# Ver logs en tiempo real
tail -f /var/log/app.log

# Reiniciar aplicación
pm2 restart all
```

## 🔄 Actualizar en el Futuro

Para actualizar el código:

1. Hacer cambios localmente
2. Ejecutar: `preparar-y-subir-git.bat`
3. En Easypanel: Click en "Rebuild"
4. Esperar a que termine
5. Verificar logs

---

**Fecha**: 26 de Noviembre de 2025  
**Sistema**: Bot Local + Ollama Assistant  
**Estado**: Listo para deploy
