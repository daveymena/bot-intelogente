# Test Simple de Ollama en Easypanel
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'TEST OLLAMA EASYPANEL' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

$ollamaUrl = 'https://davey-ollama.mapf5v.easypanel.host'

# Test 1: Verificar modelos disponibles
Write-Host '[1/3] Verificando modelos disponibles...' -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$ollamaUrl/api/tags" -Method Get
    Write-Host '✓ Modelos encontrados:' -ForegroundColor Green
    foreach ($model in $response.models) {
        Write-Host "  - $($model.name) ($($model.details.parameter_size))" -ForegroundColor White
    }
} catch {
    Write-Host '✗ Error al conectar con Ollama' -ForegroundColor Red
    exit 1
}

Write-Host ''

# Test 2: Probar llama3
Write-Host '[2/3] Probando llama3:latest...' -ForegroundColor Yellow
$body = @{
    model = 'llama3:latest'
    messages = @(
        @{
            role = 'system'
            content = 'Eres un asistente de ventas experto. Respondes en español de forma clara y concisa.'
        },
        @{
            role = 'user'
            content = 'Hola, necesito una laptop para diseño gráfico'
        }
    )
    stream = $false
    options = @{
        temperature = 0.7
        num_predict = 200
    }
} | ConvertTo-Json -Depth 10

try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "$ollamaUrl/api/chat" -Method Post -Body $body -ContentType 'application/json'
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "✓ Respuesta recibida en $([math]::Round($duration, 2))s" -ForegroundColor Green
    Write-Host ''
    Write-Host 'Respuesta:' -ForegroundColor Cyan
    Write-Host $response.message.content -ForegroundColor White
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ''
Write-Host ''

# Test 3: Probar mistral
Write-Host '[3/3] Probando mistral:latest...' -ForegroundColor Yellow
$body = @{
    model = 'mistral:latest'
    messages = @(
        @{
            role = 'system'
            content = 'Eres un asistente de ventas experto. Respondes en español de forma clara y concisa.'
        },
        @{
            role = 'user'
            content = 'Hola, necesito una laptop para diseño gráfico'
        }
    )
    stream = $false
    options = @{
        temperature = 0.7
        num_predict = 200
    }
} | ConvertTo-Json -Depth 10

try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "$ollamaUrl/api/chat" -Method Post -Body $body -ContentType 'application/json'
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "✓ Respuesta recibida en $([math]::Round($duration, 2))s" -ForegroundColor Green
    Write-Host ''
    Write-Host 'Respuesta:' -ForegroundColor Cyan
    Write-Host $response.message.content -ForegroundColor White
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ''
Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'TEST COMPLETADO' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Compara las respuestas de ambos modelos' -ForegroundColor Yellow
Write-Host 'y decide cual prefieres usar' -ForegroundColor Yellow
Write-Host ''
