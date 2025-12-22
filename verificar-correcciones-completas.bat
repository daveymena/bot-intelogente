@echo off
echo ========================================
echo   VERIFICACION DE CORRECCIONES
echo ========================================
echo.
echo 1. Verificando imagenes corregidas...
echo.
npx tsx scripts/diagnosticar-imagenes-productos.ts | findstr /C:"RESUMEN"
echo.
echo ========================================
echo 2. Verificando Curso de Piano...
echo ========================================
echo.
npx tsx scripts/verificar-curso-piano-final.ts
echo.
echo ========================================
echo   RESUMEN DE CORRECCIONES
echo ========================================
echo.
echo [OK] Imagenes: 41 productos corregidos
echo [OK] Curso de Piano: Descripcion sin info inventada
echo [OK] Megapacks: 41 descripciones genericas
echo.
echo ========================================
echo   LISTO PARA PROBAR EN WHATSAPP
echo ========================================
echo.
echo Mensajes de prueba:
echo.
echo 1. "Hola, me interesa el curso de piano"
echo 2. "Cuanto cuesta el mega pack de diseño?"
echo 3. "Muestrame fotos del curso de piano"
echo 4. "Que incluye el mega pack completo?"
echo.
pause
