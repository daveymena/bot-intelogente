# Script para corregir caracteres UTF-8 corruptos en product-training-examples.ts

$file = "src/lib/product-training-examples.ts"
$content = Get-Content $file -Raw -Encoding UTF8

Write-Host "Corrigiendo caracteres UTF-8..." -ForegroundColor Yellow

# Reemplazos específicos en orden
$content = $content -replace 'qu�', 'qué'
$content = $content -replace 'caracter�sticas', 'características'
$content = $content -replace 'env�as', 'envías'
$content = $content -replace 'env�o', 'envío'
$content = $content -replace 'elecci�n', 'elección'
$content = $content -replace 'm�todos', 'métodos'
$content = $content -replace 'gustar�a', 'gustaría'
$content = $content -replace 'informaci�n', 'información'
$content = $content -replace 'preocupaci�n', 'preocupación'
$content = $content -replace 'est�', 'está'
$content = $content -replace 'inversi�n', 'inversión'
$content = $content -replace 'econ�micas', 'económicas'
$content = $content -replace 'Gastronom�a', 'Gastronomía'
$content = $content -replace 't�cnicas', 'técnicas'
$content = $content -replace 'Reparaci�n', 'Reparación'
$content = $content -replace 'tel�fonos', 'teléfonos'
$content = $content -replace 'T�cnicas', 'Técnicas'
$content = $content -replace 'm�viles', 'móviles'
$content = $content -replace 'Colecci�n', 'Colección'
$content = $content -replace 'sublimaci�n', 'sublimación'
$content = $content -replace 'recomi�ndame', 'recomiéndame'
$content = $content -replace 'Dise�o', 'Diseño'
$content = $content -replace 'Gr�fico', 'Gráfico'
$content = $content -replace 'Programaci�n', 'Programación'
$content = $content -replace 'cu�nto', 'cuánto'
$content = $content -replace 'Automatizaci�n', 'Automatización'
$content = $content -replace 'edici�n', 'edición'
$content = $content -replace '\$�', '$'
$content = $content -replace '\$ �', '$ '
$content = $content -replace '\?\?', '📸'
$content = $content -replace '# \?\?', '#'

# Guardar con codificación UTF-8 sin BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($file, $content, $utf8NoBom)

Write-Host "✅ Archivo corregido: $file" -ForegroundColor Green
