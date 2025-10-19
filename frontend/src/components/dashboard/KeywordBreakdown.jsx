import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchKeywordAnalysis } from '../../store/slices/dashboardSlice'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

const KeywordBreakdown = ({ data }) => {
  const dispatch = useDispatch()
  const [expandedKeyword, setExpandedKeyword] = useState(null)

  const handleKeywordClick = async (keyword) => {
    if (expandedKeyword === keyword) {
      setExpandedKeyword(null)
    } else {
      setExpandedKeyword(keyword)
      dispatch(fetchKeywordAnalysis({ keyword, days: 30 }))
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Keywords</h3>
        <div className="text-center text-gray-500 py-8">
          No keyword data available. Run some visibility checks to see keyword performance.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Keywords</h3>
      <div className="space-y-4">
        {data.map((keyword, index) => (
          <div key={keyword.keyword} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{keyword.keyword}</h4>
                  <p className="text-xs text-gray-500">
                    {keyword.totalChecks} checks • {keyword.enginesCount} engines
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{keyword.visibilityScore}%</p>
                  <p className="text-xs text-gray-500">Visibility</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {keyword.avgPosition ? keyword.avgPosition.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">Avg Position</p>
                </div>
                <button
                  onClick={() => handleKeywordClick(keyword.keyword)}
                  className="flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  {expandedKeyword === keyword.keyword ? 'Hide Details' : 'View Details'}
                  <ChevronRightIcon 
                    className={`ml-1 h-4 w-4 transition-transform ${
                      expandedKeyword === keyword.keyword ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Visibility Score</span>
                <span>{keyword.visibilityScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${keyword.visibilityScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KeywordBreakdown
