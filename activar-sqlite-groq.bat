@echo off
echo ========================================
echo  ACTIVAR SQLITE + GROQ + BOT LOCAL
echo ========================================
echo.
echo 1. Generando cliente Prisma para SQLite...
npx prisma generate

echo.
echo 2. Aplicando migraciones a SQLite...
npx prisma db push

echo.
echo 3. Verificando base de datos...
npx prisma studio --browser none &
timeout /t 2 /nobreak > nul
taskkill /F /IM "Prisma Studio*" 2>nul

echo.
echo ========================================
echo  CONFIGURACION COMPLETADA
echo ========================================
echo.
echo ✅ Base de datos: SQLite (dev.db)
echo ✅ IA Principal: Groq (llama-3.1-8b-instant)
echo ✅ Fallback: Ollama (gemma3:4b)
echo ✅ Bot Local: Activado
echo.
echo Ahora ejecuta: npm run dev
echo.
pause
