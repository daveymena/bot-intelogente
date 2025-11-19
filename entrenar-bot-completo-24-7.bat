@echo off
echo ========================================
echo   ENTRENAMIENTO COMPLETO 24/7
echo   Base de Conocimientos Completa
echo ========================================
echo.
echo Este proceso entrenara el bot con TODOS los productos
echo Generara una base de conocimientos completa
echo.
echo Flujos cubiertos:
echo - Productos Digitales (Cursos, Megapacks)
echo - Productos Fisicos (Tecnologia, Hogar)
echo - Dropshipping (Envio a domicilio)
echo - Servicios (Reparacion de equipos)
echo.
echo NOTA: Este proceso puede tomar varios minutos
echo.
pause

npx tsx scripts/entrenar-bot-completo-24-7.ts

echo.
echo ========================================
echo   ENTRENAMIENTO COMPLETADO
echo ========================================
echo.
echo La base de conocimientos se guardo en:
echo knowledge-base/training-[timestamp].json
echo.
pause
