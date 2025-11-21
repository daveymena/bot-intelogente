@echo off
echo ========================================
echo   Corrigiendo Puerto 3000 a 4000
echo ========================================
echo.

echo Cambiando localhost:3000 a localhost:4000 en todos los archivos...
echo.

powershell -Command "(Get-ChildItem -Path 'src' -Recurse -Include *.ts,*.tsx) | ForEach-Object { $content = Get-Content $_.FullName -Raw -Encoding UTF8; if ($content -match 'localhost:3000') { $content = $content -replace 'localhost:3000', 'localhost:4000'; Set-Content $_.FullName -Value $content -Encoding UTF8; Write-Host \"Actualizado: $($_.FullName)\" } }"

echo.
echo ========================================
echo   Cambios Completados
echo ========================================
echo.
echo Todos los archivos actualizados de puerto 3000 a 4000
echo.

pause
