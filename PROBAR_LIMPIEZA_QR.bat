@echo off
echo ========================================
echo TEST: Limpieza de Sesion QR
echo ========================================
echo.
echo Este script prueba los endpoints de limpieza
echo.
echo 1. Verificar estado
curl -X POST http://localhost:3000/api/whatsapp/cleanup -H "Content-Type: application/json" -d "{\"action\": \"check\"}"
echo.
echo.
echo 2. Ejecutar limpieza
curl -X POST http://localhost:3000/api/whatsapp/cleanup -H "Content-Type: application/json" -d "{\"action\": \"cleanup\"}"
echo.
echo.
echo ========================================
echo Test completado
echo ========================================
pause
