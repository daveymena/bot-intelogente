# Script para corregir codificación UTF-8 en baileys-stable-service.ts

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CORRIGIENDO CODIFICACION UTF-8" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$archivo = "src/lib/baileys-stable-service.ts"

Write-Host "Cerrando procesos de Node.js..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Leyendo archivo..." -ForegroundColor Yellow
$contenido = Get-Content $archivo -Raw -Encoding UTF8

Write-Host "Guardando con codificación UTF-8 correcta..." -ForegroundColor Yellow
[System.IO.File]::WriteAllText((Resolve-Path $archivo), $contenido, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "✅ Archivo corregido exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora ejecuta: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

pause
