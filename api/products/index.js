const { query } = require('../_lib/db');
const { authMiddleware } = require('../_lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    const rows = await query('SELECT * FROM products ORDER BY id ASC');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { name, gender, price, cat_id, stock, img } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });

    const result = await query(
      'INSERT INTO products (name, gender, price, cat_id, stock, img) VALUES (?, ?, ?, ?, ?, ?)',
      [name, gender || '', price || '', cat_id || 'sin-categoria', stock || 'disponible', img || '']
    );
    return res.status(201).json({ id: Number(result.lastInsertRowid), message: 'Producto creado' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

module.exports = authMiddleware(handler);
