# 🧹 Script de Limpieza WhatsApp para PowerShell
# Uso: .\limpiar-whatsapp.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LIMPIEZA DE SESION WHATSAPP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si el servidor está corriendo
Write-Host "🔍 Verificando servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/cleanup" -Method GET -ErrorAction Stop
    Write-Host "✅ Servidor corriendo" -ForegroundColor Green
    Write-Host ""
    
    # Mostrar estado actual
    Write-Host "📊 Estado actual de la sesión:" -ForegroundColor Cyan
    Write-Host "  Usuario: $($response.health.userId)" -ForegroundColor White
    Write-Host "  Estado: $($response.health.status)" -ForegroundColor White
    Write-Host "  Saludable: $(if($response.health.isHealthy){'✅ Sí'}else{'❌ No'})" -ForegroundColor $(if($response.health.isHealthy){'Green'}else{'Red'})
    
    if ($response.health.issues.Count -gt 0) {
        Write-Host "  Problemas detectados:" -ForegroundColor Red
        foreach ($issue in $response.health.issues) {
            Write-Host "    - $issue" -ForegroundColor Red
        }
    }
    Write-Host ""
    
    # Preguntar si desea limpiar
    if ($response.health.shouldCleanup -or $response.health.issues.Count -gt 0) {
        Write-Host "⚠️  Se detectaron problemas. ¿Desea limpiar la sesión? (S/N)" -ForegroundColor Yellow
        $confirm = Read-Host
        
        if ($confirm -eq 'S' -or $confirm -eq 's' -or $confirm -eq 'Y' -or $confirm -eq 'y') {
            Write-Host ""
            Write-Host "🧹 Limpiando sesión..." -ForegroundColor Yellow
            
            $body = @{
                action = "cleanup"
                force = $true
            } | ConvertTo-Json
            
            $cleanupResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/whatsapp/cleanup" -Method POST -Body $body -ContentType "application/json"
            
            if ($cleanupResponse.success) {
                Write-Host "✅ Sesión limpiada exitosamente" -ForegroundColor Green
                Write-Host ""
                Write-Host "💡 Ahora puedes intentar conectar de nuevo desde el dashboard" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Error al limpiar sesión: $($cleanupResponse.message)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Limpieza cancelada" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ La sesión está saludable, no requiere limpieza" -ForegroundColor Green
        Write-Host ""
        Write-Host "💡 Si tienes problemas para conectar:" -ForegroundColor Cyan
        Write-Host "   1. Intenta conectar desde el dashboard" -ForegroundColor White
        Write-Host "   2. Espera 2 minutos (auto-limpieza automática)" -ForegroundColor White
        Write-Host "   3. O ejecuta: .\limpiar-whatsapp.ps1 -Force" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Servidor no está corriendo o no responde" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Soluciones:" -ForegroundColor Cyan
    Write-Host "   1. Inicia el servidor: npm run dev" -ForegroundColor White
    Write-Host "   2. O ejecuta el diagnóstico offline: npx tsx scripts/test-session-cleanup.ts" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PROCESO COMPLETADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
