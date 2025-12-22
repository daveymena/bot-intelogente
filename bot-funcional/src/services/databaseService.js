import pg from 'pg';
const { Pool } = pg;

export class DatabaseService {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    async initialize() {
        try {
            // Crear tabla de usuarios PRIMERO
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    phone_number VARCHAR(50) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    interactions INTEGER DEFAULT 0,
                    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Crear tabla de mensajes DESPUÉS (con la foreign key correcta)
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS messages (
                    id SERIAL PRIMARY KEY,
                    phone_number VARCHAR(50) NOT NULL,
                    role VARCHAR(20) NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Crear índices
            await this.pool.query(`
                CREATE INDEX IF NOT EXISTS idx_messages_phone 
                ON messages(phone_number, created_at DESC)
            `);

            console.log('✅ Base de datos inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando base de datos:', error.message);
            console.warn('⚠️ El bot funcionará sin persistencia de memoria');
        }
    }

    async getUserInfo(phoneNumber) {
        try {
            // Intentar obtener usuario
            const result = await this.pool.query(
                'SELECT * FROM users WHERE phone = $1',
                [phoneNumber]
            );

            if (result.rows.length === 0) {
                // Crear nuevo usuario
                await this.pool.query(
                    'INSERT INTO users (phone) VALUES ($1) ON CONFLICT DO NOTHING',
                    [phoneNumber]
                );
                return { phone: phoneNumber, interactions: 0, name: null };
            }

            return result.rows[0];
        } catch (error) {
            // Si hay error, retornar usuario vacío sin fallar
            console.warn('⚠️ DB no disponible, continuando sin memoria');
            return { phone: phoneNumber, interactions: 0, name: null };
        }
    }

    async getRecentConversations(phoneNumber, hours = 48) {
        try {
            const result = await this.pool.query(
                `SELECT role, content, created_at 
                 FROM messages 
                 WHERE phone_number = $1 
                 AND created_at > NOW() - INTERVAL '${hours} hours'
                 ORDER BY created_at ASC
                 LIMIT 20`,
                [phoneNumber]
            );

            return result.rows;
        } catch (error) {
            console.error('Error obteniendo conversaciones:', error);
            return [];
        }
    }

    async saveMessage(phoneNumber, role, content) {
        try {
            await this.pool.query(
                'INSERT INTO messages (phone_number, role, content) VALUES ($1, $2, $3)',
                [phoneNumber, role, content]
            );
        } catch (error) {
            console.error('Error guardando mensaje:', error);
        }
    }

    async updateUserInteractions(phoneNumber) {
        try {
            await this.pool.query(
                `UPDATE users 
                 SET interactions = COALESCE(interactions, 0) + 1, 
                     last_interaction = CURRENT_TIMESTAMP 
                 WHERE phone = $1`,
                [phoneNumber]
            );
        } catch (error) {
            // Silenciar error, no es crítico
            console.warn('⚠️ No se pudo actualizar interacciones');
        }
    }

    async updateUser(phoneNumber, info) {
        try {
            const fields = [];
            const values = [];
            let paramCount = 1;

            if (info.name) {
                fields.push(`name = $${paramCount++}`);
                values.push(info.name);
            }

            if (fields.length > 0) {
                values.push(phoneNumber);
                await this.pool.query(
                    `UPDATE users SET ${fields.join(', ')} WHERE phone_number = $${paramCount}`,
                    values
                );
            }
        } catch (error) {
            console.error('Error actualizando usuario:', error);
        }
    }
}
