import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardOverview } from '../store/slices/dashboardSlice'
import { fetchProjects } from '../store/slices/projectSlice'
import { runVisibilityChecks } from '../store/slices/dashboardSlice'
import toast from 'react-hot-toast'
import VisibilityScore from '../components/dashboard/VisibilityScore'
import TrendsChart from '../components/dashboard/TrendsChart'
import KeywordBreakdown from '../components/dashboard/KeywordBreakdown'
import Recommendations from '../components/dashboard/Recommendations'
import { PlayIcon } from '@heroicons/react/24/outline'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { overview, loading, runningChecks } = useSelector(state => state.dashboard)
  const { projects } = useSelector(state => state.projects)
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedDays, setSelectedDays] = useState(30)

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchDashboardOverview({ projectId: selectedProject, days: selectedDays }))
    } else {
      dispatch(fetchDashboardOverview({ days: selectedDays }))
    }
  }, [dispatch, selectedProject, selectedDays])

  const handleRunChecks = async () => {
    if (!selectedProject) {
      toast.error('Please select a project first')
      return
    }

    try {
      await dispatch(runVisibilityChecks({ projectId: selectedProject })).unwrap()
      toast.success('Visibility checks initiated!')
      // Refresh data after a short delay
      setTimeout(() => {
        if (selectedProject) {
          dispatch(fetchDashboardOverview({ projectId: selectedProject, days: selectedDays }))
        } else {
          dispatch(fetchDashboardOverview({ days: selectedDays }))
        }
      }, 2000)
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your AI search visibility across different engines
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={handleRunChecks}
            disabled={runningChecks || !selectedProject}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            {runningChecks ? 'Running Checks...' : 'Run Visibility Checks'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700">
              Project
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-700">
              Time Period
            </label>
            <select
              id="days"
              value={selectedDays}
              onChange={(e) => setSelectedDays(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
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

export default Dashboard
