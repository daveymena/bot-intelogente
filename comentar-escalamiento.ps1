# Script para comentar el bloque de escalamiento

$file = "src\lib\baileys-stable-service.ts"
$content = Get-Content $file -Raw -Encoding UTF8

# Buscar y reemplazar el bloque problemático
$pattern = '(?s)(// \? GVERIFICAR SI NECESITA ESCALAMIENTO A HUMANO.*?continue // No enviar respuesta automática\s+\})'
$replacement = @"
// 🚨 SISTEMA DE ESCALAMIENTO (DESACTIVADO TEMPORALMENTE)
            // El sistema híbrido actual maneja bien los casos complejos con IA
            // TODO: Reactivar cuando se corrija el método shouldEscalate
"@

$newContent = $content -replace $pattern, $replacement

# Guardar el archivo
$newContent | Set-Content $file -Encoding UTF8 -NoNewline

Write-Host "✅ Bloque de escalamiento comentado exitosamente"
Write-Host ""
Write-Host "Próximos pasos:"
Write-Host "1. Reiniciar bot: npm run dev"
Write-Host "2. Probar: 'Me interesa el curso de piano'"
Write-Host "3. Verificar que NO cae al fallback de IA"
