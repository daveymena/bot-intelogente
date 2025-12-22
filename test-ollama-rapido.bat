@echo off
echo ========================================
echo TEST RAPIDO OLLAMA EASYPANEL
echo ========================================
echo.
echo Servidor: https://davey-ollama.mapf5v.easypanel.host
echo Modelos: llama3:latest, mistral:latest
echo.
echo Probando modelo llama3 con pregunta sobre productos...
echo.

curl -X POST https://davey-ollama.mapf5v.easypanel.host/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"llama3:latest\",\"messages\":[{\"role\":\"system\",\"content\":\"Eres un asistente de ventas experto. Respondes en español de forma clara y concisa.\"},{\"role\":\"user\",\"content\":\"¿Qué laptop me recomiendas para diseño gráfico?\"}],\"stream\":false,\"options\":{\"temperature\":0.7,\"num_predict\":300}}"

echo.
echo.
echo ========================================
echo Probando modelo mistral con la misma pregunta...
echo.

curl -X POST https://davey-ollama.mapf5v.easypanel.host/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"mistral:latest\",\"messages\":[{\"role\":\"system\",\"content\":\"Eres un asistente de ventas experto. Respondes en español de forma clara y concisa.\"},{\"role\":\"user\",\"content\":\"¿Qué laptop me recomiendas para diseño gráfico?\"}],\"stream\":false,\"options\":{\"temperature\":0.7,\"num_predict\":300}}"

echo.
echo.
echo ========================================
echo TEST COMPLETADO
echo ========================================
echo.
echo Compara las respuestas de ambos modelos
echo y decide cual prefieres usar.
echo.
pause
