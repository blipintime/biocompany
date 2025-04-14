import { useState, useEffect, useTransition } from 'react'

const USERS = ['John', 'Mary', 'Gary']

function Dashboard() {
  const [siteData, setSiteData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()
  const [currentUser, setCurrentUser] = useState(USERS[2])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/dashboard?user=${currentUser}`)
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await response.json()
        
        // Use startTransition for state updates that might cause UI lag
        startTransition(() => {
          setSiteData(data)
          setLoading(false)
        })
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Site Visit Dashboard</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-3 px-4 text-left">Website</th>
              <th className="py-3 px-4 text-right">Visit Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(siteData).map((site, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{site}</td>
                <td className="py-3 px-4 text-right font-medium">{siteData[site]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard 