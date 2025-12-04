import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:w-64`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout