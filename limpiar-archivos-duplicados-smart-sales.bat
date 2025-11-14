@echo off
echo ====================================
echo LIMPIEZA DE ARCHIVOS DUPLICADOS
echo Smart Sales Bot
echo ====================================
echo.

cd C:\davey\smart-sales

echo Eliminando cache de Next.js...
if exist .next rmdir /s /q .next
echo ✓ Cache eliminado

echo.
echo Buscando archivos duplicados...

if exist "src\app\producto\[id]\page-premium.tsx" (
    del "src\app\producto\[id]\page-premium.tsx"
    echo ✓ Eliminado: page-premium.tsx
)

if exist "src\app\tienda\page-backup.tsx" (
    del "src\app\tienda\page-backup.tsx"
    echo ✓ Eliminado: page-backup.tsx
)

if exist "src\app\tienda\page-moderna.tsx" (
    del "src\app\tienda\page-moderna.tsx"
    echo ✓ Eliminado: page-moderna.tsx
)

if exist "src\app\tienda\page-old.tsx" (
    del "src\app\tienda\page-old.tsx"
    echo ✓ Eliminado: page-old.tsx
)

if exist "src\app\tienda\checkout\page-mejorado.tsx" (
    del "src\app\tienda\checkout\page-mejorado.tsx"
    echo ✓ Eliminado: page-mejorado.tsx
)

echo.
echo ====================================
echo ✅ LIMPIEZA COMPLETADA
echo ====================================
echo.
echo Ahora puedes ejecutar: npm run dev
echo.
pause
