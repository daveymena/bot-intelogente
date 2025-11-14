@echo off
cls
echo ========================================
echo RESET COMPLETO DE BASE DE DATOS
echo ========================================
echo.
echo ⚠️  ADVERTENCIA: Esto eliminara TODO excepto:
echo    ✅ Productos reales
echo    ✅ Usuario admin
echo    ✅ Backend y scripts
echo.
echo ❌ Se eliminara:
echo    - TODAS las conversaciones
echo    - TODOS los mensajes
echo    - TODAS las conexiones WhatsApp
echo    - TODAS las sesiones
echo    - Usuarios demo
echo.
echo Esta accion NO se puede deshacer.
echo.
pause

call npx tsx scripts/reset-base-datos-limpia.ts

echo.
echo ========================================
echo RESET COMPLETADO
echo ========================================
echo.
echo Credenciales de acceso:
echo Email: daveymena16@gmail.com
echo Password: admin123
echo.
pause
