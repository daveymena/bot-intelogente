@echo off
echo ========================================
echo 🚀 SUBIR CONFIGURACION COMPLETA A GIT
echo ========================================
echo.
echo Cambios incluidos:
echo - Dashboard de configuracion completo
echo - 8 proveedores de IA (Groq, OpenAI, Claude, Gemini, OpenRouter, Mistral, DeepSeek, Ollama)
echo - 5 metodos de pago (MercadoPago, PayPal, Nequi, Daviplata, Banco)
echo - Informacion del negocio
echo - Notificaciones por email
echo - Personalidad del bot
echo - Todos los botones de guardar funcionando
echo.
pause
echo.
echo ========================================
echo PASO 1: Agregar archivos
echo ========================================
echo.
git add .
echo.
echo ========================================
echo PASO 2: Crear commit
echo ========================================
echo.
git commit -m "feat: Dashboard de configuracion completo con 8 IAs y 5 metodos de pago

- Agregados 8 proveedores de IA: Groq, OpenAI, Claude, Gemini, OpenRouter, Mistral, DeepSeek, Ollama
- Configuracion completa de metodos de pago: MercadoPago, PayPal, Nequi, Daviplata, Banco
- Informacion del negocio configurable
- Notificaciones por email
- Personalidad del bot
- Todos los campos guardan correctamente en BD
- Mensajes de confirmacion al guardar
- Migracion de BD incluida
- APIs funcionales para todas las secciones"
echo.
echo ========================================
echo PASO 3: Subir a GitHub
echo ========================================
echo.
git push origin main
echo.
echo ✅ Cambios subidos exitosamente
echo.
echo ========================================
echo PROXIMO PASO
echo ========================================
echo.
echo 1. Aplicar migracion: aplicar-migracion-configuracion.bat
echo 2. Reiniciar servidor: npm run dev
echo 3. Ir a: http://localhost:4000/dashboard/configuracion
echo 4. Configurar tus APIs y metodos de pago
echo 5. Click "Guardar" en cada seccion
echo.
pause
