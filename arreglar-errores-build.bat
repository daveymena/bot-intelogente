@echo off
echo Corrigiendo errores de sintaxis...

REM Comentar temporalmente las líneas problemáticas
powershell -Command "(Get-Content 'src/lib/product-training-examples.ts') -replace 'botResponse: \"¡Perfecto! Tengo el Curso Completo de Piano Online disponible por \$ 60\.000\. # 🎹 Curso Completo de Piano Online', '// TEMP: botResponse: \"Curso de Piano disponible por $60.000\"' | Set-Content 'src/lib/product-training-examples.ts' -Encoding UTF8"

powershell -Command "(Get-Content 'src/lib/sales-flow-service.ts') -replace '/\*\*', '/**' | Set-Content 'src/lib/sales-flow-service.ts' -Encoding UTF8"

echo Errores corregidos temporalmente
echo.
echo Ahora ejecuta: construir-instalador.bat
pause
