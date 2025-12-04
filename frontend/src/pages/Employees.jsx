import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, UserPlus } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import api from '../services/api'

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchEmployees()
  }, [pagination.page, searchTerm])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        q: searchTerm
      }
      
      const response = await api.get('/employees', { params })
      setEmployees(response.data.data.employees)
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }))
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      return
    }

    try {
      await api.delete(`/employees/${id}`)
      fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Gagal menghapus karyawan')
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatDate = (epoch) => {
    if (!epoch) return '-'
    return new Date(epoch * 1000).toLocaleDateString('id-ID')
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Karyawan</h1>
          <p className="text-gray-600">Manajemen data karyawan PT Jasamedika Saranatama</p>
        </div>
        <Link to="/employees/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Tambah Karyawan</span>
          </Button>
        </Link>
      </div>

      <Card>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, NIK, atau jabatan..."
              className="input pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIK
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jabatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departemen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Lahir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'Tidak ada karyawan yang cocok dengan pencarian' : 'Belum ada data karyawan'}
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.idEmployee} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {employee.photo ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`http://localhost:8080${employee.photo}`}
                            alt={employee.namaLengkap}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {employee.namaLengkap?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.namaLengkap || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.nikUser || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.namaJabatan || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.namaDepartemen || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(employee.tanggalLahir)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/employees/${employee.idEmployee}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(employee.idEmployee)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan {((pagination.page - 1) * pagination.limit) + 1} hingga{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
              {pagination.total} hasil
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Employees