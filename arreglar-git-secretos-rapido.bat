@echo off
echo ========================================
echo ARREGLANDO GIT - ELIMINANDO SECRETOS
echo ========================================
echo.

echo Paso 1: Eliminando archivos con secretos del commit...
git reset HEAD CAMBIOS_VARIABLES_EASYPANEL.md
git reset HEAD VARIABLES_EASYPANEL_ACTUALIZADAS.txt
git reset HEAD AGREGAR_ESTAS_VARIABLES_EASYPANEL.txt
git reset HEAD VARIABLES_EASYPANEL_LISTAS.txt
git reset HEAD RESUMEN_SESION_COMPLETA_FINAL.md
git reset HEAD VARIABLES_EASYPANEL_CORRECTAS_FINALES.txt
git reset HEAD COPIAR_PEGAR_EASYPANEL_COMPLETO.txt

echo.
echo Paso 2: Agregando solo el schema.prisma...
git add prisma/schema.prisma

echo.
echo Paso 3: Haciendo commit solo del schema...
git commit -m "fix: cambiar schema a postgresql para produccion"

echo.
echo Paso 4: Haciendo push...
git push

echo.
echo ========================================
echo LISTO! El schema se subio sin secretos
echo ========================================
echo.
echo Ahora ve a Easypanel y:
echo 1. Espera que se redespliegue (2-3 min)
echo 2. Ejecuta: npx prisma db push
echo 3. Ejecuta: npx tsx scripts/limpiar-usuarios-excepto-davey.ts
echo.
pause
