import fs from 'fs';
import path from 'path';

export interface LearnedPattern {
    contextKeyword: string;     // Ej: "precio alto", "duda garantía"
    successfulResponse: string; // La respuesta exacta que funcionó
    successRate: number;        // Porcentaje de éxito (0-1)
    humanTone: string;          // Ej: "empático", "autoritario", "técnico"
    timesUsed: number;
}

export class LearningManager {
    private static memoryPath = path.join(process.cwd(), '.openclaw-workspace', 'cognitive-memory.json');

    /**
     * Cargar memoria evolutiva
     */
    static getMemory(): LearnedPattern[] {
        try {
            if (!fs.existsSync(this.memoryPath)) return [];
            const data = fs.readFileSync(this.memoryPath, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }

    /**
     * Registrar un nuevo aprendizaje
     */
    static async learn(pattern: LearnedPattern) {
        const memory = this.getMemory();
        
        // Buscar si ya existe un patrón similar
        const existingIndex = memory.findIndex(p => p.contextKeyword === pattern.contextKeyword);
        
        if (existingIndex >= 0) {
            // Reforzar aprendizaje existente
            const existing = memory[existingIndex];
            existing.timesUsed++;
            // Ajuste simple de success rate promedio
            existing.successRate = (existing.successRate * (existing.timesUsed - 1) + pattern.successRate) / existing.timesUsed;
            memory[existingIndex] = existing;
        } else {
            // Nuevo descubrimiento
            memory.push(pattern);
        }

        this.saveMemory(memory);
        console.log(`[Cognitive] 🧠 Nuevo patrón aprendido: "${pattern.contextKeyword}"`);
    }

    private static saveMemory(memory: LearnedPattern[]) {
        const dir = path.dirname(this.memoryPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.memoryPath, JSON.stringify(memory, null, 2));
    }

    /**
     * Obtener "Mejores Prácticas" para el contexto actual
     */
    static getBestPractices(messageContext: string): string {
        const memory = this.getMemory();
        const relevant = memory
            .filter(p => messageContext.toLowerCase().includes(p.contextKeyword.toLowerCase()))
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, 3); // Top 3 mejores respuestas históricas

        if (relevant.length === 0) return "";

        return `
### 🧠 MEMORIA COGNITIVA (Estrategias probadas que funcionan):
He aprendido de conversaciones pasadas que, en este contexto ("${messageContext}"), estas respuestas tienen alto éxito:
${relevant.map(p => `- "Tip: ${p.humanTone}": ${p.successfulResponse}`).join('\n')}
`;
    }
}
