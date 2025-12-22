# 🔧 Solución: "Failed to fetch" en Dashboard

## 🎯 Problema

El dashboard muestra el error:
```
Console Error
[WhatsApp] Error checking status: "Failed to fetch"
```

## 🔍 Causas Comunes

1. **Servidor Next.js no está corriendo** ❌
2. **Rutas API no compiladas correctamente** ❌
3. **Errores de TypeScript bloqueando la compilación** ❌
4. **Puerto 3000 ocupado por otro proceso** ❌

## ✅ Soluciones (en orden)

### Solución 1: Verificar que el servidor esté corriendo

```bash
# Ejecuta este script para diagnosticar
DIAGNOSTICAR_DASHBOARD.bat
```

Si el servidor NO está corriendo, verás:
```
❌ Servidor NO está corriendo
```

**Solución:** Inicia el servidor
```bash
npm run dev
```

---

### Solución 2: Limpiar y reiniciar desde cero

Si hay errores de compilación o el servidor no inicia correctamente:

```bash
# Ejecuta este script para limpiar todo y reiniciar
INICIAR_TODO_LIMPIO.bat
```

Este script:
- ✅ Limpia sesiones anteriores
- ✅ Elimina archivos de compilación
- ✅ Reinstala dependencias
- ✅ Regenera Prisma Client
- ✅ Inicia el servidor automáticamente

---

### Solución 3: Arreglar errores de TypeScript

Si ves errores de compilación en la terminal:

```bash
# Ejecuta este script para arreglar TypeScript
ARREGLAR_ERRORES_TYPESCRIPT.bat
```

Luego:
```bash
npm run dev
```

---

### Solución 4: Puerto 3000 ocupado

Si ves el error:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Opción A:** Matar el proceso que usa el puerto 3000
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Opción B:** Usar otro puerto
```bash
# En .env
PORT=3001
```

Luego:
```bash
npm run dev
```

---

## 🧪 Verificación

Una vez que el servidor esté corriendo, verifica:

1. **Terminal muestra:**
   ```
   ✓ Ready in 2.5s
   ○ Local:   http://localhost:3000
   ```

2. **Navegador abre:** http://localhost:3000

3. **Dashboard carga sin errores**

4. **Consola del navegador (F12) no muestra "Failed to fetch"**

---

## 🚀 Inicio Rápido (Todo en Uno)

Si quieres empezar desde cero sin complicaciones:

```bash
# Ejecuta este único script
INICIAR_TODO_LIMPIO.bat
```

Espera a que:
1. Se limpie todo ✅
2. Se instalen dependencias ✅
3. Se configure la base de datos ✅
4. Se abra el navegador automáticamente ✅
5. El servidor inicie ✅

---

## 📋 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] El servidor Next.js está corriendo (`npm run dev`)
- [ ] No hay errores de compilación en la terminal
- [ ] El puerto 3000 está libre
- [ ] Las dependencias están instaladas (`npm install`)
- [ ] Prisma Client está generado (`npx prisma generate`)
- [ ] El navegador puede acceder a http://localhost:3000
- [ ] La consola del navegador (F12) no muestra errores de red

---

## 🆘 Si Nada Funciona

1. **Cierra TODAS las terminales**
2. **Reinicia VS Code**
3. **Ejecuta:**
   ```bash
   INICIAR_TODO_LIMPIO.bat
   ```
4. **Espera a que termine completamente**
5. **Abre http://localhost:3000 en el navegador**

---

## 💡 Tip Pro

Para evitar este problema en el futuro, siempre usa:

```bash
# Iniciar el servidor
npm run dev

# O usa el script todo-en-uno
INICIAR_TODO_LIMPIO.bat
```

**NO** cierres la terminal mientras el servidor esté corriendo.

---

## 📞 Soporte

Si después de seguir todos estos pasos el problema persiste:

1. Ejecuta: `DIAGNOSTICAR_DASHBOARD.bat`
2. Copia el output completo
3. Revisa los logs de la terminal donde corre `npm run dev`
4. Revisa la consola del navegador (F12 → Console)
5. Comparte toda esta información para ayuda adicional
