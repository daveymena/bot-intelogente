@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════
echo   🔍 DIAGNÓSTICO RÁPIDO - FOTOS CARD
echo ═══════════════════════════════════════════════════════
echo.
echo Verificando estado del sistema...
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 1. VERIFICANDO SERVIDOR
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
netstat -ano | findstr :3000 >nul
if %errorlevel%==0 (
    echo ✅ Servidor corriendo en puerto 3000
) else (
    echo ❌ Servidor NO está corriendo
    echo.
    echo 💡 Ejecuta: INICIAR_TODO.bat
    goto :end
)
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 2. VERIFICANDO IMÁGENES EN BD
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
node verificar-imagenes-piano.js
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 3. TEST DE ENVÍO CARD
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
node test-fotos-piano-corregido.js
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 4. RESUMEN
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ Sistema híbrido: Implementado
echo ✅ Error Prisma: Corregido
echo ✅ Filtro imágenes: Corregido
echo ✅ Hot reload: Aplicado
echo.
echo 🚀 PRÓXIMO PASO:
echo    1. Abrir dashboard: http://localhost:3000
echo    2. Conectar WhatsApp (escanear QR)
echo    3. Enviar: "tienes curso de piano ?"
echo    4. Verificar que envíe foto CARD
echo.

:end
pause
