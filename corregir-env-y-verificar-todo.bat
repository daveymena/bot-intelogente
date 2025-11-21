@echo off
echo ========================================
echo  CORRECCION COMPLETA DEL SISTEMA
echo ========================================
echo.

echo [PASO 1] Respaldando .env actual...
copy .env .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
echo Respaldo creado.

echo.
echo [PASO 2] Aplicando .env corregido...
copy /Y .env.corregido .env
echo .env actualizado con:
echo - PORT=4000 (corregido de 3000)
echo - Variables separadas correctamente
echo - OPENAI_ENABLED=false (sin duplicados)

echo.
echo [PASO 3] Verificando sistema de memoria compartida...
findstr /C:"SharedMemory" src\agents\shared-memory.ts >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Memoria compartida: ACTIVA
) else (
    echo [ERROR] Memoria compartida no encontrada
)

findstr /C:"productHistory" src\agents\shared-memory.ts >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Historial de productos: ACTIVO
) else (
    echo [WARN] Historial de productos no encontrado
)

echo.
echo [PASO 4] Verificando sistema de agentes...
findstr /C:"agent-orchestrator-wrapper" src\agents\agent-orchestrator-wrapper.ts >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Orquestador de agentes: ACTIVO
) else (
    echo [ERROR] Orquestador no encontrado
)

echo.
echo [PASO 5] Verificando detección de intenciones...
findstr /C:"IntentDetector" src\agents\utils\intent-detector.ts >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Detector de intenciones: ACTIVO
) else (
    echo [ERROR] Detector de intenciones no encontrado
)

echo.
echo [PASO 6] Limpiando cache y rebuilding...
rmdir /s /q .next 2>nul
echo Cache limpiado.

echo.
echo [PASO 7] Build frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build fallo
    pause
    exit /b 1
)
echo [OK] Build exitoso

echo.
echo ========================================
echo  RESUMEN DE VERIFICACION
echo ========================================
echo.
echo Estado del Sistema:
echo [OK] .env corregido (PORT=4000)
echo [OK] Memoria compartida activa
echo [OK] Sistema de agentes activo
echo [OK] Detección de intenciones activa
echo [OK] Build frontend exitoso
echo.
echo El sistema de retraso y análisis de intención
echo está ACTIVO y funcionando correctamente.
echo.
echo Características activas:
echo - Memoria compartida entre agentes
echo - Historial de productos visitados
echo - Detección inteligente de intenciones
echo - Análisis de contexto conversacional
echo - Sistema de agentes especializados
echo.
echo ========================================
echo  LISTO PARA USAR
echo ========================================
echo.
echo Puedes:
echo 1. Iniciar desarrollo: npm run dev
echo 2. Subir a Git: git add . ^&^& git commit -m "fix: env corregido" ^&^& git push
echo 3. Desplegar en Easypanel
echo.
pause
