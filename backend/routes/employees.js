const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const storage = require('../utils/storage');
const { authMiddleware, adminOnly } = require('../utils/auth');

const router = express.Router();

// Konfigurasi multer untuk upload file
const uploadDir = path.join(__dirname, '../uploads');
const storage_config = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.access(uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'employee-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan (jpeg, jpg, png, gif)'));
    }
  }
});

// Helper function untuk convert date to epoch
function dateToEpoch(dateString) {
  if (!dateString) return null;
  return Math.floor(new Date(dateString).getTime() / 1000);
}

// Helper function untuk convert epoch to date
function epochToDate(epoch) {
  if (!epoch) return null;
  return new Date(epoch * 1000);
}

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    
    const employees = await storage.readFile('employees.json');
    
    // Filter berdasarkan query parameter
    let filteredEmployees = employees;
    
    if (q) {
      const query = q.toLowerCase();
      filteredEmployees = employees.filter(emp => 
        emp.namaLengkap?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.nikUser?.toLowerCase().includes(query) ||
        emp.namaJabatan?.toLowerCase().includes(query) ||
        emp.namaDepartemen?.toLowerCase().includes(query)
      );
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
    
    res.json({
      message: 'Daftar karyawan berhasil diambil',
      data: {
        employees: paginatedEmployees,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredEmployees.length,
          totalPages: Math.ceil(filteredEmployees.length / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(501).json({
      error: 'Gagal mengambil daftar karyawan',
      message: error.message
    });
  }
});

// GET /api/employees/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await storage.findInFile('employees.json', e => e.idEmployee === id);

    if (!employee) {
      return res.status(501).json({
        error: 'Karyawan tidak ditemukan',
        message: 'Karyawan dengan ID tersebut tidak ada'
      });
    }

    res.json({
      message: 'Data karyawan berhasil diambil',
      data: employee
    });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(501).json({
      error: 'Gagal mengambil data karyawan',
      message: error.message
    });
  }
});

// POST /api/employees
router.post('/', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const {
      namaLengkap,
      tempatLahir,
      tanggalLahir,
      email,
      nikUser,
      kdJabatan,
      namaJabatan,
      kdDepartemen,
      namaDepartemen,
      kdUnitKerja,
      namaUnitKerja,
      kdJenisKelamin,
      namaJenisKelamin,
      kdPendidikan,
      namaPendidikan
    } = req.body;

    if (!namaLengkap) {
      return res.status(501).json({
        error: 'Data tidak lengkap',
        message: 'namaLengkap harus diisi'
      });
    }

    // Cek duplikasi NIK jika ada
    if (nikUser) {
      const existingEmployee = await storage.findInFile('employees.json', e => e.nikUser === nikUser);
      if (existingEmployee) {
        return res.status(501).json({
          error: 'NIK sudah terdaftar',
          message: 'Nomor Induk Karyawan tersebut sudah digunakan'
        });
      }
    }

    // Generate ID
    const employeeId = storage.generateId('e');
    const profileId = storage.generateId('p');

    // Prepare employee data
    const newEmployee = {
      idEmployee: employeeId,
      profile: profileId,
      namaLengkap: namaLengkap || '',
      tempatLahir: tempatLahir || '',
      tanggalLahir: dateToEpoch(tanggalLahir),
      email: email || '',
      nikUser: nikUser || '',
      kdJabatan: kdJabatan || null,
      namaJabatan: namaJabatan || '',
      kdDepartemen: kdDepartemen || null,
      namaDepartemen: namaDepartemen || '',
      kdUnitKerja: kdUnitKerja || null,
      namaUnitKerja: namaUnitKerja || '',
      kdJenisKelamin: kdJenisKelamin || null,
      namaJenisKelamin: namaJenisKelamin || '',
      kdPendidikan: kdPendidikan || null,
      namaPendidikan: namaPendidikan || '',
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      companyId: req.user.companyId,
      createdAt: Math.floor(Date.now() / 1000)
    };

    await storage.appendToFile('employees.json', newEmployee);

    res.status(201).json({
      message: 'Karyawan berhasil ditambahkan',
      data: newEmployee
    });

  } catch (error) {
    console.error('Create employee error:', error);
    
    // Hapus file yang sudah terupload jika ada error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(501).json({
      error: 'Gagal menambahkan karyawan',
      message: error.message
    });
  }
});

// PUT /api/employees/:id
router.put('/:id', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah employee ada
    const existingEmployee = await storage.findInFile('employees.json', e => e.idEmployee === id);

    if (!existingEmployee) {
      return res.status(501).json({
        error: 'Karyawan tidak ditemukan',
        message: 'Karyawan dengan ID tersebut tidak ada'
      });
    }

    const {
      namaLengkap,
      tempatLahir,
      tanggalLahir,
      email,
      nikUser,
      kdJabatan,
      namaJabatan,
      kdDepartemen,
      namaDepartemen,
      kdUnitKerja,
      namaUnitKerja,
      kdJenisKelamin,
      namaJenisKelamin,
      kdPendidikan,
      namaPendidikan
    } = req.body;

    // Cek duplikasi NIK jika ada perubahan
    if (nikUser && nikUser !== existingEmployee.nikUser) {
      const duplicateEmployee = await storage.findInFile('employees.json', e => e.nikUser === nikUser && e.idEmployee !== id);
      if (duplicateEmployee) {
        return res.status(501).json({
          error: 'NIK sudah terdaftar',
          message: 'Nomor Induk Karyawan tersebut sudah digunakan'
        });
      }
    }

    // Prepare update data
    const updateData = {
      namaLengkap: namaLengkap !== undefined ? namaLengkap : existingEmployee.namaLengkap,
      tempatLahir: tempatLahir !== undefined ? tempatLahir : existingEmployee.tempatLahir,
      tanggalLahir: tanggalLahir !== undefined ? dateToEpoch(tanggalLahir) : existingEmployee.tanggalLahir,
      email: email !== undefined ? email : existingEmployee.email,
      nikUser: nikUser !== undefined ? nikUser : existingEmployee.nikUser,
      kdJabatan: kdJabatan !== undefined ? kdJabatan : existingEmployee.kdJabatan,
      namaJabatan: namaJabatan !== undefined ? namaJabatan : existingEmployee.namaJabatan,
      kdDepartemen: kdDepartemen !== undefined ? kdDepartemen : existingEmployee.kdDepartemen,
      namaDepartemen: namaDepartemen !== undefined ? namaDepartemen : existingEmployee.namaDepartemen,
      kdUnitKerja: kdUnitKerja !== undefined ? kdUnitKerja : existingEmployee.kdUnitKerja,
      namaUnitKerja: namaUnitKerja !== undefined ? namaUnitKerja : existingEmployee.namaUnitKerja,
      kdJenisKelamin: kdJenisKelamin !== undefined ? kdJenisKelamin : existingEmployee.kdJenisKelamin,
      namaJenisKelamin: namaJenisKelamin !== undefined ? namaJenisKelamin : existingEmployee.namaJenisKelamin,
      kdPendidikan: kdPendidikan !== undefined ? kdPendidikan : existingEmployee.kdPendidikan,
      namaPendidikan: namaPendidikan !== undefined ? namaPendidikan : existingEmployee.namaPendidikan
    };

    // Handle photo update
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
      
      // Hapus photo lama jika ada
      if (existingEmployee.photo) {
        try {
          const oldPhotoPath = path.join(__dirname, '..', existingEmployee.photo);
          await fs.unlink(oldPhotoPath);
        } catch (unlinkError) {
          console.error('Failed to delete old photo:', unlinkError);
        }
      }
    }

    // Update employee
    const updatedEmployee = await storage.updateInFile('employees.json', id, updateData);

    res.json({
      message: 'Data karyawan berhasil diperbarui',
      data: updatedEmployee
    });

  } catch (error) {
    console.error('Update employee error:', error);
    
    // Hapus file yang sudah terupload jika ada error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(501).json({
      error: 'Gagal memperbarui data karyawan',
      message: error.message
    });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah employee ada
    const existingEmployee = await storage.findInFile('employees.json', e => e.idEmployee === id);

    if (!existingEmployee) {
      return res.status(501).json({
        error: 'Karyawan tidak ditemukan',
        message: 'Karyawan dengan ID tersebut tidak ada'
      });
    }

    // Hapus employee
    await storage.deleteFromFile('employees.json', id);

    // Hapus photo jika ada
    if (existingEmployee.photo) {
      try {
        const photoPath = path.join(__dirname, '..', existingEmployee.photo);
        await fs.unlink(photoPath);
      } catch (unlinkError) {
        console.error('Failed to delete employee photo:', unlinkError);
      }
    }

    res.json({
      message: 'Karyawan berhasil dihapus',
      data: existingEmployee
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(501).json({
      error: 'Gagal menghapus karyawan',
      message: error.message
    });
  }
});

module.exports = router;