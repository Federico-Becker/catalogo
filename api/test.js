const { query } = require('../_lib/db');

module.exports = async (req, res) => {
  try {
    const rows = await query('SELECT 1 as ok');
    return res.status(200).json({ ok: true, db: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message, stack: err.stack });
  }
};
