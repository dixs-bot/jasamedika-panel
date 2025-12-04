const jwt = require('jsonwebtoken');
const storage = require('./storage');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token tidak ditemukan',
        message: 'Authorization header dengan Bearer token diperlukan'
      });
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET tidak diatur di environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'JWT_SECRET tidak diatur'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cari user berdasarkan decoded token
    const user = await storage.findInFile('users.json', u => u.idUser === decoded.idUser);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Token tidak valid',
        message: 'User tidak ditemukan'
      });
    }

    // Attach user info to request
    req.user = {
      idUser: user.idUser,
      profile: user.profile,
      namaLengkap: user.namaLengkap,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token tidak valid',
        message: 'JWT token malformed atau expired'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Silakan login kembali'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat verifikasi token'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Akses ditolak',
      message: 'Hanya admin yang dapat mengakses endpoint ini'
    });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };