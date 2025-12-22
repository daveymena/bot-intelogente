@echo off
echo ========================================
echo   SUBIENDO SOLO CODIGO (SIN DOCS VIEJAS)
echo ========================================
echo.

echo [1/4] Agregando solo archivos de codigo...
git add src/
git add scripts/*.ts
git add prisma/
git add public/
git add .gitignore
git add .env.example
git add package.json
git add tsconfig.json
git add next.config.ts
git add tailwind.config.ts
git add postcss.config.mjs

echo.
echo [2/4] Agregando solo documentacion nueva (sin secretos)...
git add GROQ_ACTIVADO_PRINCIPAL.md
git add SISTEMA_FALLBACK_TRIPLE.md
git add SOLUCION_CONFUSION_PRODUCTOS.md
git add SOLUCION_METODOS_PAGO_DUPLICADOS.md
git add SOLUCION_SELECCION_METODO_PAGO.md
git add SOLUCION_IMAGEN_INCORRECTA.md
git add INFORMACION_ENTREGA_CURSOS.md
git add RESUMEN_CAMBIOS_SESION.md
git add DESPLEGAR_AHORA.md

echo.
echo [3/4] Creando commit...
git commit -m "feat: Mejoras sistema IA y correcciones

- Groq como IA principal
- Ollama como fallback
- Correcciones de bugs
- Documentacion actualizada"

echo.
echo [4/4] Subiendo a GitHub...
git push origin main --force

echo.
echo ========================================
echo   SUBIDA COMPLETADA
echo ========================================
echo.
pause
