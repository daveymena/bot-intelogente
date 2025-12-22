@echo off
echo ========================================
echo ACTIVAR TODAS LAS MEJORAS DEL BOT
echo ========================================
echo.
echo Se van a aplicar 3 mejoras criticas:
echo 1. Metodos de pago correctos
echo 2. Rotacion de 8 API keys (8x capacidad)
echo 3. Sistema de aprendizaje local
echo.
pause

echo.
echo ========================================
echo PASO 1: Generar Cliente de Prisma
echo ========================================
echo.
npx prisma generate
if errorlevel 1 (
    echo ERROR: No se pudo generar el cliente de Prisma
    pause
    exit /b 1
)
echo.
echo OK: Cliente de Prisma generado
echo.

echo ========================================
echo PASO 2: Crear Tabla de Conocimiento
echo ========================================
echo.
npx prisma db push
if errorlevel 1 (
    echo ERROR: No se pudo crear la tabla
    pause
    exit /b 1
)
echo.
echo OK: Tabla de conocimiento creada
echo.

echo ========================================
echo PASO 3: Probar Sistema de Aprendizaje
echo ========================================
echo.
npx tsx scripts/test-knowledge-base.ts
echo.
echo OK: Sistema de aprendizaje probado
echo.

echo ========================================
echo PASO 4: Reiniciar el Bot
echo ========================================
echo.
echo IMPORTANTE: Ahora debes reiniciar el bot manualmente
echo.
echo 1. Presiona Ctrl+C en la ventana del bot
echo 2. Ejecuta: npm run dev
echo.
echo ========================================
echo COMPLETADO
echo ========================================
echo.
echo Mejoras aplicadas:
echo - Metodos de pago correctos
echo - 8 API keys con rotacion automatica
echo - Sistema de aprendizaje local
echo.
echo Documentacion:
echo - RESUMEN_FINAL_3_MEJORAS.md
echo - SISTEMA_APRENDIZAJE_LOCAL.md
echo - SOLUCION_RATE_LIMIT_GROQ.md
echo.
pause
