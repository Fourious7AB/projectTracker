import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjects, deleteProject } from '../store/slices/projectSlice'
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Projects = () => {
  const dispatch = useDispatch()
  const { projects, loading } = useSelector(state => state.projects)

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  const handleDelete = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      try {
        await dispatch(deleteProject(projectId)).unwrap()
        toast.success('Project deleted successfully')
      } catch (error) {
        toast.error(error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Projects
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your AI search visibility tracking projects
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/projects/create"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            New Project
          </Link>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
          <div className="mt-6">
            <Link
              to="/projects/create"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              New Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project._id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <div className="flex space-x-2">
                    <Link
                      to={`/projects/${project._id}`}
                      className="text-blue-600 hover:text-blue-500"
                      title="View project"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(project._id, project.name)}
                      className="text-red-600 hover:text-red-500"
                      title="Delete project"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {project.description || 'No description'}
                </p>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Domain:</span>
                    <span className="ml-1">{project.domain}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="font-medium">Brand:</span>
                    <span className="ml-1">{project.brand}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="font-medium">Keywords:</span>
                    <span className="ml-1">{project.keywords.length}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.settings.checkFrequency === 'daily' ? 'bg-green-100 text-green-800' :
                      project.settings.checkFrequency === 'weekly' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {project.settings.checkFrequency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects
