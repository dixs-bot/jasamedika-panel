const express = require('express');
const storage = require('../utils/storage');
const { authMiddleware, adminOnly } = require('../utils/auth');

const router = express.Router();

// GET /api/users (public endpoint - tanpa auth)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const users = await storage.readFile('users.json');
    
    // Filter berdasarkan search parameter
    let filteredUsers = users;
    
    if (search) {
      const query = search.toLowerCase();
      filteredUsers = users.filter(user => 
        user.namaLengkap?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.namaJabatan?.toLowerCase().includes(query) ||
        user.namaDepartemen?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Hapus passwordHash dari response
    const usersWithoutPassword = paginatedUsers.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({
      message: 'Daftar user berhasil diambil',
      data: {
        users: usersWithoutPassword,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(501).json({
      error: 'Gagal mengambil daftar user',
      message: error.message
    });
  }
});

// GET /api/users/:id (public endpoint - tanpa auth)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await storage.findInFile('users.json', u => u.idUser === id);

    if (!user) {
      return res.status(501).json({
        error: 'User tidak ditemukan',
        message: 'User dengan ID tersebut tidak ada'
      });
    }

    // Hapus passwordHash dari response
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: 'Data user berhasil diambil',
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(501).json({
      error: 'Gagal mengambil data user',
      message: error.message
    });
  }
});

module.exports = router;