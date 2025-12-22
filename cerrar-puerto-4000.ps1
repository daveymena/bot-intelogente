# 🔌 Script para cerrar puerto 4000 en PowerShell

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CERRANDO PUERTO 4000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Buscando procesos en puerto 4000..." -ForegroundColor Yellow

try {
    # Buscar procesos usando el puerto 4000
    $connections = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
    
    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            
            if ($process) {
                Write-Host "📦 Proceso encontrado: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
                Write-Host "🔪 Cerrando proceso..." -ForegroundColor Red
                
                Stop-Process -Id $processId -Force
                
                Write-Host "✅ Proceso cerrado exitosamente" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "✅ No hay procesos usando el puerto 4000" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Intentando método alternativo..." -ForegroundColor Yellow
    
    # Método alternativo usando netstat
    $netstatOutput = netstat -ano | Select-String ":4000"
    
    if ($netstatOutput) {
        foreach ($line in $netstatOutput) {
            $parts = $line -split '\s+'
            $pid = $parts[-1]
            
            if ($pid -match '^\d+$') {
                Write-Host "📦 Proceso encontrado (PID: $pid)" -ForegroundColor Yellow
                Write-Host "🔪 Cerrando proceso..." -ForegroundColor Red
                
                taskkill /F /PID $pid 2>$null
                
                Write-Host "✅ Proceso cerrado" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "✅ No hay procesos usando el puerto 4000" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PUERTO 4000 LIBERADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Ahora puedes ejecutar: npm run dev" -ForegroundColor Cyan
Write-Host ""
