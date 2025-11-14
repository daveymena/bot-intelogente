@echo off
echo ========================================
echo   SUBIENDO CAMBIOS A GIT
echo ========================================
echo.

echo [1/4] Agregando todos los archivos...
git add .

echo.
echo [2/4] Creando commit...
git commit -m "feat: Sistema IA mejorado + Correcciones importantes

MEJORAS DE IA:
- Groq como IA principal (1-2s respuestas ultra rapidas)
- Ollama como fallback automatico (gratis e ilimitado)
- Triple sistema de respaldo (Groq -> Ollama -> Base Local)
- Base de conocimiento local con 158+ respuestas

CORRECCIONES DE BUGS:
- Confusion de productos corregida (mantiene contexto correcto)
- Metodos de pago duplicados solucionado
- Deteccion de despedidas mejorada (no envia info innecesaria)
- Seleccion directa de metodo de pago (respuesta breve)
- Deteccion de preguntas sobre proceso (no envia metodos)

INFORMACION DE ENTREGA:
- Google Drive y Hotmart especificados
- Proceso de entrega claro y preciso
- No inventa plataformas o metodos

ARCHIVOS NUEVOS:
- .env.example (plantilla sin API keys)
- Documentacion de soluciones
- Guia de despliegue actualizada"

echo.
echo [3/4] Subiendo a GitHub...
git push origin main

echo.
echo [4/4] Verificando...
git status

echo.
echo ========================================
echo   SUBIDA COMPLETADA
echo ========================================
echo.
echo Ahora ve a Easypanel para verificar el despliegue automatico
echo.
pause
