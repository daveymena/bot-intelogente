@echo off
echo ========================================
echo ELIMINANDO SECRETOS DEL HISTORIAL DE GIT
echo ========================================
echo.
echo ADVERTENCIA: Esto reescribira el historial
pause

echo.
echo Paso 1: Eliminando archivos con secretos del historial...
git filter-branch -f --index-filter "git rm --cached --ignore-unmatch CAMBIOS_VARIABLES_EASYPANEL.md VARIABLES_EASYPANEL_ACTUALIZADAS.txt AGREGAR_ESTAS_VARIABLES_EASYPANEL.txt VARIABLES_EASYPANEL_LISTAS.txt RESUMEN_SESION_COMPLETA_FINAL.md VARIABLES_EASYPANEL_CORRECTAS_FINALES.txt COPIAR_PEGAR_EASYPANEL_COMPLETO.txt" --prune-empty --tag-name-filter cat -- --all

echo.
echo Paso 2: Limpiando referencias...
git for-each-ref --format="delete %%(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo Paso 3: Agregando solo el schema...
git add prisma/schema.prisma

echo.
echo Paso 4: Haciendo commit...
git commit -m "fix: postgresql schema para produccion"

echo.
echo Paso 5: Push forzado...
git push origin main --force

echo.
echo ========================================
echo LISTO! Schema subido a GitHub
echo ========================================
echo.
echo Ahora:
echo 1. Elimina la app en Easypanel
echo 2. Creala de nuevo desde GitHub
echo 3. Pega las variables de entorno
echo 4. Ejecuta: npx prisma db push
echo 5. Ejecuta: npx tsx scripts/limpiar-usuarios-excepto-davey.ts
echo.
pause
