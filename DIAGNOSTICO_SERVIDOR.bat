@echo off
echo ========================================
echo DIAGNOSTICO DEL SERVIDOR
echo ========================================
echo.

echo 1. Verificando procesos de Node...
tasklist | findstr node
echo.

echo 2. Verificando puerto 3000...
netstat -ano | findstr :3000
echo.

echo 3. Intentando compilar TypeScript...
npx tsc --noEmit
echo.

echo ========================================
echo Diagnostico completado
echo ========================================
echo.
echo Si hay errores arriba, compártelos.
echo Si no hay errores, reinicia con: npm run dev
echo.
pause
