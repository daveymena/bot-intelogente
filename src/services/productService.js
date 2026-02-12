const db = require('../database/connection');

module.exports = {
  async getProducts() {
      const staticRows = await db.query('SELECT * FROM products_static WHERE active = TRUE');
      const dynamicRows = await db.query('SELECT * FROM products_dynamic WHERE active = TRUE');
      return [...staticRows.rows, ...dynamicRows.rows];
  },

  async getProductByIntent(intentData) {
      // intentData might contain { intent: 'consulta_precio', entities: { categoria: 'laptop' } }
      const category = intentData.entities?.category;
      if (!category) return this.getProducts();

      const dynamic = await db.query('SELECT * FROM products_dynamic WHERE category ILIKE $1 AND active = TRUE', [`%${category}%`]);
      // Also check static names
      const staticProds = await db.query('SELECT * FROM products_static WHERE name ILIKE $1 AND active = TRUE', [`%${category}%`]);
      
      return [...dynamic.rows, ...staticProds.rows];
  },

  async checkStock(id) {
    // Check dynamic products first
    const dynamic = await db.query('SELECT stock FROM products_dynamic WHERE id = $1', [id]);
    if (dynamic.rows.length > 0) {
        return dynamic.rows[0].stock > 0;
    }
    // Static products assumed unlimited or no stock concept mentioned
    return true;
  }
};
