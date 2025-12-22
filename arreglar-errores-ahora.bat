@echo off
echo ========================================
echo 🔧 ARREGLANDO ERRORES CRÍTICOS
echo ========================================
echo.
echo Este script va a:
echo 1. Comentar el sistema de escalamiento que causa error
echo 2. Permitir que el bot funcione sin caer al fallback de IA
echo.
pause

node arreglar-errores-criticos.js

echo.
echo ========================================
echo ✅ CORRECCIÓN COMPLETADA
echo ========================================
echo.
echo PRÓXIMOS PASOS:
echo 1. Reiniciar bot: npm run dev
echo 2. Probar: "Me interesa el curso de piano"
echo 3. Verificar que responde con plantilla local (sin IA)
echo.
pause
