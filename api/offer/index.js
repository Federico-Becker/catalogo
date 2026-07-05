const { query } = require('../_lib/db');
const { authMiddleware } = require('../_lib/auth');

async function handler(req, res) {
  if (req.method === 'GET') {
    const rows = await query('SELECT * FROM offer WHERE id=1');
    const offer = rows[0] || { name: '', description: '', price: '', img: '', badge: 'Esta semana' };
    return res.status(200).json(offer);
  }

  return authMiddleware(async (req, res) => {
    if (req.method === 'PUT') {
      const { name, description, price, img, badge } = req.body || {};
      const existing = await query('SELECT id FROM offer WHERE id=1');
      if (existing.length > 0) {
        await query(
          'UPDATE offer SET name=?, description=?, price=?, img=?, badge=? WHERE id=1',
          [name || '', description || '', price || '', img || '', badge || 'Esta semana']
        );
      } else {
        await query(
          'INSERT INTO offer (id, name, description, price, img, badge) VALUES (1, ?, ?, ?, ?, ?)',
          [name || '', description || '', price || '', img || '', badge || 'Esta semana']
        );
      }
      return res.status(200).json({ message: 'Oferta actualizada' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  })(req, res);
}

module.exports = handler;
