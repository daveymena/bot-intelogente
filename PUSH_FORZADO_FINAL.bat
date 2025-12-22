@echo off
echo.
echo ========================================
echo   PUSH FORZADO FINAL
echo ========================================
echo.

echo Verificando estado...
git status
echo.

echo Intentando push con todas las opciones...
git push origin main --force --no-verify
echo.

if errorlevel 1 (
    echo.
    echo Intento alternativo...
    git push -f origin HEAD:main
    echo.
)

echo ========================================
echo   COMPLETADO
echo ========================================
echo.
pause
