@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🧪 PRUEBA RÁPIDA: MEGAPACKS DE IDIOMAS
echo ========================================
echo.

echo 1️⃣ Verificando productos en BD...
echo.
node ver-todos-productos-ahora.js | findstr /C:"Mega Pack 03" /C:"Mega Pack 08"
echo.

echo 2️⃣ Contando total de productos...
echo.
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.product.count().then(count => { console.log('📦 Total de productos:', count); prisma.$disconnect(); });"
echo.

echo 3️⃣ Verificando detección específica...
echo.
node test-deteccion-especifica-completo.js
echo.

echo ========================================
echo ✅ VERIFICACIÓN COMPLETADA
echo ========================================
echo.
echo 📝 AHORA REINICIA EL SERVIDOR:
echo    REINICIAR_Y_PROBAR_BUSQUEDA.bat
echo.
echo 📱 LUEGO PRUEBA EN WHATSAPP:
echo    "Mega packs de idiomas"
echo.

pause
