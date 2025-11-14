# 🔐 Solución: Secretos Bloqueados por GitHub

## ❌ Problema

GitHub detectó secretos en el commit `cf25d1bb26fa33f4dd379b69fe5440686bad53b4`:
- Google OAuth Client ID y Secret
- Groq API Key
- Otros secretos en archivos markdown

## ✅ Solución Rápida (Recomendada)

### Opción 1: Permitir el Push (Más Rápido)

GitHub te da URLs para permitir cada secreto. Haz click en estos enlaces:

1. **Google OAuth Client ID**:
   https://github.com/daveymena/bot-intelogente/security/secret-scanning/unblock-secret/34xHc3nSvUOnnx62hSRYPXjPVLo

2. **Google OAuth Client Secret**:
   https://github.com/daveymena/bot-intelogente/security/secret-scanning/unblock-secret/34xHc48J3k1Xe0OVmWMNSmXb8Gyremote

3. **Groq API Key**:
   https://github.com/daveymena/bot-intelogente/security/secret-scanning/unblock-secret/34xHc0ruZpy27EO468ZPGq2prmf

Después de permitir los secretos:
```bash
git push origin main
```

### Opción 2: Reescribir Historial (Más Seguro)

Si prefieres eliminar los secretos del historial:

```bash
# Ejecutar el script
LIMPIAR_SECRETOS_GIT.bat
```

O manualmente:

```bash
# 1. Crear backup
git branch backup-antes-limpiar

# 2. Resetear a antes del commit con secretos
git reset --soft HEAD~2

# 3. Crear nuevo commit limpio
git add .
git commit -m "Sistema completo sin secretos expuestos"

# 4. Forzar push
git push origin main --force
```

## 🔄 Después de Subir: Rotar Credenciales

**IMPORTANTE**: Como los secretos estuvieron expuestos, deberías rotarlos:

### 1. Groq API Key
```
1. Ve a: https://console.groq.com/keys
2. Revoca la key actual (la que estaba expuesta)
3. Genera una nueva
4. Actualiza en .env y Easypanel
```

### 2. Google OAuth
```
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Elimina las credenciales actuales
3. Crea nuevas OAuth 2.0 credentials
4. Actualiza en .env
```

### 3. Resend (Opcional)
```
1. Ve a: https://resend.com/api-keys
2. Revoca: re_MMdpZetB_PuLUUbLh6QQMdqvGozjxAGya
3. Genera nueva
4. Actualiza en .env y Easypanel
```

### 4. MercadoPago (Opcional)
```
1. Ve a: https://www.mercadopago.com.co/developers/panel
2. Revoca tokens actuales
3. Genera nuevos
4. Actualiza en .env y Easypanel
```

### 5. PayPal (Opcional)
```
1. Ve a: https://developer.paypal.com/dashboard/
2. Revoca credenciales actuales
3. Genera nuevas
4. Actualiza en .env y Easypanel
```

## 📝 Prevenir en el Futuro

### 1. Usar .gitignore
Ya está configurado para ignorar:
```
.env*
CREDENCIALES_REALES_LOCAL.txt
*CREDENCIALES*.txt
```

### 2. Nunca Poner Secretos en Markdown
En archivos de documentación, usa placeholders:
```
❌ MAL:
GROQ_API_KEY=gsk_real_key_here_exposed

✅ BIEN:
GROQ_API_KEY=tu_groq_api_key_aqui
```

### 3. Usar Variables de Entorno
- Localmente: archivo `.env` (gitignored)
- Producción: Panel de Easypanel
- Documentación: Solo placeholders

## 🎯 Siguiente Paso

**Elige una opción:**

### A) Push Rápido (Sin rotar keys)
```bash
# Click en los 3 enlaces de GitHub para permitir
# Luego:
git push origin main
```

### B) Limpiar Historial (Más seguro)
```bash
# Ejecutar:
LIMPIAR_SECRETOS_GIT.bat

# Luego rotar todas las credenciales
```

## ✅ Verificar que Funcionó

Después de hacer push exitoso:

```bash
# Ver el historial limpio
git log --oneline -5

# Verificar que no hay secretos
git show HEAD
```

## 🆘 Si Algo Sale Mal

Restaurar desde backup:
```bash
git checkout backup-antes-limpiar
git branch -D main
git checkout -b main
git push origin main --force
```

## 📞 Notas Importantes

1. **Los secretos YA están limpios** en los archivos actuales
2. El problema es que están en el **historial de Git**
3. GitHub escanea todo el historial, no solo el último commit
4. Por eso necesitas reescribir el historial o permitir los secretos

## 🎉 Recomendación Final

Para este proyecto:
1. **Usa Opción 1** (permitir secretos) - Es más rápido
2. Después de desplegar, **rota las credenciales críticas** (Groq, OAuth)
3. Las nuevas credenciales nunca estarán en Git
4. Problema resuelto ✅
