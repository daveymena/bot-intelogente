@echo off
echo ========================================
echo VERIFICADOR DE SECRETOS EN GIT
echo ========================================
echo.

echo Buscando posibles secretos en archivos staged...
echo.

echo [Verificando API Keys...]
git diff --cached | findstr /I "GROQ_API_KEY OPENAI_API_KEY CLAUDE_API_KEY GEMINI_API_KEY" >nul
if %errorlevel%==0 (
    echo ✗ ADVERTENCIA: Se encontraron API Keys en los cambios
    echo   Por favor revisa los archivos antes de hacer commit
    pause
    exit /b 1
) else (
    echo ✓ No se encontraron API Keys expuestas
)

echo.
echo [Verificando tokens de pago...]
git diff --cached | findstr /I "MERCADOPAGO_ACCESS_TOKEN PAYPAL_CLIENT_SECRET STRIPE_SECRET" >nul
if %errorlevel%==0 (
    echo ✗ ADVERTENCIA: Se encontraron tokens de pago en los cambios
    echo   Por favor revisa los archivos antes de hacer commit
    pause
    exit /b 1
) else (
    echo ✓ No se encontraron tokens de pago expuestos
)

echo.
echo [Verificando DATABASE_URL...]
git diff --cached | findstr /I "DATABASE_URL postgres://" >nul
if %errorlevel%==0 (
    echo ✗ ADVERTENCIA: Se encontró DATABASE_URL en los cambios
    echo   Por favor revisa los archivos antes de hacer commit
    pause
    exit /b 1
) else (
    echo ✓ No se encontró DATABASE_URL expuesta
)

echo.
echo [Verificando JWT_SECRET...]
git diff --cached | findstr /I "JWT_SECRET" >nul
if %errorlevel%==0 (
    echo ✗ ADVERTENCIA: Se encontró JWT_SECRET en los cambios
    echo   Por favor revisa los archivos antes de hacer commit
    pause
    exit /b 1
) else (
    echo ✓ No se encontró JWT_SECRET expuesto
)

echo.
echo ========================================
echo ✓ VERIFICACION COMPLETADA
echo   Es seguro continuar con el commit
echo ========================================
echo.
pause
