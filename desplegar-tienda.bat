@echo off
echo.
echo ========================================
echo   DESPLEGAR SISTEMA DE TIENDAS
echo ========================================
echo.

echo [1/4] Verificando sistema...
npx tsx scripts/probar-tienda-usuario.ts

echo.
echo [2/4] Agregando cambios a Git...
git add .

echo.
echo [3/4] Creando commit...
git commit -m "feat: Sistema de tiendas individuales por usuario"

echo.
echo [4/4] Subiendo a repositorio...
git push origin main

echo.
echo ========================================
echo   DEPLOY COMPLETADO
echo ========================================
echo.
echo Tu tienda estara disponible en 2-3 minutos en:
echo https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/tienda/cmhjgzsjl0000t526gou8b8x2
echo.
echo Presiona cualquier tecla para salir...
pause >nul
