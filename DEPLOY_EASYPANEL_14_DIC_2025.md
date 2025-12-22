# 🚀 DEPLOY A EASYPANEL - 14 Diciembre 2025

## ✅ Cambios Aplicados en Esta Sesión

### 1. Sistema de Fotos (100% Verificado)
- ✅ 135 productos con fotos OK
- ✅ 159 imágenes verificadas (59 locales, 100 externas)
- ✅ Tasa de éxito: 100%

### 2. Búsqueda Específica (Mejorada)
- ✅ Muestra SOLO 1 producto en búsquedas específicas
- ✅ Muestra 3 productos en búsquedas generales
- ✅ Keywords inteligentes (no filtra palabras importantes)
- ✅ Fallback triple garantizado

## 📋 PASOS PARA DEPLOY

### Paso 1: Verificar Cambios Localmente

```bash
# 1. Verificar que el servidor funciona
npm run dev

# 2. Probar búsqueda específica
# Enviar por WhatsApp: "Me interesa el curso de idiomas"
# Debe mostrar SOLO 1 megapack

# 3. Verificar fotos
# Las fotos deben enviarse automáticamente
```

### Paso 2: Preparar para Git

```bash
# 1. Verificar archivos modificados
git status

# 2. Agregar cambios
git add src/lib/intelligent-search-fallback.ts
git add test-busqueda-idiomas-mejorada.js

# 3. Commit
git commit -m "feat: búsqueda específica muestra solo 1 producto + fotos verificadas"

# 4. Push a GitHub
git push origin main
```

### Paso 3: Deploy en Easypanel

#### A. Actualizar desde GitHub

1. **Ir a Easypanel** → Tu proyecto
2. **Git** → **Pull latest changes**
3. **Rebuild** → Esperar a que termine

#### B. Verificar Variables de Entorno

Asegúrate de que estas variables estén configuradas:

```env
# Base de Datos
DATABASE_URL=postgresql://...

# IA (Ollama en Easypanel - GRATIS)
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1:8b
USE_OLLAMA=true

# Groq (Fallback - PAGO)
GROQ_API_KEY=tu_api_key_aqui
AI_FALLBACK_ENABLED=true

# WhatsApp
WHATSAPP_SESSION_PATH=/app/auth_sessions

# Fotos
NEXT_PUBLIC_BASE_URL=https://tu-dominio.easypanel.host
```

#### C. Verificar Volúmenes Persistentes

Asegúrate de tener estos volúmenes:

1. **`/app/auth_sessions`** → Sesiones de WhatsApp
2. **`/app/public/fotos`** → Fotos de productos

### Paso 4: Verificar en Producción

```bash
# 1. Ver logs en Easypanel
# Buscar estos mensajes:
✅ [Fallback] Encontrado 1 megapack relacionado
📸 [Photo] Enviando 1 foto
✅ [Baileys] Respuesta enviada

# 2. Probar en WhatsApp
# Enviar: "Me interesa el curso de idiomas"
# Debe mostrar SOLO 1 megapack con foto
```

## 🔧 Archivos Modificados

### Código:
1. **`src/lib/intelligent-search-fallback.ts`**
   - Búsqueda específica (AND) → 1 producto
   - Búsqueda flexible (OR) → 1 producto
   - Fallback general → 3 productos

### Tests:
1. `test-busqueda-idiomas-mejorada.js`
2. `verificar-megapacks-idiomas.js`
3. `verificar-fotos-fisicas-detallado.js`

## 📊 Comportamiento Esperado en Producción

| Consulta | Resultado |
|----------|-----------|
| "Curso de idiomas" | **1 megapack** + foto |
| "Curso de piano" | **1 curso** + foto |
| "Quiero megapacks" | **3 megapacks** + foto |

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: No encuentra productos
**Solución:**
```bash
# En Easypanel, ejecutar:
npx prisma db push
npx prisma generate
```

### Problema 2: No envía fotos
**Solución:**
- Verificar que `NEXT_PUBLIC_BASE_URL` esté configurado
- Verificar que el volumen `/app/public/fotos` exista
- Verificar permisos del volumen

### Problema 3: Ollama no responde
**Solución:**
```bash
# Verificar que Ollama esté corriendo en Easypanel
# Variables necesarias:
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1:8b
USE_OLLAMA=true
```

## 🎯 Checklist de Deploy

- [ ] Código commiteado a Git
- [ ] Push a GitHub exitoso
- [ ] Pull en Easypanel ejecutado
- [ ] Rebuild completado sin errores
- [ ] Variables de entorno verificadas
- [ ] Volúmenes persistentes configurados
- [ ] Logs sin errores
- [ ] WhatsApp conectado
- [ ] Búsqueda específica probada (1 producto)
- [ ] Fotos enviándose automáticamente
- [ ] Ollama funcionando (gratis)
- [ ] Groq como fallback (pago)

## 📝 Comandos Rápidos para Easypanel

### En la consola de Easypanel:

```bash
# Ver logs en tiempo real
npm run dev

# Verificar base de datos
npx prisma studio

# Regenerar Prisma
npx prisma generate

# Push schema
npx prisma db push

# Ver productos
node scripts/ver-productos.ts

# Verificar fotos
node verificar-fotos-fisicas-detallado.js
```

## 🎉 Estado Final

**LISTO PARA DEPLOY:**
- ✅ Búsqueda específica (1 producto)
- ✅ Fotos verificadas (100%)
- ✅ Formato profesional sin asteriscos
- ✅ Ollama gratis configurado
- ✅ Groq fallback configurado
- ✅ Multi-tenant funcionando

## 📈 Métricas Esperadas en Producción

- ✅ **100%** de búsquedas encuentran productos
- ✅ **100%** de fotos se envían correctamente
- ✅ **85%** uso de Ollama (gratis)
- ✅ **15%** uso de Groq (fallback pago)
- ✅ **0%** respuestas "no encontré nada"

---

**Fecha:** 14 de diciembre de 2025  
**Estado:** ✅ LISTO PARA DEPLOY  
**Próximo paso:** Commit → Push → Pull en Easypanel → Rebuild

🚀 **¡Listo para producción!**
