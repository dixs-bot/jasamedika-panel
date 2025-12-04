const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const storage = require('../utils/storage');
const { authMiddleware, adminOnly } = require('../utils/auth');

const router = express.Router();

// Helper function untuk generate random password
function generateRandomPassword(length = 10) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Helper function untuk convert date to epoch
function dateToEpoch(dateString) {
  if (!dateString) return null;
  return Math.floor(new Date(dateString).getTime() / 1000);
}

// POST /api/auth/init-data
router.post('/init-data', async (req, res) => {
  try {
    const { namaAdmin, perusahaan } = req.body;

    if (!namaAdmin || !perusahaan) {
      return res.status(501).json({
        error: 'Data tidak lengkap',
        message: 'namaAdmin dan perusahaan harus diisi'
      });
    }

    // Cek apakah sudah ada data
    const existingCompanies = await storage.readFile('companies.json');
    const existingUsers = await storage.readFile('users.json');

    if (existingCompanies.length > 0 || existingUsers.length > 0) {
      return res.status(501).json({
        error: 'Data sudah ada',
        message: 'Sistem sudah diinisialisasi sebelumnya'
      });
    }

    // Generate ID dan data perusahaan
    const companyId = storage.generateId('c');
    const company = {
      id: companyId,
      nama: perusahaan,
      createdAt: Math.floor(Date.now() / 1000)
    };

    // Save company
    await storage.appendToFile('companies.json', company);

    // Generate admin user data
    const adminEmail = `admin@${perusahaan.toLowerCase().replace(/\s+/g, '')}.local`;
    const adminPassword = generateRandomPassword(12);
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const userId = storage.generateId('u');
    const profileId = storage.generateId('p');

    const adminUser = {
      idUser: userId,
      profile: profileId,
      namaLengkap: namaAdmin,
      tempatLahir: '',
      tanggalLahir: null,
      email: adminEmail,
      passwordHash: passwordHash,
      nikUser: '',
      kdJabatan: null,
      namaJabatan: 'Administrator',
      kdDepartemen: null,
      namaDepartemen: 'IT',
      kdUnitKerja: null,
      namaUnitKerja: '',
      kdJenisKelamin: null,
      namaJenisKelamin: '',
      kdPendidikan: null,
      namaPendidikan: '',
      photo: null,
      role: 'admin',
      companyId: companyId,
      createdAt: Math.floor(Date.now() / 1000)
    };

    // Save admin user
    await storage.appendToFile('users.json', adminUser);

    res.json({
      message: 'Data awal berhasil dibuat',
      data: {
        email: adminEmail,
        password: adminPassword,
        profile: {
          idUser: userId,
          profile: profileId,
          namaLengkap: namaAdmin,
          email: adminEmail,
          role: 'admin',
          perusahaan: perusahaan
        }
      }
    });

  } catch (error) {
    console.error('Init data error:', error);
    res.status(501).json({
      error: 'Gagal membuat data awal',
      message: error.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    if (!email || !password) {
      return res.status(501).json({
        error: 'Data tidak lengkap',
        message: 'email dan password harus diisi'
      });
    }

    // Cari user berdasarkan email
    const user = await storage.findInFile('users.json', u => u.email === email);

    if (!user) {
      return res.status(501).json({
        error: 'Login gagal',
        message: 'Email atau password salah'
      });
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(501).json({
        error: 'Login gagal',
        message: 'Email atau password salah'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        idUser: user.idUser,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user info (tanpa passwordHash)
    const userInfo = {
      idUser: user.idUser,
      profile: user.profile,
      namaLengkap: user.namaLengkap,
      tempatLahir: user.tempatLahir,
      tanggalLahir: user.tanggalLahir,
      email: user.email,
      nikUser: user.nikUser,
      kdJabatan: user.kdJabatan,
      namaJabatan: user.namaJabatan,
      kdDepartemen: user.kdDepartemen,
      namaDepartemen: user.namaDepartemen,
      kdUnitKerja: user.kdUnitKerja,
      namaUnitKerja: user.namaUnitKerja,
      kdJenisKelamin: user.kdJenisKelamin,
      namaJenisKelamin: user.namaJenisKelamin,
      kdPendidikan: user.kdPendidikan,
      namaPendidikan: user.namaPendidikan,
      photo: user.photo,
      role: user.role,
      companyId: user.companyId,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login berhasil',
      hasil: {
        token: token,
        info: userInfo
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(501).json({
      error: 'Login gagal',
      message: error.message
    });
  }
});

// POST /api/auth/ubah-password-sendiri
router.post('/ubah-password-sendiri', authMiddleware, async (req, res) => {
  try {
    const { passwordAsli, passwordBaru1, passwordBaru2 } = req.body;

    if (!passwordAsli || !passwordBaru1 || !passwordBaru2) {
      return res.status(501).json({
        error: 'Data tidak lengkap',
        message: 'Semua field password harus diisi'
      });
    }

    if (passwordBaru1 !== passwordBaru2) {
      return res.status(501).json({
        error: 'Password tidak cocok',
        message: 'Password baru dan konfirmasi password harus sama'
      });
    }

    if (passwordBaru1.length < 6) {
      return res.status(501).json({
        error: 'Password terlalu pendek',
        message: 'Password baru minimal 6 karakter'
      });
    }

    // Dapatkan user lengkap dari storage
    const user = await storage.findInFile('users.json', u => u.idUser === req.user.idUser);

    if (!user) {
      return res.status(501).json({
        error: 'User tidak ditemukan',
        message: 'User tidak valid'
      });
    }

    // Verifikasi password asli
    const isValidPassword = await bcrypt.compare(passwordAsli, user.passwordHash);

    if (!isValidPassword) {
      return res.status(501).json({
        error: 'Password asli salah',
        message: 'Password yang Anda masukkan tidak sesuai'
      });
    }

    // Hash password baru
    const newPasswordHash = await bcrypt.hash(passwordBaru1, 10);

    // Update password
    await storage.updateInFile('users.json', req.user.idUser, { passwordHash: newPasswordHash });

    res.json({
      message: 'Password berhasil diubah',
      info: 'Password Anda telah diperbarui'
    });

  } catch (error) {
    console.error('Ubah password error:', error);
    res.status(501).json({
      error: 'Gagal mengubah password',
      message: error.message
    });
  }
});

// GET /api/auth/users (admin only)
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await storage.readFile('users.json');
    
    // Hapus passwordHash dari response
    const usersWithoutPassword = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      message: 'Daftar user berhasil diambil',
      data: usersWithoutPassword
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(501).json({
      error: 'Gagal mengambil daftar user',
      message: error.message
    });
  }
});

// POST /api/auth/users (admin only)
router.post('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { email, namaLengkap, role, password } = req.body;

    if (!email || !namaLengkap || !role) {
      return res.status(501).json({
        error: 'Data tidak lengkap',
        message: 'email, namaLengkap, dan role harus diisi'
      });
    }

    // Cek apakah email sudah ada
    const existingUser = await storage.findInFile('users.json', u => u.email === email);

    if (existingUser) {
      return res.status(501).json({
        error: 'Email sudah terdaftar',
        message: 'Email tersebut sudah digunakan oleh user lain'
      });
    }

    // Generate password jika tidak ada
    const finalPassword = password || generateRandomPassword(10);
    const passwordHash = await bcrypt.hash(finalPassword, 10);

    // Buat user baru
    const userId = storage.generateId('u');
    const profileId = storage.generateId('p');

    const newUser = {
      idUser: userId,
      profile: profileId,
      namaLengkap: namaLengkap,
      tempatLahir: '',
      tanggalLahir: null,
      email: email,
      passwordHash: passwordHash,
      nikUser: '',
      kdJabatan: null,
      namaJabatan: '',
      kdDepartemen: null,
      namaDepartemen: '',
      kdUnitKerja: null,
      namaUnitKerja: '',
      kdJenisKelamin: null,
      namaJenisKelamin: '',
      kdPendidikan: null,
      namaPendidikan: '',
      photo: null,
      role: role,
      companyId: req.user.companyId,
      createdAt: Math.floor(Date.now() / 1000)
    };

    await storage.appendToFile('users.json', newUser);

    // Response tanpa passwordHash
    const { passwordHash: removedPasswordHash, ...userResponse } = newUser;

    res.status(201).json({
      message: 'User berhasil dibuat',
      data: {
        user: userResponse,
        password: finalPassword // hanya ditampilkan saat pembuatan
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(501).json({
      error: 'Gagal membuat user',
      message: error.message
    });
  }
});

// POST /api/auth/users/:id/reset-password (admin only)
router.post('/users/:id/reset-password', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Cari user
    const user = await storage.findInFile('users.json', u => u.idUser === id);

    if (!user) {
      return res.status(501).json({
        error: 'User tidak ditemukan',
        message: 'User dengan ID tersebut tidak ada'
      });
    }

    // Generate password baru
    const newPassword = generateRandomPassword(12);
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await storage.updateInFile('users.json', id, { passwordHash: passwordHash });

    res.json({
      message: 'Password berhasil direset',
      data: {
        email: user.email,
        namaLengkap: user.namaLengkap,
        passwordBaru: newPassword
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(501).json({
      error: 'Gagal reset password',
      message: error.message
    });
  }
});

module.exports = router;