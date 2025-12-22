@echo off
echo ═══════════════════════════════════════════════════════════════
echo 🧹 LIMPIEZA COMPLETA DEL HISTORIAL DE GIT
echo ═══════════════════════════════════════════════════════════════
echo.
echo ADVERTENCIA: Esto eliminará TODAS las API keys del historial
echo.
pause

echo.
echo 📝 Paso 1: Asegurar que archivos sensibles estén en .gitignore...
echo .env >> .gitignore
echo .env.* >> .gitignore
echo trading-bot/ >> .gitignore
echo *_API_KEY.txt >> .gitignore
echo *_SECRET.txt >> .gitignore
echo *_TOKEN.txt >> .gitignore

echo.
echo 🗑️ Paso 2: Remover archivos sensibles del índice...
git rm -r --cached trading-bot/ 2>nul
git rm --cached .env 2>nul
git rm --cached .env.* 2>nul

echo.
echo 🧹 Paso 3: Limpieza profunda del historial (BFG Repo-Cleaner alternativo)...
echo Usando git filter-repo para limpiar el historial...

echo.
echo Creando respaldo del repositorio...
xcopy /E /I /Y .git .git-backup

echo.
echo Limpiando archivos sensibles del historial...
git filter-branch --force --index-filter ^
"git rm --cached --ignore-unmatch .env .env.* trading-bot/* *_API_KEY.txt *_SECRET.txt" ^
--prune-empty --tag-name-filter cat -- --all

echo.
echo 🗑️ Paso 4: Limpiando referencias...
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo 💾 Paso 5: Creando commit limpio...
git add .gitignore
git commit -m "chore: Limpiar historial de archivos sensibles

- Remover API keys del historial
- Excluir trading-bot/
- Actualizar .gitignore
- Preparar para deploy seguro"

echo.
echo 🌐 Paso 6: Forzando push limpio...
git push origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo ✅ HISTORIAL LIMPIADO EXITOSAMENTE
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo El repositorio ahora está limpio de API keys
    echo.
    echo IMPORTANTE:
    echo 1. Revoca las API keys expuestas en:
    echo    - Groq: https://console.groq.com/keys
    echo    - MercadoPago: https://www.mercadopago.com/developers
    echo    - PayPal: https://developer.paypal.com/
    echo.
    echo 2. Genera nuevas API keys
    echo 3. Actualiza tu .env local (nunca se subirá)
    echo 4. Configura las nuevas keys en Easypanel
    echo.
) else (
    echo.
    echo ❌ ERROR en el push
    echo.
    echo Solución alternativa: Crear repositorio nuevo
    echo.
    echo 1. Ve a GitHub y crea un nuevo repositorio
    echo 2. Ejecuta:
    echo    git remote set-url origin https://github.com/tu-usuario/nuevo-repo.git
    echo    git push -u origin main --force
    echo.
)

pause
