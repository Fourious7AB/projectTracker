import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import CreateProject from './pages/CreateProject'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading } = useSelector(state => state.auth)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, isAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/create" element={<CreateProject />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
