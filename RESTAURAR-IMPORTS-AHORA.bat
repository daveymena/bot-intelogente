@echo off
echo ========================================
echo   RESTAURAR IMPORTS CRITICOS
echo ========================================
echo.
echo Este script restaura los imports que
echo el autofix de Kiro IDE elimina.
echo.
echo Imports a restaurar:
echo   - ProductScorer
echo   - DynamicProductIntelligence  
echo   - ResponseValidator
echo.
pause

npx tsx scripts/restaurar-imports-criticos.ts

echo.
echo ========================================
echo   PROCESO COMPLETADO
echo ========================================
echo.
pause
