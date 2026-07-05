const { query } = require('../_lib/db');
const { authMiddleware } = require('../_lib/auth');

async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  if (req.method === 'PUT') {
    const { name, gender, price, cat_id, stock, img } = req.body || {};
    await query(
      'UPDATE products SET name=?, gender=?, price=?, cat_id=?, stock=?, img=? WHERE id=?',
      [name || '', gender || '', price || '', cat_id || '', stock || 'disponible', img || '', id]
    );
    return res.status(200).json({ message: 'Producto actualizado' });
  }

  if (req.method === 'DELETE') {
    await query('DELETE FROM products WHERE id=?', [id]);
    return res.status(200).json({ message: 'Producto eliminado' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

module.exports = authMiddleware(handler);
