
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = 'https://ollama-ollama.ginee6.easypanel.host';
const MODELS = ['llama3.2:1b', 'qwen2.5:3b', 'qwen2.5:7b', 'gemma2:2b'];

const TEST_PROMPT = `
Contexto: Eres David Martínez, asesor de ventas de "Tecnovariedades D&S".
Producto: Mega Pack Curso de Piano Completo ($60.000 COP).
Incluye: 19 horas de video, acceso de por vida, soporte.

Cliente dice: "Hola, me interesa el curso de piano. ¿Qué incluye exactamente y cómo es el pago?"

Responde como David, muy breve (máximo 5 líneas), usa emojis y sé persuasivo.
`;

async function benchmark() {
    console.log('🚀 Iniciando Benchmark de Modelos en Easypanel...\n');
    console.log('---');

    for (const model of MODELS) {
        console.log(`📡 Probando modelo: ${model}...`);
        
        const start = Date.now();
        try {
            const response = await fetch(`${OLLAMA_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: TEST_PROMPT,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_predict: 150
                    }
                })
            });

            const end = Date.now();
            const duration = (end - start) / 1000;

            if (response.ok) {
                const data: any = await response.json();
                console.log(`⏱️ Tiempo: ${duration.toFixed(2)}s`);
                console.log(`🤖 Respuesta:\n${data.response.trim()}`);
            } else {
                console.log(`❌ Error ${response.status}: ${model} no respondió correctamente.`);
            }
        } catch (error: any) {
            console.log(`⚠️ Error probando ${model}: ${error.message}`);
        }
        console.log('---\n');
    }
}

benchmark();
