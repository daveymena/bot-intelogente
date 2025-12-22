@echo off
echo ========================================
echo CONFIGURAR GIT PARA GITHUB
echo ========================================
echo.
echo Tu usuario actual: daveymena
echo Tu email: daveymena16@gmail.com
echo.
echo IMPORTANTE: GitHub ya NO acepta contraseñas
echo Necesitas un Personal Access Token (PAT)
echo.
echo ========================================
echo COMO OBTENER TU TOKEN:
echo ========================================
echo.
echo 1. Ve a: https://github.com/settings/tokens
echo 2. Click en "Generate new token (classic)"
echo 3. Nombre: "Bot Inteligente"
echo 4. Selecciona: repo (todos los permisos)
echo 5. Click en "Generate token"
echo 6. COPIA el token (solo se muestra una vez)
echo.
echo ========================================
echo.
pause

echo.
echo Configurando Git...
git config --global user.name "daveymena"
git config --global user.email "daveymena16@gmail.com"

echo.
echo ✓ Usuario configurado
echo.
echo ========================================
echo AHORA INTENTA SUBIR:
echo ========================================
echo.
echo Cuando Git te pida credenciales:
echo - Username: daveymena
echo - Password: [PEGA TU TOKEN AQUI]
echo.
echo O ejecuta:
echo   subir-sin-trading-bot-rapido.bat
echo.
pause
