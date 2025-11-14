@echo off
echo ========================================
echo   COMMIT Y PUSH A GIT
echo ========================================
echo.
echo Este script va a:
echo - Agregar todos los cambios
echo - Hacer commit con mensaje descriptivo
echo - Subir a GitHub
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

echo.
echo ========================================
echo   GIT ADD
echo ========================================
echo.

git add .

echo.
echo Archivos agregados!
echo.

echo ========================================
echo   GIT COMMIT
echo ========================================
echo.

git commit -m "feat: Sistema Triple Respaldo IA Automatico - Groq + OpenRouter (50 msg/dia) + Ollama (ilimitado) - Auto-deteccion y cambio de modelos sin intervencion - Sistema de razonamiento profundo integrado - Optimizaciones para Easypanel - Migracion completa a TypeScript"

echo.
echo Commit realizado!
echo.

echo ========================================
echo   GIT PUSH
echo ========================================
echo.

git push origin main

echo.
echo ========================================
echo   COMPLETADO
echo ========================================
echo.
echo Codigo subido exitosamente a GitHub!
echo.
echo PROXIMOS PASOS EN EASYPANEL:
echo ========================================
echo.
echo 1. CONFIGURAR OLLAMA (si no existe):
echo    - Crear nuevo servicio
echo    - Imagen: ollama/ollama:latest
echo    - Puerto: 11434
echo    - Volumen: /root/.ollama
echo    - Comando: ollama pull gemma:2b
echo.
echo 2. ACTUALIZAR VARIABLES DE ENTORNO:
echo    Agregar estas variables en tu app:
echo.
echo    OPENROUTER_API_KEY=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
echo    OLLAMA_BASE_URL=http://ollama:11434
echo    OLLAMA_MODEL=gemma:2b
echo    AI_FALLBACK_ORDER=groq,openrouter,ollama
echo    AI_AUTO_MODEL_DETECTION=true
echo.
echo 3. REDEPLOY:
echo    - Hacer pull del nuevo codigo
echo    - Rebuild de la aplicacion
echo    - Restart
echo.
echo 4. VERIFICAR:
echo    - Revisar logs
echo    - Probar el bot
echo    - Verificar que Ollama responde
echo.
echo Lee DEPLOY_EASYPANEL.md para mas detalles
echo.
pause
