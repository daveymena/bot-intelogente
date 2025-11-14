# 🚀 DESPLEGAR EN EASYPANEL

**Fecha:** 2025-11-11  
**Cambios:** 4 mejoras críticas implementadas

---

## 📦 Cambios a Desplegar

### 1. ✅ Métodos de Pago Correctos
- El bot mantiene el producto correcto en contexto
- Validación crítica antes de generar links

### 2. ✅ Rotación de 8 API Keys
- Sistema automático de rotación entre 8 keys de Groq
- 8x más capacidad (800,000 tokens/día)

### 3. ✅ Sistema de Aprendizaje Local
- Base de conocimiento que guarda respuestas exitosas
- Bot funciona sin APIs cuando es necesario

### 4. ✅ Sistema de Entrenamiento Automático
- Scripts para entrenar el bot con 230+ respuestas
- Simula conversaciones reales

---

## 🔄 Proceso de Despliegue

### PASO 1: Subir Cambios a GitHub

```bash
# Opción A: Script automático
SUBIR_A_GIT_AHORA.bat

# Opción B: Manual
git add .
git commit -m "feat: 4 mejoras criticas - metodos pago, rotacion APIs, aprendizaje, entrenamiento"
git push origin main
```

---

### PASO 2: Actualizar en Easypanel

#### 2.1. Acceder a Easypanel

1. Ve a: https://easypanel.io
2. Inicia sesión
3. Selecciona tu proyecto del bot

#### 2.2. Actualizar el Servicio

**Opción A: Desde la UI de Easypanel**

1. Ve a tu servicio del bot
2. Click en "Deploy"
3. Selecciona "Redeploy" o "Pull latest changes"
4. Espera a que se complete el despliegue

**Opción B: Desde Git (Automático)**

Si tienes configurado el auto-deploy:
- Easypanel detectará los cambios automáticamente
- Iniciará el redespliegue
- Espera 2-3 minutos

---

### PASO 3: Ejecutar Migraciones de Base de Datos

Una vez desplegado, necesitas crear la tabla de conocimiento:

#### 3.1. Acceder a la Terminal de Easypanel

1. En Easypanel, ve a tu servicio
2. Click en "Terminal" o "Console"
3. Se abrirá una terminal SSH

#### 3.2. Ejecutar Comandos de Migración

```bash
# 1. Generar cliente de Prisma
npx prisma generate

# 2. Crear tabla de conocimiento
npx prisma db push

# 3. Verificar que se creó
npx prisma studio
# (Opcional: abre Prisma Studio para ver la tabla)
```

---

### PASO 4: Entrenar el Bot (Opcional pero Recomendado)

Después de las migraciones, puedes entrenar el bot:

```bash
# Opción A: Entrenamiento rápido (5-10 min)
npx tsx scripts/entrenar-bot-automatico.ts

# Opción B: Entrenamiento completo (20-25 min)
npx tsx scripts/entrenar-bot-automatico.ts
npx tsx scripts/entrenar-conversaciones-completas.ts

# Opción C: Entrenar después desde local
# (Puedes entrenar localmente y la DB se sincroniza)
```

---

### PASO 5: Reiniciar el Servicio

Después de las migraciones y entrenamiento:

#### Desde Easypanel UI:

1. Ve a tu servicio
2. Click en "Restart"
3. Espera a que se reinicie (30-60 segundos)

#### Desde Terminal:

```bash
# El servicio se reinicia automáticamente
# O puedes forzar el reinicio:
pm2 restart all
```

---

### PASO 6: Verificar que Todo Funciona

#### 6.1. Ver Logs en Tiempo Real

En Easypanel:
1. Ve a tu servicio
2. Click en "Logs"
3. Deberías ver:

```
[IntelligentEngine] 🔑 8 API keys de Groq disponibles
[KnowledgeBase] 🧠 Inicializando base de conocimiento local...
[KnowledgeBase] ✅ X entradas cargadas en memoria
✅ Sistema de auto-reconexión iniciado
✅ Usuario conectado
```

#### 6.2. Probar con WhatsApp

1. Envía un mensaje de prueba
2. Verifica que responde correctamente
3. Revisa los logs para confirmar:
   - Rotación de APIs funciona
   - Respuestas se guardan en conocimiento
   - Contexto se mantiene correcto

---

## 🔧 Configuración de Variables de Entorno

Asegúrate de que estas variables estén configuradas en Easypanel:

### Variables Críticas:

```env
# Base de datos (ya configurada)
DATABASE_URL=postgresql://...

# API Keys de Groq (8 keys para rotación)
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
GROQ_API_KEY_2=YOUR_GROQ_API_KEY_2_HERE
GROQ_API_KEY_3=YOUR_GROQ_API_KEY_3_HERE
GROQ_API_KEY_4=YOUR_GROQ_API_KEY_4_HERE
GROQ_API_KEY_5=YOUR_GROQ_API_KEY_5_HERE
GROQ_API_KEY_6=YOUR_GROQ_API_KEY_6_HERE
GROQ_API_KEY_7=YOUR_GROQ_API_KEY_7_HERE
GROQ_API_KEY_8=YOUR_GROQ_API_KEY_8_HERE

# Configuración de IA
AI_PROVIDER=groq
DEFAULT_AI_PROVIDER=groq

# Métodos de pago
NEQUI_NUMBER=3136174267
DAVIPLATA_NUMBER=3136174267
MERCADO_PAGO_ACCESS_TOKEN=...
PAYPAL_CLIENT_ID=...
```

### Agregar Variables en Easypanel:

1. Ve a tu servicio
2. Click en "Environment"
3. Agrega las variables que falten
4. Click en "Save"
5. Reinicia el servicio

---

## 📊 Monitoreo Post-Despliegue

### Ver Estadísticas del Sistema:

```bash
# Desde terminal de Easypanel
npx tsx scripts/test-knowledge-base.ts
```

### Ver Logs en Tiempo Real:

```bash
# Desde terminal de Easypanel
pm2 logs

# O desde UI de Easypanel
# Click en "Logs" → Ver en tiempo real
```

### Verificar Base de Conocimiento:

```bash
# Cuántas entradas hay
npx tsx -e "import { LocalKnowledgeBase } from './src/lib/local-knowledge-base'; LocalKnowledgeBase.getStats().then(console.log)"
```

---

## 🐛 Solución de Problemas

### Problema 1: Error al Generar Prisma

```bash
# Limpiar y regenerar
rm -rf node_modules/.prisma
npx prisma generate
```

### Problema 2: Tabla No Existe

```bash
# Forzar creación de tabla
npx prisma db push --force-reset
# ⚠️ Esto borrará datos existentes
```

### Problema 3: Bot No Responde

```bash
# Ver logs
pm2 logs

# Reiniciar
pm2 restart all

# Verificar conexión de WhatsApp
# (Revisar logs para QR code o estado de conexión)
```

### Problema 4: Rate Limit Inmediato

```bash
# Verificar que las 8 keys estén configuradas
echo $GROQ_API_KEY
echo $GROQ_API_KEY_2
# ... etc

# Si faltan, agregarlas en Environment de Easypanel
```

### Problema 5: Conocimiento No Se Guarda

```bash
# Verificar que la tabla existe
npx prisma studio

# Verificar permisos de base de datos
# (Debe tener permisos de escritura)
```

---

## ✅ Checklist de Despliegue

- [ ] Cambios subidos a GitHub
- [ ] Servicio actualizado en Easypanel
- [ ] Migraciones ejecutadas (`npx prisma db push`)
- [ ] Variables de entorno configuradas (8 API keys)
- [ ] Servicio reiniciado
- [ ] Logs verificados (sin errores)
- [ ] Bot responde en WhatsApp
- [ ] Rotación de APIs funciona
- [ ] Conocimiento se guarda correctamente
- [ ] (Opcional) Bot entrenado con scripts

---

## 🎯 Comandos Rápidos

```bash
# Despliegue completo desde terminal de Easypanel
npx prisma generate && \
npx prisma db push && \
npx tsx scripts/entrenar-bot-automatico.ts && \
pm2 restart all

# Ver estado
pm2 status
pm2 logs

# Verificar conocimiento
npx tsx scripts/test-knowledge-base.ts
```

---

## 📝 Notas Importantes

### 1. Base de Datos

- La tabla `conversation_knowledge` se crea automáticamente
- No afecta tablas existentes
- Es seguro ejecutar `npx prisma db push`

### 2. Entrenamiento

- Puedes entrenar desde local o desde Easypanel
- Si entrenas desde local, la DB se sincroniza automáticamente
- El entrenamiento consume tokens pero con 8 keys es suficiente

### 3. Rendimiento

- El sistema de conocimiento usa caché en memoria
- Primera carga toma ~1-2 segundos
- Respuestas posteriores son instantáneas

### 4. Escalabilidad

- Con 8 API keys: 800,000 tokens/día
- Suficiente para ~2,400 conversaciones/día
- Si necesitas más, agrega más keys

---

## 🎉 Resultado Esperado

Después del despliegue, el bot tendrá:

1. ✅ **Métodos de pago correctos** - Sin confusiones
2. ✅ **8x más capacidad** - 800,000 tokens/día
3. ✅ **Funciona sin APIs** - Respaldo de conocimiento local
4. ✅ **Aprende continuamente** - Mejora con cada conversación
5. ✅ **Respuestas instantáneas** - Desde caché local

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en Easypanel
2. Verifica las variables de entorno
3. Ejecuta los scripts de verificación
4. Consulta la documentación:
   - `RESUMEN_FINAL_3_MEJORAS.md`
   - `SISTEMA_APRENDIZAJE_LOCAL.md`
   - `SISTEMA_ENTRENAMIENTO_AUTOMATICO.md`

---

**Desarrollado por:** Kiro AI Assistant  
**Fecha:** 2025-11-11  
**Versión:** 1.0  
**Estado:** ✅ LISTO PARA DESPLEGAR
