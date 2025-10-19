import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createProject } from '../store/slices/projectSlice'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

const CreateProject = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading } = useSelector(state => state.projects)
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm()
  
  const [competitors, setCompetitors] = useState([])
  const [keywords, setKeywords] = useState([])
  const [newCompetitor, setNewCompetitor] = useState({ name: '', domain: '' })
  const [newKeyword, setNewKeyword] = useState({ keyword: '', category: 'primary', targetPosition: 1 })

  const addCompetitor = () => {
    if (newCompetitor.name && newCompetitor.domain) {
      setCompetitors([...competitors, newCompetitor])
      setNewCompetitor({ name: '', domain: '' })
    }
  }

  const removeCompetitor = (index) => {
    setCompetitors(competitors.filter((_, i) => i !== index))
  }

  const addKeyword = () => {
    if (newKeyword.keyword) {
      setKeywords([...keywords, newKeyword])
      setNewKeyword({ keyword: '', category: 'primary', targetPosition: 1 })
    }
  }

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    if (keywords.length === 0) {
      toast.error('Please add at least one keyword')
      return
    }

    try {
      await dispatch(createProject({
        ...data,
        competitors,
        keywords,
        settings: {
          checkFrequency: data.checkFrequency || 'daily',
          engines: data.engines || ['chatgpt', 'gemini']
        }
      })).unwrap()
      
      toast.success('Project created successfully!')
      navigate('/projects')
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Create New Project
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Set up a new project to track AI search visibility
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Project name is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                Domain *
              </label>
              <input
                type="url"
                {...register('domain', { required: 'Domain is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="https://example.com"
              />
              {errors.domain && (
                <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                Brand Name *
              </label>
              <input
                type="text"
                {...register('brand', { required: 'Brand name is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter brand name"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="checkFrequency" className="block text-sm font-medium text-gray-700">
                Check Frequency
              </label>
              <select
                {...register('checkFrequency')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter project description"
            />
          </div>
        </div>

        {/* Competitors */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Competitors</h3>
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <span className="font-medium">{competitor.name}</span>
                  <span className="text-gray-500 ml-2">({competitor.domain})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeCompetitor(index)}
                  className="text-red-600 hover:text-red-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            <div className="flex space-x-4">
              <input
                type="text"
                value={newCompetitor.name}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                placeholder="Competitor name"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <input
                type="text"
                value={newCompetitor.domain}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, domain: e.target.value })}
                placeholder="Domain"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={addCompetitor}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Keywords</h3>
          <div className="space-y-4">
            {keywords.map((keyword, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <span className="font-medium">{keyword.keyword}</span>
                  <span className="text-gray-500 ml-2">({keyword.category})</span>
                  <span className="text-gray-500 ml-2">Target: #{keyword.targetPosition}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="text-red-600 hover:text-red-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <input
                type="text"
                value={newKeyword.keyword}
                onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                placeholder="Keyword"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <select
                value={newKeyword.category}
                onChange={(e) => setNewKeyword({ ...newKeyword, category: e.target.value })}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="long-tail">Long-tail</option>
              </select>
              <input
                type="number"
                min="1"
                max="10"
                value={newKeyword.targetPosition}
                onChange={(e) => setNewKeyword({ ...newKeyword, targetPosition: parseInt(e.target.value) })}
                placeholder="Target Position"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Engines to Monitor
              </label>
              <div className="grid grid-cols-2 gap-4">
                {['chatgpt', 'gemini', 'claude', 'perplexity'].map((engine) => (
                  <label key={engine} className="flex items-center">
                    <input
                      type="checkbox"
                      value={engine}
                      {...register('engines')}
                      defaultChecked={['chatgpt', 'gemini'].includes(engine)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{engine}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProject
