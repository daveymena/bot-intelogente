"use strict";
/**
 * 🧠 SERVICIO DE APRENDIZAJE NEURONAL
 *
 * Aprende de las conversaciones exitosas con Groq y actualiza
 * la base de conocimiento del bot para mejorar continuamente
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuralLearningService = void 0;
const db_1 = require("./db");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class NeuralLearningService {
    /**
     * Registrar una interacción para aprendizaje
     */
    static async recordInteraction(data) {
        console.log('[NeuralLearning] 📝 Registrando interacción para aprendizaje');
        // Agregar a la cola
        this.learningQueue.push(data);
        // Si la cola está llena, procesar
        if (this.learningQueue.length >= this.MAX_QUEUE_SIZE) {
            await this.processLearningQueue();
        }
        // Guardar en base de datos para análisis
        try {
            await db_1.db.conversationKnowledge.create({
                data: {
                    userQuery: data.userMessage,
                    botResponse: data.botResponse,
                    productId: data.productId,
                    productName: data.productName,
                    context: data.intent,
                    confidence: data.confidence,
                    usageCount: 1,
                    successRate: data.wasSuccessful ? 1.0 : 0.5
                }
            });
        }
        catch (error) {
            console.error('[NeuralLearning] ⚠️ Error guardando en BD:', error);
        }
    }
    /**
     * Procesar cola de aprendizaje
     */
    static async processLearningQueue() {
        if (this.learningQueue.length === 0)
            return;
        console.log(`[NeuralLearning] 🧠 Procesando ${this.learningQueue.length} interacciones`);
        // Filtrar solo las exitosas con Groq
        const successfulGroqInteractions = this.learningQueue.filter(item => item.provider === 'groq' && item.wasSuccessful && item.confidence > 0.7);
        if (successfulGroqInteractions.length === 0) {
            console.log('[NeuralLearning] ⚠️ No hay interacciones exitosas para aprender');
            this.learningQueue = [];
            return;
        }
        console.log(`[NeuralLearning] ✅ ${successfulGroqInteractions.length} interacciones exitosas con Groq`);
        // Cargar archivo de aprendizaje existente
        let learningData = {
            version: '1.0.0',
            lastUpdate: new Date().toISOString(),
            totalLearned: 0,
            ejemplos: []
        };
        try {
            const filePath = path_1.default.join(process.cwd(), this.LEARNING_FILE);
            if (fs_1.default.existsSync(filePath)) {
                const content = await fs_1.default.promises.readFile(filePath, 'utf-8');
                learningData = JSON.parse(content);
            }
        }
        catch (error) {
            console.log('[NeuralLearning] 📝 Creando nuevo archivo de aprendizaje');
        }
        // Agregar nuevas interacciones
        for (const interaction of successfulGroqInteractions) {
            learningData.ejemplos.push({
                entrada: interaction.userMessage,
                salida: interaction.botResponse,
                intencion: interaction.intent,
                producto_id: interaction.productId,
                producto_nombre: interaction.productName,
                confianza: interaction.confidence,
                fecha_aprendizaje: interaction.timestamp.toISOString(),
                fuente: 'groq'
            });
        }
        learningData.totalLearned = learningData.ejemplos.length;
        learningData.lastUpdate = new Date().toISOString();
        // Guardar archivo actualizado
        try {
            const filePath = path_1.default.join(process.cwd(), this.LEARNING_FILE);
            await fs_1.default.promises.writeFile(filePath, JSON.stringify(learningData, null, 2), 'utf-8');
            console.log(`[NeuralLearning] 💾 Guardadas ${successfulGroqInteractions.length} nuevas neuronas`);
            console.log(`[NeuralLearning] 📊 Total de neuronas: ${learningData.totalLearned}`);
        }
        catch (error) {
            console.error('[NeuralLearning] ❌ Error guardando aprendizaje:', error);
        }
        // Limpiar cola
        this.learningQueue = [];
    }
    /**
     * Forzar procesamiento de cola (útil al cerrar el servidor)
     */
    static async flushLearningQueue() {
        if (this.learningQueue.length > 0) {
            console.log('[NeuralLearning] 🔄 Forzando procesamiento de cola...');
            await this.processLearningQueue();
        }
    }
    /**
     * Obtener estadísticas de aprendizaje
     */
    static async getStats() {
        try {
            const filePath = path_1.default.join(process.cwd(), this.LEARNING_FILE);
            if (!fs_1.default.existsSync(filePath)) {
                return {
                    totalLearned: 0,
                    lastUpdate: null,
                    queueSize: this.learningQueue.length
                };
            }
            const content = await fs_1.default.promises.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            return {
                totalLearned: data.totalLearned || 0,
                lastUpdate: data.lastUpdate,
                queueSize: this.learningQueue.length
            };
        }
        catch (error) {
            return {
                totalLearned: 0,
                lastUpdate: null,
                queueSize: this.learningQueue.length
            };
        }
    }
    /**
     * Reentrenar el bot con las nuevas neuronas
     */
    static async retrainBot() {
        console.log('[NeuralLearning] 🎓 Iniciando reentrenamiento con nuevas neuronas...');
        try {
            // Ejecutar script de entrenamiento
            const { execSync } = require('child_process');
            execSync('npx tsx scripts/entrenar-bot-24-7-completo.ts', {
                stdio: 'inherit',
                cwd: process.cwd()
            });
            console.log('[NeuralLearning] ✅ Reentrenamiento completado');
            return true;
        }
        catch (error) {
            console.error('[NeuralLearning] ❌ Error en reentrenamiento:', error);
            return false;
        }
    }
}
exports.NeuralLearningService = NeuralLearningService;
NeuralLearningService.learningQueue = [];
NeuralLearningService.MAX_QUEUE_SIZE = 50;
NeuralLearningService.LEARNING_FILE = 'data/neural-learning.json';
// Procesar cola al cerrar el proceso
process.on('SIGINT', async () => {
    await NeuralLearningService.flushLearningQueue();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await NeuralLearningService.flushLearningQueue();
    process.exit(0);
});
