# 🔧 Solución: Archivo Grande en Git

## ❌ Problema

```
File trading-bot/node_modules/@tensorflow/tfjs-node/deps/lib/tensorflow.dll is 196.96 MB
This exceeds GitHub's file size limit of 100.00 MB
```

## ✅ Solución Rápida (Recomendada)

### Opción 1: Eliminar Carpeta y Rehacer Commit

```bash
# 1. Eliminar la carpeta trading-bot
rmdir /s /q trading-bot

# 2. Agregar cambios
git add .

# 3. Commit
git commit -m "Sistema Hibrido Bot Local + Ollama (sin trading-bot)"

# 4. Push
git push origin main
```

### Opción 2: Usar Script Automatizado

```bash
limpiar-historial-git.bat
```

**ADVERTENCIA**: Esto reescribe el historial de Git.

## 🎯 Solución Definitiva

Si quieres mantener trading-bot localmente pero no subirlo:

1. **NO elimines la carpeta** trading-bot
2. **Asegúrate** que esté en `.gitignore`:
   ```
   trading-bot/
   ```
3. **Limpia el historial**:
   ```bash
   git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch trading-bot" --prune-empty --tag-name-filter cat -- --all
   ```
4. **Limpia referencias**:
   ```bash
   git for-each-ref --format="delete %%(refname)" refs/original | git update-ref --stdin
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```
5. **Push forzado**:
   ```bash
   git push origin main --force
   ```

## 💡 Alternativa: Subir Solo lo Necesario

Si no necesitas trading-bot en producción:

1. **Elimina la carpeta**:
   ```bash
   rmdir /s /q trading-bot
   ```

2. **Ejecuta el script de subida**:
   ```bash
   preparar-y-subir-git.bat
   ```

## ⚠️ Importante

- `trading-bot/` ya está en `.gitignore`
- El problema es que ya fue agregado antes
- Necesitas limpiar el historial O eliminar la carpeta

## 🚀 Recomendación

**La más simple**: Elimina la carpeta `trading-bot` si no la necesitas:

```bash
rmdir /s /q trading-bot
git add .
git commit -m "Sistema Hibrido sin trading-bot"
git push origin main
```

Esto funcionará inmediatamente sin problemas.

---

**Solución recomendada**: Eliminar carpeta trading-bot  
**Tiempo**: 1 minuto  
**Riesgo**: Ninguno (si no necesitas trading-bot)
