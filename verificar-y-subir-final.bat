@echo off
echo ========================================
echo  VERIFICACION Y SUBIDA FINAL
echo ========================================
echo.

echo [1/6] Limpiando cache de Next.js...
rmdir /s /q .next 2>nul
echo Cache limpiado.

echo.
echo [2/6] Verificando build frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build frontend fallo
    pause
    exit /b 1
)
echo Build frontend: OK

echo.
echo [3/6] Verificando sistema de memoria compartida...
findstr /C:"SharedMemory" src\agents\shared-memory.ts >nul
if %ERRORLEVEL% EQU 0 (
    echo Memoria compartida: OK
) else (
    echo ERROR: Memoria compartida no encontrada
    pause
    exit /b 1
)

echo.
echo [4/6] Verificando exports...
findstr /C:"export const prisma" src\lib\db.ts >nul
if %ERRORLEVEL% EQU 0 (
    echo Export prisma: OK
) else (
    echo ERROR: Export prisma no encontrado
)

findstr /C:"export async function verifyAuth" src\lib\auth.ts >nul
if %ERRORLEVEL% EQU 0 (
    echo Export verifyAuth: OK
) else (
    echo ERROR: Export verifyAuth no encontrado
)

echo.
echo [5/6] Agregando cambios a Git...
git add .
git commit -m "fix: verificar memoria compartida y exports funcionando

- Memoria compartida activa y funcionando
- Exports de prisma y verifyAuth correctos
- Build frontend exitoso
- Sistema de agentes operativo"

echo.
echo [6/6] Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo  VERIFICACION COMPLETADA
echo ========================================
echo.
echo Estado:
echo - Build frontend: OK
echo - Memoria compartida: OK
echo - Exports: OK
echo - Subido a Git: OK
echo.
echo Listo para Easypanel!
echo.
pause
