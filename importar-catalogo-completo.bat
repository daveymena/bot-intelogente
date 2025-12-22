@echo off
echo ========================================
echo   IMPORTAR CATALOGO COMPLETO
echo ========================================
echo.
echo Este script importa el catalogo completo
echo de productos desde productos-completos.json
echo.
echo Incluye:
echo - 40 Mega Packs digitales
echo - Laptops ASUS, HP, Lenovo
echo - Componentes (RAM, SSD)
echo - Accesorios (Morrales, camaras)
echo - Y mucho mas...
echo.
echo ========================================
echo.

npx tsx scripts/import-productos-completos.ts

echo.
echo ========================================
echo.
echo Los productos ya estan disponibles!
echo Ve al dashboard para verlos.
echo.
pause
