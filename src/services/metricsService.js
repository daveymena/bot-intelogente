const db = require('../database/connection');

module.exports = {
  async getConversionRate() {
      // Assuming 'converted' is a status
      const total = await db.query('SELECT COUNT(*) FROM clients');
      const converted = await db.query("SELECT COUNT(*) FROM clients WHERE lead_status = 'won'");
      if (total.rows[0].count === 0) return 0;
      return (converted.rows[0].count / total.rows[0].count) * 100;
  },

  async getActiveClientsLastMonth() {
      const res = await db.query(
          "SELECT COUNT(DISTINCT client_id) FROM conversations WHERE created_at > NOW() - INTERVAL '30 days'"
      );
      return res.rows[0].count;
  }
};
