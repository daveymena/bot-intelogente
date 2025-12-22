@echo off
echo ========================================
echo VERIFICANDO PUERTOS EN USO
echo ========================================
echo.

echo Puerto 3000:
netstat -ano | findstr :3000
echo.

echo Puerto 4000:
netstat -ano | findstr :4000
echo.

echo Puerto 5000:
netstat -ano | findstr :5000
echo.

echo Puerto 8080:
netstat -ano | findstr :8080
echo.

echo ========================================
echo PROCESOS DE NODE.JS ACTIVOS
echo ========================================
tasklist | findstr node.exe
echo.

pause
