@echo off
echo ========================================
echo VERIFICAR SOLUCION "CONNECTION CLOSED"
echo ========================================
echo.

echo 1. Verificando estado de conexion...
echo.
npx tsx scripts/test-estabilizacion-conexion.ts

echo.
echo ========================================
echo.
echo 2. Para monitorear en tiempo real:
echo    npx tsx scripts/monitorear-estabilidad-conexion.ts
echo.
echo 3. Para simular reconexion rapida:
echo    npx tsx scripts/simular-reconexion-rapida.ts
echo.
echo ========================================
pause
