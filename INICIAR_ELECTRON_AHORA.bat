@echo off
cls
echo ========================================
echo   INICIAR ELECTRON - Smart Sales Bot
echo ========================================
echo.

REM Verificar que Electron este instalado
call npm list electron >nul 2>&1
if errorlevel 1 (
    echo ERROR: Electron no esta instalado
    echo.
    echo Ejecuta primero: EJECUTAR_ESTO_ELECTRON.bat
    echo O manualmente: npm install --save-dev electron electron-builder --legacy-peer-deps
    echo.
    pause
    exit /b 1
)

echo [OK] Electron instalado
echo.

REM Verificar que server.ts exista
if not exist "server.ts" (
    echo ERROR: No se encuentra server.ts
    echo.
    pause
    exit /b 1
)

echo [OK] Servidor encontrado
echo.

REM Verificar que tsx este disponible
call npx tsx --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: tsx no esta disponible
    echo Instalando tsx...
    npm install -D tsx
)

echo [OK] tsx disponible
echo.

echo ========================================
echo   Iniciando Aplicacion Desktop
echo ========================================
echo.
echo La ventana se abrira en unos segundos...
echo El servidor se iniciara automaticamente.
echo.
echo Presiona Ctrl+C para detener.
echo.

timeout /t 2 >nul

set NODE_ENV=development
npx electron .

echo.
echo ========================================
echo   Aplicacion Cerrada
echo ========================================
echo.

pause
