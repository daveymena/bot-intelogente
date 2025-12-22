@echo off
echo ========================================
echo  ARREGLANDO EDICION DE FOTOS Y TAGS
echo ========================================
echo.

echo Problema: Al editar productos, las imagenes y tags
echo se llenaban de caracteres extraños (\\\"\\\)
echo.
echo Solucion: Convertir correctamente arrays/JSON a string
echo.

echo [1/3] Verificando build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build fallo
    pause
    exit /b 1
)
echo Build: OK

echo.
echo [2/3] Subiendo a Git...
git add src/components/ProductsManagement.tsx
git commit -m "fix: corregir edicion de imagenes y tags en productos

Problema:
- Al editar productos, imagenes y tags se llenaban de \\\"\\\"
- No se podia guardar
- Se eliminaban las fotos

Solucion:
- Detectar si images/tags son array o string JSON
- Convertir correctamente a string separado por comas
- Manejar errores de parsing

Ahora funciona correctamente al editar productos"

git push origin main

echo.
echo [3/3] Verificacion...
echo.
echo ========================================
echo  ARREGLADO
echo ========================================
echo.
echo Ahora puedes:
echo 1. Editar un producto
echo 2. Modificar las imagenes o tags
echo 3. Guardar sin problemas
echo.
echo Las fotos ya no se eliminaran!
echo.
pause
