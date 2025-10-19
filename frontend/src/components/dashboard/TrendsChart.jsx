import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const TrendsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Visibility Trends</h3>
        <div className="text-center text-gray-500 py-8">
          No trend data available. Run some visibility checks to see trends.
        </div>
      </div>
    )
  }

  // Transform data for the chart
  const chartData = data.map(item => {
    const chartItem = { date: item._id }
    item.engines.forEach(engine => {
      chartItem[engine.engine] = Math.round(engine.visibilityScore)
    })
    return chartItem
  })

  const colors = {
    chatgpt: '#10B981',
    gemini: '#F59E0B',
    claude: '#8B5CF6',
    perplexity: '#EF4444'
  }

  const engineNames = {
    chatgpt: 'ChatGPT',
    gemini: 'Gemini',
    claude: 'Claude',
    perplexity: 'Perplexity'
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Visibility Trends Over Time</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value, name) => [`${value}%`, engineNames[name] || name]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            {Object.keys(colors).map(engine => (
              <Line
                key={engine}
                type="monotone"
                dataKey={engine}
                stroke={colors[engine]}
                strokeWidth={2}
                name={engineNames[engine]}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TrendsChart
