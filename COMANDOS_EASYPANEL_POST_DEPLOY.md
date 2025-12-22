# 🔧 COMANDOS EASYPANEL POST-DEPLOY

## 📋 Comandos para Ejecutar en Easypanel Después del Deploy

---

## ✅ VERIFICACIÓN BÁSICA

### 1. Ver Estado del Servidor
```bash
npm run dev
```

**Esperado:**
```
✅ Server started on port 3000
✅ Database connected
✅ Ollama available at http://ollama:11434
```

---

### 2. Verificar Base de Datos
```bash
npx prisma studio
```

**Abre interfaz web para ver:**
- Productos
- Usuarios
- Conversaciones
- Configuración

---

### 3. Ver Productos en Consola
```bash
node scripts/ver-productos.ts
```

**Muestra:**
- Total de productos
- Productos por categoría
- Productos con fotos
- Productos sin fotos

---

## 🔍 VERIFICACIÓN DE FOTOS

### 1. Verificar Fotos Físicas
```bash
node verificar-fotos-fisicas-detallado.js
```

**Esperado:**
```
✅ Total productos: 135
✅ Productos con fotos OK: 135 (100%)
✅ Total imágenes: 159
✅ Tasa de éxito: 100%
```

---

### 2. Verificar URLs de Fotos
```bash
node verificar-envio-fotos-completo.js
```

**Esperado:**
```
✅ URLs locales: 59
✅ URLs externas: 100
✅ URLs inválidas: 0
```

---

## 🔍 VERIFICACIÓN DE BÚSQUEDA

### 1. Probar Búsqueda de Idiomas
```bash
node test-busqueda-idiomas-mejorada.js
```

**Esperado:**
```
🔍 Keywords: curso, idiomas
✅ Encontrados 5 megapacks
✅ Sistema funcionando correctamente
```

---

### 2. Verificar Megapacks
```bash
node verificar-megapacks-idiomas.js
```

**Esperado:**
```
✅ Total megapacks: 40
✅ Megapacks con "curso": 6
✅ Megapacks con "idiomas": 2
```

---

## 🤖 VERIFICACIÓN DE IA

### 1. Probar Ollama
```bash
curl http://ollama:11434/api/tags
```

**Esperado:**
```json
{
  "models": [
    {
      "name": "llama3.1:8b",
      "size": 4700000000
    }
  ]
}
```

---

### 2. Test de Ollama Completo
```bash
node test-ollama-completo.js
```

**Esperado:**
```
✅ Ollama conectado
✅ Modelo llama3.1:8b disponible
✅ Respuesta generada correctamente
```

---

## 📊 VERIFICACIÓN DE SISTEMA

### 1. Ver Logs en Tiempo Real
```bash
npm run dev
```

**Buscar en logs:**
```
✅ [Fallback] Encontrado 1 megapack relacionado
📸 [Photo] Enviando 1 foto
✅ [Baileys] Respuesta enviada
```

---

### 2. Verificar Configuración
```bash
node scripts/verificar-sistema-completo.ts
```

**Esperado:**
```
✅ Base de datos: OK
✅ Ollama: OK
✅ WhatsApp: OK
✅ Fotos: OK
✅ Sistema: 100% operacional
```

---

## 🔧 COMANDOS DE MANTENIMIENTO

### 1. Regenerar Prisma Client
```bash
npx prisma generate
```

**Usar cuando:**
- Cambios en schema.prisma
- Errores de tipos TypeScript

---

### 2. Push Schema a Base de Datos
```bash
npx prisma db push
```

**Usar cuando:**
- Cambios en schema.prisma
- Necesitas actualizar estructura de BD

---

### 3. Limpiar Caché de Next.js
```bash
rm -rf .next
npm run build
```

**Usar cuando:**
- Errores de build
- Cambios no se reflejan

---

### 4. Reinstalar Dependencias
```bash
rm -rf node_modules
npm install
```

**Usar cuando:**
- Errores de dependencias
- Después de cambios en package.json

---

## 🐛 COMANDOS DE DEBUG

### 1. Ver Logs de WhatsApp
```bash
tail -f logs/whatsapp.log
```

**Muestra:**
- Mensajes recibidos
- Mensajes enviados
- Errores de conexión

---

### 2. Ver Logs de IA
```bash
tail -f logs/ai.log
```

**Muestra:**
- Consultas a IA
- Respuestas generadas
- Errores de IA

---

### 3. Ver Logs de Base de Datos
```bash
tail -f logs/database.log
```

**Muestra:**
- Queries ejecutadas
- Errores de BD
- Conexiones

---

## 🔄 COMANDOS DE RESET

### 1. Limpiar Sesión de WhatsApp
```bash
rm -rf auth_sessions/*
```

**Usar cuando:**
- WhatsApp no conecta
- Necesitas reconectar
- Cambio de número

---

### 2. Reset Base de Datos (CUIDADO)
```bash
npx prisma db push --force-reset
```

**⚠️ ADVERTENCIA:**
- Borra TODOS los datos
- Solo usar en desarrollo
- NO usar en producción

---

### 3. Limpiar Todo y Empezar de Cero
```bash
rm -rf node_modules .next auth_sessions
npm install
npx prisma generate
npm run build
```

**Usar cuando:**
- Errores graves
- Necesitas empezar limpio

---

## 📊 COMANDOS DE MONITOREO

### 1. Ver Uso de Memoria
```bash
node -e "console.log(process.memoryUsage())"
```

---

### 2. Ver Procesos Activos
```bash
ps aux | grep node
```

---

### 3. Ver Espacio en Disco
```bash
df -h
```

---

## 🎯 COMANDOS ESPECÍFICOS DEL DEPLOY

### 1. Verificar Búsqueda Específica
```bash
node test-busqueda-idiomas-mejorada.js
```

**Debe mostrar:**
```
✅ Búsqueda específica: 1 producto
✅ Búsqueda general: 3 productos
✅ Fallback funcionando
```

---

### 2. Verificar Fotos 100%
```bash
node verificar-fotos-fisicas-detallado.js
```

**Debe mostrar:**
```
✅ 135 productos con fotos
✅ 159 imágenes verificadas
✅ 0 fotos rotas
✅ 100% tasa de éxito
```

---

### 3. Test Completo del Sistema
```bash
node test-sistema-completo-verificacion.js
```

**Debe mostrar:**
```
✅ Búsqueda: OK
✅ Fotos: OK
✅ IA: OK
✅ WhatsApp: OK
✅ Sistema: 100% operacional
```

---

## 🚨 COMANDOS DE EMERGENCIA

### Si el Servidor No Inicia:
```bash
# 1. Ver logs de error
npm run dev

# 2. Verificar puerto
lsof -i :3000

# 3. Matar proceso si está ocupado
kill -9 $(lsof -t -i:3000)

# 4. Reiniciar
npm run dev
```

---

### Si Ollama No Responde:
```bash
# 1. Verificar servicio
curl http://ollama:11434/api/tags

# 2. Reiniciar servicio Ollama
# (Desde panel de Easypanel)

# 3. Verificar modelo
curl http://ollama:11434/api/show -d '{"name":"llama3.1:8b"}'
```

---

### Si WhatsApp No Conecta:
```bash
# 1. Limpiar sesión
rm -rf auth_sessions/*

# 2. Reiniciar servidor
npm run dev

# 3. Escanear nuevo QR
# (Desde dashboard)
```

---

## 📋 CHECKLIST POST-DEPLOY

Ejecutar estos comandos en orden:

```bash
# 1. Verificar servidor
npm run dev

# 2. Verificar base de datos
npx prisma studio

# 3. Verificar fotos
node verificar-fotos-fisicas-detallado.js

# 4. Verificar búsqueda
node test-busqueda-idiomas-mejorada.js

# 5. Verificar Ollama
curl http://ollama:11434/api/tags

# 6. Test completo
node test-sistema-completo-verificacion.js
```

**Si todos pasan:** ✅ Deploy exitoso

---

## 🎉 COMANDOS DE CELEBRACIÓN

### Ver Estadísticas del Sistema
```bash
node scripts/ver-estadisticas.ts
```

**Muestra:**
- Total de productos
- Total de conversaciones
- Total de ventas
- Tasa de conversión

---

**Fecha:** 14 de diciembre de 2025  
**Versión:** 2.0 (Búsqueda Específica + Fotos Verificadas)  
**Estado:** ✅ LISTO PARA USAR

🚀 **¡Comandos listos para Easypanel!**
