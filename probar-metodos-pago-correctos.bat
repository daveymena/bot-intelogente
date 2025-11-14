@echo off
echo ========================================
echo PRUEBA: Metodos de Pago Correctos
echo ========================================
echo.
echo Este script verifica que el bot envie
echo los metodos de pago del producto correcto
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

echo.
echo Ejecutando test automatizado...
echo.
npx tsx scripts/test-contexto-producto.ts

echo.
echo ========================================
echo PRUEBA COMPLETADA
echo ========================================
echo.
echo Revisa los resultados arriba.
echo.
echo Si ves "CORRECTO" en verde, todo funciona bien.
echo Si ves "ERROR" en rojo, hay un problema.
echo.
echo Para probar manualmente con WhatsApp:
echo 1. Ejecuta: npm run dev
echo 2. Conecta WhatsApp
echo 3. Envia: "tienes el curso de diseno grafico?"
echo 4. Envia: "como puedo pagar?"
echo 5. Verifica que los metodos sean del curso correcto
echo.
pause
