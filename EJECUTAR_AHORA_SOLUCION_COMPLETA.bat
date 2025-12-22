@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  🚀 SOLUCIÓN INTEGRAL COMPLETA - Smart Sales Bot Pro      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [PASO 1/6] 🔍 Verificando estado actual...
echo.
node test-solucion-integral.js
if errorlevel 1 (
    echo.
    echo ⚠️  Se detectaron problemas. Continuando con correcciones...
    echo.
) else (
    echo.
    echo ✅ Sistema verificado correctamente
    echo.
)

echo.
echo [PASO 2/6] 🧹 Limpiando puertos ocupados...
echo.
call CERRAR_PUERTOS_AHORA.bat

echo.
echo [PASO 3/6] 📦 Verificando productos críticos...
echo.
node verificar-productos-criticos.js

echo.
echo [PASO 4/6] ⚙️  Verificando configuración...
echo.
node verificar-configuracion-completa.js

echo.
echo [PASO 5/6] 🔧 Aplicando correcciones automáticas...
echo.
node aplicar-correcciones-automaticas.js

echo.
echo [PASO 6/6] 🚀 Iniciando servidor optimizado...
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ⚠️  IMPORTANTE: Espera a ver "Ready in" antes de probar  ║
echo ║  📝 Los logs mostrarán el diagnóstico en tiempo real      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

npm run dev
