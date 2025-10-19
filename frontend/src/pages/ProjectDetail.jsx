import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProject, deleteProject } from '../store/slices/projectSlice'
import { fetchDashboardOverview, runVisibilityChecks } from '../store/slices/dashboardSlice'
import toast from 'react-hot-toast'
import { ArrowLeftIcon, PlayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import VisibilityScore from '../components/dashboard/VisibilityScore'
import TrendsChart from '../components/dashboard/TrendsChart'
import KeywordBreakdown from '../components/dashboard/KeywordBreakdown'
import Recommendations from '../components/dashboard/Recommendations'

const ProjectDetail = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentProject, loading: projectLoading } = useSelector(state => state.projects)
  const { overview, loading: dashboardLoading, runningChecks } = useSelector(state => state.dashboard)
  const [selectedDays, setSelectedDays] = useState(30)

  useEffect(() => {
    dispatch(fetchProject(id))
  }, [dispatch, id])

  useEffect(() => {
    if (currentProject) {
      dispatch(fetchDashboardOverview({ projectId: id, days: selectedDays }))
    }
  }, [dispatch, id, selectedDays, currentProject])

  const handleRunChecks = async () => {
    try {
      await dispatch(runVisibilityChecks({ projectId: id })).unwrap()
      toast.success('Visibility checks initiated!')
      // Refresh data after a short delay
      setTimeout(() => {
        dispatch(fetchDashboardOverview({ projectId: id, days: selectedDays }))
      }, 2000)
    } catch (error) {
      toast.error(error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${currentProject?.name}"? This action cannot be undone.`)) {
      try {
        await dispatch(deleteProject(id)).unwrap()
        toast.success('Project deleted successfully')
      } catch (error) {
        toast.error(error)
      }
    }
  }

  if (projectLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
        <p className="mt-1 text-sm text-gray-500">The project you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link
            to="/projects"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-4">
            <Link
              to="/projects"
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                {currentProject.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {currentProject.description || 'No description'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button
            onClick={handleRunChecks}
            disabled={runningChecks}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            {runningChecks ? 'Running Checks...' : 'Run Visibility Checks'}
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <TrashIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Delete Project
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Information</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Domain</dt>
            <dd className="mt-1 text-sm text-gray-900">{currentProject.domain}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Brand</dt>
            <dd className="mt-1 text-sm text-gray-900">{currentProject.brand}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Keywords</dt>
            <dd className="mt-1 text-sm text-gray-900">{currentProject.keywords.length}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Check Frequency</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{currentProject.settings.checkFrequency}</dd>
          </div>
        </div>
        
        {currentProject.competitors.length > 0 && (
          <div className="mt-6">
            <dt className="text-sm font-medium text-gray-500">Competitors</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {currentProject.competitors.map((competitor, index) => (
                <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-800 mr-2 mb-2">
                  {competitor.name}
                </span>
              ))}
            </dd>
          </div>
        )}

        <div className="mt-6">
          <dt className="text-sm font-medium text-gray-500">Keywords</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {currentProject.keywords.map((keyword, index) => (
              <span key={index} className="inline-block bg-blue-100 rounded-full px-3 py-1 text-xs font-medium text-blue-800 mr-2 mb-2">
                {keyword.keyword}
              </span>
            ))}
          </dd>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-700">
              Time Period
            </label>
            <select
              id="days"
              value={selectedDays}
              onChange={(e) => setSelectedDays(parseInt(e.target.value))}
              className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {dashboardLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Visibility Score */}
          <VisibilityScore data={overview.visibilityScore} />

          {/* Trends Chart */}
          <TrendsChart data={overview.trends} />

          {/* Keyword Breakdown */}
          <KeywordBreakdown data={overview.keywordBreakdown} />

          {/* Recommendations */}
          <Recommendations data={overview.recommendations} />
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
