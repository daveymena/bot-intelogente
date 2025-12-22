@echo off
echo ========================================
echo  VERIFICACION DEL SISTEMA SCRAPER
echo ========================================
echo.

echo [1/5] Verificando archivos TypeScript...
if exist "scripts\scraper-fotos-todas-tiendas.ts" (
    echo   [OK] scraper-fotos-todas-tiendas.ts
) else (
    echo   [ERROR] scraper-fotos-todas-tiendas.ts NO ENCONTRADO
)

if exist "scripts\actualizar-fotos-productos.ts" (
    echo   [OK] actualizar-fotos-productos.ts
) else (
    echo   [ERROR] actualizar-fotos-productos.ts NO ENCONTRADO
)

if exist "scripts\verificar-productos-sin-fotos.ts" (
    echo   [OK] verificar-productos-sin-fotos.ts
) else (
    echo   [ERROR] verificar-productos-sin-fotos.ts NO ENCONTRADO
)

if exist "scripts\extraer-fotos-url-directa.ts" (
    echo   [OK] extraer-fotos-url-directa.ts
) else (
    echo   [ERROR] extraer-fotos-url-directa.ts NO ENCONTRADO
)

echo.
echo [2/5] Verificando archivos Batch...
if exist "ver-productos-sin-fotos.bat" (
    echo   [OK] ver-productos-sin-fotos.bat
) else (
    echo   [ERROR] ver-productos-sin-fotos.bat NO ENCONTRADO
)

if exist "actualizar-fotos-sin-imagenes.bat" (
    echo   [OK] actualizar-fotos-sin-imagenes.bat
) else (
    echo   [ERROR] actualizar-fotos-sin-imagenes.bat NO ENCONTRADO
)

if exist "actualizar-fotos-pocas-imagenes.bat" (
    echo   [OK] actualizar-fotos-pocas-imagenes.bat
) else (
    echo   [ERROR] actualizar-fotos-pocas-imagenes.bat NO ENCONTRADO
)

if exist "actualizar-todas-fotos.bat" (
    echo   [OK] actualizar-todas-fotos.bat
) else (
    echo   [ERROR] actualizar-todas-fotos.bat NO ENCONTRADO
)

echo.
echo [3/5] Verificando documentacion...
if exist "README_SCRAPER_FOTOS.md" (
    echo   [OK] README_SCRAPER_FOTOS.md
) else (
    echo   [ERROR] README_SCRAPER_FOTOS.md NO ENCONTRADO
)

if exist "GUIA_ACTUALIZAR_FOTOS_PRODUCTOS.md" (
    echo   [OK] GUIA_ACTUALIZAR_FOTOS_PRODUCTOS.md
) else (
    echo   [ERROR] GUIA_ACTUALIZAR_FOTOS_PRODUCTOS.md NO ENCONTRADO
)

if exist "EJEMPLOS_USO_SCRAPER_FOTOS.md" (
    echo   [OK] EJEMPLOS_USO_SCRAPER_FOTOS.md
) else (
    echo   [ERROR] EJEMPLOS_USO_SCRAPER_FOTOS.md NO ENCONTRADO
)

echo.
echo [4/5] Verificando dependencias...
echo   Verificando Puppeteer...
npm list puppeteer >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Puppeteer instalado
) else (
    echo   [ADVERTENCIA] Puppeteer no encontrado
    echo   Ejecuta: npm install
)

echo   Verificando Prisma...
npm list @prisma/client >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Prisma instalado
) else (
    echo   [ADVERTENCIA] Prisma no encontrado
    echo   Ejecuta: npm install
)

echo.
echo [5/5] Verificando package.json...
findstr /C:"fotos:verificar" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Scripts npm agregados
) else (
    echo   [ADVERTENCIA] Scripts npm no encontrados
)

echo.
echo ========================================
echo  VERIFICACION COMPLETADA
echo ========================================
echo.
echo Para empezar, ejecuta:
echo   ver-productos-sin-fotos.bat
echo.
echo O lee la documentacion:
echo   README_SCRAPER_FOTOS.md
echo.
pause
