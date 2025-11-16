@echo off
REM Verificar puertos activos y cerrar los innecesarios

echo.
echo ========================================================================
echo VERIFICACION DE PUERTOS ACTIVOS
echo ========================================================================
echo.

REM Mostrar todos los puertos en uso
echo Puertos activos en el sistema:
echo.
netstat -ano | findstr "LISTENING"

echo.
echo ========================================================================
echo PUERTOS ESPERADOS
echo ========================================================================
echo.
echo Puerto 3000  - Next.js Dev Server (MANTENER)
echo Puerto 4000  - Bot Local / API (MANTENER)
echo Puerto 5432  - PostgreSQL (MANTENER si está en uso)
echo Puerto 8000  - Ollama (MANTENER si está en uso)
echo.

echo ========================================================================
echo PROCESOS ACTIVOS
echo ========================================================================
echo.
tasklist | findstr /i "node npm"

echo.
echo ========================================================================
echo INSTRUCCIONES PARA CERRAR PUERTOS
echo ========================================================================
echo.
echo Para cerrar un puerto específico:
echo   netstat -ano | findstr :PUERTO
echo   taskkill /PID [PID] /F
echo.
echo Ejemplo para cerrar puerto 3000:
echo   netstat -ano | findstr :3000
echo   taskkill /PID [PID] /F
echo.

pause
