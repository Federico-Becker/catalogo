module.exports = async (req, res) => {
  const DB_URL = process.env.TURSO_DATABASE_URL?.replace('libsql://', 'https://');
  const DB_TOKEN = process.env.TURSO_AUTH_TOKEN;

  try {
    const r = await fetch(`${DB_URL}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: { sql: 'SELECT COUNT(*) as count FROM products', args: [] },
          },
          { type: 'close' },
        ],
      }),
    });
    const raw = await r.text();
    return res.status(200).json({ status: r.status, raw });
  } catch (err) {
    return res.status(200).json({ status: 'error', error: err.message });
  }
};
