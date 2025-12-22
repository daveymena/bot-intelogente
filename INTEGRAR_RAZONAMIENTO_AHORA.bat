@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     🧠 INTEGRAR RAZONAMIENTO PROFUNDO - AUTOMÁTICO            ║
echo ║                                                                ║
╚════════════════════════════════════════════════════════════════╝
echo.

echo [1/4] 🔍 Buscando archivo de servicio de WhatsApp...
echo.

if exist "src\lib\whatsapp-web-service.ts" (
    echo    ✅ Encontrado: whatsapp-web-service.ts
    set SERVICE_FILE=src\lib\whatsapp-web-service.ts
) else if exist "src\lib\baileys-stable-service.ts" (
    echo    ✅ Encontrado: baileys-stable-service.ts
    set SERVICE_FILE=src\lib\baileys-stable-service.ts
) else (
    echo    ❌ No se encontró el archivo de servicio
    echo    Por favor, integra manualmente siguiendo:
    echo    INTEGRAR_RAZONAMIENTO_PROFUNDO.md
    pause
    exit /b 1
)

echo.
echo [2/4] 📝 Creando backup del archivo original...
copy "%SERVICE_FILE%" "%SERVICE_FILE%.backup" >nul
echo    ✅ Backup creado: %SERVICE_FILE%.backup

echo.
echo [3/4] 🔧 Verificando archivos necesarios...
if exist "src\lib\deep-reasoning-ai-service.ts" (
    echo    ✅ deep-reasoning-ai-service.ts existe
) else (
    echo    ❌ deep-reasoning-ai-service.ts NO existe
    echo    Por favor, verifica que todos los archivos estén creados
    pause
    exit /b 1
)

if exist "src\lib\product-documentation-service.ts" (
    echo    ✅ product-documentation-service.ts existe
) else (
    echo    ❌ product-documentation-service.ts NO existe
    pause
    exit /b 1
)

echo.
echo [4/4] 📋 Instrucciones de integración manual...
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ⚠️ INTEGRACIÓN MANUAL REQUERIDA                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Para completar la integración, sigue estos pasos:
echo.
echo 1. Abre el archivo: %SERVICE_FILE%
echo.
echo 2. Busca la línea que dice:
echo    import { AIService } from './ai-service'
echo.
echo 3. Agrega DEBAJO de esa línea:
echo    import { DeepReasoningAIService } from './deep-reasoning-ai-service'
echo.
echo 4. Busca donde se llama a AIService.generateResponse
echo    (Puede estar en handleAutoResponse o similar)
echo.
echo 5. Reemplaza:
echo    const response = await AIService.generateResponse(...)
echo.
echo    Por:
echo    const response = await DeepReasoningAIService.generateIntelligentResponse(...)
echo.
echo 6. Guarda el archivo
echo.
echo 7. Reinicia el bot: npm run dev
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              📚 DOCUMENTACIÓN COMPLETA                         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Lee estos archivos para más detalles:
echo.
echo 📄 INTEGRAR_RAZONAMIENTO_PROFUNDO.md - Guía completa
echo 📄 RAZONAMIENTO_PROFUNDO_LISTO.txt - Resumen visual
echo.
echo ✅ Backup creado en: %SERVICE_FILE%.backup
echo    Si algo sale mal, puedes restaurar el archivo original
echo.
pause
