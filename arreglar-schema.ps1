# Script para eliminar modelos Payment y PaymentStatus duplicados

$schemaPath = "prisma/schema.prisma"
$content = Get-Content $schemaPath -Raw

Write-Host "🔧 Arreglando schema de Prisma..." -ForegroundColor Yellow
Write-Host ""

# Buscar la posición del segundo modelo Payment (el que agregamos)
$pattern = '// 💳 Modelo de Pagos Mejorado[\s\S]*?(?=\n(?:model |enum |$))'

if ($content -match $pattern) {
    Write-Host "✅ Encontrado modelo Payment duplicado" -ForegroundColor Green
    $content = $content -replace $pattern, ''
} else {
    Write-Host "⚠️  No se encontró el patrón del modelo Payment duplicado" -ForegroundColor Yellow
}

# Buscar y eliminar el segundo enum PaymentStatus
$enumPattern = '// Enum para estado de pagos\s*enum PaymentStatus \{[^}]*\}'

# Contar cuántas veces aparece
$matches = [regex]::Matches($content, $enumPattern)
Write-Host "📊 Encontrados $($matches.Count) enums PaymentStatus" -ForegroundColor Cyan

if ($matches.Count -gt 1) {
    Write-Host "✅ Eliminando enum PaymentStatus duplicado" -ForegroundColor Green
    # Eliminar solo la última aparición
    $lastMatch = $matches[$matches.Count - 1]
    $content = $content.Remove($lastMatch.Index, $lastMatch.Length)
}

# Guardar el archivo
$content | Set-Content $schemaPath -NoNewline

Write-Host ""
Write-Host "✅ Schema arreglado!" -ForegroundColor Green
Write-Host ""
Write-Host "Ejecuta ahora:" -ForegroundColor Cyan
Write-Host "  npx prisma generate" -ForegroundColor White
Write-Host "  npx prisma db push" -ForegroundColor White
Write-Host ""
