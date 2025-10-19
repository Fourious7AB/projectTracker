import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const Recommendations = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
        <div className="text-center text-gray-500 py-8">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <p>No recommendations at this time. Your visibility looks good!</p>
        </div>
      </div>
    )
  }

  const getIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'medium':
        return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
      <div className="space-y-4">
        {data.map((recommendation, index) => (
          <div 
            key={index}
            className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(recommendation.priority)}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {recommendation.type === 'low_visibility' ? 'Low Visibility Alert' :
                     recommendation.type === 'low_citations' ? 'Citation Improvement' :
                     'General Recommendation'}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {recommendation.priority.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {recommendation.message}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Action:</strong> {recommendation.action}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Recommendations
