# Script para corregir error de sintaxis en baileys-stable-service.ts

Write-Host "🔧 Corrigiendo error de sintaxis..." -ForegroundColor Yellow

$file = "src/lib/baileys-stable-service.ts"
$content = Get-Content $file -Raw

# Buscar y reemplazar el código incorrecto
$oldCode = @"
                // Asegurar que photos es un array
                let photosArray = aiResponse.photos
                if (typeof photosArray === 'string') {
                  try {
                    photosArray = JSON.parse(photosArray)
                  } catch (e) {
                    photosArray = [photosArray]
                  aiResponse.message // El mensaje completo va como caption de la foto
                )
"@

$newCode = @"
                // Asegurar que photos es un array
                let photosArray = aiResponse.photos
                if (typeof photosArray === 'string') {
                  try {
                    photosArray = JSON.parse(photosArray)
                  } catch (e) {
                    photosArray = [photosArray]
                  }
                }
                
                // Validar que el array no esté vacío y tenga URLs válidas
                if (!Array.isArray(photosArray) || photosArray.length === 0) {
                  console.log(`[Baileys] ⚠️ No hay fotos válidas, enviando solo texto`)
                  throw new Error('No hay fotos válidas')
                }
                
                // Enviar PRIMERA foto con el mensaje completo como caption
                const firstPhoto = photosArray[0]
                
                console.log(`[Baileys] 📤 Enviando foto principal: ${firstPhoto}`)
                
                const imageData = await MediaService.prepareImageMessage(
                  firstPhoto,
                  aiResponse.message // El mensaje completo va como caption de la foto
                )
"@

$content = $content -replace [regex]::Escape($oldCode), $newCode

Set-Content $file $content -NoNewline

Write-Host "✅ Archivo corregido" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora ejecuta: npm run dev" -ForegroundColor Cyan
