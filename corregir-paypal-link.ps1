# Script para corregir el link de PayPal

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CORRIGIENDO LINK DE PAYPAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Hacer backup
Write-Host "1. Creando backup..." -ForegroundColor Yellow
Copy-Item "src/lib/payment-link-generator.ts" "src/lib/payment-link-generator.ts.backup" -Force
Write-Host "   ✓ Backup creado" -ForegroundColor Green
Write-Host ""

# 2. Leer el archivo
Write-Host "2. Leyendo archivo..." -ForegroundColor Yellow
$content = Get-Content "src/lib/payment-link-generator.ts" -Raw

# 3. Hacer los reemplazos
Write-Host "3. Aplicando correcciones..." -ForegroundColor Yellow

# Reemplazo 1: Cambiar prioridad (PayPal.me primero)
$content = $content -replace 'OPCIÓN 1: Email de PayPal \(más confiable y siempre funciona\)', 'OPCIÓN 1: PayPal.me (RECOMENDADO - más confiable)'

# Reemplazo 2: Eliminar el link incorrecto de email
$content = $content -replace 'const paypalLink = `https://www\.paypal\.com/ncp/payment/\$\{encodeURIComponent\(paypalEmail\)\}`;', '// Email solo se usa en instrucciones, no genera link'

# Reemplazo 3: Cambiar el return del email a null
$content = $content -replace "console\.log\(`\[PaymentLink\] ✅ Link PayPal generado \(email\): \$\{paypalLink\}`\);[\s\S]*?return paypalLink;[\s\S]*?}[\s\S]*?// OPCIÓN 2: PayPal\.me", @"
console.log(``[PaymentLink] ⚠️ Solo email disponible (no PayPal.me)``);
        console.log(``[PaymentLink] 📧 Email: `${paypalEmail}``);
        console.log(``[PaymentLink] 💡 Recomendación: Configura PAYPAL_ME_USERNAME para links directos``);
        
        // No retornar link, solo el email se usará en las instrucciones
        return null;
      }
      
      // OPCIÓN 2: PayPal.me
"@

# Reemplazo 4: Corregir formato de PayPal.me (quitar USD del final)
$content = $content -replace 'const paypalLink = `https://www\.paypal\.me/\$\{paypalUsername\}/\$\{priceUSD\}USD`;', 'const paypalLink = `https://www.paypal.me/${paypalUsername}/${priceUSD}`;'

# Reemplazo 5: Actualizar logs de PayPal.me
$content = $content -replace "console\.log\(`\[PaymentLink\] ✅ Link PayPal\.me generado: \$\{paypalLink\}`\);", @"
console.log(``[PaymentLink] ✅ Link PayPal.me generado: `${paypalLink}``);
        console.log(``[PaymentLink] 👤 Username: `${paypalUsername}``);
        console.log(``[PaymentLink] 💰 Monto: `${priceUSD} USD``);
"@

# Reemplazo 6: Actualizar mensaje de no configurado
$content = $content -replace "console\.log\('\[PaymentLink\] ⚠️ PayPal no configurado \(falta PAYPAL_EMAIL o PAYPAL_ME_USERNAME\)'\);", @"
console.log('[PaymentLink] ⚠️ PayPal no configurado');
      console.log('[PaymentLink] 💡 Configura PAYPAL_ME_USERNAME o PAYPAL_EMAIL en .env');
"@

Write-Host "   ✓ Correcciones aplicadas" -ForegroundColor Green
Write-Host ""

# 4. Guardar el archivo
Write-Host "4. Guardando archivo corregido..." -ForegroundColor Yellow
$content | Set-Content "src/lib/payment-link-generator.ts" -Encoding UTF8
Write-Host "   ✓ Archivo guardado" -ForegroundColor Green
Write-Host ""

# 5. Mostrar resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CORRECCIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cambios realizados:" -ForegroundColor Yellow
Write-Host "  ✓ Prioridad cambiada: PayPal.me primero" -ForegroundColor Green
Write-Host "  ✓ Link incorrecto eliminado (ncp/payment)" -ForegroundColor Green
Write-Host "  ✓ Formato PayPal.me corregido" -ForegroundColor Green
Write-Host "  ✓ Logs mejorados" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Configura PAYPAL_ME_USERNAME en .env" -ForegroundColor White
Write-Host "  2. Reinicia el bot: npm run dev" -ForegroundColor White
Write-Host "  3. Prueba en WhatsApp" -ForegroundColor White
Write-Host ""
Write-Host "Backup guardado en:" -ForegroundColor Yellow
Write-Host "  src/lib/payment-link-generator.ts.backup" -ForegroundColor White
Write-Host ""
Write-Host "Para revertir cambios:" -ForegroundColor Yellow
Write-Host "  Copy-Item src/lib/payment-link-generator.ts.backup src/lib/payment-link-generator.ts" -ForegroundColor White
Write-Host ""
