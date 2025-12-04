import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, LogOut, User } from 'lucide-react'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 md:ml-0 text-xl font-semibold text-gray-900">
              Admin Panel - PT Jasamedika Saranatama
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {user?.namaLengkap}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header