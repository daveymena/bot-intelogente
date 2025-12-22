@echo off
cls
echo ========================================
echo   CORRECCION: Deteccion "Enviame link"
echo ========================================
echo.
echo PROBLEMA:
echo   El bot NO detectaba cuando el usuario
echo   pedia explicitamente el link de pago
echo.
echo SOLUCION:
echo   Se agrego deteccion de frases como:
echo   - "Enviame el link"
echo   - "Dame el link"
echo   - "Manda el link"
echo   - "El link por favor"
echo.
echo ========================================
echo.
echo Opciones:
echo.
echo [1] Probar la correccion (test automatico)
echo [2] Reiniciar bot con cambios
echo [3] Ver documentacion completa
echo [4] Salir
echo.
set /p opcion="Elige una opcion (1-4): "

if "%opcion%"=="1" goto test
if "%opcion%"=="2" goto reiniciar
if "%opcion%"=="3" goto docs
if "%opcion%"=="4" goto fin

:test
echo.
echo Ejecutando test...
call PROBAR_ENVIAR_LINK.bat
goto fin

:reiniciar
echo.
echo Reiniciando bot...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
start cmd /k "npm run dev"
echo.
echo Bot reiniciado. Prueba enviando:
echo   1. "Me interesa el mega pack 01"
echo   2. "Que metodos de pago tienen?"
echo   3. "Enviame el link de pago"
echo.
pause
goto fin

:docs
echo.
type CORRECCION_ENVIAR_LINK_PAGO.md
echo.
pause
goto fin

:fin
