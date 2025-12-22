# ⚡ INICIO RÁPIDO: Deploy en 3 Pasos

## 🎯 OBJETIVO
Subir las mejoras a Easypanel en 10 minutos

---

## 📋 PASO 1: EJECUTAR SCRIPT (2 minutos)

```bash
PREPARAR_DEPLOY_EASYPANEL_AHORA.bat
```

Este script hace TODO automáticamente:
- ✅ Verifica cambios
- ✅ Agrega archivos a Git
- ✅ Hace commit
- ✅ Push a GitHub

---

## 🚀 PASO 2: EASYPANEL (8 minutos)

### A. Pull Changes (1 minuto)
1. Ir a **Easypanel** → Tu proyecto
2. Click en **Git**
3. Click en **Pull latest changes**
4. Esperar confirmación

### B. Rebuild (5-7 minutos)
1. Click en **Rebuild**
2. Esperar a que termine
3. Ver logs: `✅ Server started on port 3000`

---

## ✅ PASO 3: VERIFICAR (3 minutos)

### En WhatsApp:
```
Tú: "Me interesa el curso de idiomas"

Bot: "💡 No encontré un curso individual de idiomas
      Pero tengo este megapack que lo incluye:
      
      1️⃣ 📦 Megapack de Cursos
         💰 20.000 COP
         📝 Más de 30 cursos incluidos
      
      ¿Te interesa?"

[Foto del megapack]
```

### Verificar:
- ✅ Muestra **SOLO 1 producto**
- ✅ Envía **foto automáticamente**
- ✅ Formato **profesional sin asteriscos**
- ✅ Precio en **COP visible**

---

## 🎉 LISTO

Si todo funciona:
- ✅ Deploy exitoso
- ✅ Sistema mejorado en producción
- ✅ Cliente recibe mejor experiencia

---

## ⚠️ SI ALGO FALLA

### Build falla:
```bash
# En Easypanel consola:
npm install
npx prisma generate
npm run build
```

### No envía fotos:
- Verificar `NEXT_PUBLIC_BASE_URL` en variables
- Verificar volumen `/app/public/fotos` existe

### Ollama no responde:
- Verificar `OLLAMA_BASE_URL=http://ollama:11434`
- Verificar servicio Ollama corriendo

---

## 📚 MÁS INFORMACIÓN

- **Guía completa:** `DEPLOY_EASYPANEL_14_DIC_2025.md`
- **Checklist detallado:** `CHECKLIST_DEPLOY_EASYPANEL_14_DIC.md`
- **Variables:** `VARIABLES_EASYPANEL_14_DIC_2025.env`
- **Resumen ejecutivo:** `RESUMEN_EJECUTIVO_DEPLOY_14_DIC.md`

---

**Tiempo total:** 10-15 minutos  
**Dificultad:** Fácil  
**Resultado:** Sistema mejorado en producción

🚀 **¡Empecemos!**
