@echo off
echo ========================================
echo 🔧 APLICAR MIGRACION: Configuracion Dashboard
echo ========================================
echo.
echo Esta migracion agrega campos para:
echo - Metodos de pago (MercadoPago, PayPal, Nequi, etc.)
echo - Informacion del negocio
echo - Configuracion de notificaciones
echo.
echo ========================================
echo PASO 1: Generar Prisma Client
echo ========================================
echo.
npx prisma generate
echo.
echo ========================================
echo PASO 2: Aplicar cambios a la base de datos
echo ========================================
echo.
npx prisma db push
echo.
echo ✅ Migracion aplicada exitosamente
echo.
echo ========================================
echo PROXIMO PASO
echo ========================================
echo.
echo Ahora puedes acceder a:
echo http://localhost:4000/dashboard/configuracion
echo.
echo Para configurar:
echo - APIs de IA (Groq, Ollama, etc.)
echo - Metodos de pago
echo - Informacion del negocio
echo - Notificaciones por email
echo.
pause
