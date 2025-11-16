# 🚀 Deploy del Sistema de Entrenamiento en Easypanel

## 📋 Preparación

### 1. Verificar Archivos Creados

```bash
# Nuevos archivos del sistema de entrenamiento
src/lib/auto-training-system.ts
src/lib/trained-response-service.ts
src/lib/dataset-generator-service.ts
src/lib/continuous-learning-service.ts

# Scripts
scripts/entrenar-24-7.ts
scripts/ver-stats-entrenamiento.ts
scripts/setup-ollama-training.sh
scripts/generar-dataset-ollama-solo.ts
scripts/generar-dataset-productos-reales.ts

# Docker
Dockerfile.training
docker-compose.training.yml

# Documentación
SISTEMA_ENTRENAMIENTO_24_7.md
RESUMEN_SISTEMA_ENTRENAMIENTO.md
DEPLOY_ENTRENAMIENTO_EASYPANEL.md
INICIAR_ENTRENAMIENTO.bat
```

### 2. Subir a Git

```bash
# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: Sistema de entrenamiento automático 24/7 con Ollama

- Sistema de entrenamiento continuo usando Ollama
- Base de conocimiento local para fallback
- Generación automática de respuestas
- Scripts de gestión y monitoreo
- Docker configurado para Easypanel
- Documentación completa"

# Push
git push origin main
```

## 🐳 Configuración en Easypanel

### Opción A: Servicios Separados (Recomendado)

#### 1. Servicio: Ollama (Motor de IA)

**Configuración:**
- **Nombre:** `ollama-ai`
- **Tipo:** Docker Image
- **Imagen:** `ollama/ollama:latest`
- **Puerto:** `11434`
- **Recursos:**
  - CPU: 2 cores
  - RAM: 4GB
  - Storage: 10GB

**Volúmenes:**
```
/root/.ollama → ollama-models (persistente)
```

**Health Check:**
```bash
curl -f http://localhost:11434/api/tags || exit 1
```

**Comando de inicio:**
```bash
# Después de crear el servicio, ejecutar una vez:
docker exec -it ollama-ai ollama pull gemma2:2b
docker exec -it ollama-ai ollama pull qwen3:4b
```

#### 2. Servicio: Sistema de Entrenamiento

**Configuración:**
- **Nombre:** `training-system`
- **Tipo:** Build from GitHub
- **Repositorio:** Tu repo
- **Branch:** `main`
- **Dockerfile:** `Dockerfile.training`
- **Build Context:** `/`

**Variables de Entorno:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
OLLAMA_BASE_URL=http://ollama-ai:11434
OLLAMA_MODEL=gemma2:2b
```

**Volúmenes:**
```
/app/data → training-data (persistente)
```

**Depends On:**
- `ollama-ai`

#### 3. Servicio: Aplicación Principal

**Configuración:**
- **Nombre:** `whatsapp-bot`
- **Tipo:** Build from GitHub
- **Repositorio:** Tu repo
- **Branch:** `main`
- **Dockerfile:** `Dockerfile`
- **Puerto:** `4000`

**Variables de Entorno:**
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# IA
GROQ_API_KEY=tu_groq_key
OLLAMA_BASE_URL=http://ollama-ai:11434
OLLAMA_MODEL=gemma2:2b
AI_FALLBACK_ENABLED=true

# WhatsApp
# ... tus otras variables
```

**Volúmenes:**
```
/app/auth_sessions → whatsapp-sessions (persistente)
/app/data → app-data (persistente)
```

**Depends On:**
- `ollama-ai`
- `training-system`

### Opción B: Docker Compose (Todo en Uno)

**Configuración:**
- **Nombre:** `whatsapp-bot-complete`
- **Tipo:** Docker Compose
- **Archivo:** `docker-compose.training.yml`

**Variables de Entorno:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
GROQ_API_KEY=tu_groq_key
```

**Puertos:**
- `4000:4000` (App)
- `11434:11434` (Ollama)

## 🔧 Post-Deploy

### 1. Verificar Ollama

```bash
# Conectar al contenedor
docker exec -it ollama-ai bash

# Verificar modelos
ollama list

# Si no hay modelos, descargar
ollama pull gemma2:2b
ollama pull qwen3:4b

exit
```

### 2. Verificar Entrenamiento

```bash
# Ver logs del sistema de entrenamiento
docker logs -f training-system

# Deberías ver:
# 🎓 INICIANDO SISTEMA DE ENTRENAMIENTO 24/7
# ✅ Ollama conectado
# 📝 Generando conversaciones...
# ✓✓✓✓✓ saludo
# ✓✓✓✓✓ busqueda_producto
# ...
```

### 3. Ver Estadísticas

```bash
# Ejecutar script de stats
docker exec -it training-system npm run train:stats

# O desde tu máquina local (si tienes acceso a la BD)
npm run train:stats
```

### 4. Verificar Fallback

```bash
# Probar que el fallback funciona
# 1. Envía mensaje por WhatsApp
# 2. Revisa logs de la app
docker logs -f whatsapp-bot

# Deberías ver:
# [AI] Generando respuesta para: "Hola"
# [AI] Error generando respuesta: (si Groq falla)
# ✅ Usando respuesta entrenada local (sin IA externa)
```

## 📊 Monitoreo en Producción

### Dashboard de Easypanel

**Métricas a monitorear:**
- CPU de Ollama (debería estar ~50-80% cuando entrena)
- RAM de Ollama (debería usar ~2-3GB)
- Logs del training-system (ver progreso)
- Logs de la app (ver uso de fallback)

### Comandos Útiles

```bash
# Ver cuántas respuestas entrenadas hay
docker exec -it training-system npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.conversationKnowledge.count().then(console.log);
"

# Ver últimas respuestas generadas
docker exec -it training-system npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.conversationKnowledge.findMany({
  orderBy: { createdAt: 'desc' },
  take: 5
}).then(r => console.log(JSON.stringify(r, null, 2)));
"

# Limpiar respuestas de baja calidad
docker exec -it training-system npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.conversationKnowledge.deleteMany({
  where: {
    AND: [
      { confidence: { lt: 0.5 } },
      { usageCount: { lt: 2 } }
    ]
  }
}).then(r => console.log('Eliminadas:', r.count));
"
```

## 🔄 Actualización del Sistema

### Actualizar Código

```bash
# En tu máquina local
git pull
git add .
git commit -m "Mejoras en entrenamiento"
git push

# En Easypanel
# 1. Ir al servicio
# 2. Click en "Rebuild"
# 3. Esperar deploy
```

### Actualizar Modelos de Ollama

```bash
# Conectar al contenedor
docker exec -it ollama-ai bash

# Actualizar modelo
ollama pull gemma2:2b

# O cambiar a modelo más grande
ollama pull gemma3:4b

exit

# Actualizar variable de entorno en Easypanel
OLLAMA_MODEL=gemma3:4b

# Reiniciar servicios
```

## 🐛 Troubleshooting

### Ollama no responde

```bash
# Verificar que está corriendo
docker ps | grep ollama

# Ver logs
docker logs ollama-ai

# Reiniciar
docker restart ollama-ai

# Verificar health
docker exec -it ollama-ai curl http://localhost:11434/api/tags
```

### Entrenamiento no genera respuestas

```bash
# Ver logs detallados
docker logs -f training-system

# Verificar conexión a Ollama
docker exec -it training-system curl http://ollama-ai:11434/api/tags

# Verificar conexión a base de datos
docker exec -it training-system npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.\$connect().then(() => console.log('DB OK')).catch(console.error);
"

# Reiniciar entrenamiento
docker restart training-system
```

### Respuestas de baja calidad

```bash
# Ajustar temperatura (más bajo = más consistente)
# En Easypanel, agregar variable:
OLLAMA_TEMPERATURE=0.6

# O cambiar a modelo más grande
OLLAMA_MODEL=gemma3:4b

# Reiniciar servicios
```

### Base de datos crece mucho

```bash
# Ver tamaño actual
docker exec -it training-system npm run train:stats

# Limpiar respuestas de baja calidad
docker exec -it training-system npx tsx scripts/limpiar-conocimiento-bajo.ts

# O configurar limpieza automática
# Agregar variable en Easypanel:
AUTO_CLEANUP_ENABLED=true
AUTO_CLEANUP_INTERVAL=86400000  # 24 horas en ms
```

## 📈 Optimización

### Acelerar Entrenamiento

```bash
# Usar modelo más rápido
OLLAMA_MODEL=gemma2:2b  # Más rápido

# Aumentar recursos de Ollama
# En Easypanel:
CPU: 4 cores
RAM: 8GB
```

### Mejorar Calidad

```bash
# Usar modelo más grande
OLLAMA_MODEL=gemma3:4b  # Más preciso

# Ajustar temperatura
OLLAMA_TEMPERATURE=0.7  # Balance
```

### Reducir Costos

```bash
# Pausar entrenamiento cuando no sea necesario
docker stop training-system

# Reanudar cuando quieras
docker start training-system

# O configurar horarios (cron en Easypanel)
# Entrenar solo de noche: 00:00 - 06:00
```

## ✅ Checklist de Deploy

- [ ] Código subido a Git
- [ ] Servicio Ollama creado en Easypanel
- [ ] Modelos descargados en Ollama
- [ ] Servicio de entrenamiento creado
- [ ] Variables de entorno configuradas
- [ ] Volúmenes persistentes configurados
- [ ] Servicios iniciados correctamente
- [ ] Logs verificados (sin errores)
- [ ] Estadísticas verificadas (respuestas generándose)
- [ ] Fallback probado en la app
- [ ] Monitoreo configurado

## 🎉 Sistema Listo

Después de completar estos pasos:

✅ **Sistema de entrenamiento** corriendo 24/7
✅ **Base de conocimiento** creciendo automáticamente
✅ **Fallback instantáneo** cuando Groq falla
✅ **Sin costos** de IA externa
✅ **Escalable** y **mantenible**

---

**¿Problemas?** Revisa los logs o contacta soporte de Easypanel.
