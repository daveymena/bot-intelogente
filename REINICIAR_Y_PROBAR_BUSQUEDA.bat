@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🔄 REINICIANDO SERVIDOR
echo ========================================
echo.

echo 📦 Cerrando puertos ocupados...
call CERRAR_PUERTOS_AHORA.bat

echo.
echo ✅ Puertos cerrados
echo.
echo 🚀 Iniciando servidor con cambios aplicados...
echo.
echo ⚠️ IMPORTANTE:
echo    1. El servidor se iniciará en modo desarrollo
echo    2. Prueba en WhatsApp: "Estoy interesado en el curso de piano"
echo    3. Debe mostrar SOLO el curso de piano
echo.
echo 📝 Para ver logs detallados, revisa la consola
echo.

npm run dev
