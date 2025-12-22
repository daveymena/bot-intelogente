@echo off
echo ========================================
echo LIMPIAR DATOS DEMO
echo Elimina productos y conversaciones demo
echo ========================================
echo.
echo ADVERTENCIA: Esto eliminara:
echo - Productos demo/prueba
echo - Conversaciones de prueba
echo - Usuarios demo
echo - Sesiones expiradas
echo.
echo Mantendra:
echo - Productos reales
echo - Usuarios reales
echo - Backend y scripts
echo.
pause

call npx tsx scripts/limpiar-datos-demo.ts

echo.
echo ========================================
echo LIMPIEZA COMPLETADA
echo ========================================
pause
