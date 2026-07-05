module.exports = async (req, res) => {
  const DB_URL = process.env.TURSO_DATABASE_URL;
  const DB_TOKEN = process.env.TURSO_AUTH_TOKEN;
  const HAS_CLOUDINARY = !!process.env.CLOUDINARY_CLOUD_NAME;

  if (!DB_URL || !DB_TOKEN) {
    return res.status(200).json({
      status: 'MISSING_ENV',
      TURSO_DATABASE_URL: DB_URL ? 'OK' : 'MISSING',
      TURSO_AUTH_TOKEN: DB_TOKEN ? 'OK' : 'MISSING',
      CLOUDINARY: HAS_CLOUDINARY ? 'OK' : 'MISSING',
    });
  }

  try {
    const httpsUrl = DB_URL.replace('libsql://', 'https://');
    const r = await fetch(`${httpsUrl}/v2/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statements: [{ q: 'SELECT 1 as test', params: [] }] }),
    });
    const data = await r.json();
    return res.status(200).json({
      status: r.ok ? 'DB_OK' : 'DB_ERROR',
      httpStatus: r.status,
      url: httpsUrl,
      result: data,
    });
  } catch (err) {
    return res.status(200).json({ status: 'CATCH_ERROR', error: err.message });
  }
};
