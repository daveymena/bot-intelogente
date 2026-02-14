
export class HumanVariabilityEngine {
    
    /**
     * Calcula retraso de escritura humano basado en longitud del mensaje
     * Simula el tiempo real que toma leer y escribir
     */
    static calculateTypingDelay(messageLength: number): number {
        // Velocidad promedio: 300 caracteres por minuto -> 5 chars/seg -> 200ms/char
        // Un bot debe ser más rápido pero no instantáneo
        const charTime = 30; // ms por caracter (muy rápido)
        const thinkTime = Math.random() * 1500 + 500; // 0.5s - 2s de "pensar"
        
        // Mensaje corto (ej "Hola"): 4*30 + 1000 = 1.2s
        // Mensaje largo (300 chars): 300*30 + 1000 = 10s (demasiado)
        // Ajuste logarítmico para mensajes largos
        
        const typingTime = Math.min(5000, messageLength * charTime); 
        
        return thinkTime + typingTime;
    }
    
    /**
     * Inyecta "personalidad" al prompt según la hora del día
     * Para que el bot no suene siempre igual
     */
    static getContextualMood(): string {
        const hour = new Date().getHours(); // Hora del servidor (ajustar a local si es necesario)
        
        // Mañana (6am - 11am)
        if (hour >= 6 && hour < 12) {
            return "🌅 MOOD: Mañana productiva. Estás fresco y enérgico. Si cabe, usa ☕ o ☀️. Sé proactivo.";
        }
        
        // Tarde (12pm - 6pm)
        if (hour >= 12 && hour < 18) {
            return "☀️ MOOD: Plena jornada. Estás enfocado y eficiente. El negocio se mueve rápido.";
        }
        
        // Noche (6pm - 10pm)
        if (hour >= 18 && hour < 22) {
            return "🌙 MOOD: Noche relajada. Sé amable pero directo, la gente ya quiere descansar o concretar rápido.";
        }
        
        // Madrugada (10pm - 6am)
        if (hour >= 22 || hour < 6) {
            return "🦉 MOOD: Horario extendido/Nocturno. Sé breve, servicial y agradece que nos escriban a esta hora. Si no es hora laboral, recuerda que dejas el mensaje grabado.";
        }
        
        return "";
    }

    /**
     * Variaciones de saludo humanas (para no decir siempre "Hola")
     */
    static getGreetingVariation(): string {
        const greetings = [
            "¡Hola! 👋", "Hola, ¿cómo estás?", "¡Buenas! ✌️", 
            "¡Hey! Qué tal.", "Hola de nuevo.", "Saludos, aquí David."
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
}
