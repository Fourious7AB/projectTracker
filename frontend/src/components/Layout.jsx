import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useDispatch()
  const location = useLocation()
  const { user } = useSelector(state => state.auth)

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="lg:pl-64">
        <Header 
          setSidebarOpen={setSidebarOpen}
          user={user}
          onLogout={handleLogout}
        />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
