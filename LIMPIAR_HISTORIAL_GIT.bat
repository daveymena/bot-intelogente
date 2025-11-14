@echo off
echo ========================================
echo   LIMPIANDO ARCHIVOS CON SECRETOS
echo ========================================
echo.

echo Eliminando archivos con secretos del repositorio...

git rm --cached RESUMEN_SESION_COMPLETA_FINAL.md
git rm --cached CAMBIOS_OLLAMA_APLICADOS.md
git rm --cached CONFIGURACION_GROQ_PRINCIPAL_FINAL.md
git rm --cached ESTADO_LLM_BOT_ACTUAL.md
git rm --cached DESPLEGAR_EN_EASYPANEL.md
git rm --cached RESUMEN_FINAL_DESPLIEGUE.md
git rm --cached SISTEMA_FALLBACK_TRIPLE.md
git rm --cached CAMBIOS_VARIABLES_EASYPANEL.md
git rm --cached VARIABLES_ENTORNO_EASYPANEL_COMPLETAS.env
git rm --cached CONFIGURACION_FINAL_RECOMENDADA.md
git rm --cached CONFIGURACION_SOLO_GROQ_FINAL.md
git rm --cached CONFIGURACION_RECOMENDADA_FINAL.md
git rm --cached ANALISIS_VELOCIDAD_OLLAMA.md

echo.
echo Agregando archivos limpios...
git add src/
git add .gitignore
git add .env.example

echo.
echo Creando commit...
git commit -m "fix: Correccion contexto productos e imagenes"

echo.
echo Subiendo con force...
git push origin main --force

echo.
echo ========================================
echo   LIMPIEZA COMPLETADA
echo ========================================
pause
