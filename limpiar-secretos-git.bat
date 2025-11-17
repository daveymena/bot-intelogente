@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  🔒 LIMPIAR SECRETOS DEL HISTORIAL DE GIT                    ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo ⚠️  ADVERTENCIA: Este proceso reescribirá el historial de Git
echo.
echo 📋 Problema detectado:
echo    GitHub bloqueó el push porque encontró una API key de Groq
echo    en el archivo: RESUMEN_TRABAJO_COMPLETO_FINAL.md
echo.
echo 🔧 Solución:
echo    Vamos a eliminar ese archivo del historial de Git
echo.

set /p continuar="¿Deseas continuar? (S/N): "
if /i not "%continuar%"=="S" goto :end

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 1️⃣  Verificando si el archivo existe en el historial...
git log --all --full-history -- "RESUMEN_TRABAJO_COMPLETO_FINAL.md" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Archivo encontrado en el historial
) else (
    echo ⚠️  Archivo no encontrado en el historial
)

echo.
echo 2️⃣  Eliminando archivo del historial de Git...
echo    (Esto puede tomar unos segundos)
echo.

git filter-branch --force --index-filter "git rm --cached --ignore-unmatch RESUMEN_TRABAJO_COMPLETO_FINAL.md" --prune-empty --tag-name-filter cat -- --all

if %errorlevel% equ 0 (
    echo ✅ Archivo eliminado del historial
) else (
    echo ❌ Error al eliminar el archivo
    goto :error
)

echo.
echo 3️⃣  Limpiando referencias...
git for-each-ref --format="delete %%(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ✅ Referencias limpiadas

echo.
echo 4️⃣  Forzando push a GitHub...
echo.

git push origin main --force

if %errorlevel% equ 0 (
    echo ✅ Push exitoso
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo 🎉 ¡Problema resuelto!
    echo.
    echo ✅ El archivo con la API key fue eliminado del historial
    echo ✅ Los cambios fueron subidos a GitHub
    echo.
    echo 🔒 Recomendaciones de seguridad:
    echo    1. Revisa que tu .gitignore incluya .env
    echo    2. Nunca subas archivos con API keys
    echo    3. Si expusiste una API key, regenerala en el proveedor
    echo.
) else (
    echo ❌ Error al hacer push
    echo.
    echo 💡 Intenta manualmente:
    echo    git push origin main --force
    goto :error
)

goto :end

:error
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ❌ Ocurrió un error
echo.
echo 💡 Solución alternativa:
echo.
echo 1. Permite el secreto en GitHub:
echo    https://github.com/daveymena/bot-intelogente/security/secret-scanning/unblock-secret/35cV8Xb4mg86bPgrTvzAoxAT54B
echo.
echo 2. O elimina el commit manualmente:
echo    git reset --hard HEAD~1
echo    git push origin main --force
echo.
pause
goto :end

:end
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pause
