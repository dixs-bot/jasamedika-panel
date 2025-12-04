import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import api from '../services/api'

const EmployeeForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    email: '',
    nikUser: '',
    kdJabatan: '',
    namaJabatan: '',
    kdDepartemen: '',
    namaDepartemen: '',
    kdUnitKerja: '',
    namaUnitKerja: '',
    kdJenisKelamin: '',
    namaJenisKelamin: '',
    kdPendidikan: '',
    namaPendidikan: ''
  })

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditing) {
      fetchEmployee()
    }
  }, [id])

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`)
      const employee = response.data.data

      // Convert epoch date to YYYY-MM-DD format for date input
      const tanggalLahirFormatted = employee.tanggalLahir 
        ? new Date(employee.tanggalLahir * 1000).toISOString().split('T')[0]
        : ''

      setFormData({
        namaLengkap: employee.namaLengkap || '',
        tempatLahir: employee.tempatLahir || '',
        tanggalLahir: tanggalLahirFormatted,
        email: employee.email || '',
        nikUser: employee.nikUser || '',
        kdJabatan: employee.kdJabatan || '',
        namaJabatan: employee.namaJabatan || '',
        kdDepartemen: employee.kdDepartemen || '',
        namaDepartemen: employee.namaDepartemen || '',
        kdUnitKerja: employee.kdUnitKerja || '',
        namaUnitKerja: employee.namaUnitKerja || '',
        kdJenisKelamin: employee.kdJenisKelamin || '',
        namaJenisKelamin: employee.namaJenisKelamin || '',
        kdPendidikan: employee.kdPendidikan || '',
        namaPendidikan: employee.namaPendidikan || ''
      })

      // Set existing photo
      if (employee.photo) {
        setPhotoPreview(`http://localhost:8080${employee.photo}`)
      }
    } catch (error) {
      console.error('Error fetching employee:', error)
      setError('Gagal memuat data karyawan')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran foto maksimal 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar')
        return
      }

      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key])
      })

      // Add photo if selected
      if (photoFile) {
        formDataToSend.append('photo', photoFile)
      }

      if (isEditing) {
        await api.put(`/employees/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        await api.post('/employees', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      navigate('/employees')
    } catch (error) {
      console.error('Error saving employee:', error)
      setError(error.response?.data?.message || 'Gagal menyimpan data karyawan')
    } finally {
      setLoading(false)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview('')
    document.getElementById('photo').value = ''
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Karyawan</span>
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Perbarui data karyawan' : 'Registrasi karyawan baru'}
        </p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="label">Foto Karyawan</label>
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo').click()}
                >
                  Pilih Foto
                </Button>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={removePhoto}
                    className="ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal 5MB, format: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div>
              <label htmlFor="namaLengkap" className="label">
                Nama Lengkap *
              </label>
              <input
                type="text"
                id="namaLengkap"
                name="namaLengkap"
                value={formData.namaLengkap}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* NIK */}
            <div>
              <label htmlFor="nikUser" className="label">
                Nomor Induk Karyawan
              </label>
              <input
                type="text"
                id="nikUser"
                name="nikUser"
                value={formData.nikUser}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Tempat Lahir */}
            <div>
              <label htmlFor="tempatLahir" className="label">
                Tempat Lahir
              </label>
              <input
                type="text"
                id="tempatLahir"
                name="tempatLahir"
                value={formData.tempatLahir}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label htmlFor="tanggalLahir" className="label">
                Tanggal Lahir
              </label>
              <input
                type="date"
                id="tanggalLahir"
                name="tanggalLahir"
                value={formData.tanggalLahir}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Jabatan */}
            <div>
              <label htmlFor="namaJabatan" className="label">
                Jabatan
              </label>
              <input
                type="text"
                id="namaJabatan"
                name="namaJabatan"
                value={formData.namaJabatan}
                onChange={handleChange}
                className="input"
                placeholder="Contoh: Staff, Manager, etc."
              />
            </div>

            {/* Departemen */}
            <div>
              <label htmlFor="namaDepartemen" className="label">
                Departemen
              </label>
              <input
                type="text"
                id="namaDepartemen"
                name="namaDepartemen"
                value={formData.namaDepartemen}
                onChange={handleChange}
                className="input"
                placeholder="Contoh: IT, HRD, Finance"
              />
            </div>

            {/* Unit Kerja */}
            <div>
              <label htmlFor="namaUnitKerja" className="label">
                Unit Kerja
              </label>
              <input
                type="text"
                id="namaUnitKerja"
                name="namaUnitKerja"
                value={formData.namaUnitKerja}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label htmlFor="namaJenisKelamin" className="label">
                Jenis Kelamin
              </label>
              <select
                id="namaJenisKelamin"
                name="namaJenisKelamin"
                value={formData.namaJenisKelamin}
                onChange={handleChange}
                className="input"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Pendidikan */}
            <div>
              <label htmlFor="namaPendidikan" className="label">
                Pendidikan Terakhir
              </label>
              <select
                id="namaPendidikan"
                name="namaPendidikan"
                value={formData.namaPendidikan}
                onChange={handleChange}
                className="input"
              >
                <option value="">Pilih Pendidikan</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/employees')}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default EmployeeForm