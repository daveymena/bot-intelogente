# 🚀 REINICIAR SERVIDOR AHORA

## ⚠️ PROBLEMA

El bot dice "No tengo ese producto" cuando **SÍ existe**.

**CAUSA:** El servidor NO se reinició. Está usando código viejo.

## ✅ SOLUCIÓN EN 3 PASOS

### PASO 1: CERRAR TODO

1. Ve a la terminal donde corre el servidor
2. Presiona **Ctrl+C**
3. **CIERRA LA TERMINAL COMPLETAMENTE** (X en la ventana)

### PASO 2: ABRIR TERMINAL NUEVA

1. Abre una terminal **NUEVA**
2. Ve a la carpeta del proyecto:
   ```bash
   cd C:\ruta\a\tu\proyecto
   ```

### PASO 3: INICIAR SERVIDOR

```bash
npm run dev
```

Espera a ver:
```
✓ Ready in X.Xs
[Server] 🚀 Servidor corriendo
```

## 🧪 PROBAR EN WHATSAPP

Envía estos mensajes:

```
1️⃣ "Tienes mega pack de idiomas"
   → Debe encontrar: Mega Pack 08: Cursos Idiomas ✅

2️⃣ "Me interesa"
   → Debe continuar con el mismo producto ✅

3️⃣ "Cuanto cuesta"
   → Debe dar precio: 20.000 COP ✅
```

## 🔍 VERIFICAR EN LOGS

Debes ver en la consola:

```
[RAG] 🏷️  Categoría detectada: idiomas
[RAG]    ✅ Mega Pack 08: Cursos Idiomas: +100
[RAG] ✅ Producto encontrado
[PERFECT BOT] 💾 Producto guardado en memoria
```

## ⚠️ SI NO FUNCIONA

Si después de reiniciar sigue sin funcionar:

```bash
# Matar procesos en puerto 3000 y 4000
netstat -ano | findstr :3000
taskkill /F /PID [número]

netstat -ano | findstr :4000
taskkill /F /PID [número]

# Iniciar de nuevo
npm run dev
```

## ✅ RESULTADO ESPERADO

```
Tú: Tienes mega pack de idiomas
Bot: ✅ Mega Pack 08: Cursos Idiomas
     💰 20.000 COP
     🌍 Más de 90 cursos de idiomas...

Tú: Me interesa
Bot: ✅ Mega Pack 08: Cursos Idiomas
     [detalles completos]
     ✅ MANTIENE CONTEXTO
```

---

**EL CÓDIGO ESTÁ CORRECTO** ✅

Solo necesitas **REINICIAR EL SERVIDOR** 🔄
