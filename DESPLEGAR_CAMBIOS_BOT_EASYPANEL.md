# 🚀 Desplegar Cambios del Bot en Easypanel

## Paso 1: Subir Cambios a GitHub

```bash
# Ejecutar el script automático
SUBIR_CAMBIOS_AHORA.bat

# O manualmente:
git add .
git commit -m "fix: mejorar respuestas bot con información completa"
git push origin main
```

## Paso 2: Actualizar en Easypanel

### Opción A: Rebuild Automático (Recomendado)

1. **Ir a Easypanel:**
   - Abre: https://easypanel.io
   - Ve a tu proyecto: `bot-whatsapp`
   - Selecciona el servicio: `bot-whatsapp-inteligente`

2. **Hacer Pull de los Cambios:**
   - Click en la pestaña **"Source"** o **"Git"**
   - Click en el botón **"Pull"** o **"Update"**
   - Esto descargará los últimos cambios de GitHub

3. **Rebuild del Contenedor:**
   - Click en la pestaña **"Build"**
   - Click en **"Rebuild"** o **"Deploy"**
   - Espera 2-5 minutos mientras se construye

4. **Verificar:**
   - Ve a la pestaña **"Logs"**
   - Verifica que no haya errores
   - El bot debería reiniciarse automáticamente

### Opción B: Desde la Consola de Easypanel

1. **Abrir Terminal:**
   - En Easypanel, ve a tu servicio
   - Click en **"Console"** o **"Terminal"**

2. **Ejecutar Comandos:**
   ```bash
   # Ir al directorio del código
   cd /app
   
   # Hacer pull de los cambios
   git pull origin main
   
   # Instalar dependencias (si hay nuevas)
   npm install
   
   # Regenerar Prisma Client
   npx prisma generate
   
   # Reiniciar el servicio
   pm2 restart all
   # O si usas otro gestor:
   # npm run start
   ```

### Opción C: Forzar Redeploy Completo

Si las opciones anteriores no funcionan:

1. **En Easypanel:**
   - Ve a tu servicio `bot-whatsapp-inteligente`
   - Click en **"Settings"** o **"Configuración"**
   - Scroll hasta abajo
   - Click en **"Redeploy"** o **"Force Rebuild"**
   - Confirma la acción

2. **Esto hará:**
   - Pull de los últimos cambios de GitHub
   - Rebuild completo del contenedor Docker
   - Reinstalación de todas las dependencias
   - Reinicio del servicio

## Paso 3: Verificar que Funciona

### Desde Easypanel

1. **Ver Logs en Tiempo Real:**
   ```
   Easypanel → Tu Servicio → Logs
   ```

2. **Buscar estos mensajes:**
   ```
   ✅ [AI] Producto encontrado: Curso Completo de Piano
   🧠 [AI] Producto guardado en memoria profesional
   ✅ Respuesta generada con información completa
   ```

### Probar el Bot

1. **Enviar mensaje de prueba por WhatsApp:**
   ```
   "Estoy interesado en el curso de piano"
   ```

2. **Respuesta esperada (COMPLETA):**
   ```
   🎹 Curso Completo de Piano
   
   Aprende piano desde cero hasta nivel avanzado 🎼
   
   ✅ +80 lecciones en video HD
   ✅ 157 recursos descargables
   ✅ Acceso de por vida
   ✅ Soporte personalizado
   
   💰 Precio: 60.000 COP
   
   ¿Te gustaría comprarlo? 😊
   ```

3. **Si solo responde:**
   ```
   ¡Perfecto! 😊 Encontré el *Curso Completo de Piano *
   ```
   
   **Entonces los cambios NO se aplicaron.** Vuelve al Paso 2.

## Comandos Rápidos para Easypanel Console

```bash
# Ver estado del servicio
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar servicio
pm2 restart all

# Ver últimos commits
git log --oneline -5

# Ver rama actual
git branch

# Forzar pull (si hay conflictos)
git fetch origin
git reset --hard origin/main

# Verificar que los cambios están
cat src/lib/ai-service.ts | grep "INFORMACIÓN COMPLETA LA PRIMERA VEZ"
```

## Troubleshooting

### Problema: "Los cambios no se aplican"

**Solución 1: Limpiar caché de Node**
```bash
cd /app
rm -rf node_modules/.cache
rm -rf .next
npm run build
pm2 restart all
```

**Solución 2: Verificar que el código está actualizado**
```bash
cd /app
git status
git log -1
# Debe mostrar tu último commit
```

**Solución 3: Rebuild completo**
```bash
# En Easypanel Console
cd /app
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart all
```

### Problema: "Error al hacer build"

**Ver logs completos:**
```
Easypanel → Build → Ver logs del último build
```

**Errores comunes:**
- Conflicto de rutas → Ya resuelto
- Error de TypeScript → Verificar con `npm run build` local
- Error de Prisma → Ejecutar `npx prisma generate`

## Variables de Entorno

Asegúrate que estas variables estén configuradas en Easypanel:

```env
# IA y Razonamiento
GROQ_API_KEY=tu_api_key
AI_USE_REASONING=true
AI_REASONING_DEPTH=deep
ENABLE_CONVERSATION_MEMORY=true

# Sistema de Entrenamiento
ENABLE_PERSONALITY_SERVICE=true
HOT_RELOAD_ENABLED=true
```

## Verificación Final

✅ **Checklist:**
- [ ] Código subido a GitHub
- [ ] Pull ejecutado en Easypanel
- [ ] Rebuild completado sin errores
- [ ] Servicio reiniciado
- [ ] Logs muestran mensajes correctos
- [ ] Bot responde con información completa
- [ ] No hay errores en consola

## Tiempo Estimado

- **Pull + Rebuild:** 3-5 minutos
- **Redeploy completo:** 5-10 minutos
- **Verificación:** 1-2 minutos

**Total:** ~10-15 minutos

---

**Fecha**: 19 Nov 2025  
**Estado**: Guía completa para deploy en Easypanel
