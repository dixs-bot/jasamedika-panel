import React, { useState, useEffect } from 'react'
import { UserPlus, RefreshCw, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import api from '../services/api'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    namaLengkap: '',
    role: 'user'
  })
  const [resetPasswords, setResetPasswords] = useState({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users')
      setUsers(response.data.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/users', newUser)
      setNewUser({ email: '', namaLengkap: '', role: 'user' })
      setShowCreateForm(false)
      fetchUsers()
      alert('User berhasil dibuat')
    } catch (error) {
      console.error('Error creating user:', error)
      alert(error.response?.data?.message || 'Gagal membuat user')
    }
  }

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset password user ini? Password baru akan di-generate.')) {
      return
    }

    try {
      const response = await api.post(`/auth/users/${userId}/reset-password`)
      const { passwordBaru } = response.data.data
      
      setResetPasswords(prev => ({
        ...prev,
        [userId]: passwordBaru
      }))
      
      fetchUsers()
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Gagal reset password')
    }
  }

  const formatDate = (epoch) => {
    if (!epoch) return '-'
    return new Date(epoch * 1000).toLocaleDateString('id-ID')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-600">Kelola user akses sistem</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah User</span>
        </Button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah User Baru</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Nama Lengkap *</label>
                <input
                  type="text"
                  value={newUser.namaLengkap}
                  onChange={(e) => setNewUser(prev => ({ ...prev, namaLengkap: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="input"
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                Buat User
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jabatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Belum ada data user
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.idUser} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {user.namaLengkap?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.namaLengkap}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {user.idUser}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.namaJabatan || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(user.idUser)}
                          className="flex items-center space-x-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Reset Password</span>
                        </Button>
                      </div>
                      
                      {/* Show new password if reset */}
                      {resetPasswords[user.idUser] && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-green-800">
                              {resetPasswords[user.idUser]}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(resetPasswords[user.idUser])
                                alert('Password disalin!')
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default Users