const { query } = require('../_lib/db');
const { signToken } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Password requerida' });
  }

  const expected = process.env.ADMIN_PASSWORD || 'meri2026';
  if (password !== expected) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  const token = signToken({ role: 'admin' });
  return res.status(200).json({ token });
};
