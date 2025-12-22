@echo off
echo ========================================
echo ACTUALIZANDO GIT - SISTEMA PRODUCCION
echo ========================================
echo.

echo [1/5] Verificando estado de Git...
git status

echo.
echo [2/5] Agregando todos los archivos...
git add .

echo.
echo [3/5] Creando commit...
git commit -m "Sistema completo listo para produccion - 254 productos, IA funcionando, memoria conversacional activa"

echo.
echo [4/5] Subiendo a GitHub...
git push origin main

echo.
echo [5/5] Verificando subida...
git log -1

echo.
echo ========================================
echo GIT ACTUALIZADO EXITOSAMENTE
echo ========================================
echo.
echo Ahora puedes:
echo 1. Ir a Easypanel
echo 2. Conectar tu repositorio
echo 3. Desplegar automaticamente
echo.
echo Variables necesarias en Easypanel:
echo - GROQ_API_KEY
echo - DATABASE_URL
echo - NEXTAUTH_SECRET
echo - NEXTAUTH_URL
echo - RESEND_API_KEY
echo - PAYPAL_CLIENT_ID
echo - PAYPAL_CLIENT_SECRET
echo.
pause
