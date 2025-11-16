# ⚡ Comandos Rápidos - Sistema de Entrenamiento

## 🚀 Inicio Rápido

### Windows
```bash
# Menú interactivo
INICIAR_ENTRENAMIENTO.bat
```

### Linux/Mac
```bash
# Configurar Ollama
npm run train:setup

# Iniciar entrenamiento
npm run train:24-7

# Ver estadísticas
npm run train:stats
```

## 📊 Monitoreo

```bash
# Ver estadísticas completas
npm run train:stats

# Ver logs en tiempo real (Docker)
docker logs -f training-system

# Ver logs en tiempo real (Local)
# Los logs aparecen en la terminal donde ejecutaste train:24-7
```

## 🐳 Docker

```bash
# Iniciar todo el sistema
docker-compose -f docker-compose.training.yml up -d

# Ver logs
docker logs -f training-system
docker logs -f ollama-ai
docker logs -f whatsapp-bot

# Detener
docker-compose -f docker-compose.training.yml down

# Reiniciar
docker-compose -f docker-compose.training.yml restart
```

## 🔧 Ollama

```bash
# Verificar que está corriendo
curl http://localhost:11434/api/tags

# Listar modelos instalados
ollama list

# Descargar modelo
ollama pull gemma2:2b
ollama pull qwen3:4b
ollama pull gemma3:4b

# Eliminar modelo
ollama rm gemma2:2b

# Iniciar Ollama
ollama serve
```

## 📦 Base de Datos

```bash
# Ver total de respuestas entrenadas
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.conversationKnowledge.count().then(console.log);
"

# Ver últimas 5 respuestas
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.conversationKnowledge.findMany({
  orderBy: { createdAt: 'desc' },
  take: 5,
  select: { userQuery: true, context: true, confidence: true }
}).then(r => console.log(JSON.stringify(r, null, 2)));
"

# Limpiar respuestas de baja calidad
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.conversationKnowledge.deleteMany({
  where: {
    AND: [
      { confidence: { lt: 0.5 } },
      { usageCount: { lt: 2 } }
    ]
  }
}).then(r => console.log('Eliminadas:', r.count));
"
```

## 🧪 Testing

```bash
# Generar dataset de prueba (25 conversaciones)
npx tsx scripts/generar-dataset-ollama-solo.ts

# Generar dataset con productos reales (60 conversaciones)
npx tsx scripts/generar-dataset-productos-reales.ts

# Probar búsqueda de respuesta entrenada
npx tsx -e "
import { trainedResponseService } from './src/lib/trained-response-service';
trainedResponseService.findTrainedResponse('hola').then(console.log);
"
```

## 🔄 Git

```bash
# Ver cambios
git status

# Agregar todo
git add .

# Commit
git commit -m "Sistema de entrenamiento 24/7"

# Push
git push origin main

# Ver últimos commits
git log --oneline -5
```

## 🚀 Deploy Easypanel

```bash
# Conectar a contenedor Ollama
docker exec -it ollama-ai bash

# Descargar modelos en producción
ollama pull gemma2:2b
exit

# Ver logs de entrenamiento
docker logs -f training-system

# Ver estadísticas en producción
docker exec -it training-system npm run train:stats

# Reiniciar servicio
docker restart training-system
```

## 🐛 Troubleshooting

```bash
# Verificar Ollama
curl http://localhost:11434/api/tags

# Reiniciar Ollama
pkill ollama
ollama serve

# Verificar conexión a BD
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.\$connect().then(() => console.log('DB OK')).catch(console.error);
"

# Ver errores de Prisma
npx prisma studio

# Regenerar Prisma Client
npx prisma generate
```

## 📈 Optimización

```bash
# Cambiar a modelo más rápido
# En .env o Easypanel:
OLLAMA_MODEL=gemma2:2b

# Cambiar a modelo más preciso
OLLAMA_MODEL=gemma3:4b

# Ajustar temperatura (más bajo = más consistente)
OLLAMA_TEMPERATURE=0.6
```

## 🧹 Mantenimiento

```bash
# Limpiar respuestas de baja calidad
npm run train:cleanup

# Backup de base de datos
pg_dump $DATABASE_URL > backup.sql

# Restaurar backup
psql $DATABASE_URL < backup.sql

# Ver tamaño de base de datos
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
Promise.all([
  p.conversationKnowledge.count(),
  p.product.count(),
  p.conversation.count()
]).then(([k, pr, c]) => console.log({
  knowledge: k,
  products: pr,
  conversations: c
}));
"
```

## 📚 Documentación

```bash
# Ver guía completa
cat SISTEMA_ENTRENAMIENTO_24_7.md

# Ver resumen técnico
cat RESUMEN_SISTEMA_ENTRENAMIENTO.md

# Ver guía de deploy
cat DEPLOY_ENTRENAMIENTO_EASYPANEL.md

# Ver este archivo
cat COMANDOS_RAPIDOS.md
```

## ⚡ Atajos Útiles

```bash
# Alias para comandos frecuentes (agregar a .bashrc o .zshrc)
alias train="npm run train:24-7"
alias stats="npm run train:stats"
alias ollama-check="curl http://localhost:11434/api/tags"
alias train-logs="docker logs -f training-system"
```

---

**Guarda este archivo para referencia rápida! 📌**
