@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     PREPARAR Y SUBIR A GIT PARA EASYPANEL                      ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Este script va a:
echo 1. Verificar que .env NO se suba (seguridad)
echo 2. Limpiar archivos temporales
echo 3. Agregar cambios a Git
echo 4. Crear commit
echo 5. Subir a GitHub
echo.
pause

echo.
echo [1/6] Verificando .gitignore...
findstr /C:".env" .gitignore >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ .env esta protegido en .gitignore
) else (
    echo ❌ ADVERTENCIA: .env NO esta en .gitignore
    echo Agregando .env a .gitignore...
    echo .env >> .gitignore
    echo ✓ .env agregado a .gitignore
)

echo.
echo [2/6] Limpiando archivos temporales...
if exist node_modules\.prisma\client\*.tmp* (
    del /F /Q node_modules\.prisma\client\*.tmp* 2>nul
    echo ✓ Archivos temporales eliminados
)

echo.
echo [3/6] Cerrando procesos de Node...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✓ Procesos cerrados

echo.
echo [4/6] Agregando cambios a Git...
git add .
if %errorlevel% neq 0 (
    echo ❌ Error al agregar archivos
    pause
    exit /b 1
)
echo ✓ Archivos agregados

echo.
echo [5/6] Creando commit...
git commit -m "Sistema Hibrido: Bot Local + Ollama Assistant con formato profesional"
if %errorlevel% neq 0 (
    echo ⚠️  No hay cambios para commitear o error
    echo Intentando continuar...
)

echo.
echo [6/6] Subiendo a GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Error al subir a GitHub
    echo.
    echo Posibles soluciones:
    echo 1. Verifica tu conexion a internet
    echo 2. Verifica tus credenciales de Git
    echo 3. Intenta: git push origin master (si tu rama es master)
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ SUBIDO A GIT EXITOSAMENTE
echo ════════════════════════════════════════════════════════════════
echo.
echo 📦 Cambios subidos:
echo    - Sistema Hibrido (Bot Local + Ollama)
echo    - Formato de respuestas profesional
echo    - Servicios de IA actualizados
echo    - PostgreSQL configurado
echo.
echo 🚀 SIGUIENTE PASO EN EASYPANEL:
echo.
echo 1. Ve a tu aplicacion en Easypanel
echo 2. Seccion "Environment Variables"
echo 3. Copia las variables de: VARIABLES_EASYPANEL_COMPLETAS.env
echo 4. Pega en Easypanel
echo 5. Guarda cambios
echo 6. Rebuild la aplicacion
echo 7. Ejecuta en consola: npx prisma db push
echo.
echo 📝 Archivo de variables: VARIABLES_EASYPANEL_COMPLETAS.env
echo.
pause
