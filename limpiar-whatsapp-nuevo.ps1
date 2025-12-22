# Script de Limpieza WhatsApp
# Uso: .\limpiar-whatsapp-nuevo.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LIMPIEZA DE SESION WHATSAPP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cerrando procesos de Node.js..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Limpiando archivos de sesion..." -ForegroundColor Yellow

$sessionDir = "auth_sessions"
if (Test-Path $sessionDir) {
    Remove-Item -Path $sessionDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Sesiones eliminadas" -ForegroundColor Green
} else {
    Write-Host "⚠️  No hay sesiones para limpiar" -ForegroundColor Yellow
}

$cacheDir = ".wwebjs_cache"
if (Test-Path $cacheDir) {
    Remove-Item -Path $cacheDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cache eliminado" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Ahora puedes:" -ForegroundColor Cyan
Write-Host "   1. Iniciar el servidor: npm run dev" -ForegroundColor White
Write-Host "   2. Conectar WhatsApp desde el dashboard" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

pause
