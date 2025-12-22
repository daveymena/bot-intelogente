# ⚡ COMANDOS RÁPIDOS

## 🧪 PROBAR SISTEMA

### Test Completo
```bash
npx tsx scripts/test-sistema-completo-debug.ts
```

### Test de Pagos
```bash
npx tsx scripts/test-deteccion-inteligente.ts
```

### Test + Reiniciar (Todo en uno)
```bash
npx tsx scripts/test-sistema-completo-debug.ts && npm run dev
```

---

## 🚀 SERVIDOR

### Iniciar Desarrollo
```bash
npm run dev
```

### Iniciar Producción
```bash
npm run build
npm start
```

### Reiniciar Rápido
```bash
# Ctrl+C para detener
npm run dev
```

---

## 📊 VERIFICAR CONFIGURACIÓN

### Ver Variables de IA
```bash
Get-Content .env | Select-String -Pattern "GROQ_MODEL|AI_USE_REASONING"
```

### Ver Todas las Variables
```bash
Get-Content .env
```

### Verificar Modelo Actual
```bash
Get-Content .env | Select-String "GROQ_MODEL"
```

---

## 🗄️ BASE DE DATOS

### Actualizar Schema
```bash
npm run db:push
```

### Ver Productos
```bash
npx tsx scripts/ver-productos.ts
```

### Ver Usuarios
```bash
npx tsx scripts/ver-usuarios.ts
```

### Verificar Sistema Completo
```bash
npx tsx scripts/verificar-sistema-completo.ts
```

---

## 🧹 LIMPIEZA

### Limpiar WhatsApp
```bash
npx tsx scripts/limpiar-whatsapp.bat
```

### Limpiar Sesiones
```bash
npx tsx scripts/limpiar-sesiones.bat
```

### Limpiar Todo
```bash
npx tsx scripts/limpiar-todo-whatsapp.bat
```

---

## 📝 LOGS Y DIAGNÓSTICO

### Ver Logs del Servidor
```bash
# Los logs aparecen automáticamente en la consola
# Busca líneas con:
# 🧠 [MEMORIA]
# 💳 [PAGO]
# 🤖 [IA]
```

### Diagnosticar WhatsApp
```bash
npx tsx scripts/diagnosticar-whatsapp.bat
```

### Diagnosticar Sistema
```bash
npx tsx scripts/diagnosticar-sistema.bat
```

---

## 🔧 DESARROLLO

### Instalar Dependencias
```bash
npm install
```

### Limpiar node_modules
```bash
Remove-Item -Recurse -Force node_modules
npm install
```

### Verificar TypeScript
```bash
npx tsc --noEmit
```

---

## 📦 GIT

### Ver Estado
```bash
git status
```

### Hacer Commit
```bash
git add .
git commit -m "Mejoras finales: memoria + detección de pagos"
```

### Push a GitHub
```bash
git push origin main
```

### Ver Cambios
```bash
git diff
```

---

## 🧪 TESTS ESPECÍFICOS

### Test de IA
```bash
npx tsx scripts/test-ia-real.ts
```

### Test de Ollama
```bash
npx tsx scripts/test-ollama-real.ts
```

### Test de Groq
```bash
npx tsx scripts/test-groq-conversacional-completo.ts
```

### Test de Memoria
```bash
npx tsx scripts/test-sistema-completo-debug.ts
```

### Test de Formato Visual
```bash
npx tsx scripts/test-visual-format.ts
```

---

## 📱 WHATSAPP

### Conectar WhatsApp
```bash
# 1. Iniciar servidor
npm run dev

# 2. Abrir navegador
# http://localhost:4000

# 3. Ir a "Conexión WhatsApp"
# 4. Escanear QR
```

### Resetear WhatsApp
```bash
npx tsx scripts/resetear-whatsapp.bat
```

### Ver Estado de Conexión
```bash
# En el navegador: http://localhost:4000
# O revisar logs del servidor
```

---

## 🎯 FLUJO COMPLETO DE PRUEBA

### Opción 1: Rápida (5 minutos)
```bash
# 1. Test
npx tsx scripts/test-sistema-completo-debug.ts

# 2. Si OK, iniciar
npm run dev

# 3. Probar con WhatsApp
```

### Opción 2: Completa (30 minutos)
```bash
# 1. Test completo
npx tsx scripts/test-sistema-completo-debug.ts

# 2. Test de pagos
npx tsx scripts/test-deteccion-inteligente.ts

# 3. Verificar variables
Get-Content .env | Select-String -Pattern "GROQ_MODEL|AI_USE_REASONING"

# 4. Iniciar servidor
npm run dev

# 5. Conectar WhatsApp
# 6. Probar conversaciones
# 7. Verificar logs
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: Puerto en Uso
```bash
# Encontrar proceso en puerto 4000
netstat -ano | findstr :4000

# Matar proceso (reemplaza PID)
taskkill /PID [PID] /F
```

### Error: Base de Datos
```bash
# Actualizar schema
npm run db:push

# Si persiste, resetear
npm run db:reset
```

### Error: WhatsApp No Conecta
```bash
# Limpiar sesiones
npx tsx scripts/limpiar-whatsapp.bat

# Reiniciar servidor
npm run dev
```

### Error: Tests Fallan
```bash
# Verificar variables
Get-Content .env | Select-String -Pattern "GROQ_MODEL|AI_USE_REASONING"

# Verificar que sean:
# GROQ_MODEL=llama-3.3-70b-versatile
# AI_USE_REASONING=true
```

---

## 📚 DOCUMENTACIÓN

### Ver Documentación
```bash
# Leer archivos en orden:
# 1. LEER_ESTO_PRIMERO.md
# 2. EJECUTAR_AHORA_VERIFICACION.md
# 3. CHECKLIST_VERIFICACION_FINAL.md
# 4. RESUMEN_SESION_COMPLETA_FINAL_HOY.md
```

### Buscar en Documentación
```bash
# Buscar archivos con "RESUMEN"
Get-ChildItem -Filter "*RESUMEN*.md"

# Buscar archivos con "GUIA"
Get-ChildItem -Filter "*GUIA*.md"
```

---

## 🎯 COMANDO MÁS IMPORTANTE

```bash
# ESTE ES EL QUE DEBES EJECUTAR PRIMERO
npx tsx scripts/test-sistema-completo-debug.ts
```

Si este test pasa (✅), todo está bien.
Si falla (❌), comparte el output completo.

---

## 💡 TIPS

### Copiar Output de Test
```bash
# Guardar en archivo
npx tsx scripts/test-sistema-completo-debug.ts > test-output.txt

# Ver archivo
Get-Content test-output.txt
```

### Ver Últimas Líneas de Logs
```bash
# En PowerShell (mientras el servidor corre)
# Los logs aparecen en tiempo real
```

### Buscar en Logs
```bash
# Buscar "ERROR" en logs
# Ctrl+F en la consola
```

---

**¡Guarda este archivo para referencia rápida!** 📌

Todos los comandos que necesitas en un solo lugar.
