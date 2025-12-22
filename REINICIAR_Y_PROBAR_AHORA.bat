@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🔄 REINICIANDO SERVIDOR - BÚSQUEDA UNIVERSAL
echo ========================================
echo.

echo 📦 Cerrando puertos ocupados...
call CERRAR_PUERTOS_AHORA.bat

echo.
echo ✅ Puertos cerrados
echo.
echo 🚀 Iniciando servidor con búsqueda universal...
echo.
echo ⚠️ PRUEBAS RECOMENDADAS:
echo.
echo    1. "Mega packs de idiomas"
echo       → Debe mostrar 2 megapacks de idiomas
echo.
echo    2. "Quiero el curso de reparación de celular"
echo       → Debe mostrar Mega Pack 18
echo.
echo    3. "Estoy interesado en el curso de piano"
echo       → Debe mostrar SOLO el curso de piano
echo.
echo 📝 El sistema ahora detecta TODOS los 166 productos
echo.

npm run dev
