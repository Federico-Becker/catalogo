const { query } = require('../_lib/db');
const { authMiddleware } = require('../_lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    const rows = await query('SELECT * FROM categories ORDER BY display_order ASC, id ASC');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { id, name, display_order } = req.body || {};
    if (!id || !name) return res.status(400).json({ error: 'ID y nombre requeridos' });

    const existing = await query('SELECT id FROM categories WHERE id=?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ya existe una categoría con ese ID' });
    }

    await query(
      'INSERT INTO categories (id, name, display_order) VALUES (?, ?, ?)',
      [id, name, display_order || 0]
    );
    return res.status(201).json({ message: 'Categoría creada' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

module.exports = authMiddleware(handler);
