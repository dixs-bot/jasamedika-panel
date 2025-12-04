import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings,
  X,
  Stethoscope
} from 'lucide-react'

const Sidebar = ({ onClose }) => {
  const location = useLocation()

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Data Karyawan',
      path: '/employees',
      icon: Users
    },
    {
      name: 'Manajemen User',
      path: '/users',
      icon: UserCheck
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="h-full bg-white shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Stethoscope className="h-8 w-8 text-primary-600" />
          <span className="text-lg font-semibold text-gray-900">Jasamedika</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          PT Jasamedika Saranatama
          <br />
          Admin Panel v1.0.0
        </div>
      </div>
    </div>
  )
}

export default Sidebar