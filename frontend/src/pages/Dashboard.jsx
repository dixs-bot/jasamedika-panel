import React, { useState, useEffect } from 'react'
import { Users, Building, Briefcase, TrendingUp } from 'lucide-react'
import Card from '../components/Card'
import api from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalPositions: 0,
    recentEmployees: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Get employees data
      const employeesResponse = await api.get('/employees?limit=1000')
      const employees = employeesResponse.data.data.employees

      // Calculate statistics
      const departments = [...new Set(employees.map(emp => emp.namaDepartemen).filter(Boolean))]
      const positions = [...new Set(employees.map(emp => emp.namaJabatan).filter(Boolean))]

      setStats({
        totalEmployees: employees.length,
        totalDepartments: departments.length,
        totalPositions: positions.length,
        recentEmployees: employees.slice(0, 5)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Karyawan',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2 dari bulan lalu'
    },
    {
      title: 'Total Departemen',
      value: stats.totalDepartments,
      icon: Building,
      color: 'bg-green-500',
      change: '0 perubahan'
    },
    {
      title: 'Total Jabatan',
      value: stats.totalPositions,
      icon: Briefcase,
      color: 'bg-purple-500',
      change: '+1 jabatan baru'
    },
    {
      title: 'Growth Rate',
      value: '+12%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: 'Quarter over quarter'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di Admin Panel PT Jasamedika Saranatama</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recent Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Karyawan Baru">
          <div className="space-y-3">
            {stats.recentEmployees.length > 0 ? (
              stats.recentEmployees.map((employee) => (
                <div key={employee.idEmployee} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {employee.namaLengkap?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{employee.namaLengkap}</p>
                      <p className="text-xs text-gray-500">{employee.namaJabatan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(employee.createdAt * 1000).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Belum ada data karyawan</p>
            )}
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Tambah Karyawan Baru</p>
                  <p className="text-xs text-gray-500">Registrasi karyawan baru</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Manajemen Departemen</p>
                  <p className="text-xs text-gray-500">Atur struktur departemen</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Laporan Bulanan</p>
                  <p className="text-xs text-gray-500">Download laporan kehadiran</p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard