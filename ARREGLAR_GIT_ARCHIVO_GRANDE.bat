@echo off
echo ═══════════════════════════════════════════════════════════════
echo 🔧 ARREGLANDO PROBLEMA DE ARCHIVO GRANDE EN GIT
echo ═══════════════════════════════════════════════════════════════
echo.
echo El problema: trading-bot/node_modules tiene archivos muy grandes
echo Solución: Excluir trading-bot del repositorio
echo.
pause

echo.
echo 📝 Agregando trading-bot a .gitignore...
echo trading-bot/ >> .gitignore
echo node_modules/ >> .gitignore

echo.
echo 🗑️ Removiendo trading-bot del índice de Git...
git rm -r --cached trading-bot/

echo.
echo 💾 Creando commit de limpieza...
git add .gitignore
git commit -m "fix: Excluir trading-bot del repositorio (archivos muy grandes)"

echo.
echo 🌐 Subiendo a GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo ✅ PROBLEMA RESUELTO - CÓDIGO SUBIDO EXITOSAMENTE
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo Ahora puedes continuar con el deploy en Easypanel
    echo.
) else (
    echo.
    echo ❌ Aún hay un problema. Intentando solución alternativa...
    echo.
    echo Ejecutando limpieza profunda del historial...
    git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch trading-bot/" --prune-empty --tag-name-filter cat -- --all
    
    echo.
    echo Forzando push...
    git push origin main --force
    
    echo.
    echo ✅ Limpieza profunda completada
)

echo.
pause
