@echo off
echo ========================================
echo   PREPARAR Y SUBIR A GIT
echo ========================================
echo.
echo Este script va a:
echo 1. Preparar el proyecto para deploy
echo 2. Verificar archivos criticos
echo 3. Crear instrucciones para Easypanel
echo 4. Hacer commit y push a Git
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

echo.
echo ========================================
echo   PASO 1: PREPARAR PROYECTO
echo ========================================
echo.

node preparar-deploy-easypanel.js

echo.
echo ========================================
echo   PASO 2: GIT STATUS
echo ========================================
echo.

git status

echo.
echo ========================================
echo   PASO 3: GIT ADD
echo ========================================
echo.
echo Agregando todos los archivos...
echo.

git add .

echo.
echo ========================================
echo   PASO 4: GIT COMMIT
echo ========================================
echo.

git commit -m "feat: Sistema triple respaldo IA automatico (Groq + OpenRouter + Ollama) - Auto-deteccion de modelos - Cambio automatico sin intervencion - 50 msg/dia extra con OpenRouter - Ollama local ilimitado"

echo.
echo ========================================
echo   PASO 5: GIT PUSH
echo ========================================
echo.
echo Subiendo a GitHub...
echo.

git push origin main

echo.
echo ========================================
echo   COMPLETADO
echo ========================================
echo.
echo Codigo subido a Git exitosamente!
echo.
echo Proximos pasos en Easypanel:
echo.
echo 1. Ir a tu proyecto en Easypanel
echo 2. Crear servicio Ollama:
echo    - Imagen: ollama/ollama:latest
echo    - Puerto: 11434
echo    - Comando: ollama pull gemma:2b
echo.
echo 3. Actualizar variables de entorno:
echo    - OLLAMA_BASE_URL=http://ollama:11434
echo    - OPENROUTER_API_KEY=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
echo    - AI_FALLBACK_ORDER=groq,openrouter,ollama
echo    - AI_AUTO_MODEL_DETECTION=true
echo.
echo 4. Hacer redeploy del bot
echo.
echo Lee DEPLOY_EASYPANEL.md para mas detalles
echo.
pause
