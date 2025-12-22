# ⚡ EJECUTAR ESTO AHORA

## 🚀 REINICIAR BOT

### OPCIÓN 1: Script Automático (RECOMENDADO)

Haz doble clic en este archivo:
```
REINICIAR-BOT-AHORA.bat
```

El script hará:
1. ✅ Detener procesos en puertos 3000 y 4000
2. ✅ Limpiar cache
3. ✅ Iniciar servidor nuevo

### OPCIÓN 2: Manual

```bash
# 1. Detener servidor (Ctrl+C en la terminal)

# 2. Matar procesos
netstat -ano | findstr :3000
taskkill /F /PID [número]

netstat -ano | findstr :4000
taskkill /F /PID [número]

# 3. Iniciar de nuevo
npm run dev
```

## ✅ ESPERAR A VER

```
✓ Ready in X.Xs
[Server] 🚀 Servidor corriendo en puerto 3000
[Baileys] ✅ Servicio inicializado
```

## 🧪 PROBAR EN WHATSAPP

```
1️⃣ "Tienes mega pack de idiomas"
   → Debe encontrar: Mega Pack 08: Cursos Idiomas ✅

2️⃣ "Me interesa"
   → Debe continuar con el mismo producto ✅

3️⃣ "Cuanto cuesta"
   → Debe dar precio: 20.000 COP ✅
```

## 🔍 VERIFICAR EN LOGS

Debes ver:
```
[RAG] 🏷️  Categoría detectada: idiomas
[RAG]    ✅ Mega Pack 08: Cursos Idiomas: +100
[RAG] ✅ Producto encontrado
[PERFECT BOT] 💾 Producto guardado en memoria
```

---

**HAZ DOBLE CLIC EN:** `REINICIAR-BOT-AHORA.bat` 🚀
