const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'meri-catalogo-secret-2026';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function authMiddleware(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.user = decoded;
    return handler(req, res);
  };
}

module.exports = { signToken, verifyToken, authMiddleware, JWT_SECRET };
