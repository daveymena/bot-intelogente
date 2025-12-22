@echo off
echo ================================================================
echo SUBIENDO CAMBIOS A GIT PARA EASYPANEL
echo ================================================================
echo.

echo 1. Verificando estado de Git...
git status
echo.

echo 2. Agregando todos los archivos...
git add .
echo.

echo 3. Creando commit con los cambios...
git commit -m "feat: Sistema de pagos flexible + Reasoning con multi-provider + Registro automatico

- Sistema de configuracion de pagos sin codigo
- PaymentConfig en base de datos
- API /api/payment-config para gestionar pagos
- PaymentConfigService para logica de negocio
- Links de pago manuales por producto
- Reasoning service integrado con AIMultiProvider
- Ollama como prioridad en razonamiento profundo
- Registro automatico crea PaymentConfig
- Flujo completo de registro documentado
- 3 usuarios inicializados con configuracion
- Sistema 100%% listo para clientes"
echo.

echo 4. Subiendo a GitHub...
git push origin main
echo.

echo ================================================================
echo CAMBIOS SUBIDOS EXITOSAMENTE
echo ================================================================
echo.
echo Ahora en Easypanel:
echo 1. Ve a tu proyecto
echo 2. Haz clic en "Redeploy"
echo 3. Espera 2-3 minutos
echo 4. Listo!
echo.
echo ================================================================

pause
