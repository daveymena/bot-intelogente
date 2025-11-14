# 🔒 Seguridad - API Keys

## ⚠️ IMPORTANTE: Nunca Subir API Keys a Git

### ❌ NO Hacer:

```env
# ❌ NO subir API keys reales
GROQ_API_KEY=gsk_EJEMPLO_NO_USAR_ESTA_KEY
OPENROUTER_API_KEY=sk-or-v1-EJEMPLO_NO_USAR_ESTA_KEY
```

### ✅ Hacer:

```env
# ✅ Usar placeholders en documentación
GROQ_API_KEY=gsk_TU_API_KEY_AQUI
OPENROUTER_API_KEY=sk-or-v1-TU_API_KEY_AQUI
```

## 📁 Archivos Protegidos

Estos archivos NUNCA deben subirse a Git:

- `.env` ✅ (ya en .gitignore)
- `.env.local` ✅ (ya en .gitignore)
- `.env.production` ✅ (ya en .gitignore)
- `.env.easypanel.optimizado` ⚠️ (contiene API keys)

## 🔧 Qué Hacer si Subes una API Key

### 1. Revocar la API Key Inmediatamente

**Groq:**
- Ve a: https://console.groq.com/keys
- Elimina la key comprometida
- Genera una nueva

**OpenRouter:**
- Ve a: https://openrouter.ai/keys
- Elimina la key comprometida
- Genera una nueva

### 2. Actualizar Variables de Entorno

```bash
# Actualizar .env local
nano .env

# Actualizar en Easypanel
# Ve a tu proyecto → Environment Variables
# Actualiza GROQ_API_KEY con la nueva
```

### 3. Limpiar Historial de Git (Opcional)

Si la key está en commits antiguos:

```bash
# Usar BFG Repo-Cleaner
# https://rtyley.github.io/bfg-repo-cleaner/

# O usar git filter-branch (más complejo)
```

## 🛡️ Mejores Prácticas

### 1. Usar Variables de Entorno

```typescript
// ✅ Correcto
const apiKey = process.env.GROQ_API_KEY

// ❌ Incorrecto
const apiKey = "gsk_EJEMPLO_NO_USAR_ESTA_KEY"
```

### 2. Verificar Antes de Commit

```bash
# Ver qué archivos vas a subir
git diff --cached

# Buscar API keys
git diff --cached | grep -i "api_key"
git diff --cached | grep "gsk_"
git diff --cached | grep "sk-or-v1"
```

### 3. Usar .gitignore

```gitignore
# API Keys y Secrets
.env
.env.local
.env.production
.env.*.local
*.key
*.pem
secrets/
```

### 4. Usar Placeholders en Documentación

```markdown
# ✅ Correcto
GROQ_API_KEY=gsk_TU_API_KEY_AQUI

# ❌ Incorrecto
GROQ_API_KEY=gsk_EJEMPLO_NO_USAR_ESTA_KEY
```

## 🔍 Detectar API Keys en Commits

### Buscar en Historial:

```bash
# Buscar "gsk_" en todo el historial
git log -p -S "gsk_"

# Buscar "sk-or-v1" en todo el historial
git log -p -S "sk-or-v1"
```

### Herramientas Automáticas:

1. **GitHub Secret Scanning** (Automático)
   - GitHub detecta automáticamente API keys
   - Bloquea el push si encuentra secrets

2. **git-secrets** (Local)
```bash
# Instalar
brew install git-secrets  # macOS
# o descargar de: https://github.com/awslabs/git-secrets

# Configurar
git secrets --install
git secrets --register-aws
```

3. **pre-commit hooks**
```bash
# .git/hooks/pre-commit
#!/bin/bash
if git diff --cached | grep -E "gsk_|sk-or-v1"; then
    echo "❌ Error: API key detectada!"
    exit 1
fi
```

## 📋 Checklist Antes de Push

- [ ] Verificar que no hay API keys en archivos nuevos
- [ ] Usar placeholders en documentación
- [ ] Revisar `git diff --cached`
- [ ] Verificar que `.env` no está en staging
- [ ] Confirmar que solo subes código, no secrets

## 🚨 Incidente Actual

**Fecha:** 2025-11-04
**Problema:** API key de Groq detectada en commits
**Solución:** 
1. ✅ Removidas API keys de archivos de documentación
2. ✅ Reescrito historial de Git
3. ✅ Push exitoso sin secrets
4. ⚠️ Considerar revocar y regenerar API key de Groq

## 📖 Recursos

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Git Secrets](https://github.com/awslabs/git-secrets)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Removing Sensitive Data from Git](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

**Recuerda:** Una API key comprometida puede costar dinero y seguridad. Siempre verifica antes de hacer push.
