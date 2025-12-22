@echo off
echo ========================================
echo COMANDOS RAPIDOS PARA EASYPANEL
echo ========================================
echo.
echo Copia y pega estos comandos en la CONSOLA de Easypanel:
echo.
echo ========================================
echo 1. ACTUALIZAR CODIGO DESDE GITHUB
echo ========================================
echo.
echo cd /app
echo git pull origin main
echo.
echo ========================================
echo 2. INSTALAR DEPENDENCIAS
echo ========================================
echo.
echo npm install
echo.
echo ========================================
echo 3. REGENERAR PRISMA
echo ========================================
echo.
echo npx prisma generate
echo.
echo ========================================
echo 4. REBUILD DE NEXT.JS
echo ========================================
echo.
echo npm run build
echo.
echo ========================================
echo 5. REINICIAR SERVICIO
echo ========================================
echo.
echo pm2 restart all
echo.
echo ========================================
echo 6. VER LOGS EN TIEMPO REAL
echo ========================================
echo.
echo pm2 logs
echo.
echo ========================================
echo 7. VERIFICAR QUE LOS CAMBIOS ESTAN
echo ========================================
echo.
echo cat src/lib/ai-service.ts ^| grep "INFORMACIÓN COMPLETA"
echo.
echo ========================================
echo 8. VER ULTIMO COMMIT
echo ========================================
echo.
echo git log -1
echo.
echo ========================================
echo COMANDO TODO EN UNO (Copiar todo junto)
echo ========================================
echo.
echo cd /app ^&^& git pull origin main ^&^& npm install ^&^& npx prisma generate ^&^& npm run build ^&^& pm2 restart all
echo.
echo ========================================
pause
