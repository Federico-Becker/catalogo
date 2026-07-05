const { authMiddleware } = require('../_lib/auth');
const { uploadImage } = require('../_lib/cloudinary');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { file, folder } = req.body || {};
  if (!file) {
    return res.status(400).json({ error: 'Archivo requerido (base64)' });
  }

  try {
    const url = await uploadImage(file, folder || 'catalogo');
    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: 'Error al subir imagen', detail: err.message });
  }
}

module.exports = authMiddleware(handler);
