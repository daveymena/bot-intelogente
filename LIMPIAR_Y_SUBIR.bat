@echo off
echo ========================================
echo   LIMPIANDO SECRETOS Y RESUBIENDO
echo ========================================
echo.

echo [1/5] Deshaciendo ultimo commit (manteniendo cambios)...
git reset HEAD~1

echo.
echo [2/5] Eliminando archivos con secretos del staging...
git reset HEAD .env.backup
git reset HEAD .env.easypanel.optimizado
git reset HEAD .z-ai-config
git reset HEAD CREDENCIALES_REALES_LOCAL.txt
git reset HEAD VARIABLES_EASYPANEL_LISTAS.txt
git reset HEAD VARIABLES_EASYPANEL_ACTUALIZADAS.txt
git reset HEAD CAMBIOS_VARIABLES_EASYPANEL.md
git reset HEAD AGREGAR_ESTAS_VARIABLES_EASYPANEL.txt

echo.
echo [3/5] Agregando solo archivos seguros...
git add .gitignore
git add src/
git add scripts/
git add prisma/
git add public/
git add .env.example
git add *.md
git add package.json
git add tsconfig.json
git add next.config.ts
git add tailwind.config.ts

echo.
echo [4/5] Creando nuevo commit SIN secretos...
git commit -m "feat: Sistema IA mejorado + Correcciones (sin secretos)

- Groq como IA principal (ultra rapido)
- Ollama como fallback automatico
- Correccion confusion de productos
- Correccion metodos de pago duplicados
- Seleccion directa de metodo de pago
- Informacion de entrega actualizada
- Correccion imagenes incorrectas"

echo.
echo [5/5] Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo   SUBIDA COMPLETADA SIN SECRETOS
echo ========================================
echo.
pause
