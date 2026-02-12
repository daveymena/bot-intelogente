const db = require('../database/connection');

module.exports = {
  async getClient(phone) {
    const res = await db.query('SELECT * FROM clients WHERE phone = $1', [phone]);
    return res.rows[0];
  },

  async createClient(data) {
    const { name, phone, tenant_id } = data;
    const res = await db.query(
        'INSERT INTO clients (name, phone, tenant_id, lead_status, purchase_probability, technical_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, phone, tenant_id, 'new', 0, 'basic']
    );
    return res.rows[0];
  },

  async updateClient(id, data) {
    const fields = Object.entries(data).map(([key, val], idx) => `${key} = $${idx + 1}`).join(', ');
    const res = await db.query(
        `UPDATE clients SET ${fields} WHERE id = $${Object.keys(data).length + 1} RETURNING *`,
        [...Object.values(data), id]
    );
    return res.rows[0];
  },

  async updateProbability(id, score) {
    const res = await db.query(
        'UPDATE clients SET purchase_probability = purchase_probability + $1 WHERE id = $2 RETURNING *',
        [score, id]
    );
    return res.rows[0];
  }
};
