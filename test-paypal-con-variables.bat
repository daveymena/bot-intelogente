@echo off
echo ========================================
echo   CONFIGURANDO Y PROBANDO PAYPAL
echo ========================================
echo.

REM Configurar variables de entorno
set PAYPAL_CLIENT_ID=BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4
set PAYPAL_CLIENT_SECRET=EP5jZdzbUuHva4I8ERnbNYSHQ_BNe0niXQe91Bvf33Kl88nRKY-ivRx0_PGERS72JbjQSiMr63y9lEEL
set PAYPAL_MODE=live
set COP_TO_USD_RATE=4000

echo Variables configuradas:
echo   PAYPAL_CLIENT_ID: %PAYPAL_CLIENT_ID:~0,20%...
echo   PAYPAL_MODE: %PAYPAL_MODE%
echo   COP_TO_USD_RATE: %COP_TO_USD_RATE%
echo.
echo Ejecutando test...
echo.

npx tsx scripts/test-paypal-dinamico.ts

echo.
echo ========================================
echo   TEST COMPLETADO
echo ========================================
pause
