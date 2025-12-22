export class MemoryService {
    constructor(db) {
        this.db = db;
        this.contextRetentionHours = parseInt(process.env.CONTEXT_RETENTION_HOURS) || 48;
    }

    async getUserContext(phoneNumber) {
        try {
            // Obtener información del usuario
            const userInfo = await this.db.getUserInfo(phoneNumber);
            
            // Obtener historial reciente de conversaciones
            const conversationHistory = await this.db.getRecentConversations(
                phoneNumber, 
                this.contextRetentionHours
            );

            return {
                userInfo,
                conversationHistory,
                hasHistory: conversationHistory.length > 0
            };
        } catch (error) {
            console.error('Error obteniendo contexto:', error);
            return { userInfo: null, conversationHistory: [], hasHistory: false };
        }
    }

    async saveConversation(phoneNumber, userMessage, botResponse) {
        try {
            await this.db.saveMessage(phoneNumber, 'user', userMessage);
            await this.db.saveMessage(phoneNumber, 'bot', botResponse);
            await this.db.updateUserInteractions(phoneNumber);
        } catch (error) {
            console.error('Error guardando conversación:', error);
        }
    }

    async updateUserInfo(phoneNumber, info) {
        try {
            await this.db.updateUser(phoneNumber, info);
        } catch (error) {
            console.error('Error actualizando usuario:', error);
        }
    }
}
