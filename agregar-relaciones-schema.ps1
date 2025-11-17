# Script para agregar relaciones faltantes en el schema

$schemaPath = "prisma/schema.prisma"
$content = Get-Content $schemaPath -Raw

Write-Host "🔧 Agregando relaciones faltantes..." -ForegroundColor Yellow
Write-Host ""

# 1. Agregar notificationTokens al modelo User
Write-Host "1️⃣ Agregando notificationTokens a User..." -ForegroundColor Cyan

$userRelationsPattern = '(salesFlowConfig\s+SalesFlowConfig\?\s+@@map\("users"\))'
$userReplacement = 'salesFlowConfig       SalesFlowConfig?
  notificationTokens    NotificationToken[]
  
  @@map("users")'

$content = $content -replace $userRelationsPattern, $userReplacement

# 2. Agregar notificationTokens al modelo Payment
Write-Host "2️⃣ Agregando notificationTokens a Payment..." -ForegroundColor Cyan

$paymentRelationsPattern = '(user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)\s+@@map\("payments"\))'
$paymentReplacement = 'user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  notificationTokens NotificationToken[]
  
  @@map("payments")'

$content = $content -replace $paymentRelationsPattern, $paymentReplacement

# Guardar
$content | Set-Content $schemaPath -NoNewline

Write-Host ""
Write-Host "✅ Relaciones agregadas!" -ForegroundColor Green
Write-Host ""
Write-Host "Ejecutando comandos de Prisma..." -ForegroundColor Cyan
Write-Host ""

# Generar cliente
Write-Host "Generando cliente..." -ForegroundColor White
& npx prisma generate

Write-Host ""
Write-Host "Aplicando cambios a BD..." -ForegroundColor White
& npx prisma db push

Write-Host ""
Write-Host "✅ ¡Listo!" -ForegroundColor Green
Write-Host ""
