@echo off
echo ========================================
echo   TEST INTERACTIVO DE DIALOGO IA
echo ========================================
echo.
echo Selecciona el modo:
echo.
echo 1. Modo Interactivo (tu escribes las preguntas)
echo 2. Modo Automatico (pruebas predefinidas)
echo.
set /p modo="Elige una opcion (1 o 2): "

if "%modo%"=="1" (
    echo.
    echo Iniciando modo interactivo...
    node test-dialogo-ia-interactivo.js interactive
) else if "%modo%"=="2" (
    echo.
    echo Ejecutando pruebas automaticas...
    node test-dialogo-ia-interactivo.js auto
) else (
    echo.
    echo Opcion no valida. Usando modo interactivo por defecto...
    node test-dialogo-ia-interactivo.js interactive
)

pause
