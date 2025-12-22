@echo off
echo ========================================
echo   SISTEMA DE NOTIFICACIONES
echo ========================================
echo.

echo 1. Migrando base de datos...
echo.
call npx prisma db push

echo.
echo 2. Ejecutando pruebas...
echo.
call npx tsx scripts/test-notification-system.ts

echo.
echo ========================================
echo   SISTEMA LISTO
echo ========================================
echo.
echo Documentacion: SISTEMA_NOTIFICACIONES_COMPLETO.md
echo Resumen: NOTIFICACIONES_LISTO.txt
echo.
echo Para usar en tu codigo:
echo import { NotificationService } from '@/lib/notification-service';
echo.
pause
