# Script para eliminar secciones corruptas del archivo de entrenamiento

$file = "src/lib/product-training-examples.ts"

Write-Host "Leyendo archivo..." -ForegroundColor Yellow
$lines = Get-Content $file -Encoding UTF8

Write-Host "Buscando líneas con caracteres corruptos..." -ForegroundColor Yellow

# Filtrar líneas que contengan caracteres corruptos
$cleanLines = $lines | Where-Object {
    $_ -notmatch '�' -and 
    $_ -notmatch 'ðŸ' -and
    $_ -notmatch 'Â' -and
    $_ -notmatch 'ï¿½'
}

Write-Host "Guardando archivo limpio..." -ForegroundColor Yellow

# Guardar con UTF-8 sin BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($file, $cleanLines, $utf8NoBom)

Write-Host "✅ Archivo limpiado" -ForegroundColor Green
Write-Host "Líneas originales: $($lines.Count)" -ForegroundColor Cyan
Write-Host "Líneas limpias: $($cleanLines.Count)" -ForegroundColor Cyan
Write-Host "Líneas eliminadas: $($lines.Count - $cleanLines.Count)" -ForegroundColor Yellow
