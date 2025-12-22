@echo off
echo ============================================================
echo DESPLEGAR MEJORAS A EASYPANEL
echo ============================================================
echo.

echo Este script va a:
echo 1. Agregar todos los cambios a Git
echo 2. Hacer commit con mensaje descriptivo
echo 3. Push a GitHub
echo 4. Easypanel desplegara automaticamente
echo.

echo Mejoras incluidas:
echo - Comprension mejorada de megapacks
echo - Persistencia de sesion (30 dias)
echo - Limpieza robusta de QR WhatsApp
echo.

set /p confirm="Continuar con el deploy? (S/N): "
if /i not "%confirm%"=="S" (
    echo Deploy cancelado
    pause
    exit /b
)

echo.
echo ============================================================
echo PASO 1: Verificando estado de Git
echo ============================================================
echo.

git status

echo.
echo ============================================================
echo PASO 2: Agregando archivos
echo ============================================================
echo.

git add .

echo.
echo ============================================================
echo PASO 3: Haciendo commit
echo ============================================================
echo.

git commit -m "feat: Mejoras en comprension, persistencia y limpieza - Comprension mejorada de megapacks con fuzzy matching - Persistencia de sesion extendida a 30 dias - Sistema robusto de limpieza de QR WhatsApp - Renovacion automatica de cookies - Hook de verificacion de sesion - Logs detallados en limpieza"

echo.
echo ============================================================
echo PASO 4: Push a GitHub
echo ============================================================
echo.

git push origin main

if errorlevel 1 (
    echo.
    echo ============================================================
    echo ERROR: Push fallido
    echo ============================================================
    echo.
    echo Posibles causas:
    echo - No estas en la rama main
    echo - Hay conflictos con el remoto
    echo - No tienes permisos
    echo.
    echo Intenta:
    echo   git pull origin main
    echo   git push origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo DEPLOY EXITOSO
echo ============================================================
echo.
echo Cambios enviados a GitHub
echo Easypanel desplegara automaticamente en 2-3 minutos
echo.
echo Verifica en:
echo - Easypanel Dashboard - Deployments
echo - Logs de la aplicacion
echo.
echo Prueba las nuevas funciones:
echo 1. Login (debe persistir al navegar)
echo 2. Busqueda de megapacks
echo 3. Limpieza de QR WhatsApp
echo.

pause
