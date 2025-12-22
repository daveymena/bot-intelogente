@echo off
echo ========================================
echo  SUBIR CAMBIOS COMPLETOS A GIT
echo ========================================
echo.
echo Este script subirá todas las actualizaciones recientes:
echo - Sistema de subcategorías para catálogo
echo - Scraper de fotos MegaComputer
echo - Mejoras en el sistema de respuestas
echo - Correcciones de bugs
echo.
pause

echo.
echo [1/6] Verificando estado actual...
git status

echo.
echo [2/6] Agregando archivos nuevos y modificados...
git add .

echo.
echo [3/6] Verificando archivos a subir...
git status

echo.
echo ========================================
echo ARCHIVOS QUE SE SUBIRÁN:
echo ========================================
echo.
echo NUEVOS SISTEMAS:
echo - Sistema de subcategorías (catálogo organizado)
echo - Scraper de fotos MegaComputer (extracción automática)
echo - Mejoras en búsqueda de productos
echo.
echo CORRECCIONES:
echo - Arreglos en respuestas del bot
echo - Mejoras en detección de intención
echo - Optimización de fallbacks
echo.
echo DOCUMENTACIÓN:
echo - Guías de uso actualizadas
echo - Instrucciones de despliegue
echo - Reportes de sesión
echo.
pause

echo.
echo [4/6] Creando commit...
git commit -m "feat: Sistema de subcategorías, scraper MegaComputer y mejoras generales

- Sistema de subcategorías para organizar catálogo por tipo de producto
- Scraper funcional para extraer fotos de MegaComputer
- Mejoras en sistema de respuestas del bot
- Correcciones en búsqueda y detección de productos
- Optimización de fallbacks locales
- Actualización de documentación completa"

echo.
echo [5/6] Verificando commit...
git log -1 --stat

echo.
echo [6/6] Subiendo a GitHub...
echo.
echo ¿Deseas continuar con el push? (S/N)
set /p confirmar=

if /i "%confirmar%"=="S" (
    echo.
    echo Subiendo cambios...
    git push origin main
    
    echo.
    echo ========================================
    echo  ✅ CAMBIOS SUBIDOS EXITOSAMENTE
    echo ========================================
    echo.
    echo Próximos pasos:
    echo 1. Ve a EasyPanel
    echo 2. El deploy automático debería iniciarse
    echo 3. Espera 2-3 minutos
    echo 4. Verifica que el bot funcione correctamente
    echo.
    echo Variables de entorno a verificar en EasyPanel:
    echo - DATABASE_URL
    echo - GROQ_API_KEY
    echo - NEXT_PUBLIC_WHATSAPP_NUMBER
    echo.
) else (
    echo.
    echo ❌ Push cancelado
    echo Los cambios están en commit local pero no se subieron
    echo.
)

echo.
pause
