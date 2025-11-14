@echo off
echo ========================================
echo ENTRENAMIENTO COMPLETO DEL BOT
echo ========================================
echo.
echo Este proceso entrenara al bot con:
echo - 150+ preguntas comunes
echo - 10 conversaciones completas
echo - 230+ respuestas de calidad
echo.
echo Duracion estimada: 20-25 minutos
echo.
echo IMPORTANTE: Asegurate de que el bot NO este corriendo
echo Presiona Ctrl+C si el bot esta corriendo
echo.
pause

echo.
echo ========================================
echo PASO 1: Preparar Base de Datos
echo ========================================
echo.
echo Generando cliente de Prisma...
npx prisma generate
if errorlevel 1 (
    echo ERROR: No se pudo generar el cliente
    pause
    exit /b 1
)
echo.
echo Creando tabla de conocimiento...
npx prisma db push
if errorlevel 1 (
    echo ERROR: No se pudo crear la tabla
    pause
    exit /b 1
)
echo.
echo OK: Base de datos lista
echo.

echo ========================================
echo PASO 2: Entrenamiento con Preguntas
echo ========================================
echo.
echo Entrenando con 150+ preguntas comunes...
echo (Esto tomara 5-10 minutos)
echo.
npx tsx scripts/entrenar-bot-automatico.ts
echo.
echo OK: Entrenamiento de preguntas completado
echo.

echo ========================================
echo PASO 3: Entrenamiento con Conversaciones
echo ========================================
echo.
echo Entrenando con 10 conversaciones completas...
echo (Esto tomara 10-15 minutos)
echo.
npx tsx scripts/entrenar-conversaciones-completas.ts
echo.
echo OK: Entrenamiento de conversaciones completado
echo.

echo ========================================
echo PASO 4: Verificar Entrenamiento
echo ========================================
echo.
echo Verificando base de conocimiento...
echo.
npx tsx scripts/test-knowledge-base.ts
echo.

echo ========================================
echo ENTRENAMIENTO COMPLETADO
echo ========================================
echo.
echo El bot ahora tiene:
echo - 230+ respuestas aprendidas
echo - Conocimiento de preguntas comunes
echo - Contexto de conversaciones completas
echo - Capacidad de funcionar sin APIs
echo.
echo Siguiente paso:
echo 1. Reinicia el bot: npm run dev
echo 2. Prueba con WhatsApp
echo 3. El bot usara el conocimiento aprendido
echo.
echo Documentacion:
echo - SISTEMA_ENTRENAMIENTO_AUTOMATICO.md
echo - SISTEMA_APRENDIZAJE_LOCAL.md
echo.
pause
