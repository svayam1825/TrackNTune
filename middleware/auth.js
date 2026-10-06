const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'trackntune_secret_key_change_in_production_2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Optional middleware that extracts user if token exists, but doesn't block unauthenticated requests
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Ignore token verification errors for optional auth
    }
  }
  next();
}

module.exports = {
  authMiddleware,
  optionalAuth,
  JWT_SECRET
};
