# Script final para comentar el escalamiento

$file = "src\lib\baileys-stable-service.ts"
$lines = Get-Content $file

$output = @()
$skip = $false
$skipCount = 0

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Detectar inicio del bloque problemático
    if ($line -match "GVERIFICAR SI NECESITA ESCALAMIENTO") {
        $output += "            // 🚨 SISTEMA DE ESCALAMIENTO (DESACTIVADO TEMPORALMENTE)"
        $output += "            // El sistema híbrido actual maneja bien los casos complejos con IA"
        $output += "            // TODO: Reactivar cuando se corrija el método shouldEscalate"
        $output += ""
        $skip = $true
        continue
    }
    
    # Detectar fin del bloque
    if ($skip -and $line -match "continue // No enviar respuesta automática") {
        $skip = $false
        continue
    }
    
    # Si no estamos saltando, agregar la línea
    if (-not $skip) {
        $output += $line
    }
}

# Guardar
$output | Set-Content $file -Encoding UTF8

Write-Host "✅ CORRECCIÓN APLICADA"
Write-Host ""
Write-Host "Reinicia el bot: npm run dev"
