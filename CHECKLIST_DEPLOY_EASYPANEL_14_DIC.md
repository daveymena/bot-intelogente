# ✅ CHECKLIST DEPLOY EASYPANEL - 14 DIC 2025

## 📋 PRE-DEPLOY (Local)

### Verificación de Código
- [ ] Servidor funciona localmente (`npm run dev`)
- [ ] Búsqueda específica probada (muestra 1 producto)
- [ ] Búsqueda general probada (muestra 3 productos)
- [ ] Fotos se envían automáticamente
- [ ] Formato profesional sin asteriscos
- [ ] No hay errores en consola

### Tests Ejecutados
- [ ] `node verificar-fotos-fisicas-detallado.js` → 100% OK
- [ ] `node verificar-megapacks-idiomas.js` → Productos encontrados
- [ ] `node test-busqueda-idiomas-mejorada.js` → Sistema funcionando

### Git
- [ ] Archivos modificados agregados (`git add`)
- [ ] Commit realizado con mensaje descriptivo
- [ ] Push a GitHub exitoso (`git push origin main`)

---

## 🚀 DEPLOY EN EASYPANEL

### Paso 1: Actualizar Código
- [ ] Ir a Easypanel → Tu proyecto
- [ ] **Git** → **Pull latest changes**
- [ ] Verificar que el pull fue exitoso

### Paso 2: Variables de Entorno
- [ ] **Settings** → **Environment**
- [ ] Verificar `DATABASE_URL` (PostgreSQL)
- [ ] Verificar `OLLAMA_BASE_URL=http://ollama:11434`
- [ ] Verificar `OLLAMA_MODEL=llama3.1:8b`
- [ ] Verificar `USE_OLLAMA=true`
- [ ] Verificar `GROQ_API_KEY` (fallback)
- [ ] Verificar `NEXT_PUBLIC_BASE_URL` (tu dominio)
- [ ] Verificar `WHATSAPP_SESSION_PATH=/app/auth_sessions`

### Paso 3: Volúmenes Persistentes
- [ ] Volumen `/app/auth_sessions` existe
- [ ] Volumen `/app/public/fotos` existe
- [ ] Permisos correctos en volúmenes

### Paso 4: Rebuild
- [ ] Click en **Rebuild**
- [ ] Esperar a que termine (5-10 minutos)
- [ ] Verificar que no hay errores en build

### Paso 5: Verificar Logs
- [ ] **Logs** → Ver logs en tiempo real
- [ ] Buscar: `✅ Server started on port 3000`
- [ ] Buscar: `✅ Database connected`
- [ ] Buscar: `✅ Ollama available`
- [ ] No hay errores críticos

---

## 🧪 POST-DEPLOY (Producción)

### Verificación Básica
- [ ] Aplicación carga correctamente
- [ ] Dashboard accesible
- [ ] Login funciona
- [ ] Base de datos conectada

### WhatsApp
- [ ] WhatsApp conectado (QR escaneado)
- [ ] Bot responde a mensajes
- [ ] Sesión persistente (no pide QR cada vez)

### Búsqueda Específica (NUEVO)
- [ ] Enviar: "Me interesa el curso de idiomas"
  - [ ] Muestra **SOLO 1 megapack**
  - [ ] Envía foto automáticamente
  - [ ] Formato profesional sin asteriscos
  - [ ] Precio en COP visible

- [ ] Enviar: "Curso de piano"
  - [ ] Muestra **SOLO 1 curso**
  - [ ] Envía foto automáticamente
  - [ ] Información completa

- [ ] Enviar: "Quiero ver megapacks"
  - [ ] Muestra **3 megapacks**
  - [ ] Envía foto del primero
  - [ ] Lista numerada

### Sistema de Fotos
- [ ] Fotos locales se envían correctamente
- [ ] Fotos externas se envían correctamente
- [ ] URLs correctas (con dominio completo)
- [ ] No hay fotos rotas

### IA (Ollama + Groq)
- [ ] Ollama responde (gratis)
- [ ] Groq como fallback (si Ollama falla)
- [ ] Respuestas coherentes
- [ ] Tiempo de respuesta < 5 segundos

### Logs en Producción
- [ ] Ver logs: `✅ [Fallback] Encontrado 1 megapack relacionado`
- [ ] Ver logs: `📸 [Photo] Enviando 1 foto`
- [ ] Ver logs: `✅ [Baileys] Respuesta enviada`
- [ ] No hay errores repetitivos

---

## 🎯 VERIFICACIÓN FINAL

### Funcionalidades Críticas
- [ ] ✅ Búsqueda específica (1 producto)
- [ ] ✅ Búsqueda general (3 productos)
- [ ] ✅ Fotos automáticas (100%)
- [ ] ✅ Formato profesional
- [ ] ✅ Ollama funcionando (gratis)
- [ ] ✅ Groq fallback (pago)
- [ ] ✅ WhatsApp persistente
- [ ] ✅ Multi-tenant funcionando

### Métricas Esperadas
- [ ] 100% de búsquedas encuentran productos
- [ ] 100% de fotos se envían
- [ ] 85% uso de Ollama (gratis)
- [ ] 15% uso de Groq (fallback)
- [ ] 0% respuestas "no encontré nada"

### Pruebas de Usuario
- [ ] Cliente pregunta por producto específico → Ve 1 opción
- [ ] Cliente pregunta por categoría → Ve 3 opciones
- [ ] Cliente recibe foto automáticamente
- [ ] Cliente puede pagar fácilmente
- [ ] Conversación fluida y natural

---

## ⚠️ PROBLEMAS COMUNES

### Problema 1: Build falla
**Solución:**
```bash
# En Easypanel consola:
npm install
npx prisma generate
npm run build
```

### Problema 2: No encuentra productos
**Solución:**
```bash
# Verificar base de datos:
npx prisma db push
npx prisma studio
```

### Problema 3: Ollama no responde
**Solución:**
- Verificar que servicio Ollama esté corriendo
- Verificar `OLLAMA_BASE_URL=http://ollama:11434`
- Verificar modelo descargado: `llama3.1:8b`

### Problema 4: No envía fotos
**Solución:**
- Verificar `NEXT_PUBLIC_BASE_URL` configurado
- Verificar volumen `/app/public/fotos` existe
- Verificar permisos del volumen

### Problema 5: WhatsApp se desconecta
**Solución:**
- Verificar volumen `/app/auth_sessions` persistente
- Verificar permisos de escritura
- Limpiar sesión y reconectar

---

## 📊 MÉTRICAS DE ÉXITO

### Antes del Deploy:
- ❌ Búsqueda muestra 3-5 productos (confuso)
- ❌ Fotos no verificadas
- ❌ Keywords filtradas incorrectamente

### Después del Deploy:
- ✅ Búsqueda específica muestra 1 producto
- ✅ Fotos 100% verificadas
- ✅ Keywords inteligentes
- ✅ Cliente recibe respuesta directa
- ✅ Mayor conversión esperada

---

## 🎉 DEPLOY EXITOSO

Si todos los checkboxes están marcados:

✅ **DEPLOY COMPLETADO CON ÉXITO**

El sistema está:
- ✅ Funcionando en producción
- ✅ Búsqueda específica activa
- ✅ Fotos enviándose automáticamente
- ✅ Ollama gratis funcionando
- ✅ Groq fallback configurado
- ✅ WhatsApp conectado y persistente

**¡Listo para recibir clientes!** 🚀

---

**Fecha:** 14 de diciembre de 2025  
**Versión:** 2.0 (Búsqueda Específica + Fotos Verificadas)  
**Estado:** ✅ LISTO PARA PRODUCCIÓN
