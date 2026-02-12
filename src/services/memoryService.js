const db = require('../database/connection');

module.exports = {
  async saveInteraction(clientId, intent, message, response, confidence) {
    const textInfo = `Intent: ${intent}, User: ${message}, Bot: ${response}`;
    try {
        await db.query(
            `INSERT INTO conversations (client_id, intent, confidence, message, response) VALUES ($1, $2, $3, $4, $5)`,
            [clientId, intent, confidence, message, response]
        );
        // Also update client last interaction
        await db.query(`UPDATE clients SET last_interaction = NOW() WHERE id = $1`, [clientId]);
    } catch (e) {
        console.error("Error saving interaction", e);
    }
  },

  async getClientContext(clientId) {
      // Get last N conversations or summary
      // For now, let's get last 5 interactions to build summary
      const res = await db.query(
          `SELECT intent, message, response FROM conversations WHERE client_id = $1 ORDER BY created_at DESC LIMIT 5`,
          [clientId]
      );
      // Construct a summary string
      const history = res.rows.reverse().map(r => `User (${r.intent}): ${r.message}\nBot: ${r.response}`).join('\n');
      return {
          history,
          summary: "Resumen de interacciones recientes." // Placeholder for real summary logic
      };
  },

  async updateClientProfile(clientId, data) {
      // Update specific fields like technical_level, purchase_probability
      const fields = [];
      const values = [];
      let idx = 1;
      
      for (const [key, value] of Object.entries(data)) {
          fields.push(`${key} = $${idx}`);
          values.push(value);
          idx++;
      }
      values.push(clientId);
      
      if (fields.length > 0) {
          await db.query(`UPDATE clients SET ${fields.join(', ')} WHERE id = $${idx}`, values);
      }
  }
};
