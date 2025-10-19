import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const VisibilityScore = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Visibility Score by Engine</h3>
        <div className="text-center text-gray-500 py-8">
          No data available. Run some visibility checks to see results.
        </div>
      </div>
    )
  }

  const chartData = data.map(item => ({
    engine: item.engine.charAt(0).toUpperCase() + item.engine.slice(1),
    visibility: Math.round(item.visibilityScore),
    avgPosition: item.avgPosition,
    avgCitations: item.avgCitations
  }))

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Visibility Score by Engine</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="engine" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'visibility' ? `${value}%` : value,
                name === 'visibility' ? 'Visibility Score' : 
                name === 'avgPosition' ? 'Avg Position' : 'Avg Citations'
              ]}
              labelFormatter={(label) => `Engine: ${label}`}
            />
            <Bar dataKey="visibility" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {chartData.map((item) => (
          <div key={item.engine} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.engine}</p>
                <p className="text-2xl font-bold text-gray-900">{item.visibility}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Avg Position</p>
                <p className="text-sm font-medium text-gray-900">
                  {item.avgPosition ? item.avgPosition.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VisibilityScore
