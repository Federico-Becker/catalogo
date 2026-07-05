const { query } = require('../_lib/db');
const { authMiddleware } = require('../_lib/auth');

async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  if (req.method === 'PUT') {
    const { name, display_order } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });

    await query(
      'UPDATE categories SET name=?, display_order=? WHERE id=?',
      [name, display_order || 0, id]
    );
    return res.status(200).json({ message: 'Categoría actualizada' });
  }

  if (req.method === 'DELETE') {
    const products = await query('SELECT COUNT(*) as count FROM products WHERE cat_id=?', [id]);
    if (products[0] && products[0].count > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: hay productos en esta categoría' });
    }
    await query('DELETE FROM categories WHERE id=?', [id]);
    return res.status(200).json({ message: 'Categoría eliminada' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

module.exports = authMiddleware(handler);
